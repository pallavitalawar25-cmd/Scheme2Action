from pydantic import BaseModel, Field


class ProfilePatch(BaseModel):
    fullName: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, pattern=r"^$|^[6-9][0-9]{9}$")
    dateOfBirth: str | None = Field(default=None, max_length=10)
    gender: str | None = Field(default=None, max_length=30)
    state: str | None = Field(default=None, max_length=80)
    district: str | None = Field(default=None, max_length=100)
    pincode: str | None = Field(default=None, pattern=r"^$|^[0-9]{6}$")
    occupation: str | None = Field(default=None, max_length=80)


class SettingsPatch(BaseModel):
    notifications: dict[str, bool] | None = None
    privacy: dict[str, bool] | None = None


class WorkspacePatch(BaseModel):
    profile: dict | None = None
    settings: dict | None = None
    helper_session: dict | None = None


class EligibilityIn(BaseModel):
    answers: dict[str, str] = Field(max_length=80)


class ApplicationIn(BaseModel):
    scheme_id: str = Field(min_length=2, max_length=90)
    assessment_id: str | None = Field(default=None, max_length=36)


class ApplicationPatch(BaseModel):
    stage: str | None = Field(default=None, pattern=r"^(eligibility|results|documents|upload|review|corrections|final|packet|tracker)$")
    answers: dict[str, str] | None = None
    outcome: str | None = Field(default=None, pattern=r"^(PASS|FAIL|NEEDS_VERIFICATION)$")
    confirmed: dict[str, bool] | None = None


class CorrectionIn(BaseModel):
    field_name: str = Field(min_length=2, max_length=80, pattern=r"^[A-Za-z0-9_.-]+$")
    corrected_value: str = Field(max_length=500)
    note: str = Field(default="", max_length=500)


class FinalReviewIn(BaseModel):
    confirmed: dict[str, bool]
    applicant_consent: bool
