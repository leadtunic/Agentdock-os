import subprocess
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.quality import QualityGateLog, QualityGateRun
from app.schemas.quality import QualityGateRunCreate


def run_quality_gate(db: Session, data: QualityGateRunCreate, user_id: str) -> QualityGateRun:
    run = QualityGateRun(
        project_id=data.project_id,
        task_id=data.task_id,
        patch_id=data.patch_id,
        status="running",
        checks=data.checks,
        started_at=datetime.utcnow(),
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    checks = data.checks or {
        "typescript_lint": True,
        "typescript_typecheck": True,
        "python_ruff": True,
        "secret_scan": True,
        "docker_compose_config": True,
    }

    all_passed = True
    for check_name, enabled in checks.items():
        if not enabled:
            continue
        status, output, exit_code, duration = _run_check(check_name)
        log = QualityGateLog(run_id=run.id, check_name=check_name, status=status, output=output, exit_code=exit_code, duration_ms=duration)
        db.add(log)
        if status != "passed":
            all_passed = False

    run.status = "passed" if all_passed else "failed"
    run.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(run)
    return run


def _run_check(check_name: str) -> tuple[str, str, int | None, int | None]:
    import time

    start = time.time()
    commands = {
        "typescript_lint": ["npx", "eslint", ".", "--max-warnings", "0"],
        "typescript_typecheck": ["npx", "tsc", "--noEmit"],
        "typescript_test": ["npx", "vitest", "run", "--passWithNoTests"],
        "typescript_build": ["npx", "tsc", "--build"],
        "python_ruff": ["ruff", "check", "."],
        "python_pyright": ["pyright", "."],
        "python_pytest": ["pytest", "--tb=short", "-q"],
        "docker_compose_config": ["docker", "compose", "config"],
        "secret_scan": ["grep", "-r", "--include=*.env", "--include=*.key", "AKIA\\|BEGIN RSA\\|password\\s*=", "."],
    }

    cmd = commands.get(check_name)
    if not cmd:
        return ("skipped", f"Unknown check: {check_name}", None, 0)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd="/tmp")
        duration = int((time.time() - start) * 1000)
        status = "passed" if result.returncode == 0 else "failed"
        return (status, result.stdout + result.stderr, result.returncode, duration)
    except subprocess.TimeoutExpired:
        return ("failed", "Check timed out", -1, int((time.time() - start) * 1000))
    except FileNotFoundError:
        return ("skipped", f"Command not found: {cmd[0]}", None, 0)
    except Exception as e:
        return ("failed", str(e), -1, int((time.time() - start) * 1000))
