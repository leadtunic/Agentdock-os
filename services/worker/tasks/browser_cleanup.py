import asyncio
import logging
from typing import Any

from config import WorkerConfig

logger = logging.getLogger("worker.tasks.browser_cleanup")


async def run_browser_cleanup(payload: dict[str, Any], config: WorkerConfig) -> dict[str, Any]:
    session_ids = payload.get("session_ids", [])
    force = payload.get("force", False)

    logger.info("Running browser cleanup for %s sessions (force=%s)", len(session_ids), force)

    results = []

    for session_id in session_ids:
        try:
            result = await _close_browser_session(session_id, config)
            results.append(result)
        except Exception as e:
            results.append({
                "session_id": session_id,
                "success": False,
                "error": str(e),
            })

    if force:
        await _cleanup_browser_data(config)

    logger.info("Browser cleanup completed: %s/%s sessions closed", sum(1 for r in results if r.get("success")), len(results))

    return {
        "session_ids": session_ids,
        "results": results,
        "total": len(results),
        "successful": sum(1 for r in results if r.get("success")),
        "failed": sum(1 for r in results if not r.get("success")),
    }


async def _close_browser_session(session_id: str, config: WorkerConfig) -> dict:
    try:
        import aiohttp

        url = f"{config.browser_runtime_url}/api/sessions/{session_id}"

        async with aiohttp.ClientSession() as session:
            async with session.delete(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status in (200, 204):
                    return {"session_id": session_id, "success": True}
                else:
                    body = await resp.text()
                    return {
                        "session_id": session_id,
                        "success": False,
                        "status": resp.status,
                        "response": body,
                    }
    except Exception as e:
        return {"session_id": session_id, "success": False, "error": str(e)}


async def _cleanup_browser_data(config: WorkerConfig) -> None:
    browser_storage = "/data/browser"

    try:
        proc = await asyncio.create_subprocess_shell(
            f"find {browser_storage} -type f -mtime +1 -delete 2>/dev/null || true",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        logger.info("Cleaned up browser data older than 1 day")
    except Exception as e:
        logger.warning("Failed to cleanup browser data: %s", e)

    try:
        proc = await asyncio.create_subprocess_shell(
            f"find {browser_storage}/videos -type f -mtime +7 -delete 2>/dev/null || true",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        logger.info("Cleaned up browser videos older than 7 days")
    except Exception as e:
        logger.warning("Failed to cleanup browser videos: %s", e)
