from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.quality import QualityGateLogResponse, QualityGateRunCreate, QualityGateRunResponse
from app.models.quality import QualityGateLog, QualityGateRun
from app.security.auth import get_current_user
from app.models.auth import User

router = APIRouter(prefix="/quality-gates", tags=["quality-gates"])


@router.post("/runs", response_model=QualityGateRunResponse, status_code=201)
def create_run(data: QualityGateRunCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.quality.service import run_quality_gate

    run = run_quality_gate(db, data, current_user.id)
    return run


@router.get("/runs", response_model=list[QualityGateRunResponse])
def list_runs(db: Session = Depends(get_db), project_id: str | None = None, task_id: str | None = None):
    query = db.query(QualityGateRun)
    if project_id:
        query = query.filter(QualityGateRun.project_id == project_id)
    if task_id:
        query = query.filter(QualityGateRun.task_id == task_id)
    return query.order_by(QualityGateRun.created_at.desc()).all()


@router.get("/runs/{run_id}", response_model=QualityGateRunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(QualityGateRun).filter(QualityGateRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Quality gate run not found")
    return run


@router.get("/runs/{run_id}/logs", response_model=list[QualityGateLogResponse])
def get_run_logs(run_id: str, db: Session = Depends(get_db)):
    run = db.query(QualityGateRun).filter(QualityGateRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Quality gate run not found")
    return db.query(QualityGateLog).filter(QualityGateLog.run_id == run_id).all()
