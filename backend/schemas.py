from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    team: Optional[str] = None
    team_role: Optional[str] = None
    is_volunteer: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RoleAssignRequest(BaseModel):
    user_id: str
    role: str
    team: Optional[str] = None
    is_volunteer: Optional[bool] = False

class TeamAdminAssignRequest(BaseModel):
    user_id: str
    team: str

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

# Event Schemas
class EventCreate(BaseModel):
    title: str
    type: str = "Academic"
    date_time: datetime
    venue: str
    description: Optional[str] = ""
    budget: Optional[float] = 0.0
    poster_url: Optional[str] = None
    academic_year: Optional[str] = "2025-26"

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
    academic_year: str
    volunteer_user_ids: List[str]
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
