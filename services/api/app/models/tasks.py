from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    created_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="dashboard")
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(64), default="created")
    priority: Mapped[str] = mapped_column(String(32), default="normal")
    context: Mapped[dict] = mapped_column(default=dict)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cost_estimate: Mapped[float | None] = mapped_column(Float, nullable=True)

    project = relationship("Project", back_populates="tasks")
    agent = relationship("Agent", back_populates="tasks")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
    events = relationship("TaskEvent", back_populates="task", cascade="all, delete-orphan")
    sessions = relationship("AgentSession", back_populates="task")
    tool_calls = relationship("ToolCall", back_populates="task")
    approvals = relationship("Approval", back_populates="task")


class TaskEvent(Base, TimestampMixin):
    __tablename__ = "task_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    task_id: Mapped[str] = mapped_column(ForeignKey("tasks.id"))
    event_type: Mapped[str] = mapped_column(String(128))
    data: Mapped[dict] = mapped_column(default=dict)

    task = relationship("Task", back_populates="events")


class AgentSession(Base, TimestampMixin):
    __tablename__ = "agent_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    status: Mapped[str] = mapped_column(String(32), default="created")
    provider_response: Mapped[dict | None] = mapped_column(nullable=True)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    task = relationship("Task", back_populates="sessions")
    agent = relationship("Agent", back_populates="sessions")
    messages = relationship("AgentMessage", back_populates="session", cascade="all, delete-orphan")


class AgentMessage(Base, TimestampMixin):
    __tablename__ = "agent_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    session_id: Mapped[str] = mapped_column(ForeignKey("agent_sessions.id"))
    role: Mapped[str] = mapped_column(String(32))
    content: Mapped[str] = mapped_column(Text)
    metadata: Mapped[dict] = mapped_column(default=dict)

    session = relationship("AgentSession", back_populates="messages")
