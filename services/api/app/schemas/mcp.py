from datetime import datetime

from pydantic import BaseModel, Field


class McpServerBase(BaseModel):
    name: str
    transport: str = "stdio"
    config: dict = Field(default_factory=dict)
    enabled: bool = True


class McpServerCreate(McpServerBase):
    organization_id: str | None = None
    project_id: str | None = None


class McpServerUpdate(BaseModel):
    name: str | None = None
    transport: str | None = None
    config: dict | None = None
    enabled: bool | None = None


class McpServerResponse(McpServerBase):
    id: str
    organization_id: str | None
    project_id: str | None
    status: str
    last_tested_at: datetime | None
    last_test_result: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class McpToolResponse(BaseModel):
    id: str
    server_id: str
    name: str
    description: str | None
    input_schema: dict
    is_sensitive: bool
    requires_approval: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class McpToolPermissionCreate(BaseModel):
    tool_id: str
    agent_id: str
    is_allowed: bool = True


class McpToolPermissionResponse(BaseModel):
    id: str
    tool_id: str
    agent_id: str
    is_allowed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class McpTestRequest(BaseModel):
    server_id: str


class McpTestResponse(BaseModel):
    success: bool
    message: str
    tools: list[dict] = Field(default_factory=list)
    latency_ms: int | None = None
