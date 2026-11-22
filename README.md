# 🇮🇳 Scheme2Action

### ✨ Discover Schemes. Check Eligibility. Take Action.

<p align="center">
  <strong>Bridging the gap between government scheme discovery and application readiness.</strong>
</p>

<p align="center">
  An AI-powered citizen assistance platform that helps people discover relevant government schemes, understand eligibility requirements and take informed next steps.
</p>

<p align="center">
  <a href="https://scheme2-action.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Explore_Scheme2Action-2563EB?style=for-the-badge" alt="Live Demo"/>
  </a>
  <a href="https://github.com/pallavitalawar25-cmd/Scheme2Action">
    <img src="https://img.shields.io/badge/💻_Source_Code-GitHub-181717?style=for-the-badge&logo=github" alt="Source Code"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Functional_MVP-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square"/>
  <img src="https://img.shields.io/badge/Frontend-React_%7C_Vite-61DAFB?style=flat-square"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square"/>
</p>

---

## 🌟 01. About the Project

Access to government benefits should not depend on how well someone can navigate complicated websites or interpret lengthy eligibility guidelines.

India offers numerous scholarships, welfare programmes and financial assistance schemes. However, discovering relevant opportunities and understanding their requirements can be challenging for students, families and other citizens.

**Scheme2Action addresses this information gap through an AI-assisted, citizen-centric platform.**

It combines conversational onboarding, structured citizen profiles, scheme discovery and rule-based eligibility evaluation into a unified experience.

Instead of simply listing government schemes, Scheme2Action aims to help citizens understand which opportunities may be relevant, why they may qualify and what information they need before taking the next step.

> 💡 **Our vision:** Transform government scheme discovery into a simpler, more transparent and accessible experience.

---

## 🎯 02. The Problem

Despite the availability of public-benefit programmes, citizens encounter several barriers:

- 🔎 **Fragmented Information:** Scheme details are distributed across different government portals.
- 📋 **Eligibility Complexity:** Requirements involving age, income, education, location and category can be difficult to interpret.
- 📢 **Limited Awareness:** Potential beneficiaries may not know which opportunities exist.
- 📑 **Application Confusion:** Citizens may struggle to understand required information and supporting documents.
- 🌐 **Accessibility Barriers:** Language and digital-literacy challenges can make information harder to access.

The challenge is not merely finding government schemes. It is helping citizens understand how those schemes relate to their circumstances.

---

## 💡 03. Our Solution

Scheme2Action introduces a guided citizen journey:

| Step | Feature | Purpose |
|---|---|---|
| 01 | 🤖 Conversational Onboarding | Understand citizen circumstances through natural conversation. |
| 02 | 👤 Profile Management | Organize responses into structured citizen information. |
| 03 | 🔍 Scheme Discovery | Identify potentially relevant government schemes. |
| 04 | ⚖️ Eligibility Evaluation | Evaluate available information using structured backend rules. |
| 05 | 📊 Transparent Results | Explain potential matches and missing information. |
| 06 | 📝 Application Readiness | Help citizens understand requirements and next steps. |

---

## ✨ 04. Core Features

### 🤖 4.1 AI-Powered Conversational Onboarding

Scheme2Action uses the **Google Gemini API** to provide a conversational alternative to traditional multi-field profile forms.

Citizens can describe their circumstances naturally while the assistant collects relevant information through guided questions.

**Key capabilities:**

- 💬 Natural-language citizen interaction.
- ❓ One-question-at-a-time onboarding.
- 🧠 Structured extraction of profile information.
- 🔄 Recognition of previously provided details.
- ⏭️ Support for optional questions and corrections.
- 👀 Profile review before saving.
- ✅ Citizen confirmation and consent.

**Information collected may include:**

- Personal details and date of birth.
- State and district.
- Rural or urban residence.
- Occupation and education.
- Annual family income.
- Gender and social category.
- Disability and other relevant circumstances.

The objective is to reduce friction during onboarding while maintaining citizen control over submitted information.

### 🔍 4.2 Intelligent Scheme Discovery

The platform uses structured citizen profile information to help identify potentially relevant government schemes.

Relevant factors can include:

- Age.
- Education.
- Occupation.
- Geographic location.
- Annual family income.
- Social category.
- Other applicable circumstances.

This creates a more focused discovery experience than relying entirely on manual searching.

### ⚖️ 4.3 Rule-Based Eligibility Evaluation

A key architectural decision in Scheme2Action is the separation of generative AI from eligibility decisions.

> **AI assists with understanding citizens. Backend rules handle eligibility evaluation.**

The process:

1. Gemini assists in interpreting natural-language responses.
2. Profile information is validated by the backend.
3. Structured eligibility rules evaluate available information.
4. Results are presented with appropriate status indicators.

