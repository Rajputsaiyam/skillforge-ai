# SkillForge AI — ML Microservice (Real Pretrained + Generative AI)

This is an **optional** Python microservice that upgrades the whole platform from
keyword/rule-based logic to real machine learning:

- **Sentence-BERT** (`all-MiniLM-L6-v2`) for semantic matching, dynamic/open-vocabulary
  skill discovery, and semantic grading of open-ended answers.
- **BERT-NER** (`dslim/bert-base-NER`) for cleaning company/school names out of resumes.
- **flan-t5-base** (a real local generative transformer) for dynamic question
  generation, micro-lessons, chatbot replies, and AI interview feedback — with
  optional cloud LLM upgrade (OpenAI/Anthropic) if you set an API key.

Nothing here is a paid requirement: everything runs 100% locally after the first
Hugging Face download, and every endpoint has a deterministic fallback so the app
never breaks even with zero internet/GPU.

## Setup

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

First run downloads the models (~600MB total) — needs internet once. After that,
fully offline.

Optional — for higher-quality generation/chat, set one of these in your shell (or
`ml-service/.env` if you add python-dotenv) before starting the service:
```bash
export OPENAI_API_KEY=sk-...        # uses gpt-4o-mini by default
# or
export ANTHROPIC_API_KEY=sk-ant-... # uses claude-haiku-4-5 by default
```
If neither is set, the service automatically uses the local flan-t5-base model
instead — no code changes needed.

Verify it's running:
```bash
curl http://localhost:8000/health
```

## How the backend uses it
`backend/services/mlServiceClient.js` calls this service via HTTP
(`ML_SERVICE_URL` in `backend/.env`, default `http://localhost:8000`). Every function
in that client returns `null` on failure — the Node backend always has a rule-based
fallback so the product works with or without this service running.

## Endpoints
| Endpoint | Purpose |
|---|---|
| `GET /health` | Service + model + active LLM provider status |
| `POST /semantic-match` | One resume vs one job description |
| `POST /semantic-match-batch` | One resume vs many job descriptions (batched) |
| `POST /rank-skills` | Rank a fixed candidate skill list against free text |
| `POST /extract-entities` | NER: organizations/persons out of resume text |
| `POST /extract-dynamic-skills` | **NEW** — open-vocabulary skill discovery: scores a large skill vocabulary AND mines genuinely novel skill-shaped terms straight from the text, so the Skill Graph is no longer limited to one fixed default list |
| `POST /generate-questions` | **NEW** — generates MCQ + open-ended assessment questions live, calibrated to the user's current skill level (not a hardcoded question bank) |
| `POST /grade-open-answer` | **NEW** — semantic-similarity + keyword-coverage grading of free-text answers, with generated feedback |
| `POST /generate-lesson` | **NEW** — short "teach me this skill" micro-lesson used before the quiz |
| `POST /chat` | **NEW** — RAG-lite chatbot/AI-interview endpoint: retrieves the most relevant context chunks (skill graph, resume, job) via embeddings, then generates a grounded reply |
