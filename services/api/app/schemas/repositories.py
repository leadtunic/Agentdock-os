from datetime import datetime

from pydantic import BaseModel, Field


class RepositoryBase(BaseModel):
    name: str
    provider: str = "git"
    url: str
    default_branch: str = "main"
    is_active: bool = True
    settings: dict = Field(default_factory=dict)


class RepositoryCreate(RepositoryBase):
    project_id: str


class RepositoryUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    url: str | None = None
    default_branch: str | None = None
    is_active: bool | None = None
    settings: dict | None = None


class RepositoryResponse(RepositoryBase):
    id: str
    project_id: str
    last_sync_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GitWorkspaceCreate(BaseModel):
    repository_id: str
    task_id: str | None = None
    agent_id: str | None = None
    branch_name: str
    created_at_branch: str = "main"


class GitWorkspaceResponse(BaseModel):
    id: str
    repository_id: str
    task_id: str | None
    agent_id: str | None
    branch_name: str
    worktree_path: str
    status: str
    created_at_branch: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatchCreate(BaseModel):
    repository_id: str
    task_id: str | None = None
    agent_id: str | None = None
    approval_id: str | None = None
    title: str
    description: str | None = None
    diff: str
    files_changed: dict = Field(default_factory=dict)


class PatchUpdate(BaseModel):
    status: str | None = None
    applied: bool | None = None


class PatchResponse(BaseModel):
    id: str
    repository_id: str
    task_id: str | None
    agent_id: str | None
    approval_id: str | None
    title: str
    description: str | None
    diff: str
    files_changed: dict
    status: str
    applied: bool
    applied_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PullRequestCreate(BaseModel):
    repository_id: str
    task_id: str | None = None
    patch_id: str | None = None
    title: str
    description: str | None = None
    source_branch: str
    target_branch: str


class PullRequestResponse(BaseModel):
    id: str
    repository_id: str
    task_id: str | None
    patch_id: str | None
    provider_pr_id: str | None
    title: str
    description: str | None
    source_branch: str
    target_branch: str
    url: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
