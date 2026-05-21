from app.routes.auth import router as auth_router
from app.routes.organizations import router as organizations_router
from app.routes.projects import router as projects_router
from app.routes.providers import router as providers_router
from app.routes.agents import router as agents_router
from app.routes.tasks import router as tasks_router
from app.routes.sessions import router as sessions_router
from app.routes.approvals import router as approvals_router
from app.routes.repositories import router as repositories_router
from app.routes.quality import router as quality_router
from app.routes.memory import router as memory_router
from app.routes.skills import router as skills_router
from app.routes.mcp import router as mcp_router
from app.routes.browser import router as browser_router
from app.routes.gateway import router as gateway_router
from app.routes.plugins import router as plugins_router
from app.routes.audit import router as audit_router
from app.routes.cost import router as cost_router
from app.routes.governance import router as governance_router
from app.routes.health import router as health_router

routers = [
    health_router,
    auth_router,
    organizations_router,
    projects_router,
    providers_router,
    agents_router,
    tasks_router,
    sessions_router,
    approvals_router,
    repositories_router,
    quality_router,
    memory_router,
    skills_router,
    mcp_router,
    browser_router,
    gateway_router,
    plugins_router,
    audit_router,
    cost_router,
    governance_router,
]
