import asyncio
import logging
import os
import signal
import sys
from datetime import datetime

from config import load_config
from worker import Worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("worker.main")


async def main() -> None:
    config = load_config()
    logger.info("Starting AgentDock Worker")
    logger.info("  Redis URL: %s", config.redis_url)
    logger.info("  API URL: %s", config.api_url)
    logger.info("  Concurrency: %s", config.concurrency)
    logger.info("  Environment: %s", config.node_env)

    worker = Worker(config)

    loop = asyncio.get_event_loop()
    shutdown_event = asyncio.Event()

    def handle_signal(sig: int) -> None:
        logger.info("Received signal %s, initiating graceful shutdown...", sig)
        shutdown_event.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, handle_signal, sig)

    await worker.start()

    try:
        await shutdown_event.wait()
    except asyncio.CancelledError:
        pass

    logger.info("Shutting down worker...")
    await worker.stop()
    logger.info("Worker stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
