from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.providers import (
    ProviderCreate,
    ProviderResponse,
    ProviderTestRequest,
    ProviderTestResponse,
    ProviderUpdate,
)
from app.models.providers import Provider, ProviderKey
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/providers", tags=["providers"])


@router.post("", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider(data: ProviderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    provider = Provider(
        organization_id=data.organization_id,
        name=data.name,
        provider_type=data.provider_type,
        base_url=data.base_url,
        is_default=data.is_default,
        is_active=data.is_active,
        metadata=data.metadata,
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    record_audit(db, event_type="provider.created", user_id=current_user.id, resource_type="provider", resource_id=provider.id)
    return provider


@router.get("", response_model=list[ProviderResponse])
def list_providers(db: Session = Depends(get_db), organization_id: str | None = None):
    query = db.query(Provider)
    if organization_id:
        query = query.filter(Provider.organization_id == organization_id)
    return query.all()


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: str, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider(provider_id: str, data: ProviderUpdate, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(provider, key, value)
    db.commit()
    db.refresh(provider)
    return provider


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_provider(provider_id: str, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(provider)
    db.commit()


@router.post("/test", response_model=ProviderTestResponse)
def test_provider(data: ProviderTestRequest, db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    from app.providers.service import test_provider_connection

    result = test_provider_connection(db, provider, data.model)
    return result
