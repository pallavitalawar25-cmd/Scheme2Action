from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import require_admin
from app.core.errors import ApiProblem
from app.database import get_db
from app.models.entities import Application, OfficialSource, PolicyChange, Rule, RuleVersion, Scheme, SchemeChange, SchemeVersion, User
from app.schemas.schemes import PolicyIn, ReviewIn, RuleIn, SchemeUpsert, SourceIn

router = APIRouter(prefix="/admin", tags=["Administration"])


def _now():
    return datetime.now(timezone.utc)


def _source_url(value) -> str:
    url = str(value)
    if not url.startswith("https://"):
        raise ApiProblem(422, "https_required", "Official source references must use HTTPS.")
    return url


def _snapshot(scheme: Scheme) -> dict:
    return {"id": scheme.id, "name_en": scheme.name_en, "name_kn": scheme.name_kn, "summary_en": scheme.summary_en, "summary_kn": scheme.summary_kn, "category": scheme.category, "government_level": scheme.government_level, "readiness": scheme.readiness, "source_url": scheme.source_url, "verification_status": scheme.verification_status}


def _scheme_out(s: Scheme) -> dict:
    return {**_snapshot(s), "nameEn": s.name_en, "nameKn": s.name_kn, "level": s.government_level, "status": s.verification_status, "source": s.source_url, "version": s.current_version, "published": s.is_published, "updated_at": s.updated_at.isoformat()}


def _rule_out(rule: Rule) -> dict:
    return {"id": rule.id, "scheme_id": rule.scheme_id, "code": rule.code, "question_en": rule.question_en, "question_kn": rule.question_kn, "expected_answer": rule.expected_answer, "applies_when": rule.applies_when, "status": rule.status, "origin": rule.origin, "source_url": rule.source_url, "source_evidence": rule.source_evidence, "version": rule.version, "created_by": rule.created_by, "reviewed_by": rule.reviewed_by, "created_at": rule.created_at.isoformat(), "updated_at": rule.updated_at.isoformat()}


def _rule_snapshot(rule: Rule) -> dict:
    return {key: value for key, value in _rule_out(rule).items() if key not in {"id", "created_at", "updated_at", "created_by", "reviewed_by"}}


