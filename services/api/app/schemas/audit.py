from datetime import datetime

from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None
    agent_id: str | None = None
    task_id: str | None = None
    event_type: str
    resource_type: str | None = None
    resource_id: str | None = None
    payload: dict = {}
    ip_address: str | None = None
    user_agent: str | None = None


class AuditLogResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    user_id: str | None
    agent_id: str | None
    task_id: str | None
    event_type: str
    resource_type: str | None
    resource_id: str | None
    payload: dict
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuditLogFilter(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None
    agent_id: str | None = None
    event_type: str | None = None
    resource_type: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    limit: int = 50
    offset: int = 0
