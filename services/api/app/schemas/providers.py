from datetime import datetime

from pydantic import BaseModel, Field


class ProviderBase(BaseModel):
    name: str
    provider_type: str
    base_url: str | None = None
    is_default: bool = False
    is_active: bool = True
    metadata: dict = Field(default_factory=dict)


class ProviderCreate(ProviderBase):
    organization_id: str | None = None
    api_key: str | None = None


class ProviderUpdate(BaseModel):
    name: str | None = None
    provider_type: str | None = None
    base_url: str | None = None
    is_default: bool | None = None
    is_active: bool | None = None
    metadata: dict | None = None
    api_key: str | None = None


class ProviderResponse(ProviderBase):
    id: str
    organization_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProviderKeyCreate(BaseModel):
    provider_id: str
    key_name: str
    encrypted_value: str
    expires_at: datetime | None = None


class ProviderKeyResponse(BaseModel):
    id: str
    provider_id: str
    key_name: str
    is_active: bool
    last_used_at: datetime | None
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProviderTestRequest(BaseModel):
    provider_id: str
    model: str | None = None


class ProviderTestResponse(BaseModel):
    success: bool
    message: str
    model: str | None = None
    latency_ms: int | None = None


SUPPORTED_PROVIDERS = [
    "openai",
    "anthropic",
    "gemini",
    "groq",
    "openrouter",
    "ollama",
    "lm_studio",
]
