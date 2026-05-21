from datetime import datetime

from pydantic import BaseModel, Field


PLUGIN_TYPES = [
    "tool_plugin",
    "channel_plugin",
    "provider_plugin",
    "mcp_plugin",
    "quality_gate_plugin",
    "browser_plugin",
    "repository_plugin",
    "notification_plugin",
]


class PluginBase(BaseModel):
    name: str
    plugin_type: str
    version: str
    description: str | None = None
    manifest: dict = Field(default_factory=dict)
    config: dict = Field(default_factory=dict)
    is_active: bool = False
    author: str | None = None
    source_url: str | None = None


class PluginCreate(PluginBase):
    organization_id: str | None = None


class PluginUpdate(BaseModel):
    name: str | None = None
    plugin_type: str | None = None
    version: str | None = None
    description: str | None = None
    manifest: dict | None = None
    config: dict | None = None
    is_active: bool | None = None
    author: str | None = None
    source_url: str | None = None


class PluginResponse(PluginBase):
    id: str
    organization_id: str | None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
