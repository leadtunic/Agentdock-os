from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class Agent(Base, TimestampMixin):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(64))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str] = mapped_column(Text, default="You are a governed AgentDock OS agent.")
    provider_id: Mapped[str | None] = mapped_column(ForeignKey("providers.id"), nullable=True)
    model: Mapped[str] = mapped_column(String(128), default="gpt-4o")
    status: Mapped[str] = mapped_column(String(32), default="active")
    temperature: Mapped[float] = mapped_column(default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=4096)
    cost_limit: Mapped[float | None] = mapped_column(Float, nullable=True)
    time_limit_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memory_scope: Mapped[str] = mapped_column(String(64), default="project")
    settings: Mapped[dict] = mapped_column(default=dict)

    organization = relationship("Organization", back_populates="agents")
    project = relationship("Project", back_populates="agents")
    provider_rel = relationship("Provider", back_populates="agents")
    policies = relationship("AgentPolicy", back_populates="agent", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="agent")
    sessions = relationship("AgentSession", back_populates="agent")
    tool_calls = relationship("ToolCall", back_populates="agent")
    approvals_requested = relationship("Approval", back_populates="requested_by_agent")


class AgentPolicy(Base, TimestampMixin):
    __tablename__ = "agent_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    name: Mapped[str] = mapped_column(String(255))
    policy_type: Mapped[str] = mapped_column(String(64), default="general")
    policy: Mapped[dict] = mapped_column(default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    agent = relationship("Agent", back_populates="policies")
