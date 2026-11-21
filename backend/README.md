# Scheme2Action API

FastAPI service for the Scheme2Action frontend. The default development database is SQLite. Eligibility is evaluated only from administrator-approved deterministic rules; draft and AI-extracted content cannot affect an outcome until a human approves a rule.

## Run locally (PowerShell)

From this `backend` directory:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set a private `SECRET_KEY` in `.env` before using the service beyond local experimentation. To create the first administrator, set `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in `.env`, then start the service:

```powershell
uvicorn app.main:app --reload
```

The API docs are available at `http://localhost:8000/docs`. Start the frontend from the repository root in a second terminal:

```powershell
npm.cmd install
npm.cmd run dev
```

Set `VITE_API_BASE_URL=http://localhost:8000` in the frontend `.env` to enable API mode. Restart Vite after changing environment variables. Without this setting, the app uses its browser-only demonstration adapters.

## Checks

```powershell
python -m pytest -q
python -m compileall -q app
```

Private uploaded documents are kept in the configured `UPLOAD_DIR` and are only available through authenticated owner-scoped routes. Gemini extraction is optional, requires explicit per-document consent, and never determines eligibility. Do not commit `.env`, uploaded files, database files, or credentials.
