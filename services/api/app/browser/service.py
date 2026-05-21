import os
from datetime import datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.browser import BrowserAction, BrowserProfile, BrowserSession
from app.schemas.browser import BrowserActionCreate, BrowserSessionCreate


def create_browser_session(db: Session, data: BrowserSessionCreate) -> BrowserSession:
    profile = db.query(BrowserProfile).filter(BrowserProfile.id == data.profile_id).first()
    if not profile:
        raise ValueError("Browser profile not found")

    session = BrowserSession(
        profile_id=data.profile_id,
        task_id=data.task_id,
        agent_id=data.agent_id,
        status="created",
        started_at=datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    try:
        response = httpx.post(
            f"{settings.browser_runtime_url}/sessions",
            json={"session_id": session.id, "profile_type": profile.profile_type, "settings": profile.settings},
            timeout=30,
        )
        response.raise_for_status()
        session_data = response.json()
        session.browser_id = session_data.get("browser_id")
        session.status = "running"
        db.commit()
    except Exception as e:
        session.status = "failed"
        session.error = str(e)
        db.commit()

    db.refresh(session)
    return session


def execute_browser_action(db: Session, session: BrowserSession, data: BrowserActionCreate) -> BrowserAction:
    action = BrowserAction(
        session_id=data.session_id,
        action_type=data.action_type,
        target=data.target,
        input_data=data.input_data,
        status="running",
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    import time

    start = time.time()
    try:
        response = httpx.post(
            f"{settings.browser_runtime_url}/sessions/{session.id}/actions",
            json={"action_type": data.action_type, "target": data.target, "input_data": data.input_data},
            timeout=60,
        )
        response.raise_for_status()
        result = response.json()
        action.result = result
        action.status = "completed"
        action.duration_ms = int((time.time() - start) * 1000)
    except Exception as e:
        action.status = "failed"
        action.error = str(e)
        action.duration_ms = int((time.time() - start) * 1000)

    db.commit()
    db.refresh(action)
    return action


def close_browser_session(db: Session, session: BrowserSession) -> BrowserSession:
    try:
        httpx.post(f"{settings.browser_runtime_url}/sessions/{session.id}/close", timeout=10)
    except Exception:
        pass

    session.status = "closed"
    session.closed_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session
