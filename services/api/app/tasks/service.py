from sqlalchemy.orm import Session

from app.models.gateway import ChannelConnection
from app.models.tasks import Task


def create_task_from_message(db: Session, channel: ChannelConnection, message_data: dict) -> Task | None:
    content = message_data.get("content", "")
    if not content:
        return None

    task = Task(
        organization_id=channel.organization_id,
        project_id=channel.project_id,
        source=f"channel:{channel.channel_type}",
        title=content[:100],
        description=content,
        context=message_data,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
