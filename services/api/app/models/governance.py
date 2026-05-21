from uuid import uuid4

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class FilePolicy(Base, TimestampMixin):
    __tablename__ = "file_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    pattern: Mapped[str] = mapped_column(String(512))
    action: Mapped[str] = mapped_column(String(32), default="deny")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CommandPolicy(Base, TimestampMixin):
    __tablename__ = "command_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    pattern: Mapped[str] = mapped_column(String(512))
    action: Mapped[str] = mapped_column(String(32), default="deny")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ToolPolicy(Base, TimestampMixin):
    __tablename__ = "tool_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    tool_name: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(32), default="deny")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class BrowserPolicy(Base, TimestampMixin):
    __tablename__ = "browser_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(64))
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    allowed_domains: Mapped[list[str]] = mapped_column(default=list)
    blocked_domains: Mapped[list[str]] = mapped_column(default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CostPolicy(Base, TimestampMixin):
    __tablename__ = "cost_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    max_cost_per_task: Mapped[float | None] = mapped_column(nullable=True)
    max_cost_per_day: Mapped[float | None] = mapped_column(nullable=True)
    max_cost_per_month: Mapped[float | None] = mapped_column(nullable=True)
    action_on_limit: Mapped[str] = mapped_column(String(32), default="block")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ApprovalPolicy(Base, TimestampMixin):
    __tablename__ = "approval_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(128))
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    approver_roles: Mapped[list[str]] = mapped_column(default=list)
    auto_approve_after_seconds: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class SecretPolicy(Base, TimestampMixin):
    __tablename__ = "secret_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    pattern: Mapped[str] = mapped_column(String(512))
    action: Mapped[str] = mapped_column(String(32), default="block")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
