from conftest import admin_login, register


def test_admin_role_scheme_versioning_and_human_approval(client):
    register(client)
    assert client.get("/admin/dashboard").status_code == 403
    client.post("/auth/logout")
    admin_login(client)
    payload = {"id": "test-scheme", "name_en": "Test scheme", "name_kn": "ಪರೀಕ್ಷಾ ಯೋಜನೆ", "summary_en": "Test summary", "summary_kn": "ಪರೀಕ್ಷಾ ಸಾರಾಂಶ", "category": "education", "government_level": "karnataka", "readiness": "soon", "source_url": "https://example.gov.in/scheme", "verification_status": "verified"}
    created = client.post("/admin/schemes", json=payload)
    assert created.status_code == 201
    assert created.json()["published"] is False
    assert client.get("/schemes/test-scheme").status_code == 404
    change_id = created.json()["change_id"]
    client.post("/auth/logout")
    reviewer = client.post("/auth/login", json={"identifier": "reviewer", "password": "ReviewPass123!"})
    assert reviewer.status_code == 200
    approved = client.post(f"/admin/scheme-changes/{change_id}/review", json={"decision": "approved", "note": "Source reviewed"})
    assert approved.status_code == 200 and approved.json()["published"] is True
    assert approved.json()["version"] == 1
    assert client.get("/schemes/test-scheme").status_code == 200
    assert len(client.get("/admin/schemes/test-scheme/history").json()["versions"]) == 1


def test_ai_rule_remains_draft_until_explicit_human_review_and_versions(client):
    admin_login(client)
    payload = {"code": "income_test", "question_en": "Is income declared?", "expected_answer": "yes", "origin": "ai", "source_url": "https://example.gov.in/rules", "source_evidence": "Example source text that must be reviewed by a human."}
    created = client.post("/admin/schemes/ssp-post-matric-scholarship/rules", json=payload)
    assert created.status_code == 201
    rule = created.json()["rule"]
    assert rule["status"] == "draft" and rule["origin"] == "ai"
    assert client.get("/admin/rulebook").json()["items"][0]["status"] == "draft"
    client.post("/auth/logout")
    client.post("/auth/login", json={"identifier": "reviewer", "password": "ReviewPass123!"})
    review = client.post(f"/admin/rules/{rule['id']}/review", json={"decision": "approved", "note": "Evidence reviewed"})
    assert review.status_code == 200 and review.json()["published"] is True
    history = client.get(f"/admin/rules/{rule['id']}/history").json()["items"]
    assert [item["event"] for item in history] == ["draft_created", "approved"]


def test_policy_change_is_pending_until_admin_review(client):
    admin_login(client)
    payload = {"scheme_id": "pm-kisan", "title": "Test policy review", "before_text": "Old summary", "after_text": "Proposed summary", "source_url": "https://pmkisan.gov.in", "source_evidence": "Source evidence copied for human review."}
    created = client.post("/admin/policy-changes", json=payload)
    assert created.status_code == 201
    assert client.get("/admin/policy-changes?status=pending").json()["items"][0]["status"] == "pending"
    reviewed = client.post(f"/admin/policy-changes/{created.json()['id']}/review", json={"decision": "rejected", "note": "Evidence is insufficient"})
    assert reviewed.status_code == 200 and reviewed.json()["status"] == "rejected"
