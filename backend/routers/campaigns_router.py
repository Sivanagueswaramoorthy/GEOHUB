import uuid
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
from routers.sync_router import broadcast_sync_event

router = APIRouter(tags=["Campaigns & Social Media"])

# ==========================================
# CAMPAIGNS
# ==========================================
@router.get("/campaigns", response_model=List[schemas.CampaignPlanResponse])
def get_campaigns(db: Session = Depends(get_db)):
    """Retrieve all chapter campaigns."""
    items = db.query(models.CampaignPlan).order_by(models.CampaignPlan.created_at.desc()).all()
    # Parse checklist JSON if string
    for item in items:
        if isinstance(item.checklist, str):
            try:
                item.checklist = json.loads(item.checklist)
            except:
                item.checklist = {}
    return items

@router.post("/campaigns", response_model=schemas.CampaignPlanResponse)
def create_campaign(
    payload: schemas.CampaignPlanCreate,
    db: Session = Depends(get_db)
):
    """Create a new chapter campaign plan."""
    chk_str = json.dumps(payload.checklist or {})
    new_camp = models.CampaignPlan(
        id=f"camp_{uuid.uuid4().hex[:12]}",
        title=payload.title.strip(),
        theme=payload.theme.strip(),
        target_audience=payload.target_audience or "General Campus",
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status or "planning",
        budget=payload.budget or 0.0,
        checklist=chk_str,
        created_at=datetime.utcnow()
    )
    db.add(new_camp)
    db.commit()
    db.refresh(new_camp)

    broadcast_sync_event("CAMPAIGN_UPDATED", {"id": new_camp.id, "title": new_camp.title})
    return new_camp

@router.put("/campaigns/{camp_id}", response_model=schemas.CampaignPlanResponse)
def update_campaign(
    camp_id: str,
    payload: schemas.CampaignPlanUpdate,
    db: Session = Depends(get_db)
):
    """Update a campaign plan or its task checklist."""
    camp = db.query(models.CampaignPlan).filter(models.CampaignPlan.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if payload.title is not None:
        camp.title = payload.title
    if payload.theme is not None:
        camp.theme = payload.theme
    if payload.target_audience is not None:
        camp.target_audience = payload.target_audience
    if payload.start_date is not None:
        camp.start_date = payload.start_date
    if payload.end_date is not None:
        camp.end_date = payload.end_date
    if payload.status is not None:
        camp.status = payload.status
    if payload.budget is not None:
        camp.budget = payload.budget
    if payload.checklist is not None:
        camp.checklist = json.dumps(payload.checklist)

    db.commit()
    db.refresh(camp)

    broadcast_sync_event("CAMPAIGN_UPDATED", {"id": camp.id, "title": camp.title})
    return camp

# ==========================================
# SOCIAL POSTS
# ==========================================
@router.get("/posts", response_model=List[schemas.SocialPostResponse])
def get_posts(db: Session = Depends(get_db)):
    """Retrieve all social media campaign posts."""
    posts = db.query(models.SocialPost).order_by(models.SocialPost.created_at.desc()).all()
    for p in posts:
        if isinstance(p.tags, str):
            try:
                p.tags = json.loads(p.tags)
            except:
                p.tags = []
    return posts

@router.post("/posts", response_model=schemas.SocialPostResponse)
def create_post(
    payload: schemas.SocialPostCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Create a social post."""
    author_id = current_user.id if current_user else "u_super_admin_sa01"
    author_name = current_user.name if current_user else "Promotion Lead"

    tags_str = json.dumps(payload.tags or [])
    new_post = models.SocialPost(
        id=f"post_{uuid.uuid4().hex[:12]}",
        title=payload.title.strip(),
        content=payload.content.strip(),
        platform=payload.platform or "all",
        status=payload.status or "draft",
        author_id=author_id,
        author_name=author_name,
        scheduled_for=payload.scheduled_for,
        published_at=payload.published_at,
        image_url=payload.image_url,
        tags=tags_str,
        created_at=datetime.utcnow()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    broadcast_sync_event("POST_CREATED", {"id": new_post.id, "title": new_post.title})
    return new_post

@router.put("/posts/{post_id}", response_model=schemas.SocialPostResponse)
def update_post(
    post_id: str,
    payload: schemas.SocialPostUpdate,
    db: Session = Depends(get_db)
):
    """Update a social post status or content."""
    post = db.query(models.SocialPost).filter(models.SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content
    if payload.platform is not None:
        post.platform = payload.platform
    if payload.status is not None:
        post.status = payload.status
    if payload.scheduled_for is not None:
        post.scheduled_for = payload.scheduled_for
    if payload.published_at is not None:
        post.published_at = payload.published_at
    if payload.image_url is not None:
        post.image_url = payload.image_url
    if payload.tags is not None:
        post.tags = json.dumps(payload.tags)

    db.commit()
    db.refresh(post)

    broadcast_sync_event("POST_UPDATED", {"id": post.id, "title": post.title})
    return post

@router.delete("/posts/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db)
):
    """Delete a social post."""
    post = db.query(models.SocialPost).filter(models.SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully."}

# ==========================================
# DAILY NEWS BULLETIN
# ==========================================
@router.get("/daily-news", response_model=List[schemas.DailyNewsItemResponse])
def get_daily_news(db: Session = Depends(get_db)):
    """Retrieve all daily news items."""
    items = db.query(models.DailyNewsItem).order_by(models.DailyNewsItem.created_at.desc()).all()
    for item in items:
        if isinstance(item.tags, str):
            try:
                item.tags = json.loads(item.tags)
            except:
                item.tags = []
    return items

@router.post("/daily-news", response_model=schemas.DailyNewsItemResponse)
def create_daily_news(
    payload: schemas.DailyNewsItemCreate,
    db: Session = Depends(get_db)
):
    """Publish a daily news bulletin or campus notice."""
    tags_str = json.dumps(payload.tags or [])
    new_item = models.DailyNewsItem(
        id=f"news_{uuid.uuid4().hex[:12]}",
        title=payload.title.strip(),
        content=payload.content.strip(),
        category=payload.category or "announcement",
        source=payload.source or "GeoHub Editorial",
        author_name=payload.author_name or "System SuperAdmin",
        published_at=payload.published_at or datetime.utcnow().strftime("%b %d, %Y"),
        tags=tags_str,
        created_at=datetime.utcnow()
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    broadcast_sync_event("NEWS_PUBLISHED", {"id": new_item.id, "title": new_item.title})
    return new_item

@router.put("/daily-news/{news_id}", response_model=schemas.DailyNewsItemResponse)
def update_daily_news(
    news_id: str,
    payload: schemas.DailyNewsItemUpdate,
    db: Session = Depends(get_db)
):
    """Update a daily news bulletin."""
    item = db.query(models.DailyNewsItem).filter(models.DailyNewsItem.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")

    if payload.title is not None:
        item.title = payload.title
    if payload.content is not None:
        item.content = payload.content
    if payload.category is not None:
        item.category = payload.category
    if payload.source is not None:
        item.source = payload.source
    if payload.author_name is not None:
        item.author_name = payload.author_name
    if payload.published_at is not None:
        item.published_at = payload.published_at
    if payload.tags is not None:
        item.tags = json.dumps(payload.tags)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/daily-news/{news_id}")
def delete_daily_news(
    news_id: str,
    db: Session = Depends(get_db)
):
    """Delete a daily news bulletin."""
    item = db.query(models.DailyNewsItem).filter(models.DailyNewsItem.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    db.delete(item)
    db.commit()
    return {"message": "News item deleted successfully."}
