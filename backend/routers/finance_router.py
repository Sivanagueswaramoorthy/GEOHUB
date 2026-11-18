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

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("BUDGET_REQUEST_SUBMITTED", {
            "id": budget_req.id,
            "team_name": budget_req.team_name,
            "amount": budget_req.requested_amount,
        })
    except Exception:
        pass

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

    # Defense in depth: Cannot approve self-submitted request unless super_admin
    if budget_req.requested_by == faculty.id and auth.normalize_role(faculty.role) != "super_admin":
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

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("BUDGET_REQUEST_APPROVED", {
            "id": budget_req.id,
            "team_name": budget_req.team_name,
            "amount": budget_req.requested_amount,
        })
    except Exception:
        pass

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

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("BUDGET_REQUEST_REJECTED", {
            "id": budget_req.id,
            "team_name": budget_req.team_name,
        })
    except Exception:
        pass

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

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EXPENSE_CREATED", {
            "id": new_exp.id,
            "title": new_exp.title,
            "amount": new_exp.amount,
        })
    except Exception:
        pass

    return new_exp

@router.put("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: str,
    exp_in: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found.")

    if exp_in.title is not None:
        exp.title = exp_in.title
    if exp_in.category is not None:
        exp.category = exp_in.category
    if exp_in.amount is not None:
        exp.amount = exp_in.amount
    if exp_in.event_id is not None:
        exp.event_id = exp_in.event_id
    if exp_in.event_title is not None:
        exp.event_title = exp_in.event_title
    if exp_in.date is not None:
        exp.date = exp_in.date
    if exp_in.receipt_url is not None:
        exp.receipt_url = exp_in.receipt_url

    db.commit()
    db.refresh(exp)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EXPENSE_UPDATED", {
            "id": exp.id,
            "title": exp.title,
            "amount": exp.amount,
        })
    except Exception:
        pass

    return exp

@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found.")

    db.delete(exp)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EXPENSE_DELETED", {"id": expense_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Expense '{expense_id}' successfully deleted."}

@router.delete("/budget-requests/{request_id}")
def delete_budget_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    req = db.query(models.BudgetRequest).filter(models.BudgetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Budget request not found.")

    db.delete(req)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("BUDGET_REQUEST_DELETED", {"id": request_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Budget request '{request_id}' successfully deleted."}

# Stock & Inventory Management Endpoints
@router.get("/stock", response_model=List[schemas.StockItemResponse])
def get_stock_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.StockItem).order_by(models.StockItem.name.asc()).all()

@router.post("/stock", response_model=schemas.StockItemResponse)
def create_stock_item(
    item_in: schemas.StockItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    stock_item = models.StockItem(
        name=item_in.name,
        category=item_in.category or "Logistics",
        quantity=item_in.quantity,
        unit=item_in.unit or "pcs",
        min_threshold=item_in.min_threshold if item_in.min_threshold is not None else 5,
        unit_cost=item_in.unit_cost or 0.0,
        last_restocked=item_in.last_restocked,
        location=item_in.location or "Main Store",
        status=item_in.status or "in_stock"
    )
    db.add(stock_item)
    db.commit()
    db.refresh(stock_item)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="stock_item_created",
        target_type="stock",
        target_id=stock_item.id,
        target_name=stock_item.name,
        details=f"Created stock item '{stock_item.name}' with quantity {stock_item.quantity}"
    )

    return stock_item

@router.put("/stock/{item_id}", response_model=schemas.StockItemResponse)
def update_stock_item(
    item_id: str,
    item_in: schemas.StockItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    stock_item = db.query(models.StockItem).filter(models.StockItem.id == item_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Stock item not found.")

    if item_in.name is not None:
        stock_item.name = item_in.name
    if item_in.category is not None:
        stock_item.category = item_in.category
    if item_in.quantity is not None:
        stock_item.quantity = item_in.quantity
    if item_in.unit is not None:
        stock_item.unit = item_in.unit
    if item_in.min_threshold is not None:
        stock_item.min_threshold = item_in.min_threshold
    if item_in.unit_cost is not None:
        stock_item.unit_cost = item_in.unit_cost
    if item_in.last_restocked is not None:
        stock_item.last_restocked = item_in.last_restocked
    if item_in.location is not None:
        stock_item.location = item_in.location
    if item_in.status is not None:
        stock_item.status = item_in.status

    db.commit()
    db.refresh(stock_item)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="stock_item_updated",
        target_type="stock",
        target_id=stock_item.id,
        target_name=stock_item.name,
        details=f"Updated stock item '{stock_item.name}'"
    )

    return stock_item

@router.delete("/stock/{item_id}")
def delete_stock_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    stock_item = db.query(models.StockItem).filter(models.StockItem.id == item_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Stock item not found.")

    name = stock_item.name
    db.delete(stock_item)
    db.commit()

    auth.log_audit(
        db=db,
        actor=current_user,
        action="stock_item_deleted",
        target_type="stock",
        target_id=item_id,
        target_name=name,
        details=f"Deleted stock item '{name}'"
    )

    return {"status": "success", "message": f"Stock item '{name}' deleted."}

