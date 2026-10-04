"""
SkillGraph AI — ML Microservice
---------------------------------
Real pretrained models, downloaded once from Hugging Face and then run
100% locally/offline (no paid API required, though cloud LLMs can be
plugged in optionally — see LLM PROVIDER PRIORITY below):

  1. sentence-transformers/all-MiniLM-L6-v2 (Sentence-BERT)
     Dense semantic embeddings + cosine similarity. Used for:
       - resume <-> job-description matching
       - semantic skill detection (taxonomy skills phrased differently)
       - DYNAMIC / OPEN-VOCABULARY skill discovery (new — not limited to a
         fixed taxonomy list any more)
       - semantic grading of free-text / open-ended assessment answers
       - retrieval for the RAG-lite chatbot

  2. dslim/bert-base-NER (BERT fine-tuned for Named Entity Recognition)
     Extracts organization/person names from resume text.

  3. google/flan-t5-base (instruction-tuned Seq2Seq transformer, ~250MB)
     A REAL local generative model loaded directly as an encoder-decoder model
     (rather than the removed Transformers v5 text2text pipeline), used for:
       - dynamic assessment question generation (MCQ + open-ended)
       - micro-lesson generation ("teach" step before the quiz)
       - open-ended answer feedback text
       - the SkillGraph AI Chatbot / AI Interview conversational turns

LLM PROVIDER PRIORITY (configurable, all optional, all fail-safe):
  1. Cloud LLM if OPENAI_API_KEY or ANTHROPIC_API_KEY is set in the
     environment (best quality — used automatically when available).
  2. Local flan-t5-base pipeline (loaded once at startup) — no internet
     needed after the first download, no API cost.
  3. Deterministic template generator (parameterized by skill / difficulty
     / level — NOT a hardcoded question bank) — guarantees the feature
     never breaks even with zero GPU/internet, e.g. in a classroom demo.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

The Node.js backend calls this service from
backend/services/mlServiceClient.js. If this service is not running, the
Node backend automatically falls back to its own logic — nothing breaks
either way.
"""
import os
import re
import random
from typing import List, Optional

import requests
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline

app = FastAPI(title="SkillGraph AI — ML Service", version="2.0.0")

# ---------------------------------------------------------------------------
# Model loading (each wrapped so one missing/failed model never crashes the
# whole service — every endpoint below degrades gracefully).
# ---------------------------------------------------------------------------
MODEL_NAME = "all-MiniLM-L6-v2"
print(f"[ML Service] Loading pretrained model: {MODEL_NAME} ...")
model = SentenceTransformer(MODEL_NAME)
print("[ML Service] Sentence-BERT model loaded.")

NER_MODEL_NAME = "dslim/bert-base-NER"
print(f"[ML Service] Loading pretrained model: {NER_MODEL_NAME} ...")
ner_pipeline = pipeline("ner", model=NER_MODEL_NAME, aggregation_strategy="simple")
print("[ML Service] NER model loaded.")

GEN_MODEL_NAME = "google/flan-t5-base"
# Transformers v5 no longer registers the old "text2text-generation" pipeline
# task, so load the encoder-decoder model directly. This works with both v4 and
# v5 and avoids silently losing local generation on newer environments.
generator_model = None
generator_tokenizer = None
try:
    print(f"[ML Service] Loading pretrained model: {GEN_MODEL_NAME} ...")
    generator_tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_NAME)
    generator_model = AutoModelForSeq2SeqLM.from_pretrained(GEN_MODEL_NAME)
    generator_model.eval()
    print("[ML Service] flan-t5-base generation model loaded.")
except Exception as e:  # pragma: no cover - environment dependent
    print(f"[ML Service] WARNING: could not load {GEN_MODEL_NAME} ({e}). "
          f"Falling back to template-based generation for questions/lessons/chat.")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "").strip()


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


# ---------------------------------------------------------------------------
# LLM abstraction — cloud (if key present) -> local flan-t5 -> None
# (None tells the caller to use its own deterministic template fallback)
# ---------------------------------------------------------------------------
def _call_openai(prompt: str, max_tokens: int = 300) -> Optional[str]:
    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.6,
            },
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[ML Service] OpenAI call failed: {e}")
        return None


def _call_anthropic(prompt: str, max_tokens: int = 300) -> Optional[str]:
    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=20,
        )
        resp.raise_for_status()
        blocks = resp.json().get("content", [])
        return "".join(b.get("text", "") for b in blocks).strip() or None
    except Exception as e:
        print(f"[ML Service] Anthropic call failed: {e}")
        return None


