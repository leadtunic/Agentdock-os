from datetime import datetime

from pydantic import BaseModel, Field


MEMORY_SCOPES = ["user", "organization", "project", "repository", "session"]
MEMORY_TYPES = ["note", "decision", "error", "preference", "architecture", "fact", "pattern"]


class MemoryBase(BaseModel):
    title: str
    content: str
    scope: str = "project"
    memory_type: str = "note"
    confidence: str = "medium"
    source: str = "manual"
    is_pinned: bool = False
    tags: list[str] = Field(default_factory=list)


class MemoryCreate(MemoryBase):
    organization_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None
    repository_id: str | None = None
    session_id: str | None = None
    expires_at: datetime | None = None


class MemoryUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    scope: str | None = None
    memory_type: str | None = None
    confidence: str | None = None
    source: str | None = None
    is_pinned: bool | None = None
    tags: list[str] | None = None
    expires_at: datetime | None = None


class MemoryResponse(MemoryBase):
    id: str
    organization_id: str | None
    project_id: str | None
    user_id: str | None
    repository_id: str | None
    session_id: str | None
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MemorySearchRequest(BaseModel):
    query: str
    scope: str | None = None
    project_id: str | None = None
    limit: int = 10


class MemorySearchResponse(BaseModel):
    memories: list[MemoryResponse]
    total: int
