# Scheme2Action - integrated frontend and API

Scheme2Action is a bilingual (English/Kannada) React + Vite citizen assistance frontend with an optional FastAPI backend. It helps people explore schemes and prepare application materials; it is not a government portal, official eligibility decision, or application submission service.

## Contents

- `src/`, `public/`: complete React frontend, routes, reusable UI, assets, translations, styles, and frontend tests.
- `backend/app/`: FastAPI routes, SQLAlchemy models, Pydantic schemas, security, services, and seed catalogue.
- `backend/tests/`: authentication, eligibility, document, and admin tests.
- `.env.example`, `backend/.env.example`: frontend and backend configuration templates. They contain placeholders only.

## Windows setup

Install Node.js (LTS) and Python 3.11 or newer. Extract `scheme2action-complete.zip`, open PowerShell in the extracted `scheme2action` directory, and install frontend packages:

```powershell
npm.cmd install
```

### Frontend demonstration mode

No backend is needed for the browser-only demo:

```powershell
npm.cmd run dev
```

Open `http://localhost:5173`. Demo accounts are browser-only and must not use real passwords or personal documents.

### Full API mode

In the project root, configure the frontend API URL:

```powershell
Copy-Item .env.example .env
```

In a second PowerShell window:

```powershell
cd .\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend\.env` and replace `SECRET_KEY` with a long random value. To create the initial administrator, fill `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before the first backend start. Registration only creates citizen accounts; it cannot assign an admin role. Then start the API:

```powershell
uvicorn app.main:app --reload
```

The API creates the SQLite database and seeds demonstration scheme catalogue records at startup. API documentation is at `http://localhost:8000/docs`. In the first PowerShell window, run the frontend:

```powershell
cd ..
npm.cmd run dev
```

The local cookie settings in `backend/.env.example` support localhost development. Use HTTPS and secure cookie settings for deployment. Do not commit either `.env` file, database files, uploaded documents, or credentials. Optional Gemini extraction requires `GEMINI_API_KEY`; without it, the API reports that extraction is unavailable and does not send the document.

## Tests and production build

Frontend, from the project root:

```powershell
npm.cmd test -- --reporter=dot
npm.cmd run build
```

Backend, from `backend` with its virtual environment active:

```powershell
python -m pytest -q
python -m compileall -q app
```

## Main behavior

- Public scheme browsing and English/Kannada interface; protected citizen workspace, saved schemes, profile/settings, and application preparation flow.
- Cookie-backed API authentication and role-protected admin routes when `VITE_API_BASE_URL` is configured. Browser demo authentication stays separate.
- Deterministic eligibility checks only use human-approved rules. New rules, including AI-origin drafts, require explicit human approval. Outcomes do not constitute official decisions.
- Private owner-scoped document upload, validation, deletion, and download. Identity proof is optional in the sample checklist; Aadhaar and national ID numbers are not extracted.
- Optional AI-assisted field extraction requires explicit consent and is marked as draft information for manual review. AI does not decide eligibility or authenticate documents.
- Citizen corrections, confirmed preparation review, generated PDF preparation packet, and a Scheme2Action activity tracker.
- Admin scheme/source management, version history, rulebook review, policy change comparison, and approve/reject workflows.

## Limitations

- Scheme records and checklists are demonstration data. No government application is submitted and no approval is issued.
- There is no configured email delivery for password reset; the API returns an accepted response without sending mail.
- AI extraction depends on optional Gemini credentials and was not live-tested without API credentials.
- SQLite tables are initialized with SQLAlchemy `create_all`; this package does not include a migration tool for upgrading an existing database schema. Back up existing data before any schema change.
