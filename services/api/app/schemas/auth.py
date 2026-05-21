from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    password: str
    is_superuser: bool = False


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    status: str | None = None


class UserResponse(UserBase):
    id: str
    status: str
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    password_hash: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    permission_ids: list[str] = []


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    permission_ids: list[str] | None = None


class RoleResponse(RoleBase):
    id: str
    is_system: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PermissionBase(BaseModel):
    resource: str
    action: str
    description: str | None = None


class PermissionCreate(PermissionBase):
    pass


class PermissionResponse(PermissionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationBase(BaseModel):
    name: str
    slug: str


class OrganizationCreate(OrganizationBase):
    plan: str = "community"


class OrganizationUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    plan: str | None = None
    settings: dict[str, Any] | None = None


class OrganizationResponse(OrganizationBase):
    id: str
    plan: str
    settings: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationMemberCreate(BaseModel):
    user_id: str
    role_id: str | None = None


class OrganizationMemberResponse(BaseModel):
    id: str
    organization_id: str
    user_id: str
    role_id: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectBase(BaseModel):
    name: str
    slug: str
    description: str | None = None


class ProjectCreate(ProjectBase):
    organization_id: str


class ProjectUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    status: str | None = None
    settings: dict[str, Any] | None = None


class ProjectResponse(ProjectBase):
    id: str
    organization_id: str
    status: str
    settings: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectMemberCreate(BaseModel):
    user_id: str
    role: str = "member"


class ProjectMemberResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