def llm_generate(prompt: str, max_tokens: int = 300) -> Optional[str]:
    """Priority: cloud LLM (if key set) -> local flan-t5 -> None."""
    if OPENAI_API_KEY:
        out = _call_openai(prompt, max_tokens)
        if out:
            return out
    if ANTHROPIC_API_KEY:
        out = _call_anthropic(prompt, max_tokens)
        if out:
            return out
    if generator_model is not None and generator_tokenizer is not None:
        try:
            inputs = generator_tokenizer(
                prompt, return_tensors="pt", truncation=True, max_length=512
            )
            with torch.inference_mode():
                output_ids = generator_model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                )
            text = generator_tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
            return text or None
        except Exception as e:
            print(f"[ML Service] Local flan-t5 generation failed: {e}")
            return None
    return None


def llm_provider_name() -> str:
    if OPENAI_API_KEY:
        return "openai"
    if ANTHROPIC_API_KEY:
        return "anthropic"
    if generator_model is not None:
        return "flan-t5-base (local)"
    return "template-fallback"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": [MODEL_NAME, NER_MODEL_NAME, GEN_MODEL_NAME if generator_model else f"{GEN_MODEL_NAME} (unavailable)"],
        "llm_provider": llm_provider_name(),
    }


@app.get("/", include_in_schema=False)
def root():
    """A browser-friendly response; API documentation is available at /docs."""
    return {"service": "SkillForge AI ML Service", "status": "ok", "docs": "/docs", "health": "/health"}


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    # Browsers request this automatically; replying 204 prevents harmless 404 noise.
    from fastapi import Response
    return Response(status_code=204)


# ---------------------------------------------------------------------------
# 1) Semantic resume <-> job matching (existing)
# ---------------------------------------------------------------------------
class MatchRequest(BaseModel):
    resume_text: str
    job_description: str


class MatchResponse(BaseModel):
    semantic_similarity: float


@app.post("/semantic-match", response_model=MatchResponse)
def semantic_match(payload: MatchRequest):
    embeddings = model.encode([payload.resume_text, payload.job_description], convert_to_tensor=True, show_progress_bar=False)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    return {"semantic_similarity": round(clamp01(score), 4)}


class BatchMatchRequest(BaseModel):
    resume_text: str
    job_descriptions: List[str]


class BatchMatchResponse(BaseModel):
    scores: List[float]


@app.post("/semantic-match-batch", response_model=BatchMatchResponse)
def semantic_match_batch(payload: BatchMatchRequest):
    if not payload.job_descriptions:
        return {"scores": []}
    resume_emb = model.encode(payload.resume_text, convert_to_tensor=True, show_progress_bar=False)
    job_embs = model.encode(payload.job_descriptions, convert_to_tensor=True, show_progress_bar=False)
    sims = util.cos_sim(resume_emb, job_embs)[0]
    return {"scores": [round(clamp01(s.item()), 4) for s in sims]}


class EmbedRequest(BaseModel):
    texts: List[str]


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]


@app.post("/embed", response_model=EmbedResponse)
def embed_texts(payload: EmbedRequest):
    if not payload.texts:
        return {"embeddings": []}
    embs = model.encode(payload.texts, convert_to_numpy=True, show_progress_bar=False)
    return {"embeddings": embs.tolist()}


# ---------------------------------------------------------------------------
# 2) Semantic skill ranking against a fixed candidate list (existing)
# ---------------------------------------------------------------------------
class SkillRankRequest(BaseModel):
    text: str
    candidate_skills: List[str]


class SkillRankResult(BaseModel):
    skill: str
    score: float


class SkillRankResponse(BaseModel):
    results: List[SkillRankResult]


@app.post("/rank-skills", response_model=SkillRankResponse)
def rank_skills(payload: SkillRankRequest):
    text_emb = model.encode(payload.text, convert_to_tensor=True, show_progress_bar=False)
    skill_embs = model.encode(payload.candidate_skills, convert_to_tensor=True, show_progress_bar=False)
    sims = util.cos_sim(text_emb, skill_embs)[0]
    results = [{"skill": s, "score": round(clamp01(sims[i].item()), 4)} for i, s in enumerate(payload.candidate_skills)]
    results.sort(key=lambda r: r["score"], reverse=True)
    return {"results": results}


# ---------------------------------------------------------------------------
# 3) NER entity extraction (existing)
# ---------------------------------------------------------------------------
class EntityExtractRequest(BaseModel):
    text: str


