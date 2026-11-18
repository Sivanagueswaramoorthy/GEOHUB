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

@router.get("/items", response_model=List[schemas.GalleryItemResponse])
def get_gallery_item_records(
    event_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.GalleryItem)
    if event_id:
        query = query.filter(models.GalleryItem.event_id == event_id)
    if category:
        query = query.filter(models.GalleryItem.category == category)
    return query.order_by(models.GalleryItem.uploaded_at.desc()).all()

@router.post("/items", response_model=schemas.GalleryItemResponse)
def create_gallery_item_record(
    item_in: schemas.GalleryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    item = models.GalleryItem(
        title=item_in.title,
        event_id=item_in.event_id,
        event_title=item_in.event_title,
        academic_year=item_in.academic_year or "2025-26",
        category=item_in.category or "photos",
        url=item_in.url,
        thumbnail_url=item_in.thumbnail_url,
        uploaded_by_name=current_user.name,
        caption=item_in.caption
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="gallery_item_created",
        target_type="gallery",
        target_id=item.id,
        target_name=item.title,
        details=f"Added gallery item '{item.title}'"
    )

    return item

@router.delete("/items/{item_id}")
def delete_gallery_item_record(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    item = db.query(models.GalleryItem).filter(models.GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found.")

    title = item.title
    db.delete(item)
    db.commit()

    auth.log_audit(
        db=db,
        actor=current_user,
        action="gallery_item_deleted",
        target_type="gallery",
        target_id=item_id,
        target_name=title,
        details=f"Deleted gallery item '{title}'"
    )

    return {"status": "success", "message": f"Gallery item '{title}' deleted."}

