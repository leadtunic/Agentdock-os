from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.cost import CostEventCreate, CostEventResponse, CostFilter, CostSummary
from app.models.cost import CostEvent

router = APIRouter(prefix="/costs", tags=["costs"])


@router.post("/events", response_model=CostEventResponse, status_code=201)
def create_event(data: CostEventCreate, db: Session = Depends(get_db)):
    event = CostEvent(
        organization_id=data.organization_id,
        project_id=data.project_id,
        agent_id=data.agent_id,
        task_id=data.task_id,
        session_id=data.session_id,
        provider_id=data.provider_id,
        provider=data.provider,
        model=data.model,
        input_tokens=data.input_tokens,
        output_tokens=data.output_tokens,
        total_tokens=data.total_tokens,
        estimated_cost=data.estimated_cost,
        currency=data.currency,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=list[CostEventResponse])
def list_events(db: Session = Depends(get_db), agent_id: str | None = None, project_id: str | None = None, limit: int = 50):
    query = db.query(CostEvent)
    if agent_id:
        query = query.filter(CostEvent.agent_id == agent_id)
    if project_id:
        query = query.filter(CostEvent.project_id == project_id)
    return query.order_by(CostEvent.created_at.desc()).limit(limit).all()


@router.get("/summary", response_model=CostSummary)
def get_summary(db: Session = Depends(get_db), data: CostFilter = Depends()):
    query = db.query(CostEvent)
    if data.organization_id:
        query = query.filter(CostEvent.organization_id == data.organization_id)
    if data.project_id:
        query = query.filter(CostEvent.project_id == data.project_id)
    if data.agent_id:
        query = query.filter(CostEvent.agent_id == data.agent_id)
    if data.start_date:
        query = query.filter(CostEvent.created_at >= data.start_date)
    if data.end_date:
        query = query.filter(CostEvent.created_at <= data.end_date)

    events = query.all()

    total_cost = sum(e.estimated_cost for e in events)
    total_tokens = sum(e.total_tokens for e in events)
    total_input = sum(e.input_tokens for e in events)
    total_output = sum(e.output_tokens for e in events)

    cost_by_provider: dict[str, float] = {}
    cost_by_agent: dict[str, float] = {}
    cost_by_project: dict[str, float] = {}
    cost_by_day: dict[str, float] = {}

    for e in events:
        cost_by_provider[e.provider] = cost_by_provider.get(e.provider, 0) + e.estimated_cost
        if e.agent_id:
            cost_by_agent[e.agent_id] = cost_by_agent.get(e.agent_id, 0) + e.estimated_cost
        if e.project_id:
            cost_by_project[e.project_id] = cost_by_project.get(e.project_id, 0) + e.estimated_cost
        day_key = e.created_at.strftime("%Y-%m-%d")
        cost_by_day[day_key] = cost_by_day.get(day_key, 0) + e.estimated_cost

    return CostSummary(
        total_cost=total_cost,
        total_tokens=total_tokens,
        total_input_tokens=total_input,
        total_output_tokens=total_output,
        cost_by_provider=cost_by_provider,
        cost_by_agent=cost_by_agent,
        cost_by_project=cost_by_project,
        cost_by_day=cost_by_day,
    )