@router.get("/dashboard")
def dashboard(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {"schemes": db.scalar(select(func.count()).select_from(Scheme)) or 0, "published_schemes": db.scalar(select(func.count()).select_from(Scheme).where(Scheme.is_published.is_(True))) or 0, "pending_scheme_changes": db.scalar(select(func.count()).select_from(SchemeChange).where(SchemeChange.status == "pending")) or 0, "draft_rules": db.scalar(select(func.count()).select_from(Rule).where(Rule.status == "draft")) or 0, "pending_sources": db.scalar(select(func.count()).select_from(OfficialSource).where(OfficialSource.verification_status == "pending")) or 0, "pending_policy_changes": db.scalar(select(func.count()).select_from(PolicyChange).where(PolicyChange.status == "pending")) or 0, "applications": db.scalar(select(func.count()).select_from(Application)) or 0, "human_review_required": True}


@router.get("/schemes")
def list_schemes(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.scalars(select(Scheme).options(selectinload(Scheme.sources)).order_by(Scheme.name_en)).all()
    result = []
    for scheme in rows:
        pending = db.scalar(select(SchemeChange).where(SchemeChange.scheme_id == scheme.id, SchemeChange.status == "pending").order_by(SchemeChange.id.desc()).limit(1))
        result.append({**_scheme_out(scheme), "sources": [{"id": s.id, "url": s.url, "title": s.title, "note": s.note, "verification_status": s.verification_status} for s in scheme.sources], "pending_change": {"id": pending.id, "after": pending.after_snapshot, "summary": pending.summary} if pending else None})
    return {"items": result}


@router.post("/schemes", status_code=201)
def create_scheme(payload: SchemeUpsert, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.get(Scheme, payload.id):
        raise ApiProblem(409, "scheme_exists", "A scheme with this ID already exists.")
    data = payload.model_dump()
    data["source_url"] = _source_url(data["source_url"])
    data["verification_status"] = "pending"
    scheme = Scheme(id=data.pop("id"), name_en=payload.name_en, name_kn=payload.name_kn, summary_en=payload.summary_en, summary_kn=payload.summary_kn, category=payload.category, government_level=payload.government_level, readiness=payload.readiness, source_url=data["source_url"], verification_status="pending", is_published=False, current_version=0)
    db.add(scheme)
    db.flush()
    db.add(OfficialSource(scheme_id=scheme.id, url=scheme.source_url, title="Primary official source", verification_status="pending", added_by=admin.id))
    change = SchemeChange(scheme_id=scheme.id, before_snapshot={}, after_snapshot=_snapshot(scheme) | {key: value for key, value in data.items() if key in {"name_en", "name_kn", "summary_en", "summary_kn", "category", "government_level", "readiness", "source_url"}}, summary="New scheme submitted for human review", created_by=admin.id)
    db.add(change)
    db.commit()
    return {"scheme": _scheme_out(scheme), "change_id": change.id, "status": "pending", "published": False}


@router.put("/schemes/{scheme_id}")
def propose_scheme_update(scheme_id: str, payload: SchemeUpsert, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    scheme = db.get(Scheme, scheme_id)
    if not scheme:
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    if payload.id != scheme_id:
        raise ApiProblem(422, "scheme_id_mismatch", "Scheme ID cannot be changed.")
    pending = db.scalar(select(SchemeChange).where(SchemeChange.scheme_id == scheme_id, SchemeChange.status == "pending"))
    if pending:
        raise ApiProblem(409, "change_pending", "Review or reject the existing pending change before proposing another.")
    after = payload.model_dump()
    after["source_url"] = _source_url(after["source_url"])
    before = _snapshot(scheme)
    after["id"] = scheme_id
    change = SchemeChange(scheme_id=scheme_id, before_snapshot=before, after_snapshot=after, summary="Scheme update submitted for human review", created_by=admin.id)
    db.add(change)
    db.commit()
    return {"change_id": change.id, "before": before, "after": after, "status": "pending"}


@router.get("/schemes/{scheme_id}/history")
def scheme_history(scheme_id: str, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    scheme = db.get(Scheme, scheme_id)
    if not scheme:
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    versions = db.scalars(select(SchemeVersion).where(SchemeVersion.scheme_id == scheme_id).order_by(SchemeVersion.version.desc())).all()
    changes = db.scalars(select(SchemeChange).where(SchemeChange.scheme_id == scheme_id).order_by(SchemeChange.created_at.desc())).all()
    return {"versions": [{"version": v.version, "snapshot": v.snapshot, "summary": v.summary, "status": v.status, "created_at": v.created_at.isoformat(), "actor_id": v.actor_id} for v in versions], "changes": [{"id": c.id, "before": c.before_snapshot, "after": c.after_snapshot, "summary": c.summary, "status": c.status, "note": c.review_note, "created_at": c.created_at.isoformat(), "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None} for c in changes]}


@router.post("/scheme-changes/{change_id}/review")
def review_scheme_change(change_id: int, payload: ReviewIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    change = db.get(SchemeChange, change_id)
    if not change or change.status != "pending":
        raise ApiProblem(404, "pending_change_not_found", "Pending scheme change not found.")
    scheme = db.get(Scheme, change.scheme_id)
    change.status = payload.decision
    change.reviewed_by = admin.id
    change.reviewed_at = _now()
    change.review_note = payload.note
    if payload.decision == "approved":
        after = change.after_snapshot
        for key in ("name_en", "name_kn", "summary_en", "summary_kn", "category", "government_level", "readiness", "source_url"):
            setattr(scheme, key, after[key])
        scheme.current_version += 1
        scheme.verification_status = "info-verified"
        scheme.is_published = True
        db.add(SchemeVersion(scheme_id=scheme.id, version=scheme.current_version, snapshot=_snapshot(scheme), summary=change.summary, status="approved", actor_id=admin.id))
    db.commit()
    return {"change_id": change.id, "status": change.status, "published": scheme.is_published, "version": scheme.current_version}


@router.get("/sources")
def sources(status: str | None = None, q: str | None = None, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    stmt = select(OfficialSource)
    if status:
        stmt = stmt.where(OfficialSource.verification_status == status)
    rows = db.scalars(stmt.order_by(OfficialSource.added_at.desc())).all()
    if q:
        query = q.casefold()
        rows = [s for s in rows if query in s.url.casefold() or query in s.title.casefold() or query in s.note.casefold()]
    return {"items": [{"id": s.id, "scheme_id": s.scheme_id, "url": s.url, "title": s.title, "note": s.note, "verification_status": s.verification_status, "added_at": s.added_at.isoformat()} for s in rows]}


@router.post("/schemes/{scheme_id}/sources", status_code=201)
def add_source(scheme_id: str, payload: SourceIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if not db.get(Scheme, scheme_id):
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    source = OfficialSource(scheme_id=scheme_id, url=_source_url(payload.url), title=payload.title, note=payload.note, verification_status="pending", added_by=admin.id)
    db.add(source)
    db.commit()
    db.refresh(source)
    return {"id": source.id, "scheme_id": source.scheme_id, "url": source.url, "title": source.title, "note": source.note, "verification_status": source.verification_status}


@router.post("/sources/{source_id}/review")
def review_source(source_id: int, payload: ReviewIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    source = db.get(OfficialSource, source_id)
    if not source:
        raise ApiProblem(404, "source_not_found", "Source not found.")
    source.verification_status = "verified" if payload.decision == "approved" else "rejected"
    if payload.note:
        source.note = payload.note
    db.commit()
    return {"id": source.id, "verification_status": source.verification_status}


@router.delete("/sources/{source_id}", status_code=204)
def delete_source(source_id: int, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    source = db.get(OfficialSource, source_id)
    if not source:
        raise ApiProblem(404, "source_not_found", "Source not found.")
    db.delete(source)
    db.commit()


@router.get("/rulebook")
def list_rules(status: str | None = None, q: str | None = None, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    stmt = select(Rule).options(selectinload(Rule.history))
    if status:
        stmt = stmt.where(Rule.status == status)
    rows = db.scalars(stmt.order_by(Rule.updated_at.desc())).all()
    if q:
        term = q.casefold()
        rows = [r for r in rows if term in r.question_en.casefold() or term in r.code.casefold() or term in r.source_url.casefold() or term in r.scheme_id.casefold()]
    return {"items": [_rule_out(r) for r in rows]}


@router.post("/schemes/{scheme_id}/rules", status_code=201)
def create_rule(scheme_id: str, payload: RuleIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if not db.get(Scheme, scheme_id):
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    if db.scalar(select(Rule.id).where(Rule.scheme_id == scheme_id, Rule.code == payload.code)):
        raise ApiProblem(409, "rule_code_exists", "A rule with this code already exists for this scheme.")
    rule = Rule(scheme_id=scheme_id, code=payload.code, question_en=payload.question_en, question_kn=payload.question_kn, expected_answer=payload.expected_answer, applies_when=payload.applies_when, status="draft", origin=payload.origin, source_url=_source_url(payload.source_url), source_evidence=payload.source_evidence.strip(), created_by=admin.id, version=1)
    db.add(rule)
    db.flush()
    db.add(RuleVersion(rule_id=rule.id, version=1, snapshot=_rule_snapshot(rule), event="draft_created", actor_id=admin.id))
    db.commit()
    db.refresh(rule)
    return {"rule": _rule_out(rule), "publish_state": "draft_requires_human_approval"}


@router.post("/rules/{rule_id}/review")
def review_rule(rule_id: int, payload: ReviewIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rule = db.scalar(select(Rule).where(Rule.id == rule_id).options(selectinload(Rule.history)))
    if not rule or rule.status not in {"draft", "pending"}:
        raise ApiProblem(404, "draft_rule_not_found", "Reviewable rule not found.")
    if rule.created_by == admin.id:
        raise ApiProblem(403, "independent_review_required", "A different administrator must review this draft.")
    if payload.decision == "approved" and (not rule.source_evidence.strip() or not rule.source_url.startswith("https://")):
        raise ApiProblem(422, "source_evidence_required", "Rules need official HTTPS evidence before approval.")
    rule.status = payload.decision
    rule.reviewed_by = admin.id
    rule.reviewed_at = _now()
    rule.version += 1
    db.add(RuleVersion(rule_id=rule.id, version=rule.version, snapshot=_rule_snapshot(rule), event=payload.decision, actor_id=admin.id))
    db.commit()
    return {"rule": _rule_out(rule), "published": rule.status == "approved"}


@router.get("/rules/{rule_id}/history")
def rule_history(rule_id: int, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    rule = db.scalar(select(Rule).where(Rule.id == rule_id).options(selectinload(Rule.history)))
    if not rule:
        raise ApiProblem(404, "rule_not_found", "Rule not found.")
    return {"items": [{"version": h.version, "event": h.event, "snapshot": h.snapshot, "created_at": h.created_at.isoformat(), "actor_id": h.actor_id} for h in rule.history]}


@router.get("/policy-changes")
def list_policy_changes(status: str | None = None, q: str | None = None, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    stmt = select(PolicyChange)
    if status:
        stmt = stmt.where(PolicyChange.status == status)
    rows = db.scalars(stmt.order_by(PolicyChange.created_at.desc())).all()
    if q:
        term = q.casefold()
        rows = [p for p in rows if term in p.title.casefold() or term in p.scheme_id.casefold() or term in p.source_url.casefold()]
    return {"items": [{"id": p.id, "scheme_id": p.scheme_id, "title": p.title, "before": p.before_text, "after": p.after_text, "source_url": p.source_url, "source_evidence": p.source_evidence, "status": p.status, "review_note": p.review_note, "created_at": p.created_at.isoformat(), "reviewed_at": p.reviewed_at.isoformat() if p.reviewed_at else None} for p in rows]}


@router.post("/policy-changes", status_code=201)
def create_policy_change(payload: PolicyIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if not db.get(Scheme, payload.scheme_id):
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    policy = PolicyChange(scheme_id=payload.scheme_id, title=payload.title, before_text=payload.before_text, after_text=payload.after_text, source_url=_source_url(payload.source_url), source_evidence=payload.source_evidence.strip(), status="pending", created_by=admin.id)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return {"id": policy.id, "status": policy.status}


@router.post("/policy-changes/{policy_id}/review")
def review_policy(policy_id: int, payload: ReviewIn, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    policy = db.get(PolicyChange, policy_id)
    if not policy or policy.status != "pending":
        raise ApiProblem(404, "pending_policy_not_found", "Pending policy change not found.")
    if payload.decision == "approved" and not policy.source_evidence.strip():
        raise ApiProblem(422, "source_evidence_required", "Policy change needs source evidence before approval.")
    policy.status = payload.decision
    policy.reviewed_by = admin.id
    policy.reviewed_at = _now()
    policy.review_note = payload.note
    db.commit()
    return {"id": policy.id, "status": policy.status, "reviewed_by": admin.id}
