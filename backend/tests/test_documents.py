from conftest import register


def _start_application(client):
    register(client)
    response = client.post("/applications", json={"scheme_id": "ssp-post-matric-scholarship"})
    assert response.status_code == 201, response.text
    return response.json()["application"]["id"]


def test_upload_validation_private_download_and_owner_isolation(client):
    application_id = _start_application(client)
    invalid = client.post(f"/applications/{application_id}/documents", data={"document_type": "income"}, files={"file": ("proof.pdf", b"not a pdf", "application/pdf")})
    assert invalid.status_code == 415
    aadhaar = client.post(f"/applications/{application_id}/documents", data={"document_type": "aadhaar"}, files={"file": ("proof.pdf", b"%PDF-1.4\nexample", "application/pdf")})
    assert aadhaar.status_code == 422 and aadhaar.json()["code"] == "unnecessary_identity_document"
    uploaded = client.post(f"/applications/{application_id}/documents", data={"document_type": "income"}, files={"file": ("proof.pdf", b"%PDF-1.4\nprivate sample", "application/pdf")})
    assert uploaded.status_code == 201, uploaded.text
    document_id = uploaded.json()["document"]["id"]
    register(client, email="other@example.test", username="other")
    private = client.get(f"/applications/{application_id}/documents/{document_id}/file")
    assert private.status_code == 404
    client.post("/auth/logout")
    client.post("/auth/login", json={"identifier": "citizen", "password": "CitizenPass123!"})
    downloaded = client.get(f"/applications/{application_id}/documents/{document_id}/file")
    assert downloaded.status_code == 200
    assert downloaded.content.startswith(b"%PDF-")
    assert downloaded.headers["cache-control"] == "private, no-store"


def test_upload_size_checklist_and_ai_consent(client):
    application_id = _start_application(client)
    checklist = client.get("/schemes/ssp-post-matric-scholarship/documents?language=kn").json()
    assert len(checklist["items"]) == 6
    assert all("aadhaar" not in row["code"].lower() for row in checklist["items"])
    extracted = client.post(f"/applications/{application_id}/documents/unknown/extract", json={"consent": False})
    assert extracted.status_code == 400
    too_large = client.post(f"/applications/{application_id}/documents", data={"document_type": "income"}, files={"file": ("proof.pdf", b"%PDF-" + b"x" * (5 * 1024 * 1024 + 1), "application/pdf")})
    assert too_large.status_code == 413
