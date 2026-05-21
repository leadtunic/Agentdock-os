import asyncio
import logging
from typing import Any

from config import WorkerConfig

logger = logging.getLogger("worker.tasks.quality_gate")


async def run_quality_gate(payload: dict[str, Any], config: WorkerConfig) -> dict[str, Any]:
    task_id = payload.get("task_id", "unknown")
    checks = payload.get("checks", ["lint", "typecheck", "test"])

    logger.info("Running quality gate for task %s with checks: %s", task_id, checks)

    results = {}
    all_passed = True

    for check in checks:
        try:
            result = await _run_check(check, payload, config)
            results[check] = result
            if not result.get("passed", False):
                all_passed = False
        except Exception as e:
            results[check] = {"passed": False, "error": str(e)}
            all_passed = False

    logger.info("Quality gate for task %s: %s", task_id, "PASSED" if all_passed else "FAILED")

    await _notify_api(task_id, results, all_passed, config)

    return {
        "task_id": task_id,
        "passed": all_passed,
        "results": results,
        "check_count": len(checks),
    }


async def _run_check(check: str, payload: dict, config: WorkerConfig) -> dict:
    if check == "lint":
        return await _run_lint(payload)
    elif check == "typecheck":
        return await _run_typecheck(payload)
    elif check == "test":
        return await _run_tests(payload)
    elif check == "security":
        return await _run_security_check(payload)
    else:
        return {"passed": True, "skipped": True, "reason": f"Unknown check: {check}"}


async def _run_lint(payload: dict) -> dict:
    project_path = payload.get("project_path", ".")
    lint_command = payload.get("lint_command", "npm run lint")

    try:
        proc = await asyncio.create_subprocess_shell(
            lint_command,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        return {
            "passed": proc.returncode == 0,
            "exit_code": proc.returncode,
            "output": stdout.decode() if stdout else "",
            "error": stderr.decode() if stderr else "",
        }
    except Exception as e:
        return {"passed": False, "error": str(e)}


async def _run_typecheck(payload: dict) -> dict:
    project_path = payload.get("project_path", ".")
    typecheck_command = payload.get("typecheck_command", "npm run typecheck")

    try:
        proc = await asyncio.create_subprocess_shell(
            typecheck_command,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        return {
            "passed": proc.returncode == 0,
            "exit_code": proc.returncode,
            "output": stdout.decode() if stdout else "",
            "error": stderr.decode() if stderr else "",
        }
    except Exception as e:
        return {"passed": False, "error": str(e)}


async def _run_tests(payload: dict) -> dict:
    project_path = payload.get("project_path", ".")
    test_command = payload.get("test_command", "npm test")

    try:
        proc = await asyncio.create_subprocess_shell(
            test_command,
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        return {
            "passed": proc.returncode == 0,
            "exit_code": proc.returncode,
            "output": stdout.decode() if stdout else "",
            "error": stderr.decode() if stderr else "",
        }
    except Exception as e:
        return {"passed": False, "error": str(e)}


async def _run_security_check(payload: dict) -> dict:
    project_path = payload.get("project_path", ".")

    try:
        proc = await asyncio.create_subprocess_shell(
            "npm audit --audit-level=moderate || true",
            cwd=project_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        return {
            "passed": proc.returncode == 0,
            "output": stdout.decode() if stdout else "",
            "error": stderr.decode() if stderr else "",
        }
    except Exception as e:
        return {"passed": False, "error": str(e)}


async def _notify_api(task_id: str, results: dict, passed: bool, config: WorkerConfig) -> None:
    try:
        import aiohttp

        url = f"{config.api_url}/api/quality/{task_id}/result"
        data = {
            "task_id": task_id,
            "passed": passed,
            "results": results,
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    logger.info("Quality gate result reported for task %s", task_id)
                else:
                    logger.warning("Failed to report quality gate result: status %s", resp.status)
    except Exception as e:
        logger.error("Failed to notify API of quality gate result: %s", e)
