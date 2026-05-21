import os
import subprocess
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.repositories import GitWorkspace, Repository
from app.schemas.repositories import GitWorkspaceCreate


def clone_repo(db: Session, repo: Repository) -> str:
    workspace_path = os.path.join(settings.workspaces_path, repo.id)
    if os.path.exists(workspace_path):
        return workspace_path

    os.makedirs(workspace_path, exist_ok=True)
    subprocess.run(["git", "clone", repo.url, workspace_path], check=True, timeout=120)
    repo.last_sync_at = datetime.utcnow()
    db.commit()
    return workspace_path


def create_worktree(db: Session, repo: Repository, data: GitWorkspaceCreate) -> GitWorkspace:
    workspace_path = os.path.join(settings.workspaces_path, repo.id, "worktrees", data.branch_name)
    os.makedirs(os.path.dirname(workspace_path), exist_ok=True)

    main_path = os.path.join(settings.workspaces_path, repo.id)
    subprocess.run(
        ["git", "-C", main_path, "worktree", "add", "-b", data.branch_name, workspace_path, data.created_at_branch],
        check=True,
        timeout=30,
    )

    workspace = GitWorkspace(
        repository_id=repo.id,
        task_id=data.task_id,
        agent_id=data.agent_id,
        branch_name=data.branch_name,
        worktree_path=workspace_path,
        created_at_branch=data.created_at_branch,
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace


def generate_diff(repo_path: str, branch: str) -> str:
    result = subprocess.run(
        ["git", "-C", repo_path, "diff", branch],
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout


def apply_patch(repo_path: str, diff_content: str, branch: str) -> bool:
    try:
        subprocess.run(
            ["git", "-C", repo_path, "apply", "--check"],
            input=diff_content,
            capture_output=True,
            text=True,
            timeout=30,
        )
        subprocess.run(
            ["git", "-C", repo_path, "apply"],
            input=diff_content,
            capture_output=True,
            text=True,
            timeout=30,
        )
        return True
    except subprocess.CalledProcessError:
        return False
