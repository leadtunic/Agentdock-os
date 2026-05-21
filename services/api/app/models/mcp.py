from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.auth import TimestampMixin, uuid


class McpServer(Base, TimestampMixin):
    __tablename__ = "mcp_servers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    transport: Mapped[str] = mapped_column(String(32), default="stdio")
    config: Mapped[dict] = mapped_column(default=dict)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(32), default="unknown")
    last_tested_at: Mapped[datetime | None] = mapped_column(nullable=True)
    last_test_result: Mapped[str | None] = mapped_column(String(32), nullable=True)

    tools = relationship("McpTool", back_populates="server", cascade="all, delete-orphan")


class McpTool(Base, TimestampMixin):
    __tablename__ = "mcp_tools"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    server_id: Mapped[str] = mapped_column(ForeignKey("mcp_servers.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_schema: Mapped[dict] = mapped_column(default=dict)
    is_sensitive: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)

    server = relationship("McpServer", back_populates="tools")
    permissions = relationship("McpToolPermission", back_populates="tool", cascade="all, delete-orphan")


class McpToolPermission(Base, TimestampMixin):
    __tablename__ = "mcp_tool_permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid)
    tool_id: Mapped[str] = mapped_column(ForeignKey("mcp_tools.id"))
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    is_allowed: Mapped[bool] = mapped_column(Boolean, default=False)

    tool = relationship("McpTool", back_populates="permissions")

    __table_args__ = (UniqueConstraint("tool_id", "agent_id", name="uq_mcp_tool_agent"),)
