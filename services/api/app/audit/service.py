from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record_audit(
    db: Session,
    event_type: str,
    user_id: str | None = None,
    agent_id: str | None = None,
    task_id: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    organization_id: str | None = None,
    project_id: str | None = None,
    payload: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    log = AuditLog(
        organization_id=organization_id,
        project_id=project_id,
        user_id=user_id,
        agent_id=agent_id,
        task_id=task_id,
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        payload=payload or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def sanitize_payload(payload: dict) -> dict:
    sensitive_keys = {"api_key", "secret", "password", "token", "authorization", "access_token"}
    sanitized = {}
    for key, value in payload.items():
        if key.lower() in sensitive_keys:
            sanitized[key] = "***REDACTED***"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_payload(value)
        else:
            sanitized[key] = value
    return sanitized
