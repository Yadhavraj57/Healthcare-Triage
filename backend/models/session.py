from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
import uuid
from database import Base


class TriageSession(Base):
    __tablename__ = "triage_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    symptoms_raw = Column(Text, nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    urgency_level = Column(String(30))
    report_json = Column(JSON)
    report_markdown = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
