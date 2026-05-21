from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    skill_type: Mapped[str] = mapped_column(String(64), default="workflow")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_approval: Mapped[list[str]] = mapped_column(default=list)
    allowed_tools: Mapped[list[str]] = mapped_column(default=list)
    settings: Mapped[dict] = mapped_column(default=dict)

    versions = relationship("SkillVersion", back_populates="skill", cascade="all, delete-orphan")
    executions = relationship("SkillExecution", back_populates="skill", cascade="all, delete-orphan")


class SkillVersion(Base, TimestampMixin):
    __tablename__ = "skill_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"))
    version: Mapped[int] = mapped_column(Integer, default=1)
    definition: Mapped[dict] = mapped_column(default=dict)
    changelog: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)

    skill = relationship("Skill", back_populates="versions")


class SkillExecution(Base, TimestampMixin):
    __tablename__ = "skill_executions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="running")
    input_data: Mapped[dict] = mapped_column(default=dict)
    output_data: Mapped[dict | None] = mapped_column(nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    skill = relationship("Skill", back_populates="executions")
