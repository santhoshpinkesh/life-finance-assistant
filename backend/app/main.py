import os
import warnings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth as auth_router
from .routers import credit_cards, emis, reminders, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Life Finance Assistant API",
    description="Personal financial reminder and life organizer — MVP backend",
    version="0.1.0",
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if FRONTEND_ORIGIN == "*" and ENVIRONMENT == "production":
    warnings.warn(
        "WARNING: CORS is set to allow all origins in production. "
        "Set FRONTEND_ORIGIN to your actual frontend domain.",
        RuntimeWarning
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(credit_cards.router)
app.include_router(emis.router)
app.include_router(reminders.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
