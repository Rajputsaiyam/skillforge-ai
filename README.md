# SkillForge AI

> **Next-Generation AI Career Intelligence, Dedicated ATS Scoring Engine, Live Video & Voice Mock Interview Simulation with Face Proctoring, and Profile-Grounded AI Career Coach.**

SkillForge AI turns a candidate's resume, target role, and active learning performance into a structured, verifiable plan for becoming job-ready. It bridges the gap between fragmented career tools by uniting resume intelligence, role-based skill gap analytics, an interactive dependency skill graph, live webcam and voice-enabled mock interviews with real-time proctoring alerts, grounded conversational AI, an enterprise-grade ATS scoring engine, and live job tracking into a single, cohesive full-stack platform.

---

## Table of Contents

- [Live Demo & Deployment](#live-demo--deployment)
- [Problem Statement](#problem-statement)
- [Solution & Value Proposition](#solution--value-proposition)
- [Core Features](#core-features)
  - [1. Live Video & Voice Mock Interview with AI Face Proctoring](#1-live-video--voice-mock-interview-with-ai-face-proctoring)
  - [2. Dedicated ATS Scoring Engine (v2.0)](#2-dedicated-ats-scoring-engine-v20)
  - [3. Profile-Grounded AI Career Copilot](#3-profile-grounded-ai-career-copilot)
  - [4. Interactive Skill Graph & Gap Engine](#4-interactive-skill-graph--gap-engine)
  - [5. Dynamic Learning Roadmap & Adaptive Assessments](#5-dynamic-learning-roadmap--adaptive-assessments)
  - [6. Live Job Discovery & Geolocation Intelligence](#6-live-job-discovery--geolocation-intelligence)
  - [7. Modern Obsidian Glassmorphic UI/UX](#7-modern-obsidian-glassmorphic-uiux)
- [System Architecture](#system-architecture)
- [AI & ML Pipelines](#ai--ml-pipelines)
  - [Live Mock Interview & Face Proctoring Pipeline](#live-mock-interview--face-proctoring-pipeline)
  - [ATS Scoring Pipeline](#ats-scoring-pipeline)
  - [Profile Grounding & Knowledge Retrieval Pipeline](#profile-grounding--knowledge-retrieval-pipeline)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (Node.js / Express)](#1-backend-setup-nodejs--express)
  - [2. Machine Learning Microservice (FastAPI + PyTorch)](#2-machine-learning-microservice-fastapi--pytorch)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [Deployment Guide](#deployment-guide)
  - [Deploying Backend to Render](#deploying-backend-to-render)
  - [Deploying Frontend to Vercel / Netlify / Render](#deploying-frontend-to-vercel--netlify--render)
  - [Configuring MongoDB Atlas](#configuring-mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [REST API Reference](#rest-api-reference)
- [Security & Resilience](#security--resilience)
- [Troubleshooting](#troubleshooting)
- [Academic & Production Note](#academic--production-note)

---

## Live Demo & Deployment

- **Backend API (Render):** `https://skillforge-ai-7.onrender.com`
- **Backend Health Check:** `https://skillforge-ai-7.onrender.com/api/health`
- **Database:** MongoDB Atlas Cloud Cluster (Replica Set)
- **AI Core:** Enterprise Multi-Model Intelligence Pipeline

---

## Problem Statement

Traditional career preparation is fragmented across disconnected utilities:
- One website for resume generation.
- Another for practice quizzes or DSA problems.
- Third-party mock interview platforms requiring human scheduling.
- Separate job portals with blind application submissions.

These utilities offer generic advice that fails to connect a candidate's existing experience to their target role. Candidates submit resumes without knowing if Applicant Tracking Systems (ATS) can parse their structure, which critical skill gaps exist, or how their interview communication holds up under pressure.

**SkillForge AI eliminates this fragmentation.** It provides an end-to-end intelligence engine that extracts candidate competencies from uploaded resumes, computes multi-dimensional ATS readiness against job descriptions, conducts real-time video and voice mock interviews with live proctoring checks, visualizes skill dependencies, and generates calibrated weekly learning roadmaps.

---

## Solution & Value Proposition

SkillForge AI functions as an intelligent career decision-support system:

1. **Extracts verified evidence:** Parses text-based PDF and DOCX resumes into structured skill, project, education, and experience models.
2. **Quantifies hiring readiness:** Benchmarks candidate profiles against target industry roles (e.g., Full Stack Engineer, Machine Learning Engineer, Cloud Architect).
3. **Conducts live video and voice simulations:** Runs realistic turn-based mock interviews with Nexora (AI Interviewer) featuring open webcam preview, microphone audio checks, live face/multi-human proctoring alerts, speech synthesis, and real-time speech transcription.
4. **Calculates objective ATS scores:** Uses a dedicated NLP engine to evaluate parseability, Google X-Y-Z quantified impact, action verbs, and keyword density.
5. **Context-Aware Career Advisory:** Provides a 24/7 career coach backed by transparent profile citations that ground advice directly in candidate resume and skill graph data.

---

## Core Features

### 1. Live Video & Voice Mock Interview with AI Face Proctoring
- **Structured 4-Step Interview Workflow:**
  - **Step 1 (Setup):**
    - Drag & drop PDF/DOCX resume upload (8 MB limit) or 1-click selection of candidate's verified profile resume.
    - Role description input field to guide interview questions toward specific job openings.
    - Selectable interview type: *Technical Interview*, *System Design Interview*, *Behavioral (STAR) Interview*, or *HR & Culture Fit*.
    - Flexible length selection: *3 questions (Quick Warmup)*, *5 questions (Standard Loop)*, or *8 questions (In-Depth Round)*.
  - **Step 2 (Introduction & Device Check):**
    - Live webcam preview with client-side video rendering.
    - Real-time microphone audio visualizer responding dynamically to candidate voice levels.
    - **Intelligent Client-Edge Proctoring (BlazeFace Deep Learning):**
      - **Face Visibility Alert:** If the candidate's face is not visible in the frame, the system displays an immediate warning: `⚠️ Face not detected! Please ensure your face is clearly visible and centered.`
      - **Multi-Human Detection Alert:** If more than one person appears in the webcam stream, the system displays an alert: `⚠️ Multiple people detected! Only one candidate is allowed during the interview.`
      - **Single Human Verification:** Displays `✓ Candidate verified (1 person detected) · Ready` when properly framed.
  - **Step 3 (Live Interview with Voice Agent):**
    - Dual-tile studio layout: Nexora (Senior AI Interviewer) tile with dynamic speaking audio waveforms alongside the candidate's live webcam video stream.
    - Spoken questions via Text-to-Speech (TTS) with one-click repeat option.
    - Live Speech-to-Text (STT) transcription capturing spoken answers in real-time with visual speech wave animations and editable text input.
    - Background proctoring monitoring that flags interruptions or unverified frames throughout the session.
  - **Step 4 (Comprehensive Scorecard & Actionable Advice):**
    - Overall score (0–100) with rating pill (*Strong Hire*, *Hire*, *Needs Practice*).
    - Multi-dimensional competency breakdown: Technical Depth, Communication & Clarity, Problem Solving & Structure, and Confidence & Delivery.
    - Proctoring integrity audit summarizing face verification consistency and flags.
    - Actionable strategic advice and question-by-question critique for interview improvement.

### 2. Dedicated ATS Scoring Engine (v2.0)
- **Multi-Factor Algorithmic Scoring:**
  - **Section Parseability:** Confirms presence of standard headers (Contact, Summary, Experience, Education, Skills, Projects, Certifications).
  - **Quantified Impact (Google X-Y-Z):** Detects measurable metrics, percentages, revenue impact, and scale indicators.
  - **Action Verb Power:** Validates active voice usage (e.g., *Architected*, *Engineered*, *Optimized*) over passive wording.
  - **Domain Keyword Overlap:** Employs Sentence-BERT (`all-MiniLM-L6-v2`) and fuzzy token matching against target role job descriptions.
  - **Layout & Density Validation:** Penalizes resume length anomalies and buzzword stuffing.
- **Dedicated Interactive UI:** Real-time radial score gauge, factor breakdown progress meters, missing critical keyword chips, and prioritized improvement tips.

### 3. Profile-Grounded AI Career Copilot
- **Transparent Citations & Grounding:** Cites context pills (Resume Profile, Target Role, Skill Gaps, Roadmap Milestones) so candidates know exactly why advice is given.
- **Rich Markdown Formatting:** Powered by `react-markdown` and `remark-gfm` with bold typography, code blocks, lists, and callout pills.
- **Resilient AI Pipeline:** Automatic multi-endpoint failover and deterministic local fallback ensure the coach remains available 24/7.

### 4. Interactive Skill Graph & Gap Engine
- **Visual Graph Intelligence:** Powered by React Flow with custom nodes, glowing edges, and zoom/pan controls.
- **Dependency Hierarchy:** Visualizes prerequisites, core technical competencies, and complementary secondary skills.
- **Role Gap Calculation:** Compares current candidate level (1–5) with target role baseline requirements, prioritizing high-impact missing skills.

### 5. Dynamic Learning Roadmap & Adaptive Assessments
- **Milestone-Based Roadmaps:** Generates weekly structured roadmaps prioritizing high-severity skill gaps.
- **Adaptive Practice Lab:** Generates bite-sized micro-lessons and MCQ/open-ended assessment questions calibrated to candidate proficiency.

### 6. Live Job Discovery & Geolocation Intelligence
- **Live Job Aggregation:** Integrates with job feeds and generates compliant, deep-linked LinkedIn search and application URLs.
- **IP Geolocation Auto-Detection:** Automatically detects candidate country and city via `ipapi.co` to tailor local job opportunities.
- **Application Lifecycle Tracking:** Tracks jobs across *Saved*, *Applied*, *Interviewing*, *Offered*, and *Rejected* statuses.

### 7. Automated Cold Email Studio (10-per-Batch Outreach)
- **Controlled 10-Email Batching:** Protects sender domain reputation and primary inbox placement by enforcing a maximum of 10 targeted leads per batch.
- **5 Proven Tech Email Strategies:** High-Impact Project Pitch, Direct Value & Scale, Internship & Early Career, Warm Referral, and 4-Day Follow-Up Nudge.
- **Real-Time Recruiter Injection:** Automatically substitutes `{{hr_name}}`, `{{company}}`, `{{target_role}}`, and personal context per lead.
- **Live macOS Mail Client Preview:** Dual-pane interactive preview allowing candidates to inspect customized emails across all batched recipients before dispatching.
- **Deliverability & Spam Auditor:** Real-time deliverability score (optimal length, trigger-word check, verified attachment pills).
- **Staggered Simulation & Scheduling:** Simulated dispatch engine with anti-spam delay intervals and optimal send-time scheduling (Tue–Thu 9:15 AM IST).

### 8. Modern Obsidian Glassmorphic UI/UX
- **Aesthetic Excellence:** Deep obsidian canvas with ambient indigo, violet, and emerald accents.
- **Glassmorphic Design:** `backdrop-blur-xl` panels, micro-borders, and tactile hover states.
- **Fluid Micro-Animations:** Motion transitions powered by Framer Motion.
- **Responsive Layout:** Dynamic collapsible navigation sidebar and topbar with global search, streak counter, and readiness indicator.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       Client Tier (React 18 + Vite)                     │
│  Glassmorphic UI · React Flow · BlazeFace Proctoring · Web Speech Voice │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON / Bearer JWT
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Application Tier (Node.js + Express)                 │
│  Helmet · Rate Limiting · Gzip · Multer · Auth · Context Orchestrator   │
└───────────────┬────────────────────────────┬────────────────────────────┘
                │                            │
      ┌─────────▼─────────┐        ┌─────────▼────────────────────────────┐
      │   Database Tier   │        │     Python ML Microservice (FastAPI) │
      │   MongoDB Atlas   │        │  Sentence-BERT · BERT-NER · Flan-T5  │
      │  Replica Cluster  │        │  Dedicated ATS Engine (ats_scorer.py)│
      └───────────────────┘        └──────────────────────────────────────┘
                │
                ▼
      ┌───────────────────────────────────────┐
      │  Enterprise AI Intelligence Pipeline  │
      │  Dynamic Adaptive Interview Reasoning │
      │  Structured JSON Evaluation Engine    │
      └───────────────────────────────────────┘
```

---

## AI & ML Pipelines

### Live Mock Interview & Face Proctoring Pipeline

```text
Webcam Stream ──► BlazeFace Deep Learning Model ──► Face Count Evaluator
                                                           │
        ┌──────────────────────────────────────────────────┴──────────────────────────────────────┐
        ▼                                                  ▼                                      ▼
[0 Faces Detected]                                [1 Face Detected]                      [>1 Faces Detected]
⚠️ "Face not detected! Center your face."        ✓ "Candidate verified · Ready"         ⚠️ "Multiple people detected! Only 1 allowed."
(Logs Proctoring Notice)                                                                 (Logs Proctoring Notice)

Candidate Speaks ──► Browser SpeechRecognition (STT) ──► Conversational Turn Engine
                                                              │
Speaker Audio ◄── Browser SpeechSynthesis (TTS) ◄── Adaptive Interview Prompt Engine
                                                              │
                                                              ▼
                  Multi-Factor Scorecard (Technical, Communication, Confidence, Advice)
```

### ATS Scoring Pipeline

```text
Uploaded Resume (PDF/DOCX)
       │
       ▼
Text Normalization & Header Segmentation
       │
       ├─► Contact & Section Parser (Contact, Experience, Education, Skills)
       ├─► Quantified Metric Extractor (Percentages, Metrics, Google X-Y-Z)
       ├─► Action Verb Classifier (Strong vs. Passive verbs)
       └─► Keyword Extraction & Dense Cosine Match (Sentence-BERT vs. Job Description)
       │
       ▼
Weighted Multi-Factor Formula
       │
       ▼
Comprehensive ATS Score (0–100) + Priority Improvement Suggestions
```

### Profile Grounding & Knowledge Retrieval Pipeline

```text
User Career Query + User State (Resume, Gaps, Roadmap)
                       │
                       ▼
           Context Chunk Retrieval
      (BM25 Lexical + Semantic Keywords)
                       │
                       ▼
           Prompt Assembly & Grounding
                       │
                       ▼
         Enterprise Generative Intelligence Core
                       │ (On Failover)
                       ▼
      Deterministic Local Fallback Synthesis
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | `^18.3.1` | Component-based Single Page Application |
| **Vite** | `^5.4.0` | Build tool and fast HMR development server |
| **TailwindCSS** | `^3.4.9` | Responsive utility-first design system |
| **Framer Motion** | `^11.3.24` | Layout animations, slide-overs, and transitions |
| **TensorFlow.js + BlazeFace** | Latest | Real-time browser face and multi-human proctoring detection |
| **React Flow** | `^11.11.4` | Interactive node-based Skill Graph visualization |
| **Recharts** | `^2.12.7` | Readiness metrics, ATS gauges, and radar charts |
| **React Markdown** | `^10.1.0` | Rich formatting for chatbot answers and lessons |
| **Web Speech API** | Native | Client-side Speech Recognition (STT) & Synthesis (TTS) |
| **Lucide React** | `^0.427.0` | Cohesive iconography |

### Backend API
| Technology | Version | Purpose |
|---|---|---|
| **Node.js + Express** | `^4.19.2` | REST API framework and application service tier |
| **MongoDB + Mongoose** | `^8.5.0` | Document database for profiles, skills, roadmaps |
| **JWT + bcryptjs** | `^9.0.2` | Secure token authentication and password hashing |
| **Helmet** | `^8.3.0` | Production HTTP security headers |
| **Compression** | `^1.8.2` | High-performance gzip/deflate response compression |
| **Express Rate Limit** | `^8.7.0` | Global, Auth, and AI endpoint abuse protection |
| **Multer** | `^1.4.5` | Secure multipart file upload handling |
| **pdf-parse + Mammoth** | `^1.1.1` | Text extraction from PDF and DOCX files |

### Machine Learning Microservice
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI + Uvicorn** | Python 3.10+ | High-performance async ML web framework |
| **Sentence-Transformers** | `all-MiniLM-L6-v2` | Dense vector embeddings and semantic cosine similarity |
| **BERT-NER** | `dslim/bert-base-NER` | Named entity recognition for clean resume parsing |
| **Flan-T5** | `flan-t5-base` | Local generative fallback for offline assessments |
| **Dedicated ATS Scorer** | Custom | Multi-factor heuristic and semantic ATS engine |

---

## Project Directory Structure

```text
skillforge-ai/
├── frontend/                         # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/               # UI components
│   │   │   ├── interview/            # LiveMockInterview (Webcam + Voice + Proctoring)
│   │   │   ├── chat/                 # ChatbotWidget with Markdown & citations
│   │   │   ├── resume/               # AtsScoreChecker & ResumeStudio components
│   │   │   ├── layout/               # Modern Sidebar and Topbar navigation
│   │   │   └── ui/                   # Button, Card, Modal, Input primitives
│   │   ├── hooks/                    # useFaceDetection (BlazeFace proctoring)
│   │   ├── pages/                    # Route pages
│   │   │   ├── Dashboard/            # Analytics and readiness overview
│   │   │   ├── Assessment/           # Live Mock Interview & Practice Lab
│   │   │   ├── Resume/               # Resume Studio and ATS Scorer
│   │   │   ├── Skills/               # Interactive React Flow Skill Graph
│   │   │   ├── Roadmap/              # Step-by-step career milestones
│   │   │   ├── Jobs/                 # Job discovery with geolocation sync
│   │   │   └── Landing/              # Modern obsidian landing page
│   │   ├── services/                 # Axios API client services
│   │   └── context/                  # AuthContext and AppState
├── backend/                          # Node.js + Express API
│   ├── config/                       # Database and passport configurations
│   ├── controllers/                  # Handlers for auth, resume, chat, assessments
│   ├── services/                     # AI reasoning cascade, ML client, resume parser
│   ├── models/                       # Mongoose schemas (User, Resume, Skill, etc.)
│   ├── routes/                       # Express REST endpoints
│   ├── middleware/                   # Rate limiting, auth, upload filters
│   └── server.js                     # Express app setup and health probes
├── ml-service/                       # Python FastAPI ML Microservice
│   ├── main.py                       # FastAPI application and routing
│   ├── ats_scorer.py                 # Dedicated ATS scoring engine
│   └── requirements.txt              # PyTorch, Transformers, FastAPI dependencies
├── docs/                             # Architecture synopsis and documentation
└── README.md                         # Project documentation
```

---

## Quick Start Guide

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ (for the optional local ML microservice)
- **MongoDB** local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **AI API Credentials** configured in backend environment

---

### 1. Backend Setup (Node.js / Express)

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```

3. Configure your `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/SkillForgeAI?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ML_SERVICE_URL=http://localhost:8000
   ```

4. Seed initial skills, roles, and mock data:
   ```bash
   npm run seed
   ```

5. Launch the backend server:
   ```bash
   npm run dev
   ```
   *Backend will run at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

---

### 2. Machine Learning Microservice (FastAPI + PyTorch)

> **Note:** The backend has built-in rule-based fallbacks. The Python ML service is recommended for full Sentence-BERT semantic matching and the dedicated ATS scoring engine.

1. Navigate to the ML directory:
   ```bash
   cd ml-service
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate       # On Windows: venv\Scripts\activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *ML Microservice will run at `http://localhost:8000` (Health Check: `http://localhost:8000/health`).*

---

### 3. Frontend Setup (React + Vite)

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

### Running All Three Services Concurrently

| Terminal | Path | Command | Local URL |
|:---:|---|---|---|
| **1** | `backend/` | `npm run dev` | `http://localhost:5000` |
| **2** | `ml-service/` | `source venv/bin/activate && uvicorn main:app --reload --port 8000` | `http://localhost:8000` |
| **3** | `frontend/` | `npm run dev` | `http://localhost:5173` |

---

## Deployment Guide

### Deploying Backend to Render

The Express backend is production-ready for deployment on **Render**:

1. **Create Web Service:** Connect your GitHub repository on Render.
2. **Configure Settings:**
   - **Root Directory:** `backend` *(CRITICAL: ensure this points to the backend folder)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Variables:** Add the following in Render's dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` *(or leave blank for Render default)*
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `<your_production_secret>`
   - `CLIENT_URL` = `https://your-frontend-app.vercel.app`
4. **Verification:**
   - Root URL `GET /` returns JSON confirmation: `🚀 SkillForge AI Backend API is live and running!`
   - Health Probe `GET /api/health` returns database connectivity and memory usage.

### Deploying the ML Service to Render

The repository includes a `render.yaml` Blueprint for the FastAPI service. You can
either create it from **New → Blueprint** in Render or create a Web Service with
these settings:

1. **Repository:** `Rajputsaiyam/skillforge-ai`
2. **Root Directory:** `ml-service`
3. **Runtime:** `Python`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Health Check Path:** `/health`
7. **Environment Variables:**
   - `PYTHON_VERSION` = `3.14.8`
   - `ML_SERVICE_API_KEY` = a long random secret shared only with the backend

After the ML service deploys, set these variables on the existing backend Render
service:

```env
ML_SERVICE_URL=https://<your-ml-service>.onrender.com
ML_SERVICE_API_KEY=<the-same-secret-as-the-ml-service>
```

The ML service leaves `/health` public for Render probes but requires the
`x-ml-service-key` header for inference endpoints. Sentence-BERT, BERT-NER, and
Flan-T5 now load lazily only when their endpoints are used, so the web server can
bind its Render port before model initialization. Free Render services still
have tight memory and cold-start limits, so heavy NER/generation requests may
fall back or require an upgrade if the service is killed for memory.

### Deploying Frontend to Vercel / Netlify / Render

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Root Directory:** `frontend`
4. **Environment Variables:**
   - `VITE_API_URL` = `https://skillforge-ai-7.onrender.com/api`

### Configuring MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a Database User with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from cloud hosting platforms (Render, Vercel).
4. Copy the connection string and paste it into `MONGO_URI`.

---

## Environment Configuration

| Variable | Required | Default | Purpose |
|---|:---:|:---:|---|
| `PORT` | No | `5000` | Server listening port |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `MONGO_URI` | **Yes** | — | MongoDB Atlas or local connection URI |
| `JWT_SECRET` | **Yes** | — | Cryptographic secret for signing auth tokens |
| `JWT_EXPIRES_IN`| No | `7d` | Token expiration duration |
| `CLIENT_URL` | **Yes** | `http://localhost:5173` | Allowed CORS origin for frontend |
| `ML_SERVICE_URL`| No | `http://localhost:8000` | Address of Python FastAPI microservice |

---

## REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new candidate account.
- `POST /api/auth/login` — Authenticate and obtain JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Resume Intelligence (`/api/resume`)
- `POST /api/resume/upload` — Upload and parse PDF/DOCX resume file.
- `GET /api/resume/latest` — Fetch latest parsed resume data and skills.
- `POST /api/resume/ats-score` — Run dedicated ATS score check on resume text.
- `POST /api/resume/review` — Run ATS keyword comparison against a target job description.
- `POST /api/resume/generate-draft` — Generate fact-grounded ATS-friendly resume draft.

### Skill Intelligence (`/api/skills`)
- `GET /api/skills/graph` — Retrieve interactive skill graph taxonomy nodes and edges.
- `GET /api/skills/my-skills` — List user's verified and identified skills.
- `POST /api/skills/target-role` — Update candidate target role and recalculate gaps.

### Assessments & Live Mock Interview (`/api/assessments`)
- `GET /api/assessments/lesson/:skillId` — Retrieve AI-generated micro-lesson for a skill.
- `GET /api/assessments/quiz/:skillId` — Generate adaptive quiz calibrated to skill level.
- `POST /api/assessments/submit` — Submit quiz answers for scoring and skill level updates.
- `POST /api/assessments/interview/start` — Initialize a Live AI Mock Interview with Nexora.
- `POST /api/assessments/interview/continue` — Process conversational turn for voice/text interview.
- `POST /api/assessments/interview/end` — Finalize interview and generate multidimensional performance report with proctoring audit.

### Career Roadmap (`/api/roadmap`)
- `GET /api/roadmap` — Retrieve active milestone-based learning roadmap.
- `POST /api/roadmap/generate` — Generate custom roadmap based on prioritized skill gaps.
- `PUT /api/roadmap/step/:stepId` — Mark milestone step as completed.

### Career Chatbot (`/api/chat`)
- `POST /api/chat/message` — Send query to profile-grounded AI Career Coach (returns citations + Markdown).
- `GET /api/chat/history` — Fetch recent conversational turns.
- `DELETE /api/chat/history` — Reset career coach conversation session.

### Job Discovery & Automation (`/api/jobs`)
- `GET /api/jobs` — Retrieve matched jobs with match percentages and LinkedIn deep links.
- `GET /api/jobs/automation/config` — Fetch candidate's automated search and filtering rules.
- `POST /api/jobs/automation/config` — Update automated role, salary, location, and negative keyword filters.
- `POST /api/jobs/automation/run` — Execute multi-platform job aggregation (LinkedIn, Indeed, Naukri, Company Career Pages), hyper-local proximity distance calculation (Haversine km), tailored AI pitch generation, and auto-queuing pipeline (100% free).
- `GET /api/applications` — Retrieve candidate tracked applications.
- `POST /api/applications` — Save or update job application status.

### Cold Outreach Studio (`/api/cold-email`)
- `POST /api/cold-email/send` — Dispatch cold outreach email batch (1 to 10 recipients per batch) using verified developer email (`saiyamrajput71@gmail.com`) via Nodemailer SMTP or verified batch simulation.
- `GET /api/cold-email/history` — Fetch recent batch dispatch logs and delivery statuses stored in MongoDB.
- `GET /api/cold-email/stats` — Retrieve overall outreach metrics (total batches, total delivered, delivery rate %).

---

## Security & Resilience

1. **Zero Client Secret Exposure:** API credentials and database connection secrets are strictly held in backend environment variables and never transmitted to the browser.
2. **Adaptive Rate Limiting:**
   - Global rate limit: 300 requests per 15 minutes per IP.
   - Authentication limiter: 30 attempts per 15 minutes to prevent brute-force attacks.
   - AI limiter: 80 requests per 10 minutes to protect upstream computational quotas.
3. **HTTP Hardening:** Helmet manages security headers, and compression optimizes JSON payloads.
4. **Resilient Fallback Design:** If the FastAPI ML microservice or external AI connections are unreachable, the Node backend automatically degrades to explainable deterministic rules and local models, preventing service outages.

---

## Troubleshooting

### 1. AI responses fall back to local template
- Check health: `curl http://localhost:5000/api/health`
- Ensure database and environment variables are active.
- Verify request rates do not exceed configured limits.

### 2. Frontend shows blank screen or Vite error
- Verify dependencies are installed: `cd frontend && npm install`
- Test the production build: `npm run build`
- Ensure Node version is 18+: `node -v`

### 3. ML service fails to download models
- On the first run, the ML microservice downloads `sentence-transformers/all-MiniLM-L6-v2` (~120MB) and `bert-base-NER` (~400MB). Ensure internet connectivity during initialization.

---

## Academic & Production Note

SkillForge AI is an advanced full-stack AI/ML engineering project developed to demonstrate:
- Practical integration of modern web engineering (React 18, Vite, Node.js, Express, MongoDB Atlas).
- Real-time client-edge computer vision (BlazeFace deep learning model for candidate face and multi-human proctoring verification).
- Classical NLP & Modern Transformers (Sentence-BERT, BERT-NER, Flan-T5, Custom ATS heuristics).
- Edge-Cloud Hybrid Voice Architectures (Browser Web Speech STT/TTS on the client + LLM reasoning on the cloud).
- Responsible Generative AI with transparent profile citations and deterministic fallback guarantees.
