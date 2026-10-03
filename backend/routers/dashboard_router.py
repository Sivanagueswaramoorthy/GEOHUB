from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    total_events = db.query(models.Event).count()
    total_members = db.query(models.User).count()
    total_volunteers = db.query(models.User).filter(models.User.is_volunteer == True).count()
    total_tasks = db.query(models.Task).count()
    completed_tasks = db.query(models.Task).filter(models.Task.status == "done").count()
    total_check_ins = db.query(models.Attendance).count()

    # Team members count
    teams = ["Management", "Promotion", "Documentation", "Entertainment"]
    team_counts = {}
    for t in teams:
        team_counts[t] = db.query(models.User).filter(models.User.team == t).count()

    # Task status counts
    task_counts = {
        "todo": db.query(models.Task).filter(models.Task.status == "todo").count(),
        "in_progress": db.query(models.Task).filter(models.Task.status == "in_progress").count(),
        "done": completed_tasks,
    }

    return schemas.DashboardStatsResponse(
        total_events=total_events,
        total_members=total_members,
        total_volunteers=total_volunteers,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        total_check_ins=total_check_ins,
        team_member_counts=team_counts,
        task_status_counts=task_counts,
    )
