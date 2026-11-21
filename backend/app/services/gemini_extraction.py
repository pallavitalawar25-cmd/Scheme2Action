import json

from app.core.config import settings
from app.core.errors import ApiProblem


def extract_document(content: bytes, mime_type: str, language: str = "en") -> dict:
    if not settings.gemini_api_key:
        raise ApiProblem(503, "ai_not_configured", "Document extraction is not configured. Your file remains private and was not sent anywhere.")
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = (
            "Extract only clearly visible, non-sensitive document fields into JSON. "
            "Do not infer eligibility, authenticity, identity numbers, or missing values. "
            "Never extract Aadhaar or other national ID numbers. Return {fields:[{name,value,confidence}], "
            "notes:string}. Use language " + ("Kannada" if language == "kn" else "English") + "."
        )
        response = client.models.generate_content(model=settings.gemini_model, contents=[prompt, types.Part.from_bytes(data=content, mime_type=mime_type)])
        raw = (response.text or "{}").strip().removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(raw)
        return {"fields": parsed.get("fields", [])[:40], "notes": str(parsed.get("notes", ""))[:1000], "requires_human_review": True, "eligibility_decision": None}
    except ApiProblem:
        raise
    except Exception as exc:
        raise ApiProblem(502, "extraction_failed", "Document extraction could not be completed. You can continue with manual review.") from exc