class Entity(BaseModel):
    entity_group: str
    text: str
    score: float


class EntityExtractResponse(BaseModel):
    organizations: List[str]
    persons: List[str]
    all_entities: List[Entity]


@app.post("/extract-entities", response_model=EntityExtractResponse)
def extract_entities(payload: EntityExtractRequest):
    raw_entities = ner_pipeline(payload.text[:3000])
    organizations, persons, all_entities = [], [], []
    for ent in raw_entities:
        group = ent["entity_group"]
        word = ent["word"].strip()
        score = float(ent["score"])
        all_entities.append({"entity_group": group, "text": word, "score": round(score, 4)})
        if group == "ORG" and word and word not in organizations:
            organizations.append(word)
        elif group == "PER" and word and word not in persons:
            persons.append(word)
    return {"organizations": organizations, "persons": persons, "all_entities": all_entities}


# ---------------------------------------------------------------------------
# 4) NEW — Dynamic / open-vocabulary skill discovery
#    Not limited to a fixed taxonomy list any more:
#      a) scores a large candidate vocabulary via embeddings (same idea as
#         rank-skills, but designed to run against a MUCH bigger list)
#      b) additionally mines "novel" skill-shaped phrases straight out of the
#         resume text (regex over tech-looking tokens: CamelCase, dotted
#         names like Node.js, ALL-CAPS acronyms, hyphenated tool names) that
#         are NOT already in the known vocabulary, then keeps only the ones
#         whose embedding is semantically close to a generic
#         "technical skill / tool / framework / programming language"
#         anchor sentence — a lightweight zero-shot-style filter that lets
#         the Skill Graph grow itself instead of showing the same fixed
#         default list to every user.
# ---------------------------------------------------------------------------
SKILL_ANCHOR_TEXT = (
    "a technical skill, programming language, software framework, developer "
    "tool, cloud platform, or professional competency mentioned on a resume"
)
NOISE_WORDS = {
    "the", "and", "for", "with", "this", "that", "from", "have", "was", "are",
    "team", "work", "project", "projects", "company", "role", "using", "used",
    "responsible", "worked", "experience", "years", "year", "including",
}


def _looks_tech_shaped(token: str) -> bool:
    if len(token) < 2 or len(token) > 30:
        return False
    if token.lower() in NOISE_WORDS:
        return False
    has_dot_or_hyphen = "." in token or "-" in token or "+" in token
    is_camel = bool(re.match(r"^[A-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$", token))
    is_acronym = bool(re.match(r"^[A-Z]{2,6}$", token))
    is_capitalized_word = bool(re.match(r"^[A-Z][a-z]{2,}$", token))
    return has_dot_or_hyphen or is_camel or is_acronym or is_capitalized_word


def mine_novel_terms(text: str, known_lower: set) -> List[str]:
    raw_tokens = re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{1,29}", text)
    candidates = []
    seen = set()
    for t in raw_tokens:
        key = t.lower()
        if key in known_lower or key in seen:
            continue
        if _looks_tech_shaped(t):
            seen.add(key)
            candidates.append(t)
    return candidates[:60]  # cap for speed


class DynamicSkillRequest(BaseModel):
    text: str
    known_vocabulary: List[str]  # large taxonomy + community skill list, owned by Node backend
    already_detected: List[str] = []
    novel_term_threshold: float = 0.42
    vocabulary_threshold: float = 0.5


class DynamicSkillMatch(BaseModel):
    skill: str
    score: float
    origin: str  # "vocabulary" | "novel"


class DynamicSkillResponse(BaseModel):
    matches: List[DynamicSkillMatch]


