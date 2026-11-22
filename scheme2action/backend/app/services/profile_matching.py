"""Deterministic mapping from a citizen-confirmed profile to eligibility answers.

No AI is involved here. An answer is produced only when the profile gives a definite basis for it;
otherwise the code is left out, so the rules engine reports it as missing information.
"""
from __future__ import annotations

from datetime import date

POST_MATRIC_EDUCATION = {"higher_secondary", "diploma_iti", "graduate", "postgraduate", "doctorate"}

# Question/rule codes that can be answered from the profile. Administrators may write approved rules using these codes.
DERIVABLE_CODES = ("student", "karnataka", "postMatric", "incomeKnown", "farmer", "woman", "seniorCitizen", "ruralResident", "hasDisability", "businessOwner")


def is_confirmed(profile: dict | None) -> bool:
    return bool((profile or {}).get("onboardingConfirmedAt"))


def _age(dob: str | None) -> int | None:
    try:
        born = date.fromisoformat(dob or "")
    except ValueError:
        return None
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def derive_answers(profile: dict | None) -> dict[str, str]:
    p = profile or {}
    circumstances = p.get("circumstances")
    known_circumstances = isinstance(circumstances, list)
    circ = set(circumstances) if known_circumstances else set()
    occupation = p.get("occupation") or ""
    out: dict[str, str] = {}

    def yes_no(code: str, positive: bool, negative_known: bool) -> None:
        if positive:
            out[code] = "yes"
        elif negative_known:
            out[code] = "no"

    yes_no("student", occupation == "student" or "student" in circ, bool(occupation) and known_circumstances)
    state = str(p.get("state") or "").strip().lower()
    if state:
        out["karnataka"] = "yes" if state == "karnataka" else "no"
    if out.get("student") == "no":
        out["postMatric"] = "no"
    elif out.get("student") == "yes" and p.get("education") in POST_MATRIC_EDUCATION:
        out["postMatric"] = "yes"
    if p.get("annualIncome") is not None:
        out["incomeKnown"] = "yes"
    yes_no("farmer", occupation == "farmer" or "farmer" in circ, bool(occupation) and known_circumstances)
    gender = p.get("gender")
    if gender == "female" or "woman" in circ:
        out["woman"] = "yes"
    elif gender == "male":
        out["woman"] = "no"
    age = _age(p.get("dateOfBirth"))
    if age is not None:
        out["seniorCitizen"] = "yes" if age >= 60 else "no"
    if p.get("residence") in {"rural", "urban"}:
        out["ruralResident"] = "yes" if p["residence"] == "rural" else "no"
    if p.get("disability") in {"yes", "no"}:
        out["hasDisability"] = p["disability"]
    yes_no("businessOwner", "business_owner" in circ, known_circumstances and bool(occupation) and occupation != "self")
    return out
