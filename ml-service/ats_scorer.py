"""
SkillForge AI — Dedicated ATS Score Checker Model & Engine
-----------------------------------------------------------
Simulates modern enterprise Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever, iCIMS).

Evaluates resumes across 5 rigorous dimensions:
  1. Parseability & Formatting (20%) — contact info, standard section headers, clean text density.
  2. Quantifiable Impact & Metrics (25%) — Google X-Y-Z formula, %, $, metric scale indicators.
  3. Action Verb Competency (20%) — high-impact executive verbs vs passive duty phrases.
  4. Role & Keyword Relevance (25%) — dense semantic similarity (Sentence-BERT) + tech taxonomy.
  5. Clarity & Red Flag Audit (10%) — buzzwords, first-person pronouns, formatting penalties.
"""

import re
from typing import Dict, List, Optional, Any


# Standard ATS Section Headers
SECTION_PATTERNS = {
    "summary": re.compile(r"\b(summary|professional summary|about me|profile|objective)\b", re.I),
    "experience": re.compile(r"\b(experience|work experience|employment|work history|professional experience)\b", re.I),
    "education": re.compile(r"\b(education|academic background|academics|qualifications|degrees)\b", re.I),
    "skills": re.compile(r"\b(skills|technical skills|core competencies|technologies|proficiencies)\b", re.I),
    "projects": re.compile(r"\b(projects|personal projects|technical projects|selected projects)\b", re.I),
}

# Strong Executive Action Verbs
STRONG_ACTION_VERBS = {
    "accelerated", "achieved", "architected", "automated", "built", "centralized",
    "coached", "collaborated", "condensed", "consolidated", "converted", "created",
    "customized", "debugged", "decreased", "delivered", "deployed", "designed",
    "developed", "devised", "diminished", "directed", "doubled", "drafted",
    "drove", "eliminated", "engineered", "established", "evaluated", "exceeded",
    "executed", "expanded", "expedited", "fabricated", "facilitated", "formulated",
    "generated", "guided", "halved", "headed", "implemented", "improved",
    "increased", "initiated", "innovated", "inspected", "installed", "instituted",
    "integrated", "introduced", "invented", "launched", "led", "managed",
    "maximized", "mentored", "migrated", "minimized", "modeled", "modernized",
    "negotiated", "optimized", "orchestrated", "overhauled", "oversaw", "partnered",
    "pioneered", "planned", "produced", "programmed", "published", "rearchitected",
    "rebuilt", "reduced", "refactored", "resolved", "restructured", "revamped",
    "scaled", "scheduled", "secured", "simplified", "solved", "spearheaded",
    "standardized", "streamlined", "strengthened", "surpassed", "trained", "transformed",
    "tripled", "troubleshot", "unified", "upgraded", "validated", "yielded"
}

# Passive or Weak Duty Phrases (Penalized by ATS & Tech Recruiters)
WEAK_PHRASES = [
    r"\bresponsible for\b",
    r"\btasked with\b",
    r"\bworked on\b",
    r"\bhelped with\b",
    r"\bassisted in\b",
    r"\bduties included\b",
    r"\bhandled\b",
    r"\bparticipated in\b",
]

# Corporate Fluff & Overused Buzzwords (Penalized)
BUZZWORDS = [
    r"\bsynergy\b",
    r"\bgo-getter\b",
    r"\bhard worker\b",
    r"\bteam player\b",
    r"\bthink outside the box\b",
    r"\bresults-oriented\b",
    r"\bdetail-oriented\b",
    r"\bthought leader\b",
    r"\bself-starter\b",
    r"\bproactive individual\b",
    r"\bseasoned professional\b",
]

# Common Technical Keywords by Domain for Missing Keyword Suggestions
ROLE_KEYWORD_TAXONOMY = {
    "frontend": [
        "React", "TypeScript", "JavaScript", "Next.js", "Redux", "Tailwind CSS",
        "HTML5", "CSS3", "Webpack", "Vite", "REST APIs", "GraphQL", "Jest",
        "Performance Optimization", "Web Vitals", "Accessibility (a11y)", "Responsive Design"
    ],
    "backend": [
        "Node.js", "Python", "Go", "Java", "Express", "FastAPI", "Spring Boot",
        "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "Microservices",
        "REST APIs", "GraphQL", "gRPC", "AWS", "CI/CD", "Kafka", "SQL Optimization"
    ],
    "full stack": [
        "React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "MongoDB",
        "REST APIs", "GraphQL", "Docker", "AWS", "Git", "State Management",
        "CI/CD", "System Design", "Microservices", "Unit Testing"
    ],
    "data science": [
        "Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "TensorFlow",
        "Machine Learning", "Data Visualization", "Jupyter", "A/B Testing",
        "Statistics", "Feature Engineering", "BigQuery", "ETL Pipelines"
    ],
    "devops": [
        "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "GitHub Actions",
        "Linux", "Bash", "Prometheus", "Grafana", "Ansible", "Helm", "CloudFormation",
        "Site Reliability", "Networking", "Security"
    ],
}


