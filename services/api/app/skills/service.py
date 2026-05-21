from datetime import datetime

from sqlalchemy.orm import Session

from app.models.skills import Skill, SkillExecution, SkillVersion


def execute_skill(db: Session, skill_id: str, input_data: dict, agent_id: str | None = None, task_id: str | None = None) -> SkillExecution:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise ValueError("Skill not found")

    current_version = db.query(SkillVersion).filter(
        SkillVersion.skill_id == skill_id,
        SkillVersion.is_current == True,
    ).first()

    execution = SkillExecution(
        skill_id=skill_id,
        task_id=task_id,
        agent_id=agent_id,
        input_data=input_data,
        status="running",
        started_at=datetime.utcnow(),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    try:
        definition = current_version.definition if current_version else skill.settings
        result = _execute_skill_steps(definition, input_data)
        execution.status = "completed"
        execution.output_data = result
        execution.completed_at = datetime.utcnow()
    except Exception as e:
        execution.status = "failed"
        execution.error = str(e)
        execution.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(execution)
    return execution


def _execute_skill_steps(definition: dict, input_data: dict) -> dict:
    steps = definition.get("steps", [])
    result = {"input": input_data, "steps": []}

    for step in steps:
        step_result = {"name": step.get("name", ""), "status": "executed"}
        result["steps"].append(step_result)

    return result
