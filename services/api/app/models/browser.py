from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class BrowserProfile(Base, TimestampMixin):
    __tablename__ = "browser_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    profile_type: Mapped[str] = mapped_column(String(64), default="isolated")
    user_data_dir: Mapped[str | None] = mapped_column(Text, nullable=True)
    settings: Mapped[dict] = mapped_column(default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    sessions = relationship("BrowserSession", back_populates="profile")


class BrowserSession(Base, TimestampMixin):
    __tablename__ = "browser_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    profile_id: Mapped[str] = mapped_column(ForeignKey("browser_profiles.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="created")
    browser_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    context_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    page_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    current_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    profile = relationship("BrowserProfile", back_populates="sessions")
    actions = relationship("BrowserAction", back_populates="session", cascade="all, delete-orphan")


class BrowserAction(Base, TimestampMixin):
    __tablename__ = "browser_actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    session_id: Mapped[str] = mapped_column(ForeignKey("browser_sessions.id"))
    action_type: Mapped[str] = mapped_column(String(64))
    target: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_data: Mapped[dict] = mapped_column(default=dict)
    result: Mapped[dict | None] = mapped_column(nullable=True)
    screenshot_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="created")
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(nullable=True)

    session = relationship("BrowserSession", back_populates="actions")
