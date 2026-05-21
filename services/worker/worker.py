import asyncio
import json
import logging
import time
import traceback
from datetime import datetime
from typing import Any

from config import WorkerConfig

from tasks.quality_gate import run_quality_gate
from tasks.git_operations import run_git_operations
from tasks.browser_cleanup import run_browser_cleanup
from tasks.notifications import send_notification

logger = logging.getLogger("worker")


class Worker:
    def __init__(self, config: WorkerConfig) -> None:
        self.config = config
        self.running = False
        self.tasks: dict[str, asyncio.Task] = {}
        self.stats = {
            "processed": 0,
            "failed": 0,
            "retried": 0,
            "started_at": datetime.utcnow().isoformat(),
        }
        self._redis_client: Any = None
        self._pubsub: Any = None

    async def start(self) -> None:
        logger.info("Worker starting with concurrency=%s", self.config.concurrency)
        self.running = True

        await self._connect_redis()

        for i in range(self.config.concurrency):
            task = asyncio.create_task(self._process_loop(i))
            self.tasks[f"worker-{i}"] = task

        logger.info("Worker started with %s workers", self.config.concurrency)

    async def stop(self) -> None:
        logger.info("Stopping worker...")
        self.running = False

        for name, task in self.tasks.items():
            logger.info("Cancelling task %s", name)
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        if self._redis_client:
            await self._redis_client.close()

        logger.info("Worker stopped. Stats: %s", self.stats)

    async def _connect_redis(self) -> None:
        try:
            import redis.asyncio as aioredis

            self._redis_client = aioredis.from_url(
                self.config.redis_url,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5,
            )
            await self._redis_client.ping()
            logger.info("Connected to Redis at %s", self.config.redis_url)
        except ImportError:
            logger.warning("redis.asyncio not available, using in-memory queue")
            self._redis_client = None
        except Exception as e:
            logger.error("Failed to connect to Redis: %s", e)
            self._redis_client = None

    async def _process_loop(self, worker_id: int) -> None:
        logger.info("Worker-%s process loop started", worker_id)

        while self.running:
            try:
                job = await self._dequeue_job()
                if job:
                    await self._process_job(job, worker_id)
                else:
                    await asyncio.sleep(1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Worker-%s error: %s", worker_id, e)
                await asyncio.sleep(self.config.retry_delay)

        logger.info("Worker-%s process loop ended", worker_id)

    async def _dequeue_job(self) -> dict | None:
        if self._redis_client:
            try:
                result = await self._redis_client.brpop(
                    "agentdock:jobs",
                    timeout=1,
                )
                if result:
                    _, job_data = result
                    return json.loads(job_data)
            except Exception as e:
                logger.error("Failed to dequeue job: %s", e)
        return None

    async def _process_job(self, job: dict, worker_id: int) -> None:
        job_id = job.get("id", "unknown")
        job_type = job.get("type", "unknown")
        attempt = job.get("attempt", 1)

        logger.info("Worker-%s processing job %s (type=%s, attempt=%s)", worker_id, job_id, job_type, attempt)

        start_time = time.time()

        try:
            await self._execute_job(job)

            duration = time.time() - start_time
            self.stats["processed"] += 1

            logger.info("Worker-%s completed job %s in %.2fs", worker_id, job_id, duration)

            await self._notify_job_completed(job_id, duration)

        except Exception as e:
            duration = time.time() - start_time
            self.stats["failed"] += 1

            error_msg = f"{type(e).__name__}: {e}"
            logger.error("Worker-%s failed job %s: %s", worker_id, job_id, error_msg)

            if attempt < self.config.max_retries:
                self.stats["retried"] += 1
                await self._requeue_job(job, attempt + 1)
                logger.info("Worker-%s requeued job %s (attempt %s/%s)", worker_id, job_id, attempt + 1, self.config.max_retries)
            else:
                await self._notify_job_failed(job_id, error_msg)

    async def _execute_job(self, job: dict) -> None:
        job_type = job.get("type")
        payload = job.get("payload", {})

        if job_type == "quality_gate":
            await run_quality_gate(payload, self.config)
        elif job_type == "git_operations":
            await run_git_operations(payload, self.config)
        elif job_type == "browser_cleanup":
            await run_browser_cleanup(payload, self.config)
        elif job_type == "notification":
            await send_notification(payload, self.config)
        elif job_type == "health_check":
            await self._run_health_checks()
        else:
            logger.warning("Unknown job type: %s", job_type)

    async def _requeue_job(self, job: dict, attempt: int) -> None:
        job["attempt"] = attempt
        job["retry_at"] = datetime.utcnow().isoformat()

        if self._redis_client:
            try:
                await self._redis_client.lpush(
                    "agentdock:jobs",
                    json.dumps(job),
                )
            except Exception as e:
                logger.error("Failed to requeue job: %s", e)

    async def _notify_job_completed(self, job_id: str, duration: float) -> None:
        if self._redis_client:
            try:
                await self._redis_client.publish(
                    "agentdock:job_events",
                    json.dumps({
                        "event": "job_completed",
                        "job_id": job_id,
                        "duration": duration,
                        "timestamp": datetime.utcnow().isoformat(),
                    }),
                )
            except Exception:
                pass

    async def _notify_job_failed(self, job_id: str, error: str) -> None:
        if self._redis_client:
            try:
                await self._redis_client.publish(
                    "agentdock:job_events",
                    json.dumps({
                        "event": "job_failed",
                        "job_id": job_id,
                        "error": error,
                        "timestamp": datetime.utcnow().isoformat(),
                    }),
                )
            except Exception:
                pass

    async def _run_health_checks(self) -> None:
        services = [
            ("api", self.config.api_url),
            ("agent-runtime", self.config.agent_runtime_url),
            ("browser-runtime", self.config.browser_runtime_url),
            ("gateway", self.config.gateway_url),
        ]

        for name, url in services:
            try:
                import aiohttp

                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{url}/health", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                        if resp.status == 200:
                            logger.debug("Health check passed for %s", name)
                        else:
                            logger.warning("Health check failed for %s: status %s", name, resp.status)
            except Exception as e:
                logger.warning("Health check error for %s: %s", name, e)

    def get_stats(self) -> dict:
        return {
            **self.stats,
            "running": self.running,
            "active_tasks": len(self.tasks),
            "uptime": (datetime.utcnow() - datetime.fromisoformat(self.stats["started_at"])).total_seconds(),
        }
