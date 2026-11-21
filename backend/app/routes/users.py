from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.core.errors import ApiProblem
from app.database import get_db
from app.models.entities import Application, PrivateDocument, Scheme, TrackerEvent, User
from app.schemas.citizen import ProfilePatch, SettingsPatch, WorkspacePatch

router = APIRouter(prefix="/me", tags=["Citizen workspace"])
STAGES = ["eligibility", "results", "documents", "upload", "review", "corrections", "final", "packet", "tracker"]


def application_summary(app: Application) -> dict:
    return {"id": app.id, "scheme_id": app.scheme_id, "schemeId": app.scheme_id, "stage": STAGES.index(app.stage) if app.stage in STAGES else 0, "stage_name": app.stage, "outcome": app.outcome, "packet_ready": app.packet_ready, "packetReady": app.packet_ready, "started_at": app.created_at.isoformat(), "startedAt": app.created_at.isoformat(), "updated_at": app.updated_at.isoformat()}


def document_summary(doc: PrivateDocument, app: Application) -> dict:
    return {"id": doc.id, "app_id": app.id, "appId": app.id, "scheme_id": app.scheme_id, "schemeId": app.scheme_id, "doc_key": doc.document_type, "docKey": doc.document_type, "status": doc.status, "original_name": doc.original_name, "created_at": doc.created_at.isoformat()}


def workspace_payload(user: User, db: Session) -> dict:
    apps = db.scalars(select(Application).where(Application.user_id == user.id).options(selectinload(Application.documents), selectinload(Application.tracker_events)).order_by(Application.updated_at.desc())).all()
    documents = [document_summary(doc, app) for app in apps for doc in app.documents]
    activity = []
    for app in apps:
        for event in app.tracker_events:
            activity.append({"id": event.id, "type": event.event_type, "schemeId": app.scheme_id, "at": event.created_at.isoformat(), "detail": event.details})
    activity.sort(key=lambda entry: entry["at"], reverse=True)
    return {"profile": user.profile or {"fullName": user.full_name, "state": "Karnataka"}, "settings": user.settings or {}, "saved": user.saved_schemes or [], "applications": [application_summary(a) for a in apps], "documents": documents, "activity": activity[:30], "helperSession": user.helper_session}


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return {"profile": user.profile or {"fullName": user.full_name, "state": "Karnataka"}}


@router.patch("/profile")
def patch_profile(payload: ProfilePatch, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = dict(user.profile or {})
    profile.update({key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None})
    user.profile = profile
    if profile.get("fullName"):
        user.full_name = profile["fullName"].strip()
    db.commit()
    return {"profile": user.profile}


@router.get("/settings")
def get_settings(user: User = Depends(get_current_user)):
    return {"settings": user.settings or {}}


@router.patch("/settings")
def patch_settings(payload: SettingsPatch, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current = dict(user.settings or {})
    for group in ("notifications", "privacy"):
        values = getattr(payload, group)
        if values is not None:
            current[group] = {**(current.get(group) or {}), **values}
    user.settings = current
    db.commit()
    return {"settings": current}


@router.get("/workspace")
def get_workspace(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return workspace_payload(user, db)


@router.patch("/workspace")
def patch_workspace(payload: WorkspacePatch, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.profile is not None:
        allowed = {"fullName", "phone", "dateOfBirth", "gender", "state", "district", "pincode", "occupation"}
        profile = dict(user.profile or {})
        profile.update({key: str(value)[:120] for key, value in payload.profile.items() if key in allowed and value is not None})
        user.profile = profile
        if profile.get("fullName"):
            user.full_name = profile["fullName"]
    if payload.settings is not None:
        allowed_groups = {"notifications", "privacy"}
        current = dict(user.settings or {})
        for group, values in payload.settings.items():
            if group in allowed_groups and isinstance(values, dict):
                current[group] = {key: bool(value) for key, value in values.items() if isinstance(value, bool)}
        user.settings = current
    if payload.helper_session is not None:
        session = payload.helper_session
        if session and not isinstance(session, dict):
            raise ApiProblem(422, "invalid_helper_session", "Helper session must be an object or null.")
        user.helper_session = {key: str(value)[:120] for key, value in session.items() if key in {"citizenName", "helperName", "relationship", "consentedAt", "prevTextSize"}} if session else None
    db.commit()
    return workspace_payload(user, db)


@router.get("/saved-schemes")
def get_saved_schemes(user: User = Depends(get_current_user)):
    return {"items": user.saved_schemes or []}


@router.put("/saved-schemes")
def put_saved_schemes(payload: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = payload.get("items")
    if not isinstance(items, list) or len(items) > 200 or any(not isinstance(item, str) or len(item) > 90 for item in items):
        raise ApiProblem(422, "invalid_saved_schemes", "Saved schemes must be a list of scheme IDs.")
    valid = set(db.scalars(select(Scheme.id).where(Scheme.id.in_(set(items)))).all()) if items else set()
    user.saved_schemes = list(dict.fromkeys(item for item in items if item in valid))
    db.commit()
    return {"items": user.saved_schemes}


@router.get("/dashboard")
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payload = workspace_payload(user, db)
    docs = payload["documents"]
    return {**payload, "summary": {"active": sum(not a["packet_ready"] for a in payload["applications"]), "packets": sum(a["packet_ready"] for a in payload["applications"]), "pendingDocs": sum(d["status"] == "missing" for d in docs), "pendingCorrections": sum(d["status"] == "needs-correction" for d in docs)}}


@router.delete("/documents/{document_id}", status_code=204)
def delete_document(document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.scalar(select(PrivateDocument).where(PrivateDocument.id == document_id, PrivateDocument.user_id == user.id))
    if not doc:
        raise ApiProblem(404, "document_not_found", "Document not found.")
    from app.services.private_storage import remove_private_file
    remove_private_file(doc.stored_name)
    db.delete(doc)
    db.commit()
