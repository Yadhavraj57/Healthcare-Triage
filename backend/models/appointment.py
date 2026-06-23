from sqlalchemy import Column, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid
from database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    session_id = Column(String(36), ForeignKey("triage_sessions.id"), nullable=True)
    specialist_type = Column(String(100))
    appointment_date = Column(Date)
    appointment_time = Column(Time)
    patient_name = Column(String(100))
    contact_email = Column(String(150))
    status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
