import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
from routers.sync_router import broadcast_sync_event

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[schemas.DocumentResponse])
def get_documents(
    team_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all official chapter documents, reports, and MoM archives."""
    query = db.query(models.Document)
    if team_id:
        query = query.filter(models.Document.team_id == team_id)
    if category:
        query = query.filter(models.Document.category == category)
    return query.order_by(models.Document.uploaded_at.desc()).all()

@router.post("", response_model=schemas.DocumentResponse)
def create_document(
    payload: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Upload or record an official chapter document."""
    uploader_name = current_user.name if current_user else "Documentation Lead"

    new_doc = models.Document(
        id=f"doc_{uuid.uuid4().hex[:12]}",
        event_id=payload.event_id or "general",
        category=payload.category or "reports",
        storage_path=payload.storage_path or "",
        download_url=payload.download_url,
        file_name=payload.file_name,
        uploaded_by=uploader_name,
        uploaded_at=datetime.utcnow(),
        team_id=payload.team_id or "Documentation"
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    broadcast_sync_event("DOCUMENT_UPLOADED", {
        "id": new_doc.id,
        "file_name": new_doc.file_name,
        "category": new_doc.category,
        "team_id": new_doc.team_id
    })

    return new_doc

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    """Delete an official document."""
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()

    broadcast_sync_event("DOCUMENT_DELETED", {"id": doc_id})
    return {"message": "Document deleted successfully."}
