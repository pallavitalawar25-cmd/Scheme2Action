from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16), default="citizen", index=True)
    locale: Mapped[str] = mapped_column(String(2), default="en")
    profile: Mapped[dict] = mapped_column(JSON, default=dict)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    saved_schemes: Mapped[list[str]] = mapped_column(JSON, default=list)
    helper_session: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Scheme(Base):
    __tablename__ = "schemes"
    id: Mapped[str] = mapped_column(String(90), primary_key=True)
    name_en: Mapped[str] = mapped_column(String(220))
    name_kn: Mapped[str] = mapped_column(String(220), default="")
    summary_en: Mapped[str] = mapped_column(Text, default="")
    summary_kn: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(80), index=True)
    government_level: Mapped[str] = mapped_column(String(20), index=True)
    verification_status: Mapped[str] = mapped_column(String(24), default="pending", index=True)
    readiness: Mapped[str] = mapped_column(String(24), default="soon")
    source_url: Mapped[str] = mapped_column(String(500))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    current_version: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    versions: Mapped[list["SchemeVersion"]] = relationship(back_populates="scheme", cascade="all, delete-orphan", order_by="SchemeVersion.version")
    sources: Mapped[list["OfficialSource"]] = relationship(back_populates="scheme", cascade="all, delete-orphan")
    rules: Mapped[list["Rule"]] = relationship(back_populates="scheme", cascade="all, delete-orphan")


class SchemeVersion(Base):
    __tablename__ = "scheme_versions"
    __table_args__ = (UniqueConstraint("scheme_id", "version", name="uq_scheme_version"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer)
    snapshot: Mapped[dict] = mapped_column(JSON)
    summary: Mapped[str] = mapped_column(String(300), default="Initial version")
    status: Mapped[str] = mapped_column(String(24), default="approved")
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    scheme: Mapped[Scheme] = relationship(back_populates="versions")


class SchemeChange(Base):
    __tablename__ = "scheme_changes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    before_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    after_snapshot: Mapped[dict] = mapped_column(JSON)
    summary: Mapped[str] = mapped_column(String(300), default="Scheme change proposed")
    status: Mapped[str] = mapped_column(String(24), default="pending", index=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_note: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class OfficialSource(Base):
    __tablename__ = "official_sources"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    title: Mapped[str] = mapped_column(String(240), default="Official source")
    note: Mapped[str] = mapped_column(String(500), default="")
    verification_status: Mapped[str] = mapped_column(String(24), default="pending")
    added_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    scheme: Mapped[Scheme] = relationship(back_populates="sources")


class Rule(Base):
    __tablename__ = "rules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(80))
    question_en: Mapped[str] = mapped_column(String(300))
    question_kn: Mapped[str] = mapped_column(String(300), default="")
    expected_answer: Mapped[str] = mapped_column(String(80))
    applies_when: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(24), default="draft", index=True)
    origin: Mapped[str] = mapped_column(String(20), default="human")
    source_url: Mapped[str] = mapped_column(String(500))
    source_evidence: Mapped[str] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    scheme: Mapped[Scheme] = relationship(back_populates="rules")
    history: Mapped[list["RuleVersion"]] = relationship(back_populates="rule", cascade="all, delete-orphan", order_by="RuleVersion.version")


class RuleVersion(Base):
    __tablename__ = "rule_versions"
    __table_args__ = (UniqueConstraint("rule_id", "version", name="uq_rule_version"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("rules.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer)
    snapshot: Mapped[dict] = mapped_column(JSON)
    event: Mapped[str] = mapped_column(String(24))
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    rule: Mapped[Rule] = relationship(back_populates="history")


class PolicyChange(Base):
    __tablename__ = "policy_changes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(240))
    before_text: Mapped[str] = mapped_column(Text)
    after_text: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str] = mapped_column(String(500))
    source_evidence: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(24), default="pending", index=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_note: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class EligibilityAssessment(Base):
    __tablename__ = "eligibility_assessments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    scheme_version: Mapped[int] = mapped_column(Integer)
    answers: Mapped[dict] = mapped_column(JSON)
    outcome: Mapped[str] = mapped_column(String(32))
    result: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Application(Base):
    __tablename__ = "applications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="RESTRICT"), index=True)
    stage: Mapped[str] = mapped_column(String(32), default="eligibility")
    answers: Mapped[dict] = mapped_column(JSON, default=dict)
    outcome: Mapped[str] = mapped_column(String(32), default="needs-verification")
    eligibility_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    confirmed: Mapped[dict] = mapped_column(JSON, default=dict)
    packet_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    user: Mapped[User] = relationship(back_populates="applications")
    documents: Mapped[list["PrivateDocument"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    corrections: Mapped[list["CitizenCorrection"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    tracker_events: Mapped[list["TrackerEvent"]] = relationship(back_populates="application", cascade="all, delete-orphan")


class PrivateDocument(Base):
    __tablename__ = "private_documents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    document_type: Mapped[str] = mapped_column(String(80))
    original_name: Mapped[str] = mapped_column(String(180))
    stored_name: Mapped[str] = mapped_column(String(80), unique=True)
    content_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="uploaded")
    extraction: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    application: Mapped[Application] = relationship(back_populates="documents")


class CitizenCorrection(Base):
    __tablename__ = "citizen_corrections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    field_name: Mapped[str] = mapped_column(String(80))
    corrected_value: Mapped[str] = mapped_column(String(500))
    note: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    application: Mapped[Application] = relationship(back_populates="corrections")


class TrackerEvent(Base):
    __tablename__ = "tracker_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(40))
    label_en: Mapped[str] = mapped_column(String(240))
    label_kn: Mapped[str] = mapped_column(String(240), default="")
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    application: Mapped[Application] = relationship(back_populates="tracker_events")
