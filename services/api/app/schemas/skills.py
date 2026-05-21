from datetime import datetime

from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    name: str
    description: str
    skill_type: str = "workflow"
    is_active: bool = True
    requires_approval: list[str] = Field(default_factory=list)
    allowed_tools: list[str] = Field(default_factory=list)
    settings: dict = Field(default_factory=dict)


class SkillCreate(SkillBase):
    organization_id: str | None = None
    project_id: str | None = None
    definition: dict = Field(default_factory=dict)


class SkillUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    skill_type: str | None = None
    is_active: bool | None = None
    requires_approval: list[str] | None = None
    allowed_tools: list[str] | None = None
    settings: dict | None = None


class SkillResponse(SkillBase):
    id: str
    organization_id: str | None
    project_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SkillVersionCreate(BaseModel):
    skill_id: str
    definition: dict = Field(default_factory=dict)
    changelog: str | None = None


class SkillVersionResponse(BaseModel):
    id: str
    skill_id: str
    version: int
    definition: dict
    changelog: str | None
    is_current: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SkillExecutionCreate(BaseModel):
    skill_id: str
    task_id: str | None = None
    agent_id: str | None = None
    input_data: dict = Field(default_factory=dict)


class SkillExecutionResponse(BaseModel):
    id: str
    skill_id: str
    task_id: str | None
    agent_id: str | None
    status: str
    input_data: dict
    output_data: dict | None
    error: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