**Eligibility statuses:**

| Status | Interpretation |
|---|---|
| 🟢 Likely Eligible | Available approved rules indicate a potential match. |
| 🔴 Not Eligible | An approved eligibility condition is not satisfied. |
| 🟡 Needs More Information | Additional citizen information is required. |
| ⚪ Needs Verification | Scheme information or eligibility conditions require verification. |

This approach avoids allowing generative AI to independently determine eligibility for government benefits.

### 🧠 4.4 Explainable Recommendations

Scheme2Action aims to make scheme recommendations understandable rather than presenting unexplained results.

The platform focuses on communicating:

- Why a scheme may be relevant.
- Which eligibility conditions matter.
- What information is missing.
- Which conditions require verification.
- What citizens can explore next.

### 🌐 4.5 Multilingual Accessibility

The platform provides an **English and Kannada experience** to make citizen assistance more approachable and accessible.

### 👤 4.6 Citizen-Centred Profile Management

Citizens can review and correct their collected information before confirming their profile.

The system is designed around explicit consent and citizen control over profile information.

### 📋 4.7 Application Readiness

Scheme2Action aims to take citizens beyond discovery by helping them understand scheme requirements and prepare for subsequent application steps.

---

## 🧩 05. What Makes Scheme2Action Different?

| Traditional Experience | Scheme2Action |
|---|---|
| Searching across multiple portals | 🔍 Guided scheme discovery |
| Manually interpreting eligibility conditions | ⚖️ Structured eligibility evaluation |
| Lengthy profile forms | 🤖 Conversational AI onboarding |
| Unclear recommendations | 📊 Explainable eligibility statuses |
| Language barriers | 🌐 English and Kannada experience |
| Uncertainty about next steps | 📝 Application readiness guidance |

### 🔐 Responsible AI Architecture

A central principle of Scheme2Action is:

> **AI understands. Rules evaluate. Citizens decide.**

Generative AI is useful for interpreting natural language and making onboarding conversational. However, government eligibility decisions require structured, traceable and verifiable conditions.

| Component | Responsibility |
|---|---|
| Google Gemini | Conversational interaction and profile suggestions |
| Backend Validation | Validate and structure citizen information |
| Eligibility Engine | Evaluate available structured eligibility rules |
| Citizen Interface | Present results for citizen understanding and review |

---

## 🏗️ 06. Technical Architecture

```text
                     👤 CITIZEN
                         |
                         v
                 REACT + VITE
                   FRONTEND
                         |
                         v
                     REST API
                         |
                         v
                PYTHON + FASTAPI
                    BACKEND
                         |
               +---------+---------+
               |                   |
               v                   v
        🤖 AI ONBOARDING      👤 PROFILE MANAGEMENT
               |                   |
               v                   v
         GOOGLE GEMINI       DATA VALIDATION
               |                   |
               +---------+---------+
                         |
                         v
               STRUCTURED CITIZEN
                     PROFILE
                         |
                         v
                ⚖️ ELIGIBILITY ENGINE
                         |
                         v
                 🔍 SCHEME DISCOVERY
                         |
                         v
                📊 RESULTS & GUIDANCE
```

The frontend and backend are deployed independently, communicating through REST APIs.

---

## 🛠️ 07. Technology Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React, Vite |
| 💻 Programming Languages | JavaScript, Python |
| 🖌️ UI Technologies | HTML, CSS |
| ⚙️ Backend Framework | FastAPI |
| 🧠 AI Integration | Google Gemini API |
| 🗄️ Data Management | SQL database through backend configuration |
| 🔗 Communication | REST APIs |
| 🔐 Authentication | Backend-managed authentication |
| 🚀 Frontend Hosting | Vercel |
| ☁️ Backend Hosting | Render |
| 📂 Version Control | Git and GitHub |

---

## 🛡️ 08. Security & Data Responsibility

Citizen information must be handled responsibly.

Scheme2Action incorporates safeguards such as:

- Filtering sensitive number patterns before sending citizen messages to Gemini.
- Backend validation of AI-generated profile suggestions.
- Citizen review and consent before profile saving.
- Separation of AI-assisted onboarding and eligibility evaluation.
- Avoiding unnecessary sensitive identification information.

**Privacy reminder:** Citizens should never provide Aadhaar numbers, bank account details, passwords or OTPs through the onboarding assistant.

---

## 🚀 09. Development Roadmap

Scheme2Action is being developed incrementally, beginning with a functional MVP and progressing towards a reliable, production-oriented citizen assistance platform.

### 🟢 Phase 1 — Functional MVP

<sub>Current development stage</sub>

