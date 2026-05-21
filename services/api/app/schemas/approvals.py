from datetime import datetime

from pydantic import BaseModel, Field


class ApprovalCreate(BaseModel):
    task_id: str | None = None
    requested_by_agent_id: str | None = None
    requested_to_user_id: str | None = None
    action_type: str
    summary: str
    payload: dict = Field(default_factory=dict)
    expires_at: datetime | None = None


class ApprovalUpdate(BaseModel):
    status: str | None = None
    decision: str | None = None
    decision_comment: str | None = None


class ApprovalResponse(BaseModel):
    id: str
    task_id: str | None
    requested_by_agent_id: str | None
    requested_to_user_id: str | None
    action_type: str
    summary: str
    payload: dict
    status: str
    decision: str | None
    decision_comment: str | None
    decided_by: str | None
    decided_at: datetime | None
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApprovalDecision(BaseModel):
    decision: str
    comment: str | None = None
