import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from config import settings
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/gallery", tags=["Gallery & Media"])

@router.get("", response_model=List[schemas.DocumentResponse])
def get_gallery_items(
    event_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Document)
    if event_id:
        query = query.filter(models.Document.event_id == event_id)
    if category:
        query = query.filter(models.Document.category == category)

    docs = query.order_by(models.Document.uploaded_at.desc()).all()
    return [schemas.DocumentResponse.from_orm(d) for d in docs]

@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_gallery_file(
    event_id: str = Form(...),
    category: str = Form("photos"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Verify permission: Documentation team or admin
    is_doc_team = current_user.team and current_user.team.lower() == "documentation"
    is_admin = current_user.role in ["admin", "super_admin"]

    if not is_doc_team and not is_admin:
        raise HTTPException(status_code=403, detail="Only Documentation team and admins can upload media.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    clean_filename = f"{event_id}_{category}_{file.filename}".replace(" ", "_")
    destination_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    download_url = f"/uploads/{clean_filename}"

    doc = models.Document(
        event_id=event_id,
        category=category,
        storage_path=destination_path,
        download_url=download_url,
        file_name=file.filename,
        uploaded_by=current_user.id,
        team_id=current_user.team or "Documentation"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return schemas.DocumentResponse.from_orm(doc)
