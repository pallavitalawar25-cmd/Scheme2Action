from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ApiProblem
from app.models.entities import EligibilityAssessment, Rule, Scheme

QUESTIONNAIRES = {
    "ssp-post-matric-scholarship": [
        {"code": "student", "question_en": "Are you currently a student?", "question_kn": "ನೀವು ಪ್ರಸ್ತುತ ವಿದ್ಯಾರ್ಥಿಯಾಗಿದ್ದೀರಾ?"},
        {"code": "karnataka", "question_en": "Are you a resident of Karnataka?", "question_kn": "ನೀವು ಕರ್ನಾಟಕದ ನಿವಾಸಿಯಾಗಿದ್ದೀರಾ?"},
        {"code": "postMatric", "question_en": "Are you studying a post-matric course?", "question_kn": "ನೀವು ಮೆಟ್ರಿಕ್ ನಂತರದ ಕೋರ್ಸ್ ಓದುತ್ತಿದ್ದೀರಾ?"},
        {"code": "incomeKnown", "question_en": "Can you provide family income information?", "question_kn": "ಕುಟುಂಬದ ಆದಾಯದ ಮಾಹಿತಿಯನ್ನು ನೀಡಬಹುದೇ?"},
    ]
}


def evaluate_rules(rules: list[Rule], answers: dict[str, str]) -> dict:
    """Pure, deterministic evaluation of approved rules. Never calls an AI model and never writes to the database."""
    if not rules:
        return {"outcome": "NEEDS_VERIFICATION", "evaluated": [], "passed": [], "failed": [], "missing": [], "reason": "No reviewed deterministic rules are approved for this scheme yet.", "next_action": "Check the linked official scheme guidance or ask an administrator to verify and approve source-backed rules.", "sources": []}
    evaluated = []
    passed = []
    failed = []
    missing = []
    for rule in rules:
        if any(answers.get(key) != expected for key, expected in (rule.applies_when or {}).items()):
            continue
        entry = {"code": rule.code, "question_en": rule.question_en, "question_kn": rule.question_kn, "expected_answer": rule.expected_answer, "answer": answers.get(rule.code), "source_url": rule.source_url, "source_evidence": rule.source_evidence, "rule_version": rule.version}
        evaluated.append(entry)
        value = answers.get(rule.code)
        if value is None or value == "unknown":
            missing.append(entry)
        elif value == rule.expected_answer:
            passed.append(entry)
        else:
            failed.append(entry)
    outcome = "NEEDS_VERIFICATION" if not evaluated or missing else "FAIL" if failed else "PASS"
    return {"outcome": outcome, "evaluated": evaluated, "passed": passed, "failed": failed, "missing": missing, "reason": "Some required answers are missing or the scheme has no applicable reviewed rule." if outcome == "NEEDS_VERIFICATION" else "One or more approved rules were not met." if outcome == "FAIL" else "All evaluated approved rules were met; this is not an official decision.", "next_action": "Complete missing answers and verify details against the official source." if outcome == "NEEDS_VERIFICATION" else "Review documents and confirm details before preparing the application." if outcome == "PASS" else "Review the official scheme conditions; Scheme2Action cannot issue an official decision.", "sources": sorted({r.source_url for r in rules if r.status == "approved"})}


def approved_rules(db: Session, scheme_id: str) -> list[Rule]:
    return list(db.scalars(select(Rule).where(Rule.scheme_id == scheme_id, Rule.status == "approved").order_by(Rule.id)).all())


def check_eligibility(db: Session, user_id: int, scheme: Scheme, answers: dict[str, str]) -> EligibilityAssessment:
    result = evaluate_rules(approved_rules(db, scheme.id), answers)
    assessment = EligibilityAssessment(user_id=user_id, scheme_id=scheme.id, scheme_version=scheme.current_version, answers=answers, outcome=result["outcome"], result=result)
    db.add(assessment)
    db.flush()
    return assessment


def get_scheme(db: Session, scheme_id: str) -> Scheme:
    scheme = db.get(Scheme, scheme_id)
    if not scheme or not scheme.is_published:
        raise ApiProblem(404, "scheme_not_found", "Scheme not found.")
    return scheme
