from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.core.errors import ApiProblem
from app.database import get_db
from app.models.entities import EligibilityAssessment, OfficialSource, Rule, Scheme, User
from app.schemas.citizen import EligibilityIn
from app.services.eligibility import QUESTIONNAIRES, check_eligibility, get_scheme

router = APIRouter(tags=["Scheme catalogue", "Eligibility"])


def serialize_scheme(scheme: Scheme, language: str = "en") -> dict:
    return {"id": scheme.id, "category": scheme.category, "level": scheme.government_level, "government_level": scheme.government_level, "status": scheme.verification_status, "verification_status": scheme.verification_status, "readiness": scheme.readiness, "source": scheme.source_url, "source_url": scheme.source_url, "nameEn": scheme.name_en, "nameKn": scheme.name_kn, "summaryEn": scheme.summary_en, "summaryKn": scheme.summary_kn, "name": scheme.name_kn if language == "kn" and scheme.name_kn else scheme.name_en, "summary": scheme.summary_kn if language == "kn" and scheme.summary_kn else scheme.summary_en, "version": scheme.current_version, "updatedAt": scheme.updated_at.isoformat(), "featured": 0}


@router.get("/categories")
def list_categories(language: str = Query("en", pattern=r"^(en|kn)$"), db: Session = Depends(get_db)):
    rows = db.execute(select(Scheme.category, func.count(Scheme.id)).where(Scheme.is_published.is_(True)).group_by(Scheme.category).order_by(Scheme.category)).all()
    return {"items": [{"id": category, "slug": category, "name": category, "count": count} for category, count in rows], "language": language}


@router.get("/schemes")
def list_schemes(category: str | None = None, level: str | None = None, status: str | None = None, q: str | None = Query(default=None, max_length=120), language: str = Query("en", pattern=r"^(en|kn)$"), db: Session = Depends(get_db)):
    stmt = select(Scheme).where(Scheme.is_published.is_(True))
    if category:
        stmt = stmt.where(Scheme.category == category)
    if level in {"central", "karnataka"}:
        stmt = stmt.where(Scheme.government_level == level)
    if status:
        stmt = stmt.where(Scheme.verification_status == status)
    if q:
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(or_(Scheme.name_en.ilike(pattern), Scheme.name_kn.ilike(pattern), Scheme.summary_en.ilike(pattern), Scheme.summary_kn.ilike(pattern)))
    items = db.scalars(stmt.order_by(Scheme.name_en)).all()
    return {"items": [serialize_scheme(item, language) for item in items], "total": len(items)}


@router.get("/schemes/{scheme_id}")
def scheme_details(scheme_id: str, language: str = Query("en", pattern=r"^(en|kn)$"), db: Session = Depends(get_db)):
    scheme = get_scheme(db, scheme_id)
    return {"scheme": serialize_scheme(scheme, language), "sources": [{"url": source.url, "title": source.title, "note": source.note, "verification_status": source.verification_status} for source in scheme.sources]}


@router.get("/schemes/{scheme_id}/eligibility/questions")
def questions(scheme_id: str, language: str = Query("en", pattern=r"^(en|kn)$"), db: Session = Depends(get_db)):
    scheme = get_scheme(db, scheme_id)
    approved = db.scalars(select(Rule).where(Rule.scheme_id == scheme.id, Rule.status == "approved").order_by(Rule.id)).all()
    items = [{"code": r.code, "label": r.question_kn if language == "kn" and r.question_kn else r.question_en, "label_en": r.question_en, "label_kn": r.question_kn, "source_url": r.source_url, "version": r.version} for r in approved]
    if not items:
        items = [{"code": item["code"], "label": item["question_kn"] if language == "kn" else item["question_en"], "label_en": item["question_en"], "label_kn": item["question_kn"], "source_url": None, "version": None} for item in QUESTIONNAIRES.get(scheme.id, [])]
    return {"items": items, "rules_available": bool(approved), "scheme_version": scheme.current_version, "disclaimer": "Questions are for preparation only; results are not an official decision."}


@router.post("/schemes/{scheme_id}/eligibility", status_code=201)
def assess(scheme_id: str, payload: EligibilityIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scheme = get_scheme(db, scheme_id)
    if any(not isinstance(value, str) or value not in {"yes", "no", "unknown", "true", "false"} for value in payload.answers.values()):
        raise ApiProblem(422, "invalid_answer", "Each answer must be yes, no or unknown.")
    assessment = check_eligibility(db, user.id, scheme, payload.answers)
    db.commit()
    return {"id": assessment.id, **assessment.result, "scheme_id": scheme.id, "scheme_version": scheme.current_version, "created_at": assessment.created_at.isoformat()}


@router.get("/eligibility/assessments/{assessment_id}")
def get_assessment(assessment_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(EligibilityAssessment).where(EligibilityAssessment.id == assessment_id, EligibilityAssessment.user_id == user.id))
    if not item:
        raise ApiProblem(404, "assessment_not_found", "Eligibility assessment not found.")
    return {"id": item.id, **item.result, "scheme_id": item.scheme_id, "scheme_version": item.scheme_version, "answers": item.answers, "created_at": item.created_at.isoformat()}


@router.get("/schemes/{scheme_id}/documents")
def document_checklist(scheme_id: str, language: str = Query("en", pattern=r"^(en|kn)$"), db: Session = Depends(get_db)):
    scheme = get_scheme(db, scheme_id)
    if scheme.id != "ssp-post-matric-scholarship":
        return {"items": [], "rules_available": False, "note": "No reviewed checklist is configured for this demonstration scheme."}
    # General document names intentionally avoid collecting Aadhaar or national-ID numbers.
    docs = [
        ("identity", "Identity proof (only if the official portal requires it)", "ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ ಗುರುತಿನ ದಾಖಲೆ"),
        ("income", "Income certificate", "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ"),
        ("marks", "Previous marks card", "ಹಿಂದಿನ ಅಂಕಪಟ್ಟಿ"),
        ("admission", "Admission confirmation", "ಪ್ರವೇಶ ದೃಢೀಕರಣ"),
        ("bank", "Bank account proof", "ಬ್ಯಾಂಕ್ ಖಾತೆಯ ದಾಖಲೆ"),
        ("caste", "Caste certificate (if applicable)", "ಅನ್ವಯಿಸಿದರೆ ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ"),
    ]
    return {"items": [{"code": code, "label": kn if language == "kn" else en, "label_en": en, "label_kn": kn, "required": code != "caste", "source_url": scheme.source_url, "rule_version": scheme.current_version} for code, en, kn in docs], "rules_available": True, "note": "Sample preparation checklist; confirm current requirements on the linked official portal."}
