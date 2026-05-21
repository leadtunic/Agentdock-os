from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.skills import (
    SkillCreate,
    SkillExecutionCreate,
    SkillExecutionResponse,
    SkillResponse,
    SkillUpdate,
    SkillVersionCreate,
    SkillVersionResponse,
)
from app.models.skills import Skill, SkillExecution, SkillVersion
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/skills", tags=["skills"])


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(data: SkillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skill = Skill(
        organization_id=data.organization_id,
        project_id=data.project_id,
        name=data.name,
        description=data.description,
        skill_type=data.skill_type,
        is_active=data.is_active,
        requires_approval=data.requires_approval,
        allowed_tools=data.allowed_tools,
        settings=data.settings,
    )
    db.add(skill)
    db.flush()

    version = SkillVersion(skill_id=skill.id, version=1, definition=data.definition, is_current=True)
    db.add(version)
    db.commit()
    db.refresh(skill)
    record_audit(db, event_type="skill.created", user_id=current_user.id, resource_type="skill", resource_id=skill.id)
    return skill


@router.get("", response_model=list[SkillResponse])
def list_skills(db: Session = Depends(get_db), project_id: str | None = None):
    query = db.query(Skill)
    if project_id:
        query = query.filter(Skill.project_id == project_id)
    return query.all()


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: str, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: str, data: SkillUpdate, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(skill, key, value)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: str, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()


@router.get("/{skill_id}/versions", response_model=list[SkillVersionResponse])
def list_versions(skill_id: str, db: Session = Depends(get_db)):
    return db.query(SkillVersion).filter(SkillVersion.skill_id == skill_id).order_by(SkillVersion.version.desc()).all()


@router.post("/{skill_id}/versions", response_model=SkillVersionResponse, status_code=status.HTTP_201_CREATED)
def create_version(skill_id: str, data: SkillVersionCreate, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    max_version = db.query(SkillVersion).filter(SkillVersion.skill_id == skill_id).count()
    db.query(SkillVersion).filter(SkillVersion.skill_id == skill_id).update({"is_current": False})

    version = SkillVersion(skill_id=skill_id, version=max_version + 1, definition=data.definition, changelog=data.changelog, is_current=True)
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


@router.post("/{skill_id}/execute", response_model=SkillExecutionResponse, status_code=status.HTTP_201_CREATED)
def execute_skill(skill_id: str, data: SkillExecutionCreate, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    execution = SkillExecution(skill_id=skill_id, task_id=data.task_id, agent_id=data.agent_id, input_data=data.input_data)
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution


@router.get("/{skill_id}/executions", response_model=list[SkillExecutionResponse])
def list_executions(skill_id: str, db: Session = Depends(get_db)):
    return db.query(SkillExecution).filter(SkillExecution.skill_id == skill_id).order_by(SkillExecution.created_at.desc()).all()
