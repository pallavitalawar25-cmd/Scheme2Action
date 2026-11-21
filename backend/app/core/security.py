from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import time
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import settings

_hasher = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(value: str) -> str:
    return value.strip().lower()


def valid_email(value: str) -> bool:
    return len(value) <= 254 and bool(_EMAIL.fullmatch(value))


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    try:
        return _hasher.verify(encoded, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError, TypeError):
        return False


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def create_access_token(subject: str, role: str) -> str:
    now = int(time.time())
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({"sub": subject, "role": role, "iat": now, "exp": now + settings.access_token_minutes * 60}, separators=(",", ":")).encode())
    message = f"{header}.{payload}".encode("ascii")
    signature = hmac.new(settings.secret_key.encode(), message, hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64(signature)}"


def decode_access_token(token: str) -> dict | None:
    try:
        header, payload, signature = token.split(".")
        message = f"{header}.{payload}".encode("ascii")
        expected = hmac.new(settings.secret_key.encode(), message, hashlib.sha256).digest()
        padding = "=" * (-len(signature) % 4)
        actual = base64.urlsafe_b64decode(signature + padding)
        if not hmac.compare_digest(expected, actual):
            return None
        claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if claims.get("exp", 0) <= time.time() or not claims.get("sub"):
            return None
        return claims
    except (ValueError, TypeError, json.JSONDecodeError):
        return None
