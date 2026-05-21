from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.governance import (
    ApprovalPolicyCreate,
    ApprovalPolicyResponse,
    ApprovalPolicyUpdate,
    BrowserPolicyCreate,
    BrowserPolicyResponse,
    BrowserPolicyUpdate,
    CommandPolicyCreate,
    CommandPolicyResponse,
    CommandPolicyUpdate,
    CostPolicyCreate,
    CostPolicyResponse,
    CostPolicyUpdate,
    FilePolicyCreate,
    FilePolicyResponse,
    FilePolicyUpdate,
    SecretPolicyCreate,
    SecretPolicyResponse,
    SecretPolicyUpdate,
    ToolPolicyCreate,
    ToolPolicyResponse,
    ToolPolicyUpdate,
)
from app.models.governance import (
    ApprovalPolicy,
    BrowserPolicy,
    CommandPolicy,
    CostPolicy,
    FilePolicy,
    SecretPolicy,
    ToolPolicy,
)
from app.security.auth import get_current_user
from app.models.auth import User


def _make_router(prefix: str, model, create_schema, update_schema, response_schema, event_type: str):
    router = APIRouter(prefix=prefix, tags=[prefix.strip("/")])

    @router.post("", response_model=response_schema, status_code=201)
    def create(data: create_schema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
        from app.audit.service import record_audit

        item = model(**data.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        record_audit(db, event_type=f"{event_type}.created", user_id=current_user.id, resource_type=event_type, resource_id=item.id)
        return item

    @router.get("", response_model=list[response_schema])
    def list_items(db: Session = Depends(get_db), agent_id: str | None = None, project_id: str | None = None):
        query = db.query(model)
        if agent_id:
            query = query.filter(model.agent_id == agent_id)
        if project_id:
            query = query.filter(model.project_id == project_id)
        return query.all()

    @router.put("/{item_id}", response_model=response_schema)
    def update(item_id: str, data: update_schema, db: Session = Depends(get_db)):
        item = db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item

    @router.delete("/{item_id}", status_code=204)
    def delete(item_id: str, db: Session = Depends(get_db)):
        item = db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        db.delete(item)
        db.commit()

    return router


router = APIRouter(prefix="/governance", tags=["governance"])

file_router = _make_router("/file-policies", FilePolicy, FilePolicyCreate, FilePolicyUpdate, FilePolicyResponse, "file_policy")
command_router = _make_router("/command-policies", CommandPolicy, CommandPolicyCreate, CommandPolicyUpdate, CommandPolicyResponse, "command_policy")
tool_router = _make_router("/tool-policies", ToolPolicy, ToolPolicyCreate, ToolPolicyUpdate, ToolPolicyResponse, "tool_policy")
browser_router = _make_router("/browser-policies", BrowserPolicy, BrowserPolicyCreate, BrowserPolicyUpdate, BrowserPolicyResponse, "browser_policy")
cost_router = _make_router("/cost-policies", CostPolicy, CostPolicyCreate, CostPolicyUpdate, CostPolicyResponse, "cost_policy")
approval_router = _make_router("/approval-policies", ApprovalPolicy, ApprovalPolicyCreate, ApprovalPolicyUpdate, ApprovalPolicyResponse, "approval_policy")
secret_router = _make_router("/secret-policies", SecretPolicy, SecretPolicyCreate, SecretPolicyUpdate, SecretPolicyResponse, "secret_policy")

routers = [file_router, command_router, tool_router, browser_router, cost_router, approval_router, secret_router]
