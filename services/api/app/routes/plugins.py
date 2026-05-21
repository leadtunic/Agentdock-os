from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.plugins import PluginCreate, PluginResponse, PluginUpdate
from app.models.plugins import Plugin
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/plugins", tags=["plugins"])


@router.post("", response_model=PluginResponse, status_code=status.HTTP_201_CREATED)
def create_plugin(data: PluginCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plugin = Plugin(
        organization_id=data.organization_id,
        name=data.name,
        plugin_type=data.plugin_type,
        version=data.version,
        description=data.description,
        manifest=data.manifest,
        config=data.config,
        is_active=data.is_active,
        author=data.author,
        source_url=data.source_url,
    )
    db.add(plugin)
    db.commit()
    db.refresh(plugin)
    record_audit(db, event_type="plugin.created", user_id=current_user.id, resource_type="plugin", resource_id=plugin.id)
    return plugin


@router.get("", response_model=list[PluginResponse])
def list_plugins(db: Session = Depends(get_db), plugin_type: str | None = None):
    query = db.query(Plugin)
    if plugin_type:
        query = query.filter(Plugin.plugin_type == plugin_type)
    return query.all()


@router.get("/{plugin_id}", response_model=PluginResponse)
def get_plugin(plugin_id: str, db: Session = Depends(get_db)):
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return plugin


@router.put("/{plugin_id}", response_model=PluginResponse)
def update_plugin(plugin_id: str, data: PluginUpdate, db: Session = Depends(get_db)):
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plugin, key, value)
    db.commit()
    db.refresh(plugin)
    return plugin


@router.delete("/{plugin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plugin(plugin_id: str, db: Session = Depends(get_db)):
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    db.delete(plugin)
    db.commit()
