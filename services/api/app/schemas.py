from typing import Any

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str
    slug: str


class ProjectCreate(BaseModel):
    organization_id: str
    name: str
    slug: str
    description: str | None = None


class AgentCreate(BaseModel):
    organization_id: str
    project_id: str | None = None
    name: str
    role: str
    description: str | None = None
    system_prompt: str = "You are a governed AgentDock OS agent."
    provider: str = "openai"
    model: str = "gpt-5.5-thinking"


class TaskCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    title: str
    description: str
    source: str = "dashboard"
    context: dict[str, Any] = Field(default_factory=dict)


class ApprovalDecision(BaseModel):
    approved: bool
    reason: str | None = None


class MemoryCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None
    scope: str = "project"
    type: str = "note"
    title: str
    content: str


class SkillCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    name: str
    description: str
    type: str = "workflow"
    definition: dict[str, Any] = Field(default_factory=dict)


class McpServerCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    name: str
    transport: str = "stdio"
    config: dict[str, Any] = Field(default_factory=dict)
