from datetime import datetime

from pydantic import BaseModel, Field


AGENT_ROLES = [
    "frontend_engineer",
    "backend_engineer",
    "fullstack_engineer",
    "qa_engineer",
    "security_reviewer",
    "devops_engineer",
    "documentation_writer",
    "browser_operator",
    "product_analyst",
    "support_agent",
    "workflow_orchestrator",
]


class AgentBase(BaseModel):
    name: str
    role: str
    description: str | None = None
    system_prompt: str = "You are a governed AgentDock OS agent."
    model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4096
    cost_limit: float | None = None
    time_limit_seconds: int | None = None
    memory_scope: str = "project"
    settings: dict = Field(default_factory=dict)


class AgentCreate(AgentBase):
    organization_id: str
    project_id: str | None = None
    provider_id: str | None = None


class AgentUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    provider_id: str | None = None
    model: str | None = None
    status: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    cost_limit: float | None = None
    time_limit_seconds: int | None = None
    memory_scope: str | None = None
    settings: dict | None = None


class AgentResponse(AgentBase):
    id: str
    organization_id: str
    project_id: str | None
    provider_id: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentPolicyBase(BaseModel):
    name: str
    policy_type: str = "general"
    policy: dict = Field(default_factory=dict)
    is_active: bool = True


class AgentPolicyCreate(AgentPolicyBase):
    agent_id: str


class AgentPolicyUpdate(BaseModel):
    name: str | None = None
    policy_type: str | None = None
    policy: dict | None = None
    is_active: bool | None = None


class AgentPolicyResponse(AgentPolicyBase):
    id: str
    agent_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
