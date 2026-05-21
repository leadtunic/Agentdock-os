from datetime import datetime

from pydantic import BaseModel


class CostEventCreate(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    task_id: str | None = None
    session_id: str | None = None
    provider_id: str | None = None
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0
    currency: str = "USD"


class CostEventResponse(BaseModel):
    id: str
    organization_id: str | None
    project_id: str | None
    agent_id: str | None
    task_id: str | None
    session_id: str | None
    provider_id: str | None
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost: float
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CostSummary(BaseModel):
    total_cost: float
    total_tokens: int
    total_input_tokens: int
    total_output_tokens: int
    cost_by_provider: dict[str, float]
    cost_by_agent: dict[str, float]
    cost_by_project: dict[str, float]
    cost_by_day: dict[str, float]


class CostFilter(BaseModel):
    organization_id: str | None = None
    project_id: str | None = None
    agent_id: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    limit: int = 50
    offset: int = 0
