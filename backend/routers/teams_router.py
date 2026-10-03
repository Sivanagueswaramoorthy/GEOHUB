import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/teams", tags=["Teams & Members"])

@router.get("", response_model=List[schemas.TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(models.Team).all()
    results = []
    for t in teams:
        results.append(schemas.TeamResponse(
            id=t.id,
            name=t.name,
            description=t.description,
            admin_user_ids=json.loads(t.admin_user_ids or "[]"),
            member_user_ids=json.loads(t.member_user_ids or "[]")
        ))
    return results

@router.get("/{team_name}")
def get_team_detail(team_name: str, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    members = db.query(models.User).filter(models.User.team == team_name).all()
    return {
        "team": {
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "admin_user_ids": json.loads(team.admin_user_ids or "[]"),
            "member_user_ids": json.loads(team.member_user_ids or "[]"),
        },
        "members": [schemas.UserResponse.from_orm(m) for m in members]
    }

@router.post("/join-request", response_model=schemas.JoinRequestResponse)
def submit_join_request(
    req: schemas.JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    new_req = models.JoinRequest(
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        team_id=req.team_id,
        status="pending",
        requested_role=req.requested_role,
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return schemas.JoinRequestResponse.from_orm(new_req)

@router.get("/{team_name}/requests", response_model=List[schemas.JoinRequestResponse])
def get_pending_requests(
    team_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check authorization: user must be team_admin for this team, or admin/super_admin
    is_admin = current_user.role in ["admin", "super_admin"]
    is_team_admin = current_user.role == "team_admin" and current_user.team == team_name

    if not is_admin and not is_team_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view requests for this team.")

    requests = db.query(models.JoinRequest).filter(
        models.JoinRequest.team_id == team_name,
        models.JoinRequest.status == "pending"
    ).all()
    return [schemas.JoinRequestResponse.from_orm(r) for r in requests]

@router.post("/requests/{request_id}/approve")
def approve_join_request(
    request_id: str,
    body: schemas.ApproveJoinRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    req = db.query(models.JoinRequest).filter(models.JoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Join request not found.")

    is_admin = current_user.role in ["admin", "super_admin"]
    is_team_admin = current_user.role == "team_admin" and current_user.team == req.team_id

    if not is_admin and not is_team_admin:
        raise HTTPException(status_code=403, detail="Not authorized to approve for this team.")

    req.status = "approved"
    req.reviewed_by = current_user.id

    # Update student record
    student = db.query(models.User).filter(models.User.id == req.user_id).first()
    if student:
        student.team = req.team_id
        student.team_role = body.team_role
        student.status = "active"

    # Add to team member list
    team = db.query(models.Team).filter(models.Team.name == req.team_id).first()
    if team:
        members = json.loads(team.member_user_ids or "[]")
        if req.user_id not in members:
            members.append(req.user_id)
            team.member_user_ids = json.dumps(members)

    db.commit()
    return {"success": True, "message": f"Approved {req.user_name} as {body.team_role}"}

@router.post("/requests/{request_id}/reject")
def reject_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    req = db.query(models.JoinRequest).filter(models.JoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.status = "rejected"
    req.reviewed_by = current_user.id
    db.commit()
    return {"success": True, "message": "Join request rejected"}
