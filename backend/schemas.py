from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    roll_no: Optional[str] = None
    department: Optional[str] = "Geoinformatics Engineering"

class UserLogin(BaseModel):
    email: Optional[str] = None
    roll_no: Optional[str] = None
    identifier: Optional[str] = None # can be email or roll_no
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class PasswordChangeResponse(BaseModel):
    success: bool
    message: str

class UserResponse(BaseModel):
    id: str
    roll_no: Optional[str] = None
    email: str
    name: str
    role: str
    post: Optional[str] = None
    department: Optional[str] = "Geoinformatics Engineering"
    year_of_study: Optional[str] = "4th Year (Senior)"
    phone: Optional[str] = "+91 94420 18820"
    tenure_end: Optional[datetime] = None
    team: Optional[str] = None
    team_role: Optional[str] = None
    squad_memberships: Optional[str] = "[]"
    is_volunteer: bool
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RoleAssignRequest(BaseModel):
    user_id: str
    role: str
    post: Optional[str] = None
    tenure_end: Optional[datetime] = None
    team: Optional[str] = None
    is_volunteer: Optional[bool] = False

class TeamAdminAssignRequest(BaseModel):
    user_id: str
    team: str
    post: Optional[str] = "Team Admin"
    tenure_end: Optional[datetime] = None

# Team Schemas
class TeamResponse(BaseModel):
    id: str
    name: str
    description: str
    admin_user_ids: List[str]
    member_user_ids: List[str]

    class Config:
        from_attributes = True

class JoinRequestCreate(BaseModel):
    team_id: str
    requested_role: Optional[str] = None

class JoinRequestResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    team_id: str
    status: str
    requested_role: Optional[str]
    reviewed_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ApproveJoinRequest(BaseModel):
    team_role: str

class TeamMemberAddRequest(BaseModel):
    user_id: str
    team_role: Optional[str] = "Member"

# Event Schemas
class EventCreate(BaseModel):
    title: str
    type: str = "Academic"
    date_time: datetime
    venue: str
    description: Optional[str] = ""
    budget: Optional[float] = 0.0
    poster_url: Optional[str] = None
    status: Optional[str] = "approved"
    academic_year: Optional[str] = "2025-26"
    geofence_enabled: Optional[bool] = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geofence_radius_meters: Optional[float] = 100.0

class EventUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    date_time: Optional[datetime] = None
    venue: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    poster_url: Optional[str] = None
    status: Optional[str] = None
    academic_year: Optional[str] = None

class EventCancelRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Mandatory non-empty reason for cancellation")

class ScannerAssignRequest(BaseModel):
    scanner_user_ids: List[str]

class EventResponse(BaseModel):
    id: str
    title: str
    type: str
    date_time: datetime
    venue: str
    description: str
    budget: float
    poster_url: Optional[str]
    status: str
    cancellation_reason: Optional[str] = None
    academic_year: str
    volunteer_user_ids: List[str]
    assigned_scanner_user_ids: List[str]
    geofence_enabled: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geofence_radius_meters: float = 100.0
    created_by: str
    created_at: datetime
    attendance_count: int

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    team_id: str
    assigned_user_ids: Optional[List[str]] = []
    deadline: datetime

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    team_id: Optional[str] = None
    assigned_user_ids: Optional[List[str]] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    team_id: str
    assigned_user_ids: List[str]
    deadline: datetime
    status: str
    proof_urls: List[str]
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class TaskProofSubmit(BaseModel):
    proof_url: str

# QR Attendance Schemas
class QrGenerateRequest(BaseModel):
    event_id: str

class QrGenerateResponse(BaseModel):
    token: str
    expires_at: datetime

class QrVerifyRequest(BaseModel):
    event_id: str
    token: str
    scanner_latitude: Optional[float] = None
    scanner_longitude: Optional[float] = None

class QrVerifyResponse(BaseModel):
    success: bool
    message: str
    attendee_name: str
    attendee_id: str
    check_in_time: datetime

