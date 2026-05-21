from sqlalchemy.orm import Session

from app.models.memory import Memory


def search_memories(db: Session, query: str, scope: str | None = None, project_id: str | None = None, limit: int = 10) -> list[Memory]:
    q = db.query(Memory).filter(
        Memory.title.ilike(f"%{query}%") | Memory.content.ilike(f"%{query}%")
    )
    if scope:
        q = q.filter(Memory.scope == scope)
    if project_id:
        q = q.filter(Memory.project_id == project_id)
    return q.order_by(Memory.is_pinned.desc(), Memory.created_at.desc()).limit(limit).all()


def get_applicable_memories(db: Session, scope: str, scope_id: str | None = None, memory_type: str | None = None) -> list[Memory]:
    q = db.query(Memory).filter(Memory.is_pinned == True)
    if scope:
        q = q.filter(Memory.scope == scope)
    if scope_id:
        if scope == "project":
            q = q.filter(Memory.project_id == scope_id)
        elif scope == "organization":
            q = q.filter(Memory.organization_id == scope_id)
        elif scope == "user":
            q = q.filter(Memory.user_id == scope_id)
        elif scope == "repository":
            q = q.filter(Memory.repository_id == scope_id)
        elif scope == "session":
            q = q.filter(Memory.session_id == scope_id)
    if memory_type:
        q = q.filter(Memory.memory_type == memory_type)
    return q.order_by(Memory.is_pinned.desc(), Memory.created_at.desc()).all()
