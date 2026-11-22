from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import ApiProblem, api_problem_handler
from app.database import SessionLocal, init_db
from app.routes import admin, applications, auth, onboarding, schemes, users
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", description="Scheme2Action citizen preparation and review API. Eligibility uses only approved, versioned deterministic rules; this service is not a government approval authority.", lifespan=lifespan)
app.add_exception_handler(ApiProblem, api_problem_handler)
app.add_middleware(CORSMiddleware, allow_origins=settings.frontend_origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type", "Accept"])

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(schemes.router)
app.include_router(onboarding.router)
app.include_router(applications.router)
app.include_router(admin.router)


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "scheme2action-api"}