- [x] React and Vite frontend.
- [x] Python and FastAPI backend.
- [x] Gemini-powered conversational onboarding.
- [x] Structured citizen profile extraction.
- [x] Profile review and consent flow.
- [x] Backend profile validation.
- [x] Rule-based eligibility evaluation.
- [x] Scheme discovery experience.
- [x] Multiple eligibility statuses.
- [x] English and Kannada experience.
- [x] Independent frontend and backend deployment.

### 🔵 Phase 2 — Verified Scheme Intelligence

<sub>Planned development</sub>

- [ ] Build a structured database of government schemes.
- [ ] Integrate official Central Government scheme information.
- [ ] Expand Karnataka State Government scheme coverage.
- [ ] Encode eligibility criteria from official guidelines.
- [ ] Attach official source links to scheme records.
- [ ] Maintain last-verified dates and update history.
- [ ] Test eligibility rules against representative citizen profiles.
- [ ] Introduce detailed document requirement checklists.
- [ ] Improve application readiness guidance.

### 🟣 Phase 3 — Production Expansion

<sub>Long-term vision</sub>

- [ ] Expand scheme coverage across Indian states.
- [ ] Introduce additional Indian regional languages.
- [ ] Improve document assistance and validation.
- [ ] Generate personalized application readiness reports.
- [ ] Explore authorized integrations with government services.
- [ ] Improve mobile accessibility.
- [ ] Establish a regular scheme verification and update process.

*Roadmap items are planned improvements and should not be interpreted as existing MVP functionality.*

---

## 💻 10. Local Development Setup

### 📌 Prerequisites

- Python and pip.
- Node.js and npm.
- Google Gemini API key.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/pallavitalawar25-cmd/Scheme2Action.git
cd Scheme2Action
```

### Step 2 — Configure the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a backend `.env` file with the required configuration.

Example:

```env
SECRET_KEY=your_local_secret_key
DATABASE_URL=sqlite:///./scheme2action.db
FRONTEND_URL=http://localhost:5173
COOKIE_SECURE=false
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=5242880
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`

### Step 3 — Configure the Frontend

Open a separate terminal in the repository root:

```bash
npm install
```

Create a frontend `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

### Step 4 — Explore AI Onboarding

Navigate to:

`http://localhost:5173/onboarding`

Start a conversation to explore the AI-assisted citizen profile collection experience.

**🔒 Security:** Never commit `.env` files, API keys, database credentials or private citizen information to the repository.

---

## ☁️ 11. Deployment

Scheme2Action uses independent frontend and backend deployments.

| Component | Platform | Link |
|---|---|---|
| 🌐 Frontend | Vercel | [Open Application](https://scheme2-action.vercel.app/) |
| ⚙️ Backend | Render | [Backend Service](https://scheme2action.onrender.com) |
| ❤️ Health Check | Render | [Check API Health](https://scheme2action.onrender.com/health) |
| 💻 Source Code | GitHub | [View Repository](https://github.com/pallavitalawar25-cmd/Scheme2Action) |

---

## 🌱 12. Future Vision

The long-term objective is to evolve Scheme2Action from an MVP into a comprehensive citizen assistance ecosystem.

Future development will focus on:

- Verified scheme descriptions and eligibility criteria.
- Traceable official information sources.
- Regular updates when government guidelines change.
- More accurate and explainable eligibility evaluation.
- Personalized document and application checklists.
- Broader regional accessibility.
- Authorized integrations wherever officially permitted.

The objective is not to replace government portals, but to make discovering and understanding public-benefit opportunities easier before citizens proceed to official application channels.

---

## ⚠️ 13. Disclaimer

Scheme2Action is an independent citizen-assistance project and is not affiliated with or operated by any government department.

Eligibility indications are informational and depend on the availability and verification of scheme rules. Final eligibility, approval and benefit distribution decisions remain with the respective government authorities.

Citizens should always verify scheme information and application requirements through official government sources.

---

## 🔗 14. Project Links

| Resource | Link |
|---|---|
| 🚀 Live Application | https://scheme2-action.vercel.app/ |
| 💻 GitHub Repository | https://github.com/pallavitalawar25-cmd/Scheme2Action |
| ⚙️ Backend Service | https://scheme2action.onrender.com |
| ❤️ API Health Check | https://scheme2action.onrender.com/health |

---

<p align="center">
  <h3 align="center">🇮🇳 Scheme2Action</h3>
  <strong>Discover Schemes. Check Eligibility. Take Action.</strong>
  <br/><br/>
  <em>Technology with a purpose. AI with responsibility. Impact through accessibility.</em>
  <br/><br/>
  Made with ❤️ to make public-benefit discovery simpler and more inclusive.
</p>