@app.post("/extract-dynamic-skills", response_model=DynamicSkillResponse)
def extract_dynamic_skills(payload: DynamicSkillRequest):
    known_lower = {s.lower() for s in payload.known_vocabulary} | {s.lower() for s in payload.already_detected}
    remaining_vocab = [s for s in payload.known_vocabulary if s.lower() not in {a.lower() for a in payload.already_detected}]

    matches: List[dict] = []

    # (a) score the remaining part of the (possibly large) known vocabulary
    if remaining_vocab:
        text_emb = model.encode(payload.text, convert_to_tensor=True, show_progress_bar=False)
        vocab_embs = model.encode(remaining_vocab, convert_to_tensor=True, show_progress_bar=False)
        sims = util.cos_sim(text_emb, vocab_embs)[0]
        for i, s in enumerate(remaining_vocab):
            score = clamp01(sims[i].item())
            if score >= payload.vocabulary_threshold:
                matches.append({"skill": s, "score": round(score, 4), "origin": "vocabulary"})

    # (b) mine genuinely novel skill-shaped terms not in the vocabulary at all,
    # then filter with the zero-shot-style anchor similarity check
    novel_terms = mine_novel_terms(payload.text, known_lower)
    if novel_terms:
        anchor_emb = model.encode(SKILL_ANCHOR_TEXT, convert_to_tensor=True, show_progress_bar=False)
        term_embs = model.encode(novel_terms, convert_to_tensor=True, show_progress_bar=False)
        sims = util.cos_sim(anchor_emb, term_embs)[0]
        for i, term in enumerate(novel_terms):
            score = clamp01(sims[i].item())
            if score >= payload.novel_term_threshold:
                matches.append({"skill": term, "score": round(score, 4), "origin": "novel"})

    matches.sort(key=lambda m: m["score"], reverse=True)
    return {"matches": matches}


# ---------------------------------------------------------------------------
# 5) NEW — Dynamic assessment question generation
# ---------------------------------------------------------------------------
class GenerateQuestionsRequest(BaseModel):
    skill: str
    difficulty: str = "Intermediate"   # Beginner | Intermediate | Advanced
    level: int = 50                    # user's current 0-100 proficiency, used to calibrate difficulty
    count: int = 3
    question_type: str = "mixed"       # "mcq" | "open" | "mixed"


class GeneratedQuestion(BaseModel):
    skill: str
    difficulty: str
    question_type: str  # "mcq" | "open"
    question_text: str
    options: List[str] = []
    correct_option_index: Optional[int] = None
    model_answer: Optional[str] = None  # used for grading open questions


class GenerateQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion]
    generated_by: str


def _difficulty_for_level(level: int) -> str:
    if level < 35:
        return "Beginner"
    if level < 70:
        return "Intermediate"
    return "Advanced"


def _parse_mcq_block(raw: str, skill: str, difficulty: str) -> Optional[dict]:
    """Best-effort parser for an LLM-generated MCQ in a loose 'Q / A) B) C) D) / Answer: X' shape."""
    try:
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
        q_line = next((l for l in lines if not re.match(r"^[A-D][)\.]", l) and "answer" not in l.lower()), None)
        opts = [re.sub(r"^[A-D][)\.]\s*", "", l) for l in lines if re.match(r"^[A-D][)\.]", l)]
        ans_line = next((l for l in lines if l.lower().startswith("answer")), None)
        if not q_line or len(opts) < 2:
            return None
        correct_idx = 0
        if ans_line:
            m = re.search(r"[A-D]", ans_line.upper())
            if m:
                correct_idx = "ABCD".index(m.group(0))
        correct_idx = min(correct_idx, len(opts) - 1)
        return {
            "skill": skill, "difficulty": difficulty, "question_type": "mcq",
            "question_text": q_line, "options": opts[:4], "correct_option_index": correct_idx,
        }
    except Exception:
        return None


def _template_mcq(skill: str, difficulty: str, seed: int) -> dict:
    """Deterministic, parameterized fallback (NOT a hardcoded per-skill bank) used
    only if no generative model/LLM is reachable — guarantees the feature always works."""
    rng = random.Random(f"{skill}-{difficulty}-{seed}")
    templates = [
        f"Which statement best describes a core concept of {skill} at a {difficulty.lower()} level?",
        f"In a real {skill} project, which practice would a {difficulty.lower()} engineer be expected to follow?",
        f"What is a common pitfall developers face when using {skill}?",
        f"Which of the following best explains why {skill} is used in modern software projects?",
    ]
    correct = f"A well-reasoned, best-practice answer for {skill}"
    distractors = [
        f"An answer unrelated to {skill}",
        f"A common misconception about {skill}",
        f"An outdated approach no longer used with {skill}",
    ]
    options = [correct] + distractors
    rng.shuffle(options)
    return {
        "skill": skill, "difficulty": difficulty, "question_type": "mcq",
        "question_text": rng.choice(templates), "options": options,
        "correct_option_index": options.index(correct),
    }


