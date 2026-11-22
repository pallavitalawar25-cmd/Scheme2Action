from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.core.errors import ApiProblem
from app.database import get_db
from app.models.entities import Application, CitizenCorrection, PrivateDocument, Scheme, TrackerEvent, User
from app.schemas.citizen import ApplicationIn, ApplicationPatch, CorrectionIn, EligibilityIn, FinalReviewIn
from app.services.eligibility import QUESTIONNAIRES, approved_rules, check_eligibility
from app.services.profile_matching import derive_answers, is_confirmed
from app.services.gemini_extraction import extract_document
from app.services.packet_pdf import create_packet_pdf
from app.services.private_storage import read_private_file, remove_private_file, validate_and_save

router = APIRouter(prefix="/applications", tags=["Applications, documents and tracker"])


def owned_application(db: Session, application_id: str, user: User, load_documents: bool = False) -> Application:
    stmt = select(Application).where(Application.id == application_id, Application.user_id == user.id)
    if load_documents:
        stmt = stmt.options(selectinload(Application.documents), selectinload(Application.corrections), selectinload(Application.tracker_events))
    app = db.scalar(stmt)
    if not app:
        raise ApiProblem(404, "application_not_found", "Application not found.")
    return app


def event(db: Session, app: Application, event_type: str, label_en: str, label_kn: str = "", details: dict | None = None) -> None:
    db.add(TrackerEvent(application_id=app.id, user_id=app.user_id, event_type=event_type, label_en=label_en, label_kn=label_kn, details=details or {}))


def serialize_application(app: Application) -> dict:
    return {"id": app.id, "scheme_id": app.scheme_id, "schemeId": app.scheme_id, "stage": app.stage, "outcome": app.outcome, "eligibility_result": app.eligibility_result, "answers": app.answers or {}, "confirmed": app.confirmed or {}, "packet_ready": app.packet_ready, "packetReady": app.packet_ready, "created_at": app.created_at.isoformat(), "startedAt": app.created_at.isoformat(), "updated_at": app.updated_at.isoformat()}


def serialize_document(doc: PrivateDocument) -> dict:
    return {"id": doc.id, "application_id": doc.application_id, "document_type": doc.document_type, "docKey": f"doc.{doc.document_type}", "name": doc.original_name, "content_type": doc.content_type, "size_bytes": doc.size_bytes, "status": doc.status, "created_at": doc.created_at.isoformat(), "extraction": doc.extraction}


def prefill_answers(db: Session, user: User, scheme: Scheme) -> dict:
    """Pre-fill eligibility answers from a profile the citizen confirmed in AI onboarding (editable, never an outcome)."""
    if not is_confirmed(user.profile):
        return {}
    codes = {r.code for r in approved_rules(db, scheme.id)} | {q["code"] for q in QUESTIONNAIRES.get(scheme.id, [])}
    return {code: value for code, value in derive_answers(user.profile).items() if code in codes}


@router.post("", status_code=201)
def create_application(payload: ApplicationIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scheme = db.get(Scheme, payload.scheme_id)
    if not scheme or not scheme.is_published:
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    assessment = None
    if payload.assessment_id:
        from app.models.entities import EligibilityAssessment
        assessment = db.scalar(select(EligibilityAssessment).where(EligibilityAssessment.id == payload.assessment_id, EligibilityAssessment.user_id == user.id, EligibilityAssessment.scheme_id == scheme.id))
        if not assessment:
            raise ApiProblem(404, "assessment_not_found", "Assessment not found for this account and scheme.")
    app = Application(user_id=user.id, scheme_id=scheme.id, stage="eligibility", answers=assessment.answers if assessment else prefill_answers(db, user, scheme), outcome=assessment.outcome if assessment else "NEEDS_VERIFICATION")
    db.add(app)
    db.flush()
    event(db, app, "started", "Preparation started", "ಸಿದ್ಧತೆ ಆರಂಭಿಸಲಾಗಿದೆ")
    db.commit()
    db.refresh(app)
    return {"application": serialize_application(app)}


@router.get("")
def list_applications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Application).where(Application.user_id == user.id).order_by(Application.updated_at.desc())).all()
    return {"items": [serialize_application(row) for row in rows]}


