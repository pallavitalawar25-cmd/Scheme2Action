import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, normalize_email
from app.models.entities import OfficialSource, Scheme, SchemeVersion, User

SEED_FILE = Path(__file__).with_name("catalogue_seed.json")


def seed_database(db: Session) -> None:
    if not db.scalar(select(Scheme.id).limit(1)):
        rows = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        for row in rows:
            scheme = Scheme(**row)
            db.add(scheme)
            snapshot = {key: value for key, value in row.items() if key not in {"id"}}
            db.add(SchemeVersion(scheme_id=row["id"], version=1, snapshot=snapshot, summary="Initial demonstration catalogue record", status="approved"))
            db.add(OfficialSource(scheme_id=row["id"], url=row["source_url"], title="Official scheme portal reference", note="Reference only; evidence must be checked by a reviewer.", verification_status="pending"))
        db.commit()

    if settings.admin_email and settings.admin_username and settings.admin_password and not db.scalar(select(User.id).where(User.role == "admin").limit(1)):
        admin = User(email=normalize_email(settings.admin_email), username=settings.admin_username.lower(), full_name="Scheme2Action Administrator", password_hash=hash_password(settings.admin_password), role="admin", locale="en", profile={"fullName": "Scheme2Action Administrator"}, settings={})
        db.add(admin)
        db.commit()
