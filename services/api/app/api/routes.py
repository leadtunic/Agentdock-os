from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import Base, engine, get_db
from app.models import Agent, Approval, Memory, McpServer, Organization, Project, Skill, Task
from app.schemas import AgentCreate, ApprovalDecision, MemoryCreate, McpServerCreate, OrganizationCreate, ProjectCreate, SkillCreate, TaskCreate
from app.services.audit import record_audit_event

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agentdock-api"}


@router.post("/system/init-db")
def init_db() -> dict[str, str]:
    Base.metadata.create_all(bind=engine)
    return {"status": "created"}


@router.get("/organizations")
def list_organizations(db: Session = Depends(get_db)):
    return db.scalars(select(Organization)).all()


@router.post("/organizations")
def create_organization(input: OrganizationCreate, db: Session = Depends(get_db)):
    item = Organization(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "organization.created", resource_type="organization", resource_id=item.id, payload={"name": item.name})
    return item


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return db.scalars(select(Project)).all()


@router.post("/projects")
def create_project(input: ProjectCreate, db: Session = Depends(get_db)):
    item = Project(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "project.created", organization_id=item.organization_id, resource_type="project", resource_id=item.id)
    return item


@router.get("/agents")
def list_agents(db: Session = Depends(get_db)):
    return db.scalars(select(Agent)).all()


@router.post("/agents")
def create_agent(input: AgentCreate, db: Session = Depends(get_db)):
    item = Agent(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "agent.created", organization_id=item.organization_id, project_id=item.project_id, agent_id=item.id, resource_type="agent", resource_id=item.id)
    return item


@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    return db.scalars(select(Task)).all()


@router.post("/tasks")
def create_task(input: TaskCreate, db: Session = Depends(get_db)):
    item = Task(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "task.created", organization_id=item.organization_id, project_id=item.project_id, agent_id=item.agent_id, task_id=item.id, resource_type="task", resource_id=item.id, payload={"source": item.source})
    return item


@router.post("/tasks/{task_id}/approve")
def approve_task(task_id: str, decision: ApprovalDecision, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        return {"error": "task_not_found"}
    task.status = "approved" if decision.approved else "rejected"
    db.commit()
    record_audit_event(db, "task.approval_decision", project_id=task.project_id, task_id=task.id, payload=decision.model_dump())
    return task


@router.get("/approvals")
def list_approvals(db: Session = Depends(get_db)):
    return db.scalars(select(Approval)).all()


@router.get("/memories")
def list_memories(db: Session = Depends(get_db)):
    return db.scalars(select(Memory)).all()


@router.post("/memories")
def create_memory(input: MemoryCreate, db: Session = Depends(get_db)):
    item = Memory(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "memory.created", organization_id=item.organization_id, project_id=item.project_id, resource_type="memory", resource_id=item.id)
    return item


@router.get("/skills")
def list_skills(db: Session = Depends(get_db)):
    return db.scalars(select(Skill)).all()


@router.post("/skills")
def create_skill(input: SkillCreate, db: Session = Depends(get_db)):
    item = Skill(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "skill.created", organization_id=item.organization_id, project_id=item.project_id, resource_type="skill", resource_id=item.id)
    return item


@router.get("/mcp/servers")
def list_mcp_servers(db: Session = Depends(get_db)):
    return db.scalars(select(McpServer)).all()


@router.post("/mcp/servers")
def create_mcp_server(input: McpServerCreate, db: Session = Depends(get_db)):
    item = McpServer(**input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    record_audit_event(db, "mcp.server.created", organization_id=item.organization_id, project_id=item.project_id, resource_type="mcp_server", resource_id=item.id)
    return item


@router.get("/audit")
def audit_log(db: Session = Depends(get_db)):
    from app.models import AuditLog

    return db.scalars(select(AuditLog)).all()
