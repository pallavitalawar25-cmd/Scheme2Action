from __future__ import annotations

import os
from pathlib import Path
from secrets import token_urlsafe

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


def _boolean(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    app_name = "Scheme2Action API"
    secret_key = os.getenv("SECRET_KEY") or token_urlsafe(48)
    database_url = os.getenv("DATABASE_URL", "sqlite:///./scheme2action.db")
    frontend_origins = [x.strip() for x in os.getenv("FRONTEND_URL", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
    cookie_secure = _boolean("COOKIE_SECURE", False)
    access_token_minutes = max(5, int(os.getenv("ACCESS_TOKEN_MINUTES", "60")))
    upload_dir = Path(os.getenv("UPLOAD_DIR", str(BACKEND_DIR / "uploads")))
    if not upload_dir.is_absolute():
        upload_dir = (BACKEND_DIR / upload_dir).resolve()
    max_upload_bytes = min(max(1024, int(os.getenv("MAX_UPLOAD_BYTES", "5242880"))), 10 * 1024 * 1024)
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_username = os.getenv("ADMIN_USERNAME", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "")


settings = Settings()
