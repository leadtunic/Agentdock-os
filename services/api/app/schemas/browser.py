from datetime import datetime

from pydantic import BaseModel, Field


class BrowserProfileBase(BaseModel):
    name: str
    profile_type: str = "isolated"
    settings: dict = Field(default_factory=dict)
    is_active: bool = True


class BrowserProfileCreate(BrowserProfileBase):
    organization_id: str | None = None
    project_id: str | None = None


class BrowserProfileUpdate(BaseModel):
    name: str | None = None
    profile_type: str | None = None
    settings: dict | None = None
    is_active: bool | None = None


class BrowserProfileResponse(BrowserProfileBase):
    id: str
    organization_id: str | None
    project_id: str | None
    user_data_dir: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BrowserSessionCreate(BaseModel):
    profile_id: str
    task_id: str | None = None
    agent_id: str | None = None


class BrowserSessionResponse(BaseModel):
    id: str
    profile_id: str
    task_id: str | None
    agent_id: str | None
    status: str
    current_url: str | None
    started_at: datetime | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BrowserActionCreate(BaseModel):
    session_id: str
    action_type: str
    target: str | None = None
    input_data: dict = Field(default_factory=dict)


class BrowserActionResponse(BaseModel):
    id: str
    session_id: str
    action_type: str
    target: str | None
    input_data: dict
    result: dict | None
    screenshot_path: str | None
    status: str
    error: str | None
    duration_ms: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