# Document Schemas
class DocumentResponse(BaseModel):
    id: str
    event_id: str
    category: str
    storage_path: str
    download_url: str
    file_name: str
    uploaded_by: str
    uploaded_at: datetime
    team_id: str

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    action: str
    target_type: str
    target_id: str
    target_name: Optional[str]
    before_state: Optional[str]
    after_state: Optional[str]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetSubmitRequest(BaseModel):
    team_name: str
    requested_amount: float
    current_allocation: Optional[float] = 0.0
    reason: str

class BudgetResponse(BaseModel):
    id: str
    team_name: str
    requested_amount: float
    current_allocation: float
    reason: str
    requested_by: str
    reviewed_by: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStatsResponse(BaseModel):
    total_events: int
    total_members: int
    total_volunteers: int
    total_tasks: int
    completed_tasks: int
    total_check_ins: int
    team_member_counts: dict
    task_status_counts: dict

# Expense Schemas
class ExpenseCreate(BaseModel):
    title: str
    category: str
    amount: float
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    date: Optional[datetime] = None
    receipt_url: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    date: Optional[datetime] = None
    receipt_url: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    title: str
    category: str
    amount: float
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    date: datetime
    receipt_url: Optional[str] = None
    logged_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# User Enrollment Schema
class UserEnrollRequest(BaseModel):
    name: str
    roll_no: str
    email: Optional[str] = None
    role: Optional[str] = "student"
    post: Optional[str] = "Student Member"
    department: Optional[str] = "Geoinformatics Engineering"
    year_of_study: Optional[str] = "1st Year"
    phone: Optional[str] = None
    team: Optional[str] = "General"
    team_role: Optional[str] = "Member"
    is_volunteer: Optional[bool] = False
    password: Optional[str] = "geohub"

# Faculty Management Schemas
class FacultyCreateRequest(BaseModel):
    name: str
    roll_no: str
    email: str
    department: Optional[str] = "Geoinformatics Engineering"
    post: Optional[str] = "Faculty Advisor"
    phone: Optional[str] = None
    password: Optional[str] = "GeoHub2026!"

class FacultyResponse(BaseModel):
    id: str
    name: str
    roll_no: str
    email: str
    role: str
    post: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FacultyUpdateRequest(BaseModel):
    name: Optional[str] = None
    roll_no: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    post: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

# SuperAdmin Universal User Management Schemas
class UserAdminCreateRequest(BaseModel):
    name: str
    roll_no: str
    email: str
    role: str = "student"
    post: Optional[str] = "Student Member"
    department: Optional[str] = "Geoinformatics Engineering"
    year_of_study: Optional[str] = "1st Year"
    phone: Optional[str] = None
    team: Optional[str] = "General"
    team_role: Optional[str] = "Member"
    is_volunteer: Optional[bool] = False
    password: Optional[str] = "GeoHub2026!"

class UserAdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    roll_no: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    post: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    phone: Optional[str] = None
    team: Optional[str] = None
    team_role: Optional[str] = None
    is_volunteer: Optional[bool] = None
    status: Optional[str] = None
    password: Optional[str] = None

# Meeting Schemas
class MeetingCreate(BaseModel):
    title: str
    type: Optional[str] = "general"
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    date_time: str
    venue: str
    organizer_name: Optional[str] = None
    attendee_ids: Optional[List[str]] = []
    agenda: Optional[str] = ""

class MeetingMoMUpdate(BaseModel):
    mom_notes: str
    action_items: Optional[List[dict]] = []

class MeetingResponse(BaseModel):
    id: str
    title: str
    type: str
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    date_time: str
    venue: str
    organizer_name: str
    attendee_ids: List[str]
    agenda: str
    mom_notes: Optional[str] = None
    action_items: List[dict] = []
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Forum Message Schemas
class ForumMessageCreate(BaseModel):
    channel_id: str = "general"
    title: Optional[str] = None
    content: str

class ForumMessageResponse(BaseModel):
    id: str
    channel_id: str
    author_id: str
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    title: Optional[str] = None
    content: str
    timestamp: str
    likes: int = 0
    liked_by: List[str] = []
    pinned: bool = False
    replies: List[dict] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Stock Item Schemas
