from datetime import datetime

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str
    description: str
    source: str = "dashboard"
    priority: str = "normal"
    context: dict = Field(default_factory=dict)


class TaskCreate(TaskBase):
    project_id: str | None = None
    agent_id: str | None = None
    organization_id: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    context: dict | None = None
    result: str | None = None
    error: str | None = None


class TaskResponse(TaskBase):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    created_by: str | None
    status: str
    result: str | None
    error: str | None
    cost_estimate: float | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskEventCreate(BaseModel):
    task_id: str
    event_type: str
    data: dict = Field(default_factory=dict)


class TaskEventResponse(BaseModel):
    id: str
    task_id: str
    event_type: str
    data: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentSessionCreate(BaseModel):
    task_id: str | None = None
    agent_id: str


class AgentSessionResponse(BaseModel):
    id: str
    task_id: str | None
    agent_id: str
    status: str
    input_tokens: int
    output_tokens: int
    started_at: datetime | None
    completed_at: datetime | None
    error: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentMessageCreate(BaseModel):
    session_id: str
    role: str
    content: str
    metadata: dict = Field(default_factory=dict)


class AgentMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    metadata: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
