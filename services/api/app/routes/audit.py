from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.audit import AuditLogFilter, AuditLogResponse
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=list[AuditLogResponse])
def list_logs(db: Session = Depends(get_db), event_type: str | None = None, resource_type: str | None = None, limit: int = 50):
    query = db.query(AuditLog)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/logs/{log_id}", response_model=AuditLogResponse)
def get_log(log_id: str, db: Session = Depends(get_db)):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Audit log not found")
    return log


@router.post("/logs/filter", response_model=list[AuditLogResponse])
def filter_logs(data: AuditLogFilter, db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if data.organization_id:
        query = query.filter(AuditLog.organization_id == data.organization_id)
    if data.project_id:
        query = query.filter(AuditLog.project_id == data.project_id)
    if data.user_id:
        query = query.filter(AuditLog.user_id == data.user_id)
    if data.agent_id:
        query = query.filter(AuditLog.agent_id == data.agent_id)
    if data.event_type:
        query = query.filter(AuditLog.event_type == data.event_type)
    if data.resource_type:
        query = query.filter(AuditLog.resource_type == data.resource_type)
    if data.start_date:
        query = query.filter(AuditLog.created_at >= data.start_date)
    if data.end_date:
        query = query.filter(AuditLog.created_at <= data.end_date)
    return query.order_by(AuditLog.created_at.desc()).offset(data.offset).limit(data.limit).all()
