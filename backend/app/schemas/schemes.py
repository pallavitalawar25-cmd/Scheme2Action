from pydantic import BaseModel, Field, HttpUrl


class SchemeUpsert(BaseModel):
    id: str = Field(min_length=2, max_length=90, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name_en: str = Field(min_length=2, max_length=220)
    name_kn: str = Field(default="", max_length=220)
    summary_en: str = Field(default="", max_length=3000)
    summary_kn: str = Field(default="", max_length=3000)
    category: str = Field(min_length=2, max_length=80)
    government_level: str = Field(pattern=r"^(central|karnataka)$")
    readiness: str = Field(default="soon", pattern=r"^(ready|partial|soon)$")
    source_url: HttpUrl
    verification_status: str = Field(default="pending", pattern=r"^(pending|info-verified|verified)$")


class SourceIn(BaseModel):
    url: HttpUrl
    title: str = Field(default="Official source", min_length=2, max_length=240)
    note: str = Field(default="", max_length=500)


class RuleIn(BaseModel):
    code: str = Field(min_length=2, max_length=80, pattern=r"^[a-zA-Z0-9_.-]+$")
    question_en: str = Field(min_length=2, max_length=300)
    question_kn: str = Field(default="", max_length=300)
    expected_answer: str = Field(min_length=1, max_length=80)
    applies_when: dict[str, str] = Field(default_factory=dict)
    origin: str = Field(default="human", pattern=r"^(human|ai)$")
    source_url: HttpUrl
    source_evidence: str = Field(min_length=12, max_length=5000)


class PolicyIn(BaseModel):
    scheme_id: str
    title: str = Field(min_length=2, max_length=240)
    before_text: str = Field(min_length=1, max_length=4000)
    after_text: str = Field(min_length=1, max_length=4000)
    source_url: HttpUrl
    source_evidence: str = Field(min_length=12, max_length=5000)


class ReviewIn(BaseModel):
    decision: str = Field(pattern=r"^(approved|rejected)$")
    note: str = Field(default="", max_length=500)