@router.get("/tracker")
def all_tracker(language: str = Query("en", pattern=r"^(en|kn)$"), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(TrackerEvent).where(TrackerEvent.user_id == user.id).order_by(TrackerEvent.created_at.desc()).limit(100)).all()
    return {"items": [{"id": e.id, "application_id": e.application_id, "type": e.event_type, "label": e.label_kn if language == "kn" and e.label_kn else e.label_en, "at": e.created_at.isoformat(), "details": e.details} for e in rows]}


@router.get("/{application_id}")
def application_details(application_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user, True)
    return {"application": serialize_application(app), "documents": [serialize_document(d) for d in app.documents], "corrections": [{"id": c.id, "field_name": c.field_name, "corrected_value": c.corrected_value, "note": c.note} for c in app.corrections], "tracker": [{"id": e.id, "type": e.event_type, "label_en": e.label_en, "label_kn": e.label_kn, "details": e.details, "at": e.created_at.isoformat()} for e in app.tracker_events]}


@router.patch("/{application_id}")
def update_application(application_id: str, payload: ApplicationPatch, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user)
    changes = payload.model_dump(exclude_unset=True)
    changes.pop("outcome", None)  # Client-supplied eligibility outcomes are never trusted.
    if "answers" in changes:
        scheme = db.get(Scheme, app.scheme_id)
        assessment = check_eligibility(db, user.id, scheme, changes["answers"])
        app.answers = changes["answers"]
        app.outcome = assessment.outcome
        app.eligibility_result = assessment.result
        event(db, app, "eligibility_checked", "Eligibility checked", "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ", {"outcome": assessment.outcome})
        changes.pop("answers", None)
    if changes.get("stage"):
        app.stage = changes["stage"]
        event(db, app, "stage_updated", "Preparation stage updated", "ಸಿದ್ಧತೆಯ ಹಂತವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ", {"stage": app.stage})
    if "confirmed" in changes:
        app.confirmed = changes["confirmed"]
    db.commit()
    db.refresh(app)
    return {"application": serialize_application(app)}


@router.post("/{application_id}/eligibility")
def assess_application(application_id: str, payload: EligibilityIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user)
    scheme = db.get(Scheme, app.scheme_id)
    assessment = check_eligibility(db, user.id, scheme, payload.answers)
    app.answers = payload.answers
    app.outcome = assessment.outcome
    app.eligibility_result = assessment.result
    app.stage = "results"
    event(db, app, "eligibility_checked", "Eligibility checked", "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ", {"assessment_id": assessment.id, "outcome": assessment.outcome})
    db.commit()
    return {"assessment_id": assessment.id, **assessment.result, "application": serialize_application(app)}


@router.post("/{application_id}/documents", status_code=201)
async def upload_document(application_id: str, document_type: str = Form(..., min_length=2, max_length=80), file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user)
    original, stored, content = await validate_and_save(file, document_type)
    try:
        doc = PrivateDocument(application_id=app.id, user_id=user.id, document_type=document_type.strip().lower(), original_name=original, stored_name=stored, content_type=file.content_type or "application/octet-stream", size_bytes=len(content), status="uploaded")
        db.add(doc)
        app.stage = "upload"
        event(db, app, "document_uploaded", "A document was added", "ದಾಖಲೆಯನ್ನು ಸೇರಿಸಲಾಗಿದೆ", {"document_type": doc.document_type})
        db.commit()
        db.refresh(doc)
        return {"document": serialize_document(doc)}
    except Exception:
        remove_private_file(stored)
        db.rollback()
        raise


@router.get("/{application_id}/documents")
def list_documents(application_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user, True)
    return {"items": [serialize_document(d) for d in app.documents]}


