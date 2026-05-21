from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AgentDock OS API"
    debug: bool = False

    database_url: str = "postgresql+psycopg://agentdock:agentdock@postgres:5432/agentdock"
    redis_url: str = "redis://redis:6379/0"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440

    encryption_key: str = "change-me-32-chars-minimum!!"

    api_url: str = "http://localhost:8000"
    agent_runtime_url: str = "http://agent-runtime:8020"
    browser_runtime_url: str = "http://browser-runtime:8010"
    gateway_url: str = "http://gateway:8030"
    worker_url: str = "http://worker:8040"

    storage_path: str = "/data/agentdock"
    workspaces_path: str = "/data/agentdock/workspaces"
    browser_profiles_path: str = "/data/agentdock/browser"

    enable_audit_log: bool = True
    enable_cost_tracking: bool = True

    cors_origins: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
