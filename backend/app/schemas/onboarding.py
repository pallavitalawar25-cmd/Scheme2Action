"""Schemas for AI onboarding. The AI only proposes profile values; validation here is the gate."""
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

OCCUPATIONS = ("student", "farmer", "homemaker", "employed", "self", "unemployed", "retired")
GENDERS = ("female", "male", "other", "na")
RESIDENCES = ("rural", "urban")
EDUCATIONS = ("none", "primary", "secondary", "higher_secondary", "diploma_iti", "graduate", "postgraduate", "doctorate")
CATEGORIES = ("general", "obc", "sc", "st", "ews")
DISABILITY = ("yes", "no")
CIRCUMSTANCES = ("student", "farmer", "woman", "business_owner", "senior_citizen", "widow", "unemployed", "daily_wage_worker")

# Order is the order the assistant asks in. CORE fields drive "ready for review".
CORE_FIELDS = ("fullName", "dateOfBirth", "state", "district", "residence", "occupation", "education", "annualIncome")
OPTIONAL_FIELDS = ("gender", "category", "disability", "circumstances")
ALL_FIELDS = CORE_FIELDS + OPTIONAL_FIELDS


class OnboardingProfile(BaseModel):
    """Canonical profile shape; every field optional so partially collected profiles validate."""
    fullName: str | None = Field(default=None, min_length=2, max_length=120)
    dateOfBirth: str | None = None
    state: str | None = Field(default=None, min_length=2, max_length=80)
    district: str | None = Field(default=None, min_length=2, max_length=100)
    residence: Literal["rural", "urban"] | None = None
    occupation: Literal["student", "farmer", "homemaker", "employed", "self", "unemployed", "retired"] | None = None
    education: Literal["none", "primary", "secondary", "higher_secondary", "diploma_iti", "graduate", "postgraduate", "doctorate"] | None = None
    annualIncome: int | None = Field(default=None, ge=0, le=1_000_000_000)
    gender: Literal["female", "male", "other", "na"] | None = None
    category: Literal["general", "obc", "sc", "st", "ews"] | None = None
    disability: Literal["yes", "no"] | None = None
    circumstances: list[Literal["student", "farmer", "woman", "business_owner", "senior_citizen", "widow", "unemployed", "daily_wage_worker"]] | None = Field(default=None, max_length=8)

    @field_validator("fullName", "state", "district", mode="before")
    @classmethod
    def _clean_text(cls, value):
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be text")
        value = " ".join(value.split())
        if any(ch in value for ch in "<>{}[]\\") or any(ch.isdigit() for ch in value):
            raise ValueError("contains characters that are not allowed")
        return value

    @field_validator("dateOfBirth", mode="before")
    @classmethod
    def _dob(cls, value):
        if value is None:
            return None
        try:
            parsed = date.fromisoformat(str(value))
        except ValueError as exc:
            raise ValueError("use the format YYYY-MM-DD") from exc
        today = date.today()
        if parsed >= today:
            raise ValueError("date of birth must be in the past")
        if today.year - parsed.year > 120:
            raise ValueError("date of birth is not plausible")
        return parsed.isoformat()

    @field_validator("annualIncome", mode="before")
    @classmethod
    def _income(cls, value):
        if value is None or isinstance(value, bool):
            if isinstance(value, bool):
                raise ValueError("must be a number")
            return None
        if isinstance(value, float) and value.is_integer():
            return int(value)
        if isinstance(value, str) and value.strip().replace(",", "").isdigit():
            return int(value.strip().replace(",", ""))
        if isinstance(value, int):
            return value
        raise ValueError("must be a whole number of rupees per year")


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=1500)


class OnboardingMessageIn(BaseModel):
    language: Literal["en", "kn"] = "en"
    # Empty message with empty history asks the assistant to open the conversation.
    message: str = Field(default="", max_length=1000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=24)
    profile: dict = Field(default_factory=dict)
    skipped: list[str] = Field(default_factory=list, max_length=12)

    @field_validator("profile")
    @classmethod
    def _profile_size(cls, value):
        if len(value) > 20:
            raise ValueError("too many fields")
        return value


class OnboardingMessageOut(BaseModel):
    reply: str
    profile: dict
    skipped: list[str]
    missing: list[str]
    progress: int
    ready: bool
    rejected: list[dict]
