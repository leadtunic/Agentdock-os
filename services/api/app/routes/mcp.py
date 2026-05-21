from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mcp import (
    McpServerCreate,
    McpServerResponse,
    McpServerUpdate,
    McpTestRequest,
    McpTestResponse,
    McpToolPermissionCreate,
    McpToolPermissionResponse,
    McpToolResponse,
)
from app.models.mcp import McpServer, McpTool, McpToolPermission
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/mcp", tags=["mcp"])


@router.post("/servers", response_model=McpServerResponse, status_code=status.HTTP_201_CREATED)
def create_server(data: McpServerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    server = McpServer(
        organization_id=data.organization_id,
        project_id=data.project_id,
        name=data.name,
        transport=data.transport,
        config=data.config,
        enabled=data.enabled,
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    record_audit(db, event_type="mcp_server.created", user_id=current_user.id, resource_type="mcp_server", resource_id=server.id)
    return server


@router.get("/servers", response_model=list[McpServerResponse])
def list_servers(db: Session = Depends(get_db), project_id: str | None = None):
    query = db.query(McpServer)
    if project_id:
        query = query.filter(McpServer.project_id == project_id)
    return query.all()


@router.get("/servers/{server_id}", response_model=McpServerResponse)
def get_server(server_id: str, db: Session = Depends(get_db)):
    server = db.query(McpServer).filter(McpServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP server not found")
    return server


@router.put("/servers/{server_id}", response_model=McpServerResponse)
def update_server(server_id: str, data: McpServerUpdate, db: Session = Depends(get_db)):
    server = db.query(McpServer).filter(McpServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP server not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(server, key, value)
    db.commit()
    db.refresh(server)
    return server


@router.delete("/servers/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(server_id: str, db: Session = Depends(get_db)):
    server = db.query(McpServer).filter(McpServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP server not found")
    db.delete(server)
    db.commit()


@router.get("/servers/{server_id}/tools", response_model=list[McpToolResponse])
def list_tools(server_id: str, db: Session = Depends(get_db)):
    return db.query(McpTool).filter(McpTool.server_id == server_id).all()


@router.post("/servers/{server_id}/test", response_model=McpTestResponse)
def test_server(server_id: str, data: McpTestRequest, db: Session = Depends(get_db)):
    from app.mcp.service import test_mcp_server

    server = db.query(McpServer).filter(McpServer.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="MCP server not found")

    return test_mcp_server(db, server)


@router.post("/tools/permissions", response_model=McpToolPermissionResponse, status_code=status.HTTP_201_CREATED)
def create_tool_permission(data: McpToolPermissionCreate, db: Session = Depends(get_db)):
    tool = db.query(McpTool).filter(McpTool.id == data.tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="MCP tool not found")

    existing = db.query(McpToolPermission).filter(
        McpToolPermission.tool_id == data.tool_id,
        McpToolPermission.agent_id == data.agent_id,
    ).first()
    if existing:
        existing.is_allowed = data.is_allowed
        db.commit()
        db.refresh(existing)
        return existing

    perm = McpToolPermission(tool_id=data.tool_id, agent_id=data.agent_id, is_allowed=data.is_allowed)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm
