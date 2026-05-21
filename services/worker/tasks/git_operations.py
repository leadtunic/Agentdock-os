import asyncio
import logging
from typing import Any

from config import WorkerConfig

logger = logging.getLogger("worker.tasks.git_operations")


async def run_git_operations(payload: dict[str, Any], config: WorkerConfig) -> dict[str, Any]:
    operation = payload.get("operation", "status")
    repo_path = payload.get("repo_path", ".")
    branch = payload.get("branch")
    commit_message = payload.get("commit_message")

    logger.info("Running git operation '%s' on %s", operation, repo_path)

    result = {"operation": operation, "repo_path": repo_path}

    try:
        if operation == "status":
            result = await _git_status(repo_path)
        elif operation == "diff":
            result = await _git_diff(repo_path, payload.get("target"))
        elif operation == "commit":
            result = await _git_commit(repo_path, commit_message or "Auto-commit by AgentDock")
        elif operation == "push":
            result = await _git_push(repo_path, branch)
        elif operation == "pull":
            result = await _git_pull(repo_path, branch)
        elif operation == "create_branch":
            result = await _git_create_branch(repo_path, branch or "feature/agentdock-update")
        elif operation == "checkout":
            result = await _git_checkout(repo_path, branch or "main")
        else:
            result["error"] = f"Unknown operation: {operation}"

    except Exception as e:
        result["error"] = str(e)
        logger.error("Git operation '%s' failed: %s", operation, e)

    await _notify_api(operation, result, config)

    return result


async def _git_status(repo_path: str) -> dict:
    proc = await asyncio.create_subprocess_shell(
        "git status --porcelain",
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    changed_files = []
    if stdout:
        for line in stdout.decode().strip().split("\n"):
            if line.strip():
                parts = line.strip().split(" ", 1)
                if len(parts) == 2:
                    changed_files.append({"status": parts[0], "file": parts[1]})

    return {
        "operation": "status",
        "changed_files": changed_files,
        "file_count": len(changed_files),
        "exit_code": proc.returncode,
    }


async def _git_diff(repo_path: str, target: str | None = None) -> dict:
    diff_target = target or "HEAD"
    proc = await asyncio.create_subprocess_shell(
        f"git diff {diff_target} --stat",
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    return {
        "operation": "diff",
        "target": diff_target,
        "diff_stat": stdout.decode() if stdout else "",
        "exit_code": proc.returncode,
    }


async def _git_commit(repo_path: str, message: str) -> dict:
    proc = await asyncio.create_subprocess_shell(
        f'git add -A && git commit -m "{message}"',
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode == 0:
        hash_proc = await asyncio.create_subprocess_shell(
            "git rev-parse HEAD",
            cwd=repo_path,
            stdout=asyncio.subprocess.PIPE,
        )
        hash_stdout, _ = await hash_proc.communicate()
        commit_hash = hash_stdout.decode().strip()
    else:
        commit_hash = None

    return {
        "operation": "commit",
        "success": proc.returncode == 0,
        "commit_hash": commit_hash,
        "message": message,
        "output": stdout.decode() if stdout else "",
        "error": stderr.decode() if stderr else "",
        "exit_code": proc.returncode,
    }


async def _git_push(repo_path: str, branch: str | None = None) -> dict:
    branch_arg = branch or ""
    proc = await asyncio.create_subprocess_shell(
        f"git push {'origin ' + branch_arg if branch_arg else ''}".strip(),
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    return {
        "operation": "push",
        "success": proc.returncode == 0,
        "branch": branch,
        "output": stdout.decode() if stdout else "",
        "error": stderr.decode() if stderr else "",
        "exit_code": proc.returncode,
    }


async def _git_pull(repo_path: str, branch: str | None = None) -> dict:
    branch_arg = branch or ""
    proc = await asyncio.create_subprocess_shell(
        f"git pull {'origin ' + branch_arg if branch_arg else ''}".strip(),
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    return {
        "operation": "pull",
        "success": proc.returncode == 0,
        "branch": branch,
        "output": stdout.decode() if stdout else "",
        "error": stderr.decode() if stderr else "",
        "exit_code": proc.returncode,
    }


async def _git_create_branch(repo_path: str, branch: str) -> dict:
    proc = await asyncio.create_subprocess_shell(
        f"git checkout -b {branch}",
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    return {
        "operation": "create_branch",
        "success": proc.returncode == 0,
        "branch": branch,
        "output": stdout.decode() if stdout else "",
        "error": stderr.decode() if stderr else "",
        "exit_code": proc.returncode,
    }


async def _git_checkout(repo_path: str, branch: str) -> dict:
    proc = await asyncio.create_subprocess_shell(
        f"git checkout {branch}",
        cwd=repo_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()

    return {
        "operation": "checkout",
        "success": proc.returncode == 0,
        "branch": branch,
        "output": stdout.decode() if stdout else "",
        "error": stderr.decode() if stderr else "",
        "exit_code": proc.returncode,
    }


async def _notify_api(operation: str, result: dict, config: WorkerConfig) -> None:
    try:
        import aiohttp

        url = f"{config.api_url}/api/git/result"
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=result, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    logger.warning("Failed to report git result: status %s", resp.status)
    except Exception as e:
        logger.error("Failed to notify API of git result: %s", e)
