from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
import uuid

from database import get_db
from models.session import TriageSession
from agents.triage_crew import run_triage_crew

load_dotenv()

router = APIRouter(prefix="/api", tags=["triage"])

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


class TriageRequest(BaseModel):
    symptoms: str
    age: int | None = None
    gender: str | None = None
    existing_conditions: list[str] = []
    medications: list[str] = []


def get_optional_user_id(authorization: str | None = Header(default=None)) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.post("/triage")
def run_triage(
    req: TriageRequest,
    db: Session = Depends(get_db),
    user_id: str | None = Depends(get_optional_user_id),
):
    if not req.symptoms or len(req.symptoms.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please describe your symptoms in more detail.")

    try:
        result = run_triage_crew(
            symptoms=req.symptoms,
            age=req.age,
            gender=req.gender,
            existing_conditions=req.existing_conditions,
            medications=req.medications,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Triage analysis failed: {str(e)}")

    session = TriageSession(
        user_id=user_id if user_id else None,
        symptoms_raw=req.symptoms,
        age=req.age,
        gender=req.gender,
        urgency_level=result["urgency_level"],
        report_json=result,
        report_markdown=result["report_markdown"],
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": str(session.id), **result}


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    sessions = (
        db.query(TriageSession)
        .filter(TriageSession.user_id == user_id)
        .order_by(TriageSession.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "session_id": str(s.id),
            "symptoms_raw": s.symptoms_raw,
            "urgency_level": s.urgency_level,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]
