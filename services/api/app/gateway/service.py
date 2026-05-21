from datetime import datetime

from sqlalchemy.orm import Session

from app.models.gateway import ChannelConnection, Notification, WebhookEvent
from app.schemas.gateway import WebhookPayload, WebhookResponse


def process_webhook(db: Session, channel_type: str, payload: WebhookPayload) -> WebhookResponse:
    channel = db.query(ChannelConnection).filter(
        ChannelConnection.channel_type == channel_type,
        ChannelConnection.is_active == True,
    ).first()

    if not channel:
        return WebhookResponse(success=False, message=f"No active channel found for type: {channel_type}")

    event = WebhookEvent(
        channel_id=channel.id,
        event_type=payload.event_type,
        payload=payload.payload,
    )
    db.add(event)
    db.commit()

    if payload.event_type == "message":
        from app.tasks.service import create_task_from_message

        task = create_task_from_message(db, channel, payload.payload)
        event.task_id = task.id if task else None
        event.processed = True
        event.processed_at = datetime.utcnow()
        db.commit()
        return WebhookResponse(success=True, task_id=event.task_id, message="Task created from message")

    event.processed = True
    event.processed_at = datetime.utcnow()
    db.commit()
    return WebhookResponse(success=True, message="Webhook processed")


def send_notification(db: Session, user_id: str | None, title: str, message: str, notification_type: str = "info", channel: str | None = None, task_id: str | None = None, approval_id: str | None = None) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        channel=channel,
        task_id=task_id,
        approval_id=approval_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
