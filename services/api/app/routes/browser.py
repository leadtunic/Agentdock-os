from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.browser import (
    BrowserActionCreate,
    BrowserActionResponse,
    BrowserProfileCreate,
    BrowserProfileResponse,
    BrowserProfileUpdate,
    BrowserSessionCreate,
    BrowserSessionResponse,
)
from app.models.browser import BrowserAction, BrowserProfile, BrowserSession
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/browser", tags=["browser"])


@router.post("/profiles", response_model=BrowserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(data: BrowserProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = BrowserProfile(
        organization_id=data.organization_id,
        project_id=data.project_id,
        name=data.name,
        profile_type=data.profile_type,
        settings=data.settings,
        is_active=data.is_active,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    record_audit(db, event_type="browser_profile.created", user_id=current_user.id, resource_type="browser_profile", resource_id=profile.id)
    return profile


@router.get("/profiles", response_model=list[BrowserProfileResponse])
def list_profiles(db: Session = Depends(get_db)):
    return db.query(BrowserProfile).all()


@router.put("/profiles/{profile_id}", response_model=BrowserProfileResponse)
def update_profile(profile_id: str, data: BrowserProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(BrowserProfile).filter(BrowserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Browser profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/sessions", response_model=BrowserSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(data: BrowserSessionCreate, db: Session = Depends(get_db)):
    from app.browser.service import create_browser_session

    session = create_browser_session(db, data)
    return session


@router.get("/sessions", response_model=list[BrowserSessionResponse])
def list_sessions(db: Session = Depends(get_db), profile_id: str | None = None):
    query = db.query(BrowserSession)
    if profile_id:
        query = query.filter(BrowserSession.profile_id == profile_id)
    return query.order_by(BrowserSession.created_at.desc()).all()


@router.get("/sessions/{session_id}", response_model=BrowserSessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(BrowserSession).filter(BrowserSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    return session


@router.post("/sessions/{session_id}/actions", response_model=BrowserActionResponse, status_code=status.HTTP_201_CREATED)
def create_action(session_id: str, data: BrowserActionCreate, db: Session = Depends(get_db)):
    from app.browser.service import execute_browser_action

    session = db.query(BrowserSession).filter(BrowserSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")

    return execute_browser_action(db, session, data)


@router.get("/sessions/{session_id}/actions", response_model=list[BrowserActionResponse])
def list_actions(session_id: str, db: Session = Depends(get_db)):
    return db.query(BrowserAction).filter(BrowserAction.session_id == session_id).order_by(BrowserAction.created_at).all()
