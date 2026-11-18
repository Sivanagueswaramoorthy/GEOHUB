import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Text
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    roll_no = Column(String(32), unique=True, index=True, nullable=True) # e.g. 21GEO001
    email = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="student")  # super_admin, faculty, coordinator, documentation, treasurer, promotion, management, student
    post = Column(String(64), nullable=True)      # Club President, Vice President, Treasurer, Documentation Lead, etc.
    department = Column(String(128), default="Geoinformatics Engineering")
    year_of_study = Column(String(64), default="4th Year (Senior)")
    phone = Column(String(32), default="+91 94420 18820")
    tenure_end = Column(DateTime, nullable=True)
    team = Column(String(64), nullable=True)     # Management, Promotion, Documentation, Entertainment
    team_role = Column(String(64), nullable=True) # Designer, Photographer, Squad Lead, etc.
    squad_memberships = Column(Text, default="[]") # JSON string of [{ squad: 'Management', isLead: true }]
    is_volunteer = Column(Boolean, default=False)
    status = Column(String(32), default="pending") # pending, active, disabled
    last_login_at = Column(DateTime, nullable=True)
    last_seen_at = Column(DateTime, nullable=True)
    last_platform = Column(String(32), default="Android")
    last_app_version = Column(String(32), default="1.6.26")
    token_version = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"

    id = Column(String(64), primary_key=True)
    name = Column(String(64), unique=True, nullable=False)
    description = Column(String(255), default="")
    admin_user_ids = Column(Text, default="[]")  # JSON string of user IDs
    member_user_ids = Column(Text, default="[]") # JSON string of user IDs

