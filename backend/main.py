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

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # lock this down to specific origins in production
    allow_credentials=False,      # must be False when allow_origins=["*"]
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
