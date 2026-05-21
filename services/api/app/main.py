import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import routers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AgentDock OS API starting")
    yield
    logger.info("AgentDock OS API shutting down")


app = FastAPI(
    title="AgentDock OS API",
    description="Open source operating system for governed AI agents",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router)

from app.routes.governance import routers as governance_routers

for router in governance_routers:
    app.include_router(router)


@app.get("/")
async def root():
    return {"service": "AgentDock OS API", "version": "0.1.0", "status": "running"}