class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False)
    user_name = Column(String(128), nullable=False)
    user_email = Column(String(128), nullable=False)
    team_id = Column(String(64), nullable=False)
    status = Column(String(32), default="pending") # pending, approved, rejected
    requested_role = Column(String(64), nullable=True)
    reviewed_by = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(128), nullable=False)
    type = Column(String(64), default="Academic")
    date_time = Column(DateTime, nullable=False)
    venue = Column(String(128), nullable=False)
    description = Column(Text, default="")
    budget = Column(Float, default=0.0)
    poster_url = Column(String(255), nullable=True)
    status = Column(String(32), default="draft") # draft, submitted, approved, live, done, archived, cancelled
    cancellation_reason = Column(Text, nullable=True)
    academic_year = Column(String(32), default="2025-26")
    volunteer_user_ids = Column(Text, default="[]") # JSON string of user IDs
    assigned_scanner_user_ids = Column(Text, default="[]") # JSON string of user IDs authorized to scan
    geofence_enabled = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geofence_radius_meters = Column(Float, default=100.0)
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    attendance_count = Column(Integer, default=0)

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(String(128), primary_key=True) # eventId_userId
    event_id = Column(String(64), nullable=False)
    user_id = Column(String(64), nullable=False)
    user_name = Column(String(128), nullable=False)
    user_email = Column(String(128), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(128), nullable=False)
    description = Column(Text, default="")
    team_id = Column(String(64), nullable=False)
    assigned_user_ids = Column(Text, default="[]") # JSON string
    deadline = Column(DateTime, nullable=False)
    status = Column(String(32), default="todo") # todo, in_progress, done
    proof_urls = Column(Text, default="[]") # JSON string of links
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QrSession(Base):
    __tablename__ = "qr_sessions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    event_id = Column(String(64), nullable=False)
    user_id = Column(String(64), nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(128), primary_key=True) # eventId_userId
    event_id = Column(String(64), nullable=False)
    user_id = Column(String(64), nullable=False)
    user_name = Column(String(128), nullable=True)
    scanned_by = Column(String(64), nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    method = Column(String(32), default="qr")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    event_id = Column(String(64), nullable=False)
    category = Column(String(32), default="photos") # photos, videos, bills, reports
    storage_path = Column(String(255), nullable=False)
    download_url = Column(String(255), nullable=False)
    file_name = Column(String(128), nullable=False)
    uploaded_by = Column(String(64), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    team_id = Column(String(64), default="Documentation")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    actor_id = Column(String(64), nullable=False)
    actor_name = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)
    target_type = Column(String(64), nullable=False) # user, event, budget, attendance, report, post
    target_id = Column(String(64), nullable=False)
    target_name = Column(String(128), nullable=True)
    before_state = Column(Text, nullable=True)
    after_state = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class BudgetRequest(Base):
    __tablename__ = "budget_requests"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    team_name = Column(String(64), nullable=False)
    requested_amount = Column(Float, nullable=False)
    current_allocation = Column(Float, default=0.0)
    reason = Column(Text, nullable=False)
    requested_by = Column(String(64), nullable=False)
    reviewed_by = Column(String(64), nullable=True)
    status = Column(String(32), default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(32), default="info") # info, success, warning, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    amount = Column(Float, nullable=False)
    event_id = Column(String(64), nullable=True)
    event_title = Column(String(128), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    receipt_url = Column(String(256), nullable=True)
    logged_by = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AppDevice(Base):
    __tablename__ = "app_devices"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    device_id = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(String(64), nullable=True, index=True) # roll_no or user id
    device_name = Column(String(128), default="Android Device")
    os_version = Column(String(64), default="Android")
    app_version = Column(String(32), default="1.5.0")
    fcm_token = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class RolePermissionOverride(Base):
    __tablename__ = "role_permission_overrides"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    role = Column(String(32), unique=True, index=True, nullable=False) # e.g. coordinator
    overrides_json = Column(Text, nullable=False, default="{}") # JSON of { "canApproveEvents": true, ... }
    updated_by = Column(String(64), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RoleModuleAccess(Base):
    __tablename__ = "role_module_access"

    role = Column(String(32), primary_key=True)
    module_key = Column(String(64), primary_key=True)
    enabled = Column(Boolean, default=True, nullable=False)
    updated_by = Column(String(64), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    type = Column(String(50), default="general")  # pre_event, post_event, general, core, faculty
    event_id = Column(String(64), nullable=True)
    event_title = Column(String(255), nullable=True)
    date_time = Column(String(100), nullable=False)
    venue = Column(String(255), nullable=False)
    organizer_name = Column(String(255), nullable=False)
    attendee_ids = Column(Text, default="[]")  # JSON string of attendee user IDs
    agenda = Column(Text, default="")
    mom_notes = Column(Text, nullable=True)
    action_items = Column(Text, default="[]")  # JSON string of [{task, assignedTo, isDone}]
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

class ForumMessage(Base):
    __tablename__ = "forum_messages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    channel_id = Column(String(64), nullable=False, index=True)  # announcements, coordination, tech_geo, general
    author_id = Column(String(64), nullable=False)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(100), default="student")
    author_avatar = Column(String(500), nullable=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(String(100), nullable=False)
    likes = Column(Integer, default=0)
    liked_by = Column(Text, default="[]")  # JSON list of user IDs
    pinned = Column(Boolean, default=False)
    replies = Column(Text, default="[]")   # JSON list of replies/comments
    created_at = Column(DateTime, default=datetime.utcnow)

class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Logistics")  # Logistics, Stage, Printing, Refreshments, Field Equipment, Stationery
    quantity = Column(Integer, default=0)
    unit = Column(String(50), default="pcs")
    min_threshold = Column(Integer, default=5)
    unit_cost = Column(Float, default=0.0)
    last_restocked = Column(String(100), nullable=True)
    location = Column(String(255), default="Main Store")
    status = Column(String(50), default="in_stock")  # in_stock, low_stock, out_of_stock
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    event_id = Column(String(64), nullable=True)
    event_title = Column(String(255), nullable=True)
    academic_year = Column(String(32), default="2025-26")
    category = Column(String(50), default="photos")  # photos, videos, bills, reports
    url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    uploaded_by_name = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    file_size_bytes = Column(String(64), nullable=True)
    caption = Column(Text, nullable=True)



