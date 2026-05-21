import os
from dataclasses import dataclass


@dataclass
class WorkerConfig:
    redis_url: str
    api_url: str
    agent_runtime_url: str
    browser_runtime_url: str
    gateway_url: str
    memory_engine_url: str
    skill_engine_url: str
    sandbox_url: str
    node_env: str
    log_level: str
    concurrency: int
    max_retries: int
    retry_delay: int
    health_check_port: int
    jwt_secret: str


def load_config() -> WorkerConfig:
    return WorkerConfig(
        redis_url=os.getenv("REDIS_URL", "redis://redis:6379/0"),
        api_url=os.getenv("API_URL", "http://localhost:8000"),
        agent_runtime_url=os.getenv("AGENT_RUNTIME_URL", "http://localhost:8020"),
        browser_runtime_url=os.getenv("BROWSER_RUNTIME_URL", "http://localhost:8010"),
        gateway_url=os.getenv("GATEWAY_URL", "http://localhost:8030"),
        memory_engine_url=os.getenv("MEMORY_ENGINE_URL", "http://localhost:8050"),
        skill_engine_url=os.getenv("SKILL_ENGINE_URL", "http://localhost:8060"),
        sandbox_url=os.getenv("SANDBOX_URL", "http://localhost:8070"),
        node_env=os.getenv("NODE_ENV", "development"),
        log_level=os.getenv("LOG_LEVEL", "info"),
        concurrency=int(os.getenv("WORKER_CONCURRENCY", "5")),
        max_retries=int(os.getenv("WORKER_MAX_RETRIES", "3")),
        retry_delay=int(os.getenv("WORKER_RETRY_DELAY", "5")),
        health_check_port=int(os.getenv("WORKER_HEALTH_PORT", "8080")),
        jwt_secret=os.getenv("JWT_SECRET", "change-me"),
    )
