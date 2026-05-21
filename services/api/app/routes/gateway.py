from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.gateway import (
    ChannelConnectionCreate,
    ChannelConnectionResponse,
    ChannelConnectionUpdate,
    NotificationResponse,
    WebhookPayload,
    WebhookResponse,
)
from app.models.gateway import ChannelConnection, Notification, WebhookEvent
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/gateway", tags=["gateway"])


@router.post("/channels", response_model=ChannelConnectionResponse, status_code=status.HTTP_201_CREATED)
def create_channel(data: ChannelConnectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    channel = ChannelConnection(
        organization_id=data.organization_id,
        project_id=data.project_id,
        channel_type=data.channel_type,
        name=data.name,
        config=data.config,
        is_active=data.is_active,
    )
    db.add(channel)
    db.commit()
    db.refresh(channel)
    record_audit(db, event_type="channel.created", user_id=current_user.id, resource_type="channel", resource_id=channel.id)
    return channel


@router.get("/channels", response_model=list[ChannelConnectionResponse])
def list_channels(db: Session = Depends(get_db), channel_type: str | None = None):
    query = db.query(ChannelConnection)
    if channel_type:
        query = query.filter(ChannelConnection.channel_type == channel_type)
    return query.all()


@router.put("/channels/{channel_id}", response_model=ChannelConnectionResponse)
def update_channel(channel_id: str, data: ChannelConnectionUpdate, db: Session = Depends(get_db)):
    channel = db.query(ChannelConnection).filter(ChannelConnection.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(channel, key, value)
    db.commit()
    db.refresh(channel)
    return channel


@router.delete("/channels/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(ChannelConnection).filter(ChannelConnection.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    db.delete(channel)
    db.commit()


@router.post("/webhooks/{channel_type}", response_model=WebhookResponse)
def receive_webhook(channel_type: str, payload: WebhookPayload, db: Session = Depends(get_db)):
    from app.gateway.service import process_webhook

    result = process_webhook(db, channel_type, payload)
    return result


@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()


@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    from datetime import datetime

    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notification)
    return notification
