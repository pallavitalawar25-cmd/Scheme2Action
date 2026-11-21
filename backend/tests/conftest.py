import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import hash_password
from app.database import Base, get_db
from app.main import app
from app.models.entities import User
from app.services.seed import seed_database


@pytest.fixture
def client(tmp_path):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(engine)
    settings.upload_dir = tmp_path / "private"

    def override_db():
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db
    with testing_session() as db:
        seed_database(db)
        db.add_all([
            User(email="admin@example.test", username="admin", full_name="Admin One", password_hash=hash_password("AdminPass123!"), role="admin", profile={}, settings={}),
            User(email="reviewer@example.test", username="reviewer", full_name="Admin Two", password_hash=hash_password("ReviewPass123!"), role="admin", profile={}, settings={}),
        ])
        db.commit()
    yield TestClient(app)
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def register(client: TestClient, email="citizen@example.test", username="citizen", password="CitizenPass123!"):
    response = client.post("/auth/register", json={"name": "Test Citizen", "email": email, "username": username, "password": password})
    assert response.status_code == 201, response.text
    return response.json()["user"]


def admin_login(client: TestClient, username="admin", password="AdminPass123!"):
    response = client.post("/auth/login", json={"identifier": username, "password": password, "remember": True})
    assert response.status_code == 200, response.text
    return response.json()["user"]
