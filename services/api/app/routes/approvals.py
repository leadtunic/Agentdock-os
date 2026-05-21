from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.approvals import ApprovalCreate, ApprovalDecision, ApprovalResponse
from app.models.approvals import Approval
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.post("", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED)
def create_approval(data: ApprovalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = Approval(
        task_id=data.task_id,
        requested_by_agent_id=data.requested_by_agent_id,
        requested_to_user_id=data.requested_to_user_id,
        action_type=data.action_type,
        summary=data.summary,
        payload=data.payload,
        expires_at=data.expires_at,
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    record_audit(db, event_type="approval.created", user_id=current_user.id, resource_type="approval", resource_id=approval.id)
    return approval


@router.get("", response_model=list[ApprovalResponse])
def list_approvals(db: Session = Depends(get_db), status: str | None = None, task_id: str | None = None):
    query = db.query(Approval)
    if status:
        query = query.filter(Approval.status == status)
    if task_id:
        query = query.filter(Approval.task_id == task_id)
    return query.order_by(Approval.created_at.desc()).all()


@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: str, db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval


@router.post("/{approval_id}/decide", response_model=ApprovalResponse)
def decide_approval(approval_id: str, decision: ApprovalDecision, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime

    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval already decided")

    approval.decision = decision.decision
    approval.decision_comment = decision.comment
    approval.status = "approved" if decision.decision == "approve" else "rejected"
    approval.decided_by = current_user.id
    approval.decided_at = datetime.utcnow()

    db.commit()
    db.refresh(approval)
    record_audit(
        db,
        event_type=f"approval.{approval.status}",
        user_id=current_user.id,
        resource_type="approval",
        resource_id=approval.id,
        payload={"decision": decision.decision, "comment": decision.comment},
    )
    return approval
