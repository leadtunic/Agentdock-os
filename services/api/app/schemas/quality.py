from datetime import datetime

from pydantic import BaseModel, Field


class QualityGateRunCreate(BaseModel):
    project_id: str
    task_id: str | None = None
    patch_id: str | None = None
    checks: dict = Field(default_factory=dict)


class QualityGateRunResponse(BaseModel):
    id: str
    project_id: str
    task_id: str | None
    patch_id: str | None
    status: str
    checks: dict
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QualityGateLogResponse(BaseModel):
    id: str
    run_id: str
    check_name: str
    status: str
    output: str | None
    exit_code: int | None
    duration_ms: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QualityGateConfig(BaseModel):
    typescript_lint: bool = True
    typescript_typecheck: bool = True
    typescript_test: bool = True
    typescript_build: bool = True
    python_ruff: bool = True
    python_pyright: bool = True
    python_pytest: bool = True
    docker_compose_config: bool = True
    secret_scan: bool = True
    custom_checks: list[dict] = Field(default_factory=list)
