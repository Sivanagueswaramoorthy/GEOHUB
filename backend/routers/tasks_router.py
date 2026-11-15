import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/tasks", tags=["Tasks & Proofs"])

@router.get("", response_model=List[schemas.TaskResponse])
def get_tasks(
    scope: Optional[str] = "my_tasks", # my_tasks, team, all
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Task)

    if status:
        query = query.filter(models.Task.status == status)

    all_tasks = query.order_by(models.Task.deadline.asc()).all()
    filtered = []

    for t in all_tasks:
        assigned_ids = json.loads(t.assigned_user_ids or "[]")
        proofs = json.loads(t.proof_urls or "[]")

        include = False
        if scope == "all" and auth.normalize_role(current_user.role) in ["coordinator", "super_admin", "faculty"]:
            include = True
        elif scope == "team" and current_user.team == t.team_id:
            include = True
        elif current_user.id in assigned_ids:
            include = True

        if include:
            filtered.append(schemas.TaskResponse(
                id=t.id,
                title=t.title,
                description=t.description,
                team_id=t.team_id,
                assigned_user_ids=assigned_ids,
                deadline=t.deadline,
                status=t.status,
                proof_urls=proofs,
                created_by=t.created_by,
                created_at=t.created_at
            ))

    return filtered

@router.post("", response_model=schemas.TaskResponse)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    norm_role = auth.normalize_role(current_user.role)
    is_admin = norm_role in ["admin", "super_admin", "coordinator", "faculty"] or current_user.role in ["admin", "super_admin"]
    is_team_admin = (current_user.role == "team_admin" or "lead" in (current_user.post or "").lower()) and current_user.team == task_in.team_id

    if not is_admin and not is_team_admin:
        raise HTTPException(status_code=403, detail="Not authorized to assign tasks for this team.")

    new_task = models.Task(
        title=task_in.title,
        description=task_in.description or "",
        team_id=task_in.team_id,
        assigned_user_ids=json.dumps(task_in.assigned_user_ids or []),
        deadline=task_in.deadline,
        status="todo",
        created_by=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("TASK_CREATED", {
            "id": new_task.id,
            "title": new_task.title,
            "status": new_task.status,
            "team_id": new_task.team_id,
        })
    except Exception:
        pass

    return schemas.TaskResponse(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        team_id=new_task.team_id,
        assigned_user_ids=task_in.assigned_user_ids or [],
        deadline=new_task.deadline,
        status=new_task.status,
        proof_urls=[],
        created_by=new_task.created_by,
        created_at=new_task.created_at
    )

@router.patch("/{task_id}/status")
def update_task_status(
    task_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    task.status = status
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("TASK_UPDATED", {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "team_id": task.team_id,
        })
    except Exception:
        pass

    return {"success": True, "status": status}

@router.post("/{task_id}/proof")
def submit_proof(
    task_id: str,
    body: schemas.TaskProofSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    proofs = json.loads(task.proof_urls or "[]")
    if body.proof_url not in proofs:
        proofs.append(body.proof_url)

    task.proof_urls = json.dumps(proofs)
    task.status = "done"  # Auto mark completed upon proof submission
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("TASK_UPDATED", {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "team_id": task.team_id,
        })
    except Exception:
        pass

    return {"success": True, "proof_urls": proofs}

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: str,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.team_id is not None:
        task.team_id = task_in.team_id
    if task_in.assigned_user_ids is not None:
        task.assigned_user_ids = json.dumps(task_in.assigned_user_ids)
    if task_in.deadline is not None:
        task.deadline = task_in.deadline
    if task_in.status is not None:
        task.status = task_in.status

    db.commit()
    db.refresh(task)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("TASK_UPDATED", {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "team_id": task.team_id,
        })
    except Exception:
        pass

    return schemas.TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        team_id=task.team_id,
        assigned_user_ids=json.loads(task.assigned_user_ids or "[]"),
        deadline=task.deadline,
        status=task.status,
        proof_urls=json.loads(task.proof_urls or "[]"),
        created_by=task.created_by,
        created_at=task.created_at
    )

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    db.delete(task)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("TASK_DELETED", {"id": task_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Task '{task_id}' successfully deleted."}
