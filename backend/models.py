import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Text
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")  # faculty, coordinator, documentation, treasurer, promotion, student
    post = Column(String, nullable=True)      # President, Vice President, Treasurer, Team Admin, etc.
    tenure_end = Column(DateTime, nullable=True) # Optional post tenure expiration
    team = Column(String, nullable=True)     # Management, Promotion, Documentation, Entertainment
    team_role = Column(String, nullable=True) # Designer, Photographer, Lead, etc.
    is_volunteer = Column(Boolean, default=False)
    status = Column(String, default="pending") # pending, active, disabled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, default="")
    admin_user_ids = Column(Text, default="[]")  # JSON string of user IDs
    member_user_ids = Column(Text, default="[]") # JSON string of user IDs

class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    team_id = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected
    requested_role = Column(String, nullable=True)
    reviewed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    type = Column(String, default="Academic")
    date_time = Column(DateTime, nullable=False)
    venue = Column(String, nullable=False)
    description = Column(Text, default="")
    budget = Column(Float, default=0.0)
    poster_url = Column(String, nullable=True)
    status = Column(String, default="draft") # draft, submitted, approved, live, done, archived, cancelled
    cancellation_reason = Column(Text, nullable=True)
    academic_year = Column(String, default="2025-26")
    volunteer_user_ids = Column(Text, default="[]") # JSON string of user IDs (legacy compatibility)
    assigned_scanner_user_ids = Column(Text, default="[]") # JSON string of user IDs authorized to scan
    geofence_enabled = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geofence_radius_meters = Column(Float, default=100.0)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    attendance_count = Column(Integer, default=0)

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(String, primary_key=True) # eventId_userId
    event_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    team_id = Column(String, nullable=False)
    assigned_user_ids = Column(Text, default="[]") # JSON string
    deadline = Column(DateTime, nullable=False)
    status = Column(String, default="todo") # todo, in_progress, done
    proof_urls = Column(Text, default="[]") # JSON string of links
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QrSession(Base):
    __tablename__ = "qr_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True) # eventId_userId
    event_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=True)
    scanned_by = Column(String, nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    method = Column(String, default="qr")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, nullable=False)
    category = Column(String, default="photos") # photos, videos, bills, reports
    storage_path = Column(String, nullable=False)
    download_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    team_id = Column(String, default="Documentation")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    actor_id = Column(String, nullable=False)
    actor_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False) # user, event, budget, attendance, report, post
    target_id = Column(String, nullable=False)
    target_name = Column(String, nullable=True)
    before_state = Column(Text, nullable=True)
    after_state = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class BudgetRequest(Base):
    __tablename__ = "budget_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    team_name = Column(String, nullable=False)
    requested_amount = Column(Float, nullable=False)
    current_allocation = Column(Float, default=0.0)
    reason = Column(Text, nullable=False)
    requested_by = Column(String, nullable=False)
    reviewed_by = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
