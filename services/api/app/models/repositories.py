from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(255))
    provider: Mapped[str] = mapped_column(String(64), default="git")
    url: Mapped[str] = mapped_column(Text)
    default_branch: Mapped[str] = mapped_column(String(128), default="main")
    ssh_key_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    settings: Mapped[dict] = mapped_column(default=dict)

    project = relationship("Project", back_populates="repositories")
    workspaces = relationship("GitWorkspace", back_populates="repository", cascade="all, delete-orphan")
    patches = relationship("Patch", back_populates="repository", cascade="all, delete-orphan")
    pull_requests = relationship("PullRequest", back_populates="repository", cascade="all, delete-orphan")


class GitWorkspace(Base, TimestampMixin):
    __tablename__ = "git_workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    repository_id: Mapped[str] = mapped_column(ForeignKey("repositories.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    branch_name: Mapped[str] = mapped_column(String(255))
    worktree_path: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="active")
    created_at_branch: Mapped[str] = mapped_column(String(255), default="main")

    repository = relationship("Repository", back_populates="workspaces")


class Patch(Base, TimestampMixin):
    __tablename__ = "patches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    repository_id: Mapped[str] = mapped_column(ForeignKey("repositories.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    approval_id: Mapped[str | None] = mapped_column(ForeignKey("approvals.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    diff: Mapped[str] = mapped_column(Text)
    files_changed: Mapped[dict] = mapped_column(default=dict)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    applied: Mapped[bool] = mapped_column(Boolean, default=False)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    repository = relationship("Repository", back_populates="patches")


class PullRequest(Base, TimestampMixin):
    __tablename__ = "pull_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    repository_id: Mapped[str] = mapped_column(ForeignKey("repositories.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    patch_id: Mapped[str | None] = mapped_column(ForeignKey("patches.id"), nullable=True)
    provider_pr_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_branch: Mapped[str] = mapped_column(String(255))
    target_branch: Mapped[str] = mapped_column(String(255))
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="open")

    repository = relationship("Repository", back_populates="pull_requests")
