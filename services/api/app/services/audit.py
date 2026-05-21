from typing import Any

from sqlalchemy.orm import Session

from app.models import AuditLog


def record_audit_event(
    db: Session,
    event_type: str,
    payload: dict[str, Any] | None = None,
    organization_id: str | None = None,
    project_id: str | None = None,
    user_id: str | None = None,
    agent_id: str | None = None,
    task_id: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
) -> AuditLog:
    event = AuditLog(
        event_type=event_type,
        payload=payload or {},
        organization_id=organization_id,
        project_id=project_id,
        user_id=user_id,
        agent_id=agent_id,
        task_id=task_id,
        resource_type=resource_type,
        resource_id=resource_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
