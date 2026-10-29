import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
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
    # Check Layer 1 & Layer 2 authorization:
    # Faculty/Coordinator can view any team requests.
    # Squad lead can view ONLY their own squad, and ONLY if tenure is active.
    can_manage = auth.has_permission(current_user, "canManageMembers", context={"squad": team_name})
    if not can_manage:
        raise HTTPException(status_code=403, detail=f"Not authorized to view requests for {team_name} squad.")

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

    # Check Layer 1 & Layer 2 authorization:
    can_manage = auth.has_permission(current_user, "canManageMembers", context={"squad": req.team_id})
    if not can_manage:
        raise HTTPException(
            status_code=403,
            detail=f"Not authorized to approve requests for {req.team_id} squad. Team admins can only manage their own squad."
        )

    req.status = "approved"
    req.reviewed_by = current_user.id

    # Update student record
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if target_user:
        target_user.team = req.team_id
        target_user.team_role = body.team_role
        target_user.status = "active"

    # Add to team member list
    team = db.query(models.Team).filter(models.Team.name == req.team_id).first()
    if team:
        member_ids = json.loads(team.member_user_ids or "[]")
        if req.user_id not in member_ids:
            member_ids.append(req.user_id)
            team.member_user_ids = json.dumps(member_ids)

    db.commit()

    auth.log_audit(
        db=db,
        actor=current_user,
        action="join_request_approved",
        target_type="user",
        target_id=req.user_id,
        target_name=req.user_name,
        details=f"Approved join request for {req.team_id} with role {body.team_role}"
    )

    return {"success": True, "message": f"Approved {req.user_name} for {req.team_id}."}
