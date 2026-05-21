from pydantic import BaseModel, Field


class FilePolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    pattern: str
    action: str = "deny"
    description: str | None = None
    is_active: bool = True


class FilePolicyUpdate(BaseModel):
    pattern: str | None = None
    action: str | None = None
    description: str | None = None
    is_active: bool | None = None


class FilePolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    pattern: str
    action: str
    description: str | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class CommandPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    pattern: str
    action: str = "deny"
    requires_approval: bool = False
    description: str | None = None
    is_active: bool = True


class CommandPolicyUpdate(BaseModel):
    pattern: str | None = None
    action: str | None = None
    requires_approval: bool | None = None
    description: str | None = None
    is_active: bool | None = None


class CommandPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    pattern: str
    action: str
    requires_approval: bool
    description: str | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class ToolPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    tool_name: str
    action: str = "deny"
    requires_approval: bool = False
    description: str | None = None
    is_active: bool = True


class ToolPolicyUpdate(BaseModel):
    tool_name: str | None = None
    action: str | None = None
    requires_approval: bool | None = None
    description: str | None = None
    is_active: bool | None = None


class ToolPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    tool_name: str
    action: str
    requires_approval: bool
    description: str | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class BrowserPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    action: str
    requires_approval: bool = True
    allowed_domains: list[str] = Field(default_factory=list)
    blocked_domains: list[str] = Field(default_factory=list)
    is_active: bool = True


class BrowserPolicyUpdate(BaseModel):
    action: str | None = None
    requires_approval: bool | None = None
    allowed_domains: list[str] | None = None
    blocked_domains: list[str] | None = None
    is_active: bool | None = None


class BrowserPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    action: str
    requires_approval: bool
    allowed_domains: list[str]
    blocked_domains: list[str]
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class CostPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    max_cost_per_task: float | None = None
    max_cost_per_day: float | None = None
    max_cost_per_month: float | None = None
    action_on_limit: str = "block"
    is_active: bool = True


class CostPolicyUpdate(BaseModel):
    max_cost_per_task: float | None = None
    max_cost_per_day: float | None = None
    max_cost_per_month: float | None = None
    action_on_limit: str | None = None
    is_active: bool | None = None


class CostPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    max_cost_per_task: float | None
    max_cost_per_day: float | None
    max_cost_per_month: float | None
    action_on_limit: str
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class ApprovalPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    action_type: str
    requires_approval: bool = True
    approver_roles: list[str] = Field(default_factory=list)
    auto_approve_after_seconds: int | None = None
    is_active: bool = True


class ApprovalPolicyUpdate(BaseModel):
    action_type: str | None = None
    requires_approval: bool | None = None
    approver_roles: list[str] | None = None
    auto_approve_after_seconds: int | None = None
    is_active: bool | None = None


class ApprovalPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    action_type: str
    requires_approval: bool
    approver_roles: list[str]
    auto_approve_after_seconds: int | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class SecretPolicyCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    pattern: str
    action: str = "block"
    description: str | None = None
    is_active: bool = True


class SecretPolicyUpdate(BaseModel):
    pattern: str | None = None
    action: str | None = None
    description: str | None = None
    is_active: bool | None = None


class SecretPolicyResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    pattern: str
    action: str
    description: str | None
    is_active: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
