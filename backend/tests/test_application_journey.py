from app.core.config import settings
from conftest import register


def _application(client):
    register(client)
    response = client.post("/applications", json={"scheme_id": "ssp-post-matric-scholarship"})
    assert response.status_code == 201, response.text
    return response.json()["application"]["id"]


def test_corrections_final_review_packet_and_tracker(client):
    application_id = _application(client)
    correction = client.post(f"/applications/{application_id}/corrections", json={"field_name": "applicant_name", "corrected_value": "Asha Citizen", "note": "Corrected by citizen"})
    assert correction.status_code == 201
    assert correction.json()["correction"]["corrected_value"] == "Asha Citizen"

    incomplete = client.post(f"/applications/{application_id}/review", json={"confirmed": {"documents": True}, "applicant_consent": False})
    assert incomplete.status_code == 422
    reviewed = client.post(f"/applications/{application_id}/review", json={"confirmed": {"documents": True, "answers": True}, "applicant_consent": True})
    assert reviewed.status_code == 200
    assert reviewed.json()["application"]["packet_ready"] is True

    packet = client.get(f"/applications/{application_id}/packet.pdf?language=en")
    assert packet.status_code == 200
    assert packet.content.startswith(b"%PDF-")
    assert packet.headers["cache-control"] == "private, no-store"
    events = client.get(f"/applications/{application_id}/tracker?language=en").json()["items"]
    assert {event["type"] for event in events} >= {"started", "correction_added", "review_completed"}


def test_ai_extraction_without_credentials_stays_private(client, monkeypatch):
    application_id = _application(client)
    pdf = b"%PDF-1.4\nsmall synthetic test fixture\n%%EOF"
    uploaded = client.post(f"/applications/{application_id}/documents", data={"document_type": "income"}, files={"file": ("synthetic.pdf", pdf, "application/pdf")})
    assert uploaded.status_code == 201
    document_id = uploaded.json()["document"]["id"]
    monkeypatch.setattr(settings, "gemini_api_key", "")
    response = client.post(f"/applications/{application_id}/documents/{document_id}/extract", json={"consent": True})
    assert response.status_code == 503
    assert response.json()["code"] == "ai_not_configured"
    assert "not sent" in response.json()["detail"]