def _template_open(skill: str, difficulty: str, seed: int) -> dict:
    rng = random.Random(f"{skill}-open-{difficulty}-{seed}")
    prompts = [
        f"Explain, in your own words, how you would use {skill} to solve a real-world problem.",
        f"Describe a challenge you might face with {skill} at a {difficulty.lower()} level, and how you'd address it.",
        f"Walk through the key steps involved in a typical {skill} workflow.",
    ]
    return {
        "skill": skill, "difficulty": difficulty, "question_type": "open",
        "question_text": rng.choice(prompts),
        "model_answer": f"A strong answer covers the core purpose of {skill}, a concrete example of applying it, "
                         f"and an awareness of common trade-offs or pitfalls at the {difficulty.lower()} level.",
    }


@app.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions(payload: GenerateQuestionsRequest):
    difficulty = payload.difficulty or _difficulty_for_level(payload.level)
    count = max(1, min(payload.count, 8))
    questions: List[dict] = []
    used_llm = False

    for i in range(count):
        want_mcq = payload.question_type == "mcq" or (payload.question_type == "mixed" and i % 2 == 0)
        if want_mcq:
            prompt = (
                f"Write ONE {difficulty.lower()}-level multiple choice interview question about {payload.skill}.\n"
                "Format exactly like this, nothing else:\n"
                "Question: <question text>\nA) <option>\nB) <option>\nC) <option>\nD) <option>\nAnswer: <letter>\n"
            )
            raw = llm_generate(prompt, max_tokens=180)
            parsed = _parse_mcq_block(raw, payload.skill, difficulty) if raw else None
            if parsed:
                used_llm = True
                questions.append(parsed)
            else:
                questions.append(_template_mcq(payload.skill, difficulty, i))
        else:
            prompt = (
                f"Write ONE open-ended, {difficulty.lower()}-level technical interview question about "
                f"{payload.skill}, followed on a new line by 'Model answer:' and a concise 2-3 sentence ideal answer."
            )
            raw = llm_generate(prompt, max_tokens=220)
            if raw and "model answer" in raw.lower():
                parts = re.split(r"model answer\s*:\s*", raw, flags=re.IGNORECASE)
                q_text = re.sub(r"^question\s*:\s*", "", parts[0].strip(), flags=re.IGNORECASE).strip()
                model_answer = parts[1].strip() if len(parts) > 1 else None
                if q_text and model_answer:
                    used_llm = True
                    questions.append({
                        "skill": payload.skill, "difficulty": difficulty, "question_type": "open",
                        "question_text": q_text, "model_answer": model_answer,
                    })
                    continue
            questions.append(_template_open(payload.skill, difficulty, i))

    return {"questions": questions, "generated_by": llm_provider_name() if used_llm else "template-fallback"}


# ---------------------------------------------------------------------------
# 6) NEW — Semantic grading of open-ended answers
# ---------------------------------------------------------------------------
class GradeAnswerRequest(BaseModel):
    question: str
    model_answer: str
    user_answer: str


class GradeAnswerResponse(BaseModel):
    score: float  # 0-100
    semantic_similarity: float
    keyword_coverage: float
    feedback: str


def _extract_keywords(text: str) -> List[str]:
    words = re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{2,}", text)
    return list({w.lower() for w in words if w.lower() not in NOISE_WORDS})


@app.post("/grade-open-answer", response_model=GradeAnswerResponse)
def grade_open_answer(payload: GradeAnswerRequest):
    if not payload.user_answer.strip():
        return {"score": 0.0, "semantic_similarity": 0.0, "keyword_coverage": 0.0,
                "feedback": "No answer was provided."}

    embs = model.encode([payload.model_answer, payload.user_answer], convert_to_tensor=True, show_progress_bar=False)
    sim = clamp01(util.cos_sim(embs[0], embs[1]).item())

    model_keywords = set(_extract_keywords(payload.model_answer))
    user_keywords = set(_extract_keywords(payload.user_answer))
    coverage = len(model_keywords & user_keywords) / len(model_keywords) if model_keywords else sim

    score = round(clamp01(0.7 * sim + 0.3 * coverage) * 100, 1)

    feedback_prompt = (
        f"Question: {payload.question}\nModel answer: {payload.model_answer}\n"
        f"Candidate answer: {payload.user_answer}\n"
        "In 2 short sentences, give constructive feedback on the candidate answer, "
        "mentioning one thing they got right and one thing to improve."
    )
    feedback = llm_generate(feedback_prompt, max_tokens=120)
    if not feedback:
        if score >= 80:
            feedback = "Strong answer — it closely matches the key ideas expected for this question."
        elif score >= 50:
            feedback = "Reasonable answer, but it's missing some of the key concepts a complete answer would cover."
        else:
            feedback = "This answer misses most of the key concepts expected here — review the fundamentals of this topic."

    return {"score": score, "semantic_similarity": round(sim, 4), "keyword_coverage": round(coverage, 4), "feedback": feedback}


