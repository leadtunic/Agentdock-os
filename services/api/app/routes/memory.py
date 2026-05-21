from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.memory import MemoryCreate, MemoryResponse, MemorySearchRequest, MemorySearchResponse, MemoryUpdate
from app.models.memory import Memory
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/memories", tags=["memories"])


@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
def create_memory(data: MemoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memory = Memory(
        organization_id=data.organization_id,
        project_id=data.project_id,
        user_id=data.user_id,
        repository_id=data.repository_id,
        session_id=data.session_id,
        scope=data.scope,
        memory_type=data.memory_type,
        title=data.title,
        content=data.content,
        confidence=data.confidence,
        source=data.source,
        is_pinned=data.is_pinned,
        expires_at=data.expires_at,
        tags=data.tags,
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    record_audit(db, event_type="memory.created", user_id=current_user.id, resource_type="memory", resource_id=memory.id)
    return memory


@router.get("", response_model=list[MemoryResponse])
def list_memories(db: Session = Depends(get_db), scope: str | None = None, project_id: str | None = None):
    query = db.query(Memory)
    if scope:
        query = query.filter(Memory.scope == scope)
    if project_id:
        query = query.filter(Memory.project_id == project_id)
    return query.order_by(Memory.created_at.desc()).all()


@router.get("/{memory_id}", response_model=MemoryResponse)
def get_memory(memory_id: str, db: Session = Depends(get_db)):
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory


@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(memory_id: str, data: MemoryUpdate, db: Session = Depends(get_db)):
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(memory, key, value)
    db.commit()
    db.refresh(memory)
    return memory


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(memory)
    db.commit()


@router.post("/search", response_model=MemorySearchResponse)
def search_memories(data: MemorySearchRequest, db: Session = Depends(get_db)):
    query = db.query(Memory).filter(
        Memory.title.ilike(f"%{data.query}%") | Memory.content.ilike(f"%{data.query}%")
    )
    if data.scope:
        query = query.filter(Memory.scope == data.scope)
    if data.project_id:
        query = query.filter(Memory.project_id == data.project_id)

    memories = query.order_by(Memory.is_pinned.desc(), Memory.created_at.desc()).limit(data.limit).all()
    total = query.count()
    return MemorySearchResponse(memories=[MemoryResponse.model_validate(m) for m in memories], total=total)
