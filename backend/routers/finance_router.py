from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/finance", tags=["Finance & Budget"])

@router.get("/budget-requests", response_model=List[schemas.BudgetResponse])
def get_budget_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    norm_role = auth.normalize_role(current_user.role)

    # Faculty can review all executive approvals
    if auth.has_permission(current_user, "canReviewExecutiveApprovals"):
        return db.query(models.BudgetRequest).order_by(models.BudgetRequest.created_at.desc()).all()

    # Treasurer can ONLY see the status of their own submitted requests
    if norm_role == "treasurer":
        return db.query(models.BudgetRequest).filter(
            models.BudgetRequest.requested_by == current_user.id
        ).order_by(models.BudgetRequest.created_at.desc()).all()

    raise HTTPException(status_code=403, detail="Permission denied to access budget requests.")

@router.post("/budget-requests", response_model=schemas.BudgetResponse)
def submit_budget_request(
    req: schemas.BudgetSubmitRequest,
    db: Session = Depends(get_db),
    treasurer: models.User = Depends(auth.require_permission("canSubmitBudgetRequest"))
):
    """Treasurer submits budget request."""
    budget_req = models.BudgetRequest(
        team_name=req.team_name,
        requested_amount=req.requested_amount,
        current_allocation=req.current_allocation or 0.0,
        reason=req.reason,
        requested_by=treasurer.id,
        status="pending"
    )
    db.add(budget_req)
    db.commit()
    db.refresh(budget_req)

    auth.log_audit(
        db=db,
        actor=treasurer,
        action="budget_request_submitted",
        target_type="budget",
        target_id=budget_req.id,
        target_name=req.team_name,
        details=f"Submitted budget request for ₹{req.requested_amount:.2f} for {req.team_name}. Reason: {req.reason}"
    )

    return budget_req

@router.post("/budget-requests/{request_id}/approve", response_model=schemas.BudgetResponse)
def approve_budget_request(
    request_id: str,
    db: Session = Depends(get_db),
    faculty: models.User = Depends(auth.require_permission("canApproveBudget"))
):
    """Faculty ONLY can approve budget.
    Defense in depth: Treasurer cannot approve a request they submitted (and the flag is removed anyway).
    """
    budget_req = db.query(models.BudgetRequest).filter(models.BudgetRequest.id == request_id).first()
    if not budget_req:
        raise HTTPException(status_code=404, detail="Budget request not found.")

    # Defense in depth: Cannot approve self-submitted request
    if budget_req.requested_by == faculty.id:
        raise HTTPException(
            status_code=400,
            detail="Protection Rule: Cannot approve your own budget request."
        )

    budget_req.status = "approved"
    budget_req.reviewed_by = faculty.id
    db.commit()

    auth.log_audit(
        db=db,
        actor=faculty,
        action="budget_approval",
        target_type="budget",
        target_id=budget_req.id,
        target_name=budget_req.team_name,
        before_state="pending",
        after_state="approved",
        details=f"Faculty approved budget of ₹{budget_req.requested_amount:.2f} for {budget_req.team_name}"
    )

    return budget_req

@router.post("/budget-requests/{request_id}/reject", response_model=schemas.BudgetResponse)
def reject_budget_request(
    request_id: str,
    db: Session = Depends(get_db),
    faculty: models.User = Depends(auth.require_permission("canApproveBudget"))
):
    budget_req = db.query(models.BudgetRequest).filter(models.BudgetRequest.id == request_id).first()
    if not budget_req:
        raise HTTPException(status_code=404, detail="Budget request not found.")

    budget_req.status = "rejected"
    budget_req.reviewed_by = faculty.id
    db.commit()

    auth.log_audit(
        db=db,
        actor=faculty,
        action="budget_rejection",
        target_type="budget",
        target_id=budget_req.id,
        target_name=budget_req.team_name,
        before_state="pending",
        after_state="rejected",
        details=f"Faculty rejected budget request for {budget_req.team_name}"
    )

    return budget_req

@router.get("/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Retrieve all approved official chapter expenses from the financial ledger."""
    return db.query(models.Expense).order_by(models.Expense.date.desc()).all()

@router.post("/expenses", response_model=schemas.ExpenseResponse)
def create_expense(
    exp_in: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Log an expense transaction in the chapter ledger with audit logging."""
    new_exp = models.Expense(
        title=exp_in.title,
        category=exp_in.category,
        amount=exp_in.amount,
        event_id=exp_in.event_id,
        event_title=exp_in.event_title,
        date=exp_in.date or datetime.utcnow(),
        receipt_url=exp_in.receipt_url,
        logged_by=current_user.id
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="expense_logged",
        target_type="expense",
        target_id=new_exp.id,
        target_name=new_exp.title,
        details=f"Logged expense of ₹{new_exp.amount:.2f} under {new_exp.category} for {new_exp.event_title or 'General Operations'}"
    )

    return new_exp
