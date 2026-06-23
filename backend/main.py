# Use the OS (Windows) certificate store for SSL. This trusts certs that a
# VPN/proxy/antivirus injects, fixing CERTIFICATE_VERIFY_FAILED for outbound
# calls to Groq and LangSmith. Must run before any networking library loads.
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base
from routers import auth, triage, appointments

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Healthcare Triage API",
    description="AI-powered healthcare triage system using multi-agent CrewAI",
    version="1.0.0",
)

allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
allow_all = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else allowed_origins,
    allow_credentials=not allow_all,   # credentials can't be combined with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(triage.router)
app.include_router(appointments.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Healthcare Triage API"}


@app.get("/")
def root():
    return {"message": "Healthcare Triage API is running. Visit /docs for API documentation."}
