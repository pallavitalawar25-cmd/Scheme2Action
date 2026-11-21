from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import ApiProblem

ALLOWED = {
    "application/pdf": (".pdf", b"%PDF-"),
    "image/jpeg": (".jpg", b"\xff\xd8\xff"),
    "image/png": (".png", b"\x89PNG\r\n\x1a\n"),
}


async def validate_and_save(upload: UploadFile, document_type: str) -> tuple[str, str, bytes]:
    if document_type.strip().lower() in {"aadhaar", "aadhaar_card", "aadhar", "aadhar_card"}:
        raise ApiProblem(422, "unnecessary_identity_document", "Do not upload Aadhaar details unless an official requirement has been verified. Use a non-sensitive identity checklist item instead.")
    if upload.content_type not in ALLOWED:
        raise ApiProblem(415, "invalid_file_type", "Only PDF, JPEG and PNG files are accepted.")
    ext, signature = ALLOWED[upload.content_type]
    original = Path(upload.filename or "document").name.replace("\x00", "")[:180] or "document"
    if Path(original).suffix.lower() != ext and not (ext == ".jpg" and Path(original).suffix.lower() == ".jpeg"):
        raise ApiProblem(415, "file_extension_mismatch", "The filename extension does not match the uploaded file type.")
    content = await upload.read(settings.max_upload_bytes + 1)
    if not content:
        raise ApiProblem(422, "empty_file", "Choose a non-empty document.")
    if len(content) > settings.max_upload_bytes:
        raise ApiProblem(413, "file_too_large", f"Files must be no larger than {settings.max_upload_bytes // (1024 * 1024)} MB.")
    if not content.startswith(signature):
        raise ApiProblem(415, "invalid_file_content", "The file content does not match its declared format.")
    stored = f"{uuid4().hex}{ext}"
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    path = settings.upload_dir / stored
    path.write_bytes(content)
    return original, stored, content


def remove_private_file(stored_name: str) -> None:
    # Stored names are server-generated UUID names, never user-provided paths.
    (settings.upload_dir / Path(stored_name).name).unlink(missing_ok=True)


def read_private_file(stored_name: str) -> bytes:
    path = settings.upload_dir / Path(stored_name).name
    if not path.is_file() or path.parent.resolve() != settings.upload_dir.resolve():
        raise FileNotFoundError(stored_name)
    return path.read_bytes()