# ---------------------------------------------------------------------------
# 7) NEW — Micro-lesson generation ("teach" step before the quiz)
# ---------------------------------------------------------------------------
class GenerateLessonRequest(BaseModel):
    skill: str
    level: int = 30


class GenerateLessonResponse(BaseModel):
    title: str
    content: str
    generated_by: str


@app.post("/generate-lesson", response_model=GenerateLessonResponse)
def generate_lesson(payload: GenerateLessonRequest):
    difficulty = _difficulty_for_level(payload.level)
    prompt = (
        f"Write a short {difficulty.lower()}-level lesson (120-180 words) teaching the most important concept "
        f"of {payload.skill} to someone preparing for a job interview. Include one concrete example."
    )
    content = llm_generate(prompt, max_tokens=260)
    generated_by = llm_provider_name()
    if not content:
        content = (
            f"{payload.skill} is a core competency evaluated for this role. At a {difficulty.lower()} level, focus on: "
            f"(1) understanding the fundamental purpose {payload.skill} serves in a real project, "
            f"(2) being able to explain a concrete example of using it, and "
            f"(3) knowing at least one common pitfall or trade-off. "
            f"Review official docs or a hands-on tutorial for {payload.skill}, then try explaining it out loud in one minute — "
            f"if you can teach it simply, you're ready for the quiz."
        )
        generated_by = "template-fallback"
    return {"title": f"{difficulty} {payload.skill}: what you need to know", "content": content, "generated_by": generated_by}


# ---------------------------------------------------------------------------
# 8) NEW — Chatbot / AI Interview conversational endpoint (RAG-lite)
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    context_chunks: List[str] = []   # e.g. skill graph summary lines, resume snippets, job description
    history: List[ChatMessage] = []
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    used_context: List[str]
    generated_by: str


def _retrieve_relevant_chunks(query: str, chunks: List[str], top_k: int = 4) -> List[str]:
    if not chunks:
        return []
    query_emb = model.encode(query, convert_to_tensor=True, show_progress_bar=False)
    chunk_embs = model.encode(chunks, convert_to_tensor=True, show_progress_bar=False)
    sims = util.cos_sim(query_emb, chunk_embs)[0]
    ranked = sorted(zip(chunks, sims.tolist()), key=lambda x: x[1], reverse=True)
    return [c for c, s in ranked[:top_k] if s > 0.15]


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    relevant = _retrieve_relevant_chunks(payload.message, payload.context_chunks)
    system = payload.system_prompt or (
        "You are SkillGraph AI's career coach chatbot. Answer briefly and specifically, "
        "using the provided context about the user's skills/resume/career goal when relevant. "
        "If the context doesn't cover the question, answer from general career/tech knowledge."
    )
    history_text = "\n".join(f"{h.role}: {h.content}" for h in payload.history[-6:])
    context_text = "\n".join(f"- {c}" for c in relevant)
    prompt = (
        f"{system}\n\n"
        f"Context about this user:\n{context_text or '(none)'}\n\n"
        f"Conversation so far:\n{history_text or '(start of conversation)'}\n\n"
        f"User: {payload.message}\nAssistant:"
    )
    reply = llm_generate(prompt, max_tokens=220)
    generated_by = llm_provider_name()
    if not reply:
        if relevant:
            reply = ("Based on what I know about you: " + relevant[0] +
                      ". Could you tell me a bit more about what you'd like help with?")
        else:
            reply = ("I can help with your skill gaps, resume, and interview prep once I have some context — "
                      "try uploading a resume or picking a target role first.")
        generated_by = "template-fallback"
    return {"reply": reply, "used_context": relevant, "generated_by": generated_by}


# ---------------------------------------------------------------------------
# 11) Dedicated ATS Score Checker Model
# ---------------------------------------------------------------------------
from ats_scorer import ats_engine


class AtsScoreRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None
    job_description: Optional[str] = None


@app.post("/ats-score")
def check_ats_score(payload: AtsScoreRequest):
    """
    Dedicated enterprise-grade ATS scoring engine.
    Evaluates Parseability, Quantified Impact (Google X-Y-Z), Action Verbs,
    Domain Keyword Density (Sentence-BERT), and Red Flags/Buzzwords.
    """
    return ats_engine.evaluate(
        resume_text=payload.resume_text,
        target_role=payload.target_role,
        job_description=payload.job_description,
        sentence_bert_model=model,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

