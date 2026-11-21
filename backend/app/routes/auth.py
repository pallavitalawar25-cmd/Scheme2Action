from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from time import monotonic

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.errors import ApiProblem
from app.core.security import create_access_token, hash_password, normalize_email, valid_email, verify_password
from app.database import get_db
from app.models.entities import User
from app.schemas.auth import ForgotPasswordIn, LoginIn, RegisterIn
from app.services.private_storage import remove_private_file
from app.models.entities import PrivateDocument

router = APIRouter(prefix="/auth", tags=["Authentication"])
_attempts: dict[str, deque[float]] = defaultdict(deque)


def serialize_user(user: User) -> dict:
    return {"id": user.id, "name": user.full_name, "email": user.email, "username": user.username, "role": user.role}


def _set_session(response: Response, user: User, remember: bool = True) -> None:
    max_age = settings.access_token_minutes * 60 if remember else None
    response.set_cookie("s2a_session", create_access_token(str(user.id), user.role), httponly=True, secure=settings.cookie_secure, samesite="lax", max_age=max_age, path="/")


@router.post("/register", status_code=201)
def register(payload: RegisterIn, response: Response, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    username = payload.username.strip().lower()
    if not valid_email(email):
        raise ApiProblem(422, "invalid_email", "Enter a valid email address.")
    if db.scalar(select(User.id).where(User.email == email)):
        raise ApiProblem(409, "email_taken", "An account already uses this email address.")
    if db.scalar(select(User.id).where(User.username == username)):
        raise ApiProblem(409, "username_taken", "This username is already in use.")
    user = User(email=email, username=username, full_name=payload.name.strip(), password_hash=hash_password(payload.password), role="citizen", locale="en", profile={"fullName": payload.name.strip(), "state": "Karnataka"}, settings={"notifications": {"email": True, "sms": False, "policy": True}, "privacy": {"ai": False, "helper": True}})
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session(response, user)
    return {"user": serialize_user(user)}


@router.post("/login")
def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    key = request.client.host if request.client else "unknown"
    now = monotonic()
    bucket = _attempts[key]
    while bucket and now - bucket[0] > 300:
        bucket.popleft()
    if len(bucket) >= 12:
        raise ApiProblem(429, "rate_limited", "Too many sign-in attempts. Wait a few minutes and try again.")
    identifier = payload.identifier.strip().lower()
    user = db.scalar(select(User).where(or_(User.email == identifier, User.username == identifier)))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        bucket.append(now)
        raise ApiProblem(401, "invalid_credentials", "The email/username or password is incorrect.")
    bucket.clear()
    _set_session(response, user, payload.remember)
    return {"user": serialize_user(user)}


@router.get("/me")
def current_user(user: User = Depends(get_current_user)):
    return {"user": serialize_user(user)}


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie("s2a_session", path="/")
    response.status_code = 204
    return response


@router.post("/forgot-password", status_code=202)
def forgot_password(_payload: ForgotPasswordIn):
    # No email delivery service is configured; response deliberately reveals no account existence.
    return {"accepted": True}


@router.delete("/account", status_code=204)
def delete_account(response: Response, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        other_admins = db.scalar(select(User.id).where(User.role == "admin", User.id != user.id).limit(1))
        if not other_admins:
            raise ApiProblem(409, "last_admin", "Create another administrator before deleting this account.")
    names = db.scalars(select(PrivateDocument.stored_name).where(PrivateDocument.user_id == user.id)).all()
    for name in names:
        remove_private_file(name)
    db.delete(user)
    db.commit()
    response.delete_cookie("s2a_session", path="/")
    response.status_code = 204
    return response
