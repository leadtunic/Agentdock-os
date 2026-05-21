from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.agents import (
    AgentCreate,
    AgentPolicyCreate,
    AgentPolicyResponse,
    AgentPolicyUpdate,
    AgentResponse,
    AgentUpdate,
)
from app.models.agents import Agent, AgentPolicy
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(data: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = Agent(
        organization_id=data.organization_id,
        project_id=data.project_id,
        name=data.name,
        role=data.role,
        description=data.description,
        system_prompt=data.system_prompt,
        provider_id=data.provider_id,
        model=data.model,
        temperature=data.temperature,
        max_tokens=data.max_tokens,
        cost_limit=data.cost_limit,
        time_limit_seconds=data.time_limit_seconds,
        memory_scope=data.memory_scope,
        settings=data.settings,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    record_audit(db, event_type="agent.created", user_id=current_user.id, resource_type="agent", resource_id=agent.id)
    return agent


@router.get("", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_db), organization_id: str | None = None, project_id: str | None = None):
    query = db.query(Agent)
    if organization_id:
        query = query.filter(Agent.organization_id == organization_id)
    if project_id:
        query = query.filter(Agent.project_id == project_id)
    return query.all()


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, data: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)
    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()


@router.post("/{agent_id}/policies", response_model=AgentPolicyResponse, status_code=status.HTTP_201_CREATED)
def create_policy(agent_id: str, data: AgentPolicyCreate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    policy = AgentPolicy(agent_id=agent_id, name=data.name, policy_type=data.policy_type, policy=data.policy, is_active=data.is_active)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/{agent_id}/policies", response_model=list[AgentPolicyResponse])
def list_policies(agent_id: str, db: Session = Depends(get_db)):
    return db.query(AgentPolicy).filter(AgentPolicy.agent_id == agent_id).all()


@router.put("/policies/{policy_id}", response_model=AgentPolicyResponse)
def update_policy(policy_id: str, data: AgentPolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(AgentPolicy).filter(AgentPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
    db.commit()
    db.refresh(policy)
    return policy
