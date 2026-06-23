from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import date, time
from dotenv import load_dotenv
import os
import uuid

from database import get_db
from models.appointment import Appointment

load_dotenv()

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


class BookingRequest(BaseModel):
    session_id: str | None = None
    specialist_type: str
    appointment_date: date
    appointment_time: time
    patient_name: str
    contact_email: str


def get_optional_user_id(authorization: str | None = Header(default=None)) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.post("")
def book_appointment(
    req: BookingRequest,
    db: Session = Depends(get_db),
    user_id: str | None = Depends(get_optional_user_id),
):
    appointment = Appointment(
        user_id=user_id if user_id else None,
        session_id=req.session_id if req.session_id else None,
        specialist_type=req.specialist_type,
        appointment_date=req.appointment_date,
        appointment_time=req.appointment_time,
        patient_name=req.patient_name,
        contact_email=req.contact_email,
        status="pending",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "booking_id": str(appointment.id),
        "specialist_type": appointment.specialist_type,
        "appointment_date": appointment.appointment_date.isoformat(),
        "appointment_time": appointment.appointment_time.isoformat(),
        "patient_name": appointment.patient_name,
        "status": appointment.status,
        "message": "Appointment booked successfully. You will receive a confirmation shortly.",
    }


@router.get("")
def list_appointments(
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

    appointments = (
        db.query(Appointment)
        .filter(Appointment.user_id == user_id)
        .order_by(Appointment.created_at.desc())
        .all()
    )

    return [
        {
            "booking_id": str(a.id),
            "specialist_type": a.specialist_type,
            "appointment_date": a.appointment_date.isoformat() if a.appointment_date else None,
            "appointment_time": a.appointment_time.isoformat() if a.appointment_time else None,
            "patient_name": a.patient_name,
            "status": a.status,
            "created_at": a.created_at.isoformat(),
        }
        for a in appointments
    ]