class AtsScoringEngine:
    """Enterprise-grade ATS resume parsing and rating engine."""

    def __init__(self):
        self.email_regex = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
        self.phone_regex = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
        self.linkedin_regex = re.compile(r"linkedin\.com/in/[a-zA-Z0-9_-]+", re.I)
        self.github_regex = re.compile(r"github\.com/[a-zA-Z0-9_-]+", re.I)

        # Metrics patterns: percentages, currency, multipliers, scale metrics
        self.metric_regex = re.compile(
            r"(\b\d+(\.\d+)?%|\$\s?\d+([,\.]\d+)?\s?[kKmMbB]?|\b\d+\s?(k|K|M|B|x|X)\b|\b\d{2,}\+?\s?(users|clients|requests|ms|qps|rps|seconds|hours|minutes|teams|engineers|stores|endpoints|stars)\b)",
            re.I
        )

    def evaluate(
        self,
        resume_text: str,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
        sentence_bert_model: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive 5-dimensional ATS rating.
        Returns overall score (0-100), letter grade, dimension breakdowns,
        detected metrics, critical blocker fixes, and positive signals.
        """
        text = resume_text or ""
        clean_text = " ".join(text.split())
        words = clean_text.split()
        word_count = len(words)

        # 1. Parseability & Structure (Weight: 20%)
        parse_res = self._eval_parseability(text, word_count)

        # 2. Quantifiable Impact & Metrics (Weight: 25%)
        impact_res = self._eval_impact(text)

        # 3. Action Verb Strength (Weight: 20%)
        action_res = self._eval_action_verbs(text)

        # 4. Role & Keyword Relevance (Weight: 25%)
        relevance_res = self._eval_relevance(text, target_role, job_description, sentence_bert_model)

        # 5. Clarity & Red Flags (Weight: 10%)
        clarity_res = self._eval_clarity_and_red_flags(text, word_count)

        # Compute Weighted Score
        weighted_score = (
            (parse_res["score"] * 0.20) +
            (impact_res["score"] * 0.25) +
            (action_res["score"] * 0.20) +
            (relevance_res["score"] * 0.25) +
            (clarity_res["score"] * 0.10)
        )
        overall_score = max(0, min(100, round(weighted_score)))

        # Assign Letter Grade & Status
        if overall_score >= 90:
            grade = "A+"
            status = "ATS Leader — High Interview Probability"
        elif overall_score >= 80:
            grade = "A"
            status = "Strong Match — Passes Most Filters"
        elif overall_score >= 70:
            grade = "B"
            status = "Competitive — Minor Optimizations Needed"
        elif overall_score >= 55:
            grade = "C"
            status = "Borderline — High Risk of Automated Filtering"
        else:
            grade = "Needs Work"
            status = "At Risk — Substantial ATS Gaps Detected"

        # Compile Critical Issues and Positive Signals
        critical_fixes = []
        positive_signals = []

        if not parse_res["has_email"]:
            critical_fixes.append("Missing or unparseable email address in contact header.")
        if not parse_res["has_phone"]:
            critical_fixes.append("Missing phone number for recruiter outreach.")
        if parse_res["sections_found_count"] < 3:
            critical_fixes.append(f"Only {parse_res['sections_found_count']}/5 standard section headers detected. Use standard titles (Experience, Education, Skills, Projects).")
        if impact_res["metrics_count"] < 3:
            critical_fixes.append(f"Only {impact_res['metrics_count']} quantified metrics found. Modern ATS algorithms heavily prioritize numbers, %, and quantifiable outcomes.")
        if action_res["weak_phrases_count"] > 1:
            critical_fixes.append(f"Found {action_res['weak_phrases_count']} passive phrases (e.g. 'responsible for'). Replace with assertive executive verbs (e.g. 'Engineered', 'Spearheaded').")
        if clarity_res["first_person_count"] > 2:
            critical_fixes.append(f"Found {clarity_res['first_person_count']} first-person pronouns ('I', 'me', 'my'). Technical resumes should use concise 3rd-person phrasing.")
        if word_count < 250:
            critical_fixes.append(f"Resume is very brief ({word_count} words). Aim for 400-900 words to provide adequate keyword density.")

        if parse_res["has_linkedin"]:
            positive_signals.append("LinkedIn profile link properly detected.")
        if parse_res["has_github"]:
            positive_signals.append("GitHub / portfolio link detected.")
        if impact_res["metrics_count"] >= 5:
            positive_signals.append(f"Excellent quantifiable impact: {impact_res['metrics_count']} data metrics detected.")
        if action_res["strong_verbs_count"] >= 8:
            positive_signals.append(f"High-impact vocabulary: {action_res['strong_verbs_count']} strong action verbs used.")
        if relevance_res["matched_keywords_count"] >= 6:
            positive_signals.append(f"Strong keyword alignment: {relevance_res['matched_keywords_count']} core domain competencies matched.")

        return {
            "overallScore": overall_score,
            "grade": grade,
            "status": status,
            "wordCount": word_count,
            "dimensions": {
                "parseability": {
                    "score": parse_res["score"],
                    "weight": "20%",
                    "label": "Formatting & Parseability",
                    "details": parse_res,
                },
                "quantifiedImpact": {
                    "score": impact_res["score"],
                    "weight": "25%",
                    "label": "Google X-Y-Z Quantified Impact",
                    "details": impact_res,
                },
                "actionVerbs": {
                    "score": action_res["score"],
                    "weight": "20%",
                    "label": "Action Verb Strength",
                    "details": action_res,
                },
                "roleRelevance": {
                    "score": relevance_res["score"],
                    "weight": "25%",
                    "label": "Skill & Keyword Relevance",
                    "details": relevance_res,
                },
                "clarityAudit": {
                    "score": clarity_res["score"],
                    "weight": "10%",
                    "label": "Clarity & Red Flag Audit",
                    "details": clarity_res,
                },
            },
            "criticalFixes": critical_fixes[:5],
            "positiveSignals": positive_signals[:5],
            "metricsDetected": impact_res["samples"][:8],
            "actionVerbsUsed": action_res["found_verbs"][:10],
            "missingKeywords": relevance_res.get("missing_keywords", [])[:8],
            "matchedKeywords": relevance_res.get("matched_keywords", [])[:12],
            "engine": "SkillForge ATS Model v2.0 (Sentence-BERT + Structural Heuristics)",
        }

    def _eval_parseability(self, text: str, word_count: int) -> Dict[str, Any]:
        has_email = bool(self.email_regex.search(text))
        has_phone = bool(self.phone_regex.search(text))
        has_linkedin = bool(self.linkedin_regex.search(text))
        has_github = bool(self.github_regex.search(text))

        sections_found = {}
        for sec_name, pattern in SECTION_PATTERNS.items():
            sections_found[sec_name] = bool(pattern.search(text))

        sec_count = sum(1 for v in sections_found.values() if v)

        score = 0
        if has_email: score += 20
        if has_phone: score += 15
        if has_linkedin or has_github: score += 15
        score += (sec_count * 8)  # up to 40 pts for 5 sections

        # Word count sweet spot (400 - 1000 words)
        if 400 <= word_count <= 1100:
            score += 10
        elif 250 <= word_count <= 1400:
            score += 5

        return {
            "score": min(100, score),
            "has_email": has_email,
            "has_phone": has_phone,
            "has_linkedin": has_linkedin,
            "has_github": has_github,
            "sections_found": sections_found,
            "sections_found_count": sec_count,
        }

    def _eval_impact(self, text: str) -> Dict[str, Any]:
        matches = self.metric_regex.findall(text)
        samples = []
        for m in matches:
            val = m[0] if isinstance(m, tuple) else m
            if val and val not in samples:
                samples.append(val.strip())

        metrics_count = len(samples)
        # 1-2 metrics: 40-60, 3-4 metrics: 75, 5+ metrics: 90-100
        if metrics_count == 0:
            score = 25
        elif metrics_count <= 2:
            score = 55
        elif metrics_count <= 4:
            score = 75
        elif metrics_count <= 7:
            score = 90
        else:
            score = 100

        return {
            "score": score,
            "metrics_count": metrics_count,
            "samples": samples,
            "feedback": (
                "Excellent quantifiable metrics detected." if score >= 85
                else "Add more numbers, percentages (%), and dollar metrics to prove tangible impact."
            ),
        }

    def _eval_action_verbs(self, text: str) -> Dict[str, Any]:
        lower_words = set(re.findall(r"\b[a-z]{3,}\b", text.lower()))
        found_strong = sorted(list(STRONG_ACTION_VERBS.intersection(lower_words)))

        weak_found = []
        for wp in WEAK_PHRASES:
            found = re.findall(wp, text, re.I)
            if found:
                weak_found.extend([f.lower() for f in found])

        strong_count = len(found_strong)
        weak_count = len(weak_found)

        if strong_count == 0:
            base_score = 30
        elif strong_count <= 2:
            base_score = 55
        elif strong_count <= 4:
            base_score = 78
        elif strong_count <= 7:
            base_score = 90
        else:
            base_score = 98

        score = base_score - (weak_count * 8)
        score = max(20, min(100, score))

        return {
            "score": score,
            "strong_verbs_count": strong_count,
            "weak_phrases_count": weak_count,
            "found_verbs": found_strong,
            "weak_phrases_found": list(set(weak_found)),
        }


    def _eval_relevance(
        self,
        text: str,
        target_role: Optional[str],
        job_description: Optional[str],
        sentence_bert_model: Optional[Any]
    ) -> Dict[str, Any]:
        lower_text = text.lower()

        # Find closest role key
        role_key = "full stack"
        if target_role:
            r = target_role.lower()
            if "front" in r: role_key = "frontend"
            elif "back" in r: role_key = "backend"
            elif "data" in r or "ml" in r or "machine" in r: role_key = "data science"
            elif "devops" in r or "cloud" in r: role_key = "devops"

        expected_keywords = ROLE_KEYWORD_TAXONOMY.get(role_key, ROLE_KEYWORD_TAXONOMY["full stack"])
        matched = []
        missing = []

        for kw in expected_keywords:
            if re.search(rf"\b{re.escape(kw.lower())}\b", lower_text):
                matched.append(kw)
            else:
                missing.append(kw)

        # Baseline score from keyword match ratio
        kw_ratio = len(matched) / max(1, len(expected_keywords))
        base_score = int(kw_ratio * 90) + 10

        # Semantic embedding alignment via Sentence-BERT if available
        semantic_sim = None
        if sentence_bert_model and (job_description or target_role):
            try:
                reference_text = job_description if job_description else f"Job description and requirements for a {target_role} role."
                from sentence_transformers import util
                embeddings = sentence_bert_model.encode([text[:3000], reference_text[:3000]], convert_to_tensor=True, show_progress_bar=False)
                sim = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
                semantic_sim = round(max(0.0, min(1.0, sim)), 3)
                # Blend keyword score with semantic similarity
                base_score = round((base_score * 0.5) + (semantic_sim * 100 * 0.5))
            except Exception as e:
                pass

        return {
            "score": min(100, max(25, base_score)),
            "target_role": target_role or "Full Stack Developer",
            "matched_keywords": matched,
            "matched_keywords_count": len(matched),
            "missing_keywords": missing,
            "semantic_similarity": semantic_sim,
        }

    def _eval_clarity_and_red_flags(self, text: str, word_count: int) -> Dict[str, Any]:
        # First-person pronouns count
        first_person = re.findall(r"\b(i|me|my|mine|myself)\b", text, re.I)
        first_person_count = len(first_person)

        # Buzzwords count
        buzzwords_found = []
        for bw in BUZZWORDS:
            matches = re.findall(bw, text, re.I)
            if matches:
                buzzwords_found.extend([m.lower() for m in matches])

        buzzword_count = len(buzzwords_found)

        score = 100
        score -= min(35, first_person_count * 7)
        score -= min(35, buzzword_count * 10)

        if word_count < 250:
            score -= 20
        elif word_count > 1600:
            score -= 15

        return {
            "score": max(20, min(100, score)),
            "first_person_count": first_person_count,
            "buzzwords_found": list(set(buzzwords_found)),
            "buzzwords_count": buzzword_count,
        }


# Global singleton
ats_engine = AtsScoringEngine()
