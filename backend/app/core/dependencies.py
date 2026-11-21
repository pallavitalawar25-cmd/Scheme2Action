from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.errors import ApiProblem
from app.core.security import decode_access_token
from app.database import get_db
from app.models.entities import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    authorization = request.headers.get("authorization", "")
    token = authorization[7:].strip() if authorization.lower().startswith("bearer ") else request.cookies.get("s2a_session", "")
    claims = decode_access_token(token) if token else None
    user = db.get(User, int(claims["sub"])) if claims and str(claims.get("sub", "")).isdigit() else None
    if not user or not user.is_active:
        raise ApiProblem(401, "unauthorized", "Sign in to continue.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise ApiProblem(403, "forbidden", "Administrator access is required.")
    return user