@router.get("/{application_id}/documents/{document_id}/file")
def download_document(application_id: str, document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.scalar(select(PrivateDocument).where(PrivateDocument.id == document_id, PrivateDocument.application_id == application_id, PrivateDocument.user_id == user.id))
    if not doc:
        raise ApiProblem(404, "document_not_found", "Document not found.")
    try:
        content = read_private_file(doc.stored_name)
    except FileNotFoundError as exc:
        raise ApiProblem(404, "document_missing", "The private document file is unavailable.") from exc
    safe_name = doc.original_name.replace('"', "")
    return Response(content, media_type=doc.content_type, headers={"Content-Disposition": f'attachment; filename="{safe_name}"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})


@router.delete("/{application_id}/documents/{document_id}", status_code=204)
def delete_document(application_id: str, document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.scalar(select(PrivateDocument).where(PrivateDocument.id == document_id, PrivateDocument.application_id == application_id, PrivateDocument.user_id == user.id))
    if not doc:
        raise ApiProblem(404, "document_not_found", "Document not found.")
    remove_private_file(doc.stored_name)
    db.delete(doc)
    db.commit()


@router.post("/{application_id}/documents/{document_id}/extract")
def extract_fields(application_id: str, document_id: str, payload: dict, language: str = Query("en", pattern=r"^(en|kn)$"), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.get("consent") is not True:
        raise ApiProblem(400, "consent_required", "Confirm that you want to send this document for AI-assisted extraction.")
    doc = db.scalar(select(PrivateDocument).where(PrivateDocument.id == document_id, PrivateDocument.application_id == application_id, PrivateDocument.user_id == user.id))
    if not doc:
        raise ApiProblem(404, "document_not_found", "Document not found.")
    content = read_private_file(doc.stored_name)
    result = extract_document(content, doc.content_type, language)
    doc.extraction = result
    doc.status = "needs-review"
    db.commit()
    return {"extraction": result}


@router.post("/{application_id}/corrections", status_code=201)
def add_correction(application_id: str, payload: CorrectionIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user)
    correction = CitizenCorrection(application_id=app.id, user_id=user.id, field_name=payload.field_name, corrected_value=payload.corrected_value.strip(), note=payload.note.strip())
    db.add(correction)
    app.stage = "corrections"
    event(db, app, "correction_added", "A correction was recorded", "ತಿದ್ದುಪಡಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ", {"field": payload.field_name})
    db.commit()
    db.refresh(correction)
    return {"correction": {"id": correction.id, "field_name": correction.field_name, "corrected_value": correction.corrected_value, "note": correction.note}}


@router.post("/{application_id}/review")
def final_review(application_id: str, payload: FinalReviewIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user, True)
    if not payload.applicant_consent:
        raise ApiProblem(422, "consent_required", "Confirm the preparation summary before creating a packet.")
    if any(value is not True for value in payload.confirmed.values()):
        raise ApiProblem(422, "review_incomplete", "Confirm each review item before continuing.")
    app.confirmed = payload.confirmed
    app.packet_ready = True
    app.stage = "packet"
    event(db, app, "review_completed", "Preparation review completed", "ಸಿದ್ಧತಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ")
    db.commit()
    return {"application": serialize_application(app), "packet_url": f"/applications/{app.id}/packet.pdf", "notice": "Preparation summary only; this is not a government application or approval."}


@router.get("/{application_id}/packet.pdf")
def packet_pdf(application_id: str, language: str = Query("en", pattern=r"^(en|kn)$"), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user, True)
    scheme = db.get(Scheme, app.scheme_id)
    if not app.packet_ready:
        raise ApiProblem(409, "packet_not_ready", "Complete the final review before downloading the packet.")
    lines = [f"Scheme: {scheme.name_kn if language == 'kn' and scheme.name_kn else scheme.name_en}", f"Applicant: {user.full_name}", f"Preparation stage: {app.stage}", f"Eligibility outcome: {app.outcome}", "Documents are stored privately in this service.", "This document is a preparation aid, not a government form or approval."]
    return Response(create_packet_pdf(lines), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="scheme2action-{app.scheme_id}-preparation.pdf"', "Cache-Control": "private, no-store"})


@router.get("/{application_id}/tracker")
def tracker(application_id: str, language: str = Query("en", pattern=r"^(en|kn)$"), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = owned_application(db, application_id, user, True)
    return {"items": [{"id": e.id, "type": e.event_type, "label": e.label_kn if language == "kn" and e.label_kn else e.label_en, "at": e.created_at.isoformat(), "details": e.details} for e in sorted(app.tracker_events, key=lambda row: row.created_at)]}


