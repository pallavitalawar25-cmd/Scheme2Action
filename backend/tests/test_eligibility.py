from conftest import admin_login, register


def test_no_approved_rules_returns_needs_verification(client):
    register(client)
    questions = client.get("/schemes/ssp-post-matric-scholarship/eligibility/questions?language=kn")
    assert questions.status_code == 200
    assert len(questions.json()["items"]) == 4
    assert questions.json()["rules_available"] is False
    response = client.post("/schemes/ssp-post-matric-scholarship/eligibility", json={"answers": {"student": "yes"}})
    assert response.status_code == 201
    assert response.json()["outcome"] == "NEEDS_VERIFICATION"
    assert response.json()["evaluated"] == []
    assert response.json()["reason"] and response.json()["next_action"]


def test_approved_rules_are_deterministic_for_pass_fail_and_missing(client):
    register(client)
    admin_login(client)
    reviewer = client.post("/auth/login", json={"identifier": "reviewer", "password": "ReviewPass123!"})
    assert reviewer.status_code == 200
    client.post("/auth/logout")
    admin_login(client)
    payload = {"code": "resident", "question_en": "Are you a resident?", "question_kn": "ನೀವು ನಿವಾಸಿಯೇ?", "expected_answer": "yes", "applies_when": {}, "origin": "ai", "source_url": "https://ssp.karnataka.gov.in", "source_evidence": "Reviewer transcribed source passage for test coverage."}
    created = client.post("/admin/schemes/ssp-post-matric-scholarship/rules", json=payload)
    assert created.status_code == 201
    rule = created.json()["rule"]
    assert rule["status"] == "draft" and rule["origin"] == "ai"
    client.post("/auth/logout")
    client.post("/auth/login", json={"identifier": "reviewer", "password": "ReviewPass123!"})
    reviewed = client.post(f"/admin/rules/{rule['id']}/review", json={"decision": "approved", "note": "Source checked"})
    assert reviewed.status_code == 200 and reviewed.json()["published"] is True
    client.post("/auth/logout")
    register(client, email="second@example.test", username="second")
    passed = client.post("/schemes/ssp-post-matric-scholarship/eligibility", json={"answers": {"resident": "yes"}}).json()
    failed = client.post("/schemes/ssp-post-matric-scholarship/eligibility", json={"answers": {"resident": "no"}}).json()
    missing = client.post("/schemes/ssp-post-matric-scholarship/eligibility", json={"answers": {}}).json()
    assert (passed["outcome"], failed["outcome"], missing["outcome"]) == ("PASS", "FAIL", "NEEDS_VERIFICATION")
    assert passed["sources"] == ["https://ssp.karnataka.gov.in/"]


def test_rule_author_cannot_approve_own_ai_draft(client):
    register(client)
    admin_login(client)
    payload = {"code": "test_rule", "question_en": "Test question", "expected_answer": "yes", "origin": "ai", "source_url": "https://example.gov.in/source", "source_evidence": "Evidence excerpt used only by this test."}
    created = client.post("/admin/schemes/ssp-post-matric-scholarship/rules", json=payload)
    rule_id = created.json()["rule"]["id"]
    result = client.post(f"/admin/rules/{rule_id}/review", json={"decision": "approved"})
    assert result.status_code == 403
