from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tasks import AgentMessageCreate, AgentMessageResponse, AgentSessionCreate, AgentSessionResponse
from app.models.tasks import AgentMessage, AgentSession
from app.security.auth import get_current_user
from app.models.auth import User

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=AgentSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(data: AgentSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = AgentSession(task_id=data.task_id, agent_id=data.agent_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[AgentSessionResponse])
def list_sessions(db: Session = Depends(get_db), agent_id: str | None = None, task_id: str | None = None):
    query = db.query(AgentSession)
    if agent_id:
        query = query.filter(AgentSession.agent_id == agent_id)
    if task_id:
        query = query.filter(AgentSession.task_id == task_id)
    return query.order_by(AgentSession.created_at.desc()).all()


@router.get("/{session_id}", response_model=AgentSessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(AgentSession).filter(AgentSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/messages", response_model=list[AgentMessageResponse])
def list_messages(session_id: str, db: Session = Depends(get_db)):
    return db.query(AgentMessage).filter(AgentMessage.session_id == session_id).order_by(AgentMessage.created_at).all()


@router.post("/{session_id}/messages", response_model=AgentMessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(session_id: str, data: AgentMessageCreate, db: Session = Depends(get_db)):
    session = db.query(AgentSession).filter(AgentSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    message = AgentMessage(session_id=session_id, role=data.role, content=data.content, metadata=data.metadata)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
