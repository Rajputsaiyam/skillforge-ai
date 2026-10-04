# SkillForge AI

> An AI-powered career intelligence platform that turns a resume, a target role and real learning activity into a practical plan for becoming job-ready.

SkillForge AI helps students and early-career professionals answer four important questions:

1. **What skills do I already have?**
2. **What skills am I missing for my target role?**
3. **What should I practise or learn next?**
4. **How can I improve my resume and interview performance?**

It combines resume parsing, role-based skill-gap analysis, an interactive skill graph, AI assessments, mock interviews, a career chatbot, ATS-oriented resume review, roadmap creation and application tracking in one responsive full-stack application.

---

## Contents

- [Problem statement](#problem-statement)
- [Solution and key objectives](#solution-and-key-objectives)
- [Scope](#scope)
- [Core features](#core-features)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [AI and ML pipeline](#ai-and-ml-pipeline)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [How to use the platform](#how-to-use-the-platform)
- [API overview](#api-overview)
- [Security and privacy](#security-and-privacy)
- [Known limitations](#known-limitations)
- [Future scope](#future-scope)
- [Troubleshooting](#troubleshooting)

---

## Problem statement

Students and job seekers usually use separate websites for resume creation, interview preparation, skill assessment, job discovery and learning resources. These tools often provide generic suggestions and do not connect a candidate's existing skills, resume, target role and progress. As a result, users may not know which missing skill matters most, whether their resume is ATS-friendly, or how to prepare for an interview in a measurable way.

**SkillForge AI solves this fragmentation** by creating a single career workspace. It analyses a user's resume and skill profile, compares them against a selected target role, identifies gaps, recommends a learning sequence and supports preparation through AI-guided practice.

## Solution and key objectives

SkillForge AI is a decision-support platform, not merely a chatbot. Its objectives are to:

- Extract useful career information from uploaded PDF and DOCX resumes.
- Build a personalised skill profile and visual skill graph.
- Compare the profile with target-role requirements to calculate skill gaps and career readiness.
- Generate adaptive lessons, quizzes and mock-interview conversations.
- Produce a prioritised learning roadmap with realistic milestones.
- Review a resume for ATS relevance against a pasted job description.
- Create a fact-grounded, printable ATS-friendly resume draft for user review.
- Track assessment outcomes, skill history, roadmap completion and applications over time.

## Scope

### In scope

- Individual learner and early-career professional use.
- Resume upload and parsing for text-based PDF and DOCX files.
- Role-based skill-gap analysis and career-readiness scoring.
- AI-assisted career guidance, assessment, mock interviews and resume improvement.
- Job/application tracking and compliant LinkedIn search/apply deep links.
- Responsive web interface for desktop, tablet and mobile devices.
- Admin tools for managing users, skills and mock jobs.

### Out of scope

- Guaranteed ATS scores, interviews or job offers.
- Scraping LinkedIn, job boards or private applicant data.
- Automated submission of job applications on a user's behalf.
- Replacing professional recruitment, legal, immigration or financial advice.
- Inventing candidate experience, employers, degrees or achievements in a resume.

---

## Core features

| Module | What it does |
|---|---|
| **Authentication and profiles** | JWT-protected accounts, target role, location and profile management. |
| **Resume Intelligence** | Parses PDF/DOCX files; extracts skills, projects, experience, education and certifications. |
| **ATS Resume Studio** | Analyses a resume against a job description, identifies relevant keywords and generates a fact-grounded draft template. |
| **Skill Graph** | Visualises skills, prerequisites, related skills and personalised recommendations. |
| **Skill Gap Engine** | Compares user proficiency with role requirements and prioritises gaps. |
| **AI Assessment** | Provides micro-lessons, MCQs and open-ended questions calibrated to skill level. |
| **AI Mock Interview** | Runs an adaptive interview conversation and returns a strengths/improvements scorecard. |
| **Career Chatbot** | Answers career questions using selected user context such as resume, skills and gaps. |
| **Learning Roadmap** | Produces a weekly, prioritised learning plan with progress tracking. |
| **Jobs and Applications** | Displays mock/provider jobs, match information and application tracking; creates LinkedIn deep links without scraping. |
| **Progress Analytics** | Shows readiness, assessment performance, learning milestones, applications and skill history. |
| **Admin Workspace** | Provides administrative views for users, skills, jobs, analytics and activity. |

---

## Technology stack

### Front end

| Technology | Use |
|---|---|
| React 18 + Vite | Component-based SPA and development tooling |
| Tailwind CSS | Responsive UI system and design tokens |
| React Router | Client-side routing and protected routes |
| Axios | Communication with REST APIs |
| Recharts | Progress and analytics visualisation |
| React Flow | Interactive skill-graph visualisation |
| Framer Motion | Lightweight UI transitions |
| Lucide React | Consistent iconography |

### Back end

| Technology | Use |
|---|---|
| Node.js + Express.js | REST API and application services |
| MongoDB + Mongoose | User, resume, skill, assessment, roadmap and application persistence |
| JWT + bcryptjs | Authentication and password security |
| Multer | Secure multipart file upload handling |
| pdf-parse + Mammoth | PDF and DOCX text extraction |
| Natural + string-similarity | Tokenisation, exact/fuzzy skill matching |

### AI and ML

| Technology | Use |
|---|---|
| Google Gemini API | Server-side structured generation for chat, interviews, assessments, roadmaps and resume review |
| FastAPI | Python ML microservice |
| Sentence-Transformers (`all-MiniLM-L6-v2`) | Semantic resume/job matching, skill ranking and retrieval |
| BERT NER (`dslim/bert-base-NER`) | Organisation and person entity extraction |
| FLAN-T5 | Optional local text generation fallback |
| PyTorch + Transformers | Local model inference |

---

## System architecture

```text
┌─────────────────────────────────────────────────────────┐
│ React + Vite client                                      │
│ Dashboard · Resume Studio · Assessments · Roadmap · Chat │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼─────────────────────────────┐
│ Node.js + Express API                                    │
│ Auth · Business rules · Resume orchestration · Gemini    │
└───────────────┬───────────────────────────┬─────────────┘
                │                           │
      ┌─────────▼─────────┐       ┌─────────▼─────────────┐
      │ MongoDB           │       │ Python FastAPI ML      │
      │ Users, resumes,   │       │ Semantic matching, NER │
      │ skills, progress  │       │ local AI fallbacks     │
      └───────────────────┘       └───────────────────────┘
                │
                ▼
      Google Gemini API (server-side only)
```

### Design principles

- **API keys remain server-side.** The browser never receives `GEMINI_API_KEY`.
- **Graceful degradation.** When Gemini or the ML service is unavailable, explainable local rules and safe templates keep core flows operational.
- **Fact grounding.** Resume generation prompts are instructed to use supplied facts only; users must review generated content before using it.
- **Modularity.** Front end, Express API and Python ML service can be developed and deployed independently.

---

## AI and ML pipeline

### 1. Resume parsing and skill extraction

1. Extract text from a PDF or DOCX resume.
2. Normalise text to reduce line-break and formatting artefacts.
3. Detect skills using taxonomy aliases, exact matching and fuzzy matching.
4. Optionally use semantic ranking to find meaning-related skills.
5. Detect education, experience, projects and certifications.
6. Persist structured results and merge confirmed skills into the user's profile.

### 2. Skill gaps and readiness

The platform compares the user's recorded proficiency with role requirements. A gap is prioritised by skill importance and the difference between current and required level. The resulting information drives the Skill Graph, roadmap and chatbot context.

### 3. Generative AI flows

Gemini is called through the backend for:

- Context-aware career chatbot replies.
- Short skill lessons and quiz questions.
- Adaptive mock-interview questions and structured interview scorecards.
- Roadmap content based on priority skill gaps.
- ATS review, keyword suggestions and resume drafts.

Structured JSON output is requested and validated before the application displays it. If the configured model is unavailable, the server uses fallback logic instead of exposing an error to the user.

---

## Project structure

```text
skillforge-ai/
├── frontend/                         # React + Vite application
│   └── src/
│       ├── components/               # Layout, UI, charts, chat, resume, skills
│       ├── pages/                    # User and admin screens
│       ├── services/                 # Axios API clients
│       ├── context/                  # Auth and application state
│       └── routes/                   # Protected/admin route guards
├── backend/                          # Express API
│   ├── controllers/                  # Request handlers
│   ├── services/                     # Business logic and AI providers
│   ├── models/                       # Mongoose schemas
│   ├── routes/                       # REST endpoint definitions
│   ├── middleware/                   # Auth, upload and error middleware
│   ├── data/                         # Skill taxonomy and mock jobs
│   └── utils/                        # Context builder, logging, token helper
├── ml-service/                       # FastAPI ML microservice
│   ├── main.py                       # ML endpoints and model loading
│   └── requirements.txt
├── docs/                             # Project documentation and synopsis
└── README.md
```

---

## Quick start

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Community Edition or a MongoDB Atlas connection string
- Python 3.10 or later (recommended for ML features)
- A Gemini API key (recommended for generative AI features)

### 1. Start MongoDB

On macOS with Homebrew:

```bash
brew services start mongodb-community
```

Use your own MongoDB service command if you are on Windows or Linux.

### 2. Configure and start the back end

```bash
cd backend
npm install
cp .env.example .env
```

Set a strong `JWT_SECRET`, correct `MONGO_URI`, and optionally configure Gemini in `backend/.env`:

```env
GEMINI_API_KEY=your_new_key_here
GEMINI_MODEL=gemini-3.5-flash
```

Then run:

```bash
npm run seed
npm run dev
```

Back end health endpoint: `http://localhost:5000/api/health`

### 3. Start the optional ML service

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

ML service health endpoint: `http://localhost:8000/health`

> First launch can download model files. Internet access is required for the initial download. Gemini-powered server features can still work when the Python ML service is unavailable.

### 4. Start the front end

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Run all three services

| Terminal | Command | Address |
|---|---|---|
| 1 | `cd backend && npm run dev` | `http://localhost:5000` |
| 2 | `cd ml-service && source venv/bin/activate && uvicorn main:app --reload --port 8000` | `http://localhost:8000` |
| 3 | `cd frontend && npm run dev` | `http://localhost:5173` |

---

## Environment configuration

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env`. Never commit the actual `.env` file.

| Variable | Required | Purpose |
|---|:---:|---|
| `PORT` | No | Express port; defaults to `5000` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d` |
| `CLIENT_URL` | Yes | Front-end origin for CORS |
| `ML_SERVICE_URL` | No | FastAPI service URL; defaults to `http://localhost:8000` |
| `GEMINI_API_KEY` | Recommended | Server-only Gemini API key |
| `GEMINI_MODEL` | No | Gemini model identifier; defaults to `gemini-3.5-flash` |
| OAuth and job-provider variables | Optional | Enable only when authorised credentials are available |

### Key safety

- Put Gemini keys in **`backend/.env` only**.
- Do not put keys in `frontend/.env`, React code, screenshots or documentation.
- If a key is accidentally exposed, revoke it in Google AI Studio and create a new key immediately.
- Keep `.env.example` values blank and non-sensitive.

---

## How to use the platform

1. Register or sign in.
2. Complete your profile and choose a target role.
3. Upload a text-based PDF or DOCX resume.
4. Review detected skills, role gaps and ATS recommendations in **Resume Studio**.
5. Explore your **Skill Graph** and generate a **Learning Plan**.
6. Use **Practice Lab** for lessons, assessments or an AI mock interview.
7. Track applications and open compliant LinkedIn search/apply links.
8. Check **Progress** to see readiness, assessment history and skill checkpoints.

---

## API overview

All protected endpoints require a JWT bearer token after login.

| Area | Base route | Example capabilities |
|---|---|---|
| Authentication | `/api/auth` | Register, login, password reset and OAuth placeholders |
| Resume | `/api/resume` | Upload, latest analysis, ATS review and draft generation |
| Skills | `/api/skills` | Skill graph, user skills and skill-related data |
| Assessments | `/api/assessments` | Lessons, quizzes, answer submission and mock interviews |
| Roadmap | `/api/roadmap` | Generate, retrieve and update roadmap progress |
| Progress | `/api/progress` | Readiness and analytics aggregates |
| Jobs | `/api/jobs` | Search/list job data and matching information |
| Applications | `/api/applications` | Track application status |
| Chat | `/api/chat` | Context-aware coach messages and history reset |
| Profile | `/api/profile` | Read/update profile and career preferences |
| Admin | `/api/admin` | Administrative users, skills, jobs and analytics |

---

## Security and privacy

- Passwords are hashed with `bcryptjs`; plaintext passwords are not stored.
- JWT-protected routes isolate user data by authenticated user ID.
- Resume uploads are processed by the server; temporary upload files are removed after parsing.
- Gemini requests are made from the Express service, keeping API credentials away from the browser.
- The project should be served through HTTPS and use a managed database with access controls in production.
- Users should review every AI-generated resume bullet and recommendation for correctness.

---

## Known limitations

- ATS scores are estimates, not hiring guarantees.
- Text extraction quality depends on the source document; image-only/scanned PDFs require OCR support, which is not yet included.
- Local model downloads can be large and slow on first run.
- Gemini free-tier models have quotas and model availability varies by account/project.
- AI answers can be unavailable or imperfect; fallback responses are intentionally shown when a reliable answer cannot be generated.
- Job listings currently use seeded/mock data unless an authorised job provider is configured.
- LinkedIn support uses deep links; it does not scrape or directly submit applications.

---

## Future scope

- OCR for scanned resumes and multilingual parsing.
- Export resume drafts to DOCX and styled PDF.
- Voice-based interview simulation and feedback.
- Mentor/college-placement dashboards with consent-based aggregate analytics.
- Authorised real-time job-provider integration.
- More target roles, richer skill taxonomies and course-provider integrations.
- Evaluation datasets for parser quality, assessment quality and AI-answer safety.
- Background processing, rate limiting, audit logging and cloud deployment automation.

---

## Troubleshooting

### Gemini shows “Local AI fallback”

1. Confirm the backend is running: `curl http://localhost:5000/api/health`.
2. Confirm `geminiConfigured` is `true` in the response.
3. Restart the backend after changing `backend/.env`.
4. Check backend terminal logs for the Gemini status code:
   - `401`: invalid/revoked API key.
   - `403`: permission, API enablement or key restriction issue.
   - `404`: configured model is unavailable for the project; use an available Flash model.
   - `429`: free-tier rate limit or quota reached.
5. Never paste an API key into a chat, issue or screenshot.

### Front end shows a Vite/PostCSS overlay

```bash
cd frontend
npm run dev
```

Read the file and line number in the overlay. After updating the code, Vite normally reloads automatically. Verify the production build with:

```bash
npm run build
```

### ML service does not start

```bash
cd ml-service
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Check `http://localhost:8000/health`. If model files cannot download, verify the internet connection or run without the optional ML service; the Node back end retains safe fallbacks.

---

## Documentation

- [Project synopsis](docs/SkillForge_AI_Synopsis.md)
- [ML service notes](ml-service/README.md)
- [Backend environment template](backend/.env.example)

---

## Academic note

SkillForge AI is an academic full-stack AIML project. It demonstrates practical integration of web engineering, NLP, semantic ML, generative AI and responsible fallback design for career preparation. It is intended to assist users' decisions, not to replace human judgement in recruitment.
