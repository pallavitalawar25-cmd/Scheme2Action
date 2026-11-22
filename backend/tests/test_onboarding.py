import json

import pytest

from app.core.config import settings
from app.routes import onboarding as onboarding_routes
from app.services import onboarding_ai
from app.services.profile_matching import derive_answers
from conftest import register

SOURCE = "https://ssp.karnataka.gov.in"


@pytest.fixture(autouse=True)
def configured_ai(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    onboarding_routes._hits.clear()
    yield
    onboarding_routes._hits.clear()


def fake_model(monkeypatch, payload):
    seen = {}

    def _call(prompt, turns):
        seen["prompt"], seen["turns"] = prompt, turns
        if isinstance(payload, Exception):
            raise payload
        return payload if isinstance(payload, str) else json.dumps(payload)

    monkeypatch.setattr(onboarding_ai, "_call_gemini", _call)
    return seen


def turn(client, message="hello", **extra):
    return client.post("/onboarding/message", json={"message": message, **extra})


def test_not_configured_returns_clear_503(client, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    response = turn(client)
    assert response.status_code == 503 and response.json()["code"] == "ai_not_configured"


def test_extracts_validates_and_never_trusts_model(client, monkeypatch):
    fake_model(monkeypatch, {"reply": "Thanks Asha! Where do you live?", "updates": {"fullName": "Asha Rao", "dateOfBirth": "3000-01-01", "occupation": "astronaut", "annualIncome": "2,40,000", "aadhaar": "123412341234", "residence": "rural"}, "skip": ["category", "fullName"]})
    body = turn(client, "I am Asha Rao, farmer income 240000").json()
    assert body["profile"] == {"fullName": "Asha Rao", "annualIncome": 240000, "residence": "rural"}
    assert {(r["field"], r["reason"]) for r in body["rejected"]} == {("dateOfBirth", "invalid_value"), ("occupation", "invalid_value"), ("aadhaar", "unknown_field")}
    assert body["skipped"] == ["category"]  # only optional fields can be skipped; core fields cannot
    assert "dateOfBirth" in body["missing"] and body["ready"] is False and 0 < body["progress"] < 100


def test_correction_replaces_earlier_value_and_ready_flag(client, monkeypatch):
    full = {"fullName": "Asha Rao", "dateOfBirth": "2004-06-15", "state": "Karnataka", "district": "Mysuru", "residence": "urban", "occupation": "student", "education": "higher_secondary", "annualIncome": 100000, "gender": "female", "disability": "no", "circumstances": []}
    fake_model(monkeypatch, {"reply": "Updated.", "updates": {"district": "Mandya"}, "skip": ["category"]})
    body = turn(client, "Actually my district is Mandya", profile=full).json()
    assert body["profile"]["district"] == "Mandya" and body["ready"] is True and body["progress"] == 100 and body["missing"] == []


def test_sensitive_numbers_never_reach_the_model(client, monkeypatch):
    seen = fake_model(monkeypatch, {"reply": "Please do not share ID numbers.", "updates": {}, "skip": []})
    turn(client, "my aadhaar is 1234 5678 9012 and phone 9876543210, income 150000", history=[{"role": "user", "content": "card 4111 1111 1111 1111"}])
    sent = json.dumps(seen["turns"])
    assert "1234 5678 9012" not in sent and "9876543210" not in sent and "4111" not in sent and "150000" in sent


def test_prompt_states_ai_does_not_decide_eligibility(client, monkeypatch):
    seen = fake_model(monkeypatch, {"reply": "Hi! What is your name?", "updates": {}, "skip": []})
    assert turn(client, "", language="kn").status_code == 200  # empty message + empty history opens the conversation
    assert "Kannada" in seen["prompt"] and "do NOT decide eligibility" in seen["prompt"] and "Aadhaar" in seen["prompt"]


@pytest.mark.parametrize("payload", [RuntimeError("secret-citizen-detail boom"), "not json", json.dumps({"reply": ""}), json.dumps(["x"])])
def test_model_failures_are_clean_502(client, monkeypatch, payload):
    fake_model(monkeypatch, payload)
    response = turn(client, "my name is Asha")
    assert response.status_code == 502 and response.json()["code"] == "ai_unavailable"
    assert "secret" not in response.text and "Asha" not in response.text


def test_input_validation_and_rate_limit(client, monkeypatch):
    fake_model(monkeypatch, {"reply": "ok", "updates": {}, "skip": []})
    assert turn(client, "", history=[{"role": "user", "content": "hi"}]).status_code == 422
    assert turn(client, "x" * 1001).status_code == 422
    assert turn(client, language="fr").status_code == 422
    assert client.post("/onboarding/message", json={"message": "hi", "history": [{"role": "system", "content": "x"}]}).status_code == 422
    codes = [turn(client, "hi").status_code for _ in range(45)]
    assert codes.count(200) == 40 and codes[-1] == 429


def test_profile_save_requires_auth_and_validates(client):
    assert client.patch("/me/profile", json={"residence": "rural"}).status_code == 401
    assert client.get("/me/scheme-matches").status_code == 401
    register(client)
    for bad in ({"residence": "moon"}, {"education": "phd"}, {"annualIncome": -5}, {"category": "x"}, {"disability": "maybe"}, {"circumstances": ["a"] * 13}):
        assert client.patch("/me/profile", json=bad).status_code == 422, bad


def test_confirmed_profile_is_saved_on_the_account_and_belongs_to_that_user(client):
    register(client)
    payload = {"fullName": "Asha Rao", "dateOfBirth": "2004-06-15", "state": "Karnataka", "district": "Mysuru", "residence": "urban", "occupation": "student", "education": "higher_secondary", "annualIncome": 120000, "category": "obc", "disability": "no", "circumstances": ["student"], "onboardingConsent": True}
    saved = client.patch("/me/profile", json=payload).json()["profile"]
    assert saved["annualIncome"] == 120000 and saved["residence"] == "urban" and saved["onboardingConfirmedAt"] and "onboardingConsent" not in saved
    assert client.get("/me/profile").json()["profile"]["district"] == "Mysuru"
    assert client.get("/me/workspace").json()["profile"]["education"] == "higher_secondary"
    client.post("/auth/logout")
    register(client, email="other@example.test", username="other")
    assert "annualIncome" not in client.get("/me/profile").json()["profile"]


def approve_rules(client, rules):
    from conftest import admin_login
    admin_login(client)
    ids = []
    for code, expected in rules:
        created = client.post("/admin/schemes/ssp-post-matric-scholarship/rules", json={"code": code, "question_en": f"Rule {code}?", "expected_answer": expected, "source_url": SOURCE, "source_evidence": "Official guideline text reviewed by a human."})
        ids.append(created.json()["rule"]["id"])
    client.post("/auth/logout")
    client.post("/auth/login", json={"identifier": "reviewer", "password": "ReviewPass123!"})
    for rule_id in ids:
        assert client.post(f"/admin/rules/{rule_id}/review", json={"decision": "approved", "note": "ok"}).status_code == 200
    client.post("/auth/logout")


def matches_for(client, scheme="ssp-post-matric-scholarship"):
    items = client.get("/me/scheme-matches").json()
    return items, next(i for i in items["items"] if i["scheme"]["id"] == scheme)


def test_matches_use_saved_profile_and_deterministic_rules_only(client, monkeypatch):
    # No AI call may happen while evaluating eligibility.
    monkeypatch.setattr(onboarding_ai, "_call_gemini", lambda *a: (_ for _ in ()).throw(AssertionError("Gemini must not be used for eligibility")))
    approve_rules(client, [("karnataka", "yes"), ("student", "yes"), ("postMatric", "yes")])
    register(client)
    _, before = matches_for(client)
    assert before["outcome"] == "NEEDS_VERIFICATION" and len(before["missing"]) == 3  # nothing saved yet -> nothing assumed
    client.patch("/me/profile", json={"state": "Karnataka", "occupation": "student", "education": "graduate", "circumstances": ["student"], "onboardingConsent": True})
    body, passed = matches_for(client)
    assert body["profile_confirmed"] is True and passed["outcome"] == "PASS" and len(passed["passed"]) == 3 and passed["failed"] == []
    others = [i for i in body["items"] if i["scheme"]["id"] != "ssp-post-matric-scholarship"]
    assert others and all(i["outcome"] == "NEEDS_VERIFICATION" and not i["rules_available"] for i in others)  # no fabricated results
    client.patch("/me/profile", json={"state": "Kerala"})
    _, failed = matches_for(client)
    assert failed["outcome"] == "FAIL" and [r["code"] for r in failed["failed"]] == ["karnataka"]


def test_application_prefill_only_from_confirmed_profile(client):
    register(client)
    client.patch("/me/profile", json={"state": "Karnataka"})
    first = client.post("/applications", json={"scheme_id": "ssp-post-matric-scholarship"}).json()["application"]
    assert first["answers"] == {}  # profile not confirmed through onboarding -> existing behaviour unchanged
    client.post("/auth/logout")
    register(client, email="b@example.test", username="bee")
    client.patch("/me/profile", json={"state": "Karnataka", "occupation": "student", "education": "graduate", "annualIncome": 90000, "circumstances": ["student"], "onboardingConsent": True})
    app = client.post("/applications", json={"scheme_id": "ssp-post-matric-scholarship"}).json()["application"]
    assert app["answers"] == {"student": "yes", "karnataka": "yes", "postMatric": "yes", "incomeKnown": "yes"} and app["outcome"] == "NEEDS_VERIFICATION"


def test_derive_answers_is_conservative():
    assert derive_answers({}) == {}
    assert derive_answers({"occupation": "student"}) == {"student": "yes"}  # no education -> postMatric stays unknown
    assert "student" not in derive_answers({"occupation": "farmer"})  # circumstances unknown -> not assumed
    d = derive_answers({"occupation": "farmer", "circumstances": [], "gender": "male", "residence": "rural", "disability": "no", "dateOfBirth": "1950-01-01", "state": "kerala"})
    assert d == {"student": "no", "postMatric": "no", "karnataka": "no", "farmer": "yes", "woman": "no", "seniorCitizen": "yes", "businessOwner": "no", "ruralResident": "yes", "hasDisability": "no"}