class StockItemCreate(BaseModel):
    name: str
    category: Optional[str] = "Logistics"
    quantity: int = 0
    unit: Optional[str] = "pcs"
    min_threshold: Optional[int] = 5
    unit_cost: Optional[float] = 0.0
    last_restocked: Optional[str] = None
    location: Optional[str] = "Main Store"
    status: Optional[str] = "in_stock"

class StockItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    min_threshold: Optional[int] = None
    unit_cost: Optional[float] = None
    last_restocked: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class StockItemResponse(BaseModel):
    id: str
    name: str
    category: str
    quantity: int
    unit: str
    min_threshold: int
    unit_cost: float
    last_restocked: Optional[str] = None
    location: str
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Gallery Item Schemas
class GalleryItemCreate(BaseModel):
    title: str
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    academic_year: Optional[str] = "2025-26"
    category: Optional[str] = "photos"
    url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None

class GalleryItemResponse(BaseModel):
    id: str
    title: str
    event_id: Optional[str] = None
    event_title: Optional[str] = None
    academic_year: str
    category: str
    url: str
    thumbnail_url: Optional[str] = None
    uploaded_by_name: str
    uploaded_at: datetime
    file_size_bytes: Optional[str] = None
    caption: Optional[str] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: Optional[str] = "info"

class NotificationBroadcastRequest(BaseModel):
    title: str
    message: str
    type: Optional[str] = "alert"
    urgency: Optional[str] = "normal"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentCreate(BaseModel):
    event_id: Optional[str] = "general"
    category: Optional[str] = "reports"
    storage_path: Optional[str] = ""
    download_url: str
    file_name: str
    team_id: Optional[str] = "Documentation"

class DocumentResponse(BaseModel):
    id: str
    event_id: str
    category: str
    storage_path: str
    download_url: str
    file_name: str
    uploaded_by: str
    uploaded_at: datetime
    team_id: str

    class Config:
        from_attributes = True

# Social Post Schemas
class SocialPostCreate(BaseModel):
    title: str
    content: str
    platform: Optional[str] = "all"
    status: Optional[str] = "draft"
    scheduled_for: Optional[str] = None
    published_at: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class SocialPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    scheduled_for: Optional[str] = None
    published_at: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class SocialPostResponse(BaseModel):
    id: str
    title: str
    content: str
    platform: str
    status: str
    author_id: str
    author_name: str
    scheduled_for: Optional[str] = None
    published_at: Optional[str] = None
    image_url: Optional[str] = None
    tags: Any = None
    created_at: datetime

    class Config:
        from_attributes = True

# Campaign Schemas
class CampaignPlanCreate(BaseModel):
    title: str
    theme: str
    target_audience: Optional[str] = "General Campus"
    start_date: str
    end_date: str
    status: Optional[str] = "planning"
    budget: Optional[float] = 0.0
    checklist: Optional[Dict[str, Any]] = None

class CampaignPlanUpdate(BaseModel):
    title: Optional[str] = None
    theme: Optional[str] = None
    target_audience: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    checklist: Optional[Dict[str, Any]] = None

class CampaignPlanResponse(BaseModel):
    id: str
    title: str
    theme: str
    target_audience: str
    start_date: str
    end_date: str
    status: str
    budget: float
    checklist: Any = None
    created_at: datetime

    class Config:
        from_attributes = True

# Daily News Schemas
class DailyNewsItemCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "announcement"
    source: Optional[str] = "GeoHub Editorial"
    author_name: Optional[str] = "System SuperAdmin"
    published_at: Optional[str] = None
    tags: Optional[List[str]] = None

class DailyNewsItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = None
    author_name: Optional[str] = None
    published_at: Optional[str] = None
    tags: Optional[List[str]] = None

class DailyNewsItemResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    source: str
    author_name: str
    published_at: Optional[str] = None
    tags: Any = None
    created_at: datetime

    class Config:
        from_attributes = True

# Member Custom Clearance Schemas
class MemberClearanceRequest(BaseModel):
    user_id: str
    allowed_modules: List[str]

class MemberClearanceResponse(BaseModel):
    user_id: str
    allowed_modules: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True



