from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.repositories import (
    GitWorkspaceCreate,
    GitWorkspaceResponse,
    PatchCreate,
    PatchResponse,
    PatchUpdate,
    PullRequestCreate,
    PullRequestResponse,
    RepositoryCreate,
    RepositoryResponse,
    RepositoryUpdate,
)
from app.models.repositories import GitWorkspace, Patch, PullRequest, Repository
from app.security.auth import get_current_user
from app.models.auth import User
from app.audit.service import record_audit

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.post("", response_model=RepositoryResponse, status_code=status.HTTP_201_CREATED)
def create_repository(data: RepositoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = Repository(
        project_id=data.project_id,
        name=data.name,
        provider=data.provider,
        url=data.url,
        default_branch=data.default_branch,
        is_active=data.is_active,
        settings=data.settings,
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    record_audit(db, event_type="repository.created", user_id=current_user.id, resource_type="repository", resource_id=repo.id)
    return repo


@router.get("", response_model=list[RepositoryResponse])
def list_repositories(db: Session = Depends(get_db), project_id: str | None = None):
    query = db.query(Repository)
    if project_id:
        query = query.filter(Repository.project_id == project_id)
    return query.all()


@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo


@router.put("/{repo_id}", response_model=RepositoryResponse)
def update_repository(repo_id: str, data: RepositoryUpdate, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(repo, key, value)
    db.commit()
    db.refresh(repo)
    return repo


@router.delete("/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_repository(repo_id: str, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    db.delete(repo)
    db.commit()


@router.post("/{repo_id}/clone", response_model=RepositoryResponse)
def clone_repository(repo_id: str, db: Session = Depends(get_db)):
    from app.repositories.service import clone_repo

    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    clone_repo(db, repo)
    return repo


@router.post("/{repo_id}/workspaces", response_model=GitWorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(repo_id: str, data: GitWorkspaceCreate, db: Session = Depends(get_db)):
    from app.repositories.service import create_worktree

    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    workspace = create_worktree(db, repo, data)
    return workspace


@router.get("/{repo_id}/workspaces", response_model=list[GitWorkspaceResponse])
def list_workspaces(repo_id: str, db: Session = Depends(get_db)):
    return db.query(GitWorkspace).filter(GitWorkspace.repository_id == repo_id).all()


@router.post("/{repo_id}/patches", response_model=PatchResponse, status_code=status.HTTP_201_CREATED)
def create_patch(repo_id: str, data: PatchCreate, db: Session = Depends(get_db)):
    patch = Patch(
        repository_id=repo_id,
        task_id=data.task_id,
        agent_id=data.agent_id,
        approval_id=data.approval_id,
        title=data.title,
        description=data.description,
        diff=data.diff,
        files_changed=data.files_changed,
    )
    db.add(patch)
    db.commit()
    db.refresh(patch)
    return patch


@router.get("/{repo_id}/patches", response_model=list[PatchResponse])
def list_patches(repo_id: str, db: Session = Depends(get_db)):
    return db.query(Patch).filter(Patch.repository_id == repo_id).all()


@router.put("/patches/{patch_id}", response_model=PatchResponse)
def update_patch(patch_id: str, data: PatchUpdate, db: Session = Depends(get_db)):
    patch = db.query(Patch).filter(Patch.id == patch_id).first()
    if not patch:
        raise HTTPException(status_code=404, detail="Patch not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patch, key, value)
    db.commit()
    db.refresh(patch)
    return patch


@router.post("/{repo_id}/pull-requests", response_model=PullRequestResponse, status_code=status.HTTP_201_CREATED)
def create_pull_request(repo_id: str, data: PullRequestCreate, db: Session = Depends(get_db)):
    pr = PullRequest(
        repository_id=repo_id,
        task_id=data.task_id,
        patch_id=data.patch_id,
        title=data.title,
        description=data.description,
        source_branch=data.source_branch,
        target_branch=data.target_branch,
    )
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr


@router.get("/{repo_id}/pull-requests", response_model=list[PullRequestResponse])
def list_pull_requests(repo_id: str, db: Session = Depends(get_db)):
    return db.query(PullRequest).filter(PullRequest.repository_id == repo_id).all()
