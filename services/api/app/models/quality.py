from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class QualityGateRun(Base, TimestampMixin):
    __tablename__ = "quality_gate_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    task_id: Mapped[str | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    patch_id: Mapped[str | None] = mapped_column(ForeignKey("patches.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="running")
    checks: Mapped[dict] = mapped_column(default=dict)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    logs = relationship("QualityGateLog", back_populates="run", cascade="all, delete-orphan")


class QualityGateLog(Base, TimestampMixin):
    __tablename__ = "quality_gate_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("quality_gate_runs.id"))
    check_name: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32))
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    exit_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    run = relationship("QualityGateRun", back_populates="logs")
