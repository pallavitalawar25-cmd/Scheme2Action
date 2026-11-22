from collections import defaultdict, deque
from time import monotonic

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.errors import ApiProblem
from app.database import get_db
from app.models.entities import Scheme, User
from app.routes.schemes import serialize_scheme
from app.schemas.onboarding import OnboardingMessageIn, OnboardingMessageOut
from app.services.eligibility import approved_rules, evaluate_rules
from app.services.onboarding_ai import run_turn
from app.services.profile_matching import derive_answers, is_confirmed

router = APIRouter(tags=["AI onboarding"])
_WINDOW_SECONDS, _PER_CLIENT, _GLOBAL = 600, 40, 600
_hits: dict[str, deque[float]] = defaultdict(deque)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    return forwarded or (request.client.host if request.client else "unknown")


def _rate_limit(request: Request) -> None:
    now = monotonic()
    for key in (_client_key(request), "*global*"):
        bucket = _hits[key]
        while bucket and now - bucket[0] > _WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= (_GLOBAL if key == "*global*" else _PER_CLIENT):
            raise ApiProblem(429, "rate_limited", "Too many onboarding messages. Please wait a few minutes and try again.")
    _hits[_client_key(request)].append(now)
    _hits["*global*"].append(now)


@router.post("/onboarding/message", response_model=OnboardingMessageOut)
def onboarding_message(payload: OnboardingMessageIn, request: Request):
    """One conversational turn. Public so people can start before signing in (rate limited); saving requires sign-in
    and goes through PATCH /me/profile. The AI only proposes profile values and never decides eligibility."""
    if not payload.message.strip() and payload.history:
        raise ApiProblem(422, "empty_message", "Type an answer to continue.")
    _rate_limit(request)
    return run_turn(payload.language, payload.message, [t.model_dump() for t in payload.history], payload.profile, payload.skipped)


@router.get("/me/scheme-matches")
def scheme_matches(language: str = "en", user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Evaluate every published scheme against the SAVED profile using approved deterministic rules only."""
    profile = user.profile or {}
    # Only a profile the citizen reviewed and confirmed counts; registration defaults (e.g. state) are never treated as answers.
    answers = derive_answers(profile) if is_confirmed(profile) else {}
    items = []
    for scheme in db.scalars(select(Scheme).where(Scheme.is_published.is_(True)).order_by(Scheme.name_en)).all():
        result = evaluate_rules(approved_rules(db, scheme.id), answers)
        items.append({"scheme": serialize_scheme(scheme, "kn" if language == "kn" else "en"), "outcome": result["outcome"], "rules_available": bool(result["evaluated"]), "passed": result["passed"], "failed": result["failed"], "missing": result["missing"], "reason": result["reason"], "next_action": result["next_action"], "sources": result["sources"]})
    return {"profile_confirmed": is_confirmed(profile), "answers_used": answers, "items": items, "disclaimer": "Results come from approved deterministic rules and the profile you confirmed. They are for preparation only and are not an official government decision."}
