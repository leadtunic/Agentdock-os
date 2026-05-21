import asyncio
import json
import logging
from typing import Any

from config import WorkerConfig

logger = logging.getLogger("worker.tasks.notifications")


async def send_notification(payload: dict[str, Any], config: WorkerConfig) -> dict[str, Any]:
    channel = payload.get("channel", "log")
    recipient = payload.get("recipient")
    subject = payload.get("subject", "AgentDock Notification")
    content = payload.get("content", "")

    logger.info("Sending notification via %s to %s", channel, recipient or "broadcast")

    result = {"channel": channel, "recipient": recipient, "sent": False}

    try:
        if channel == "telegram":
            result = await _send_telegram_notification(recipient, content, config)
        elif channel == "discord":
            result = await _send_discord_notification(recipient, content, config)
        elif channel == "slack":
            result = await _send_slack_notification(recipient, content, config)
        elif channel == "email":
            result = await _send_email_notification(recipient, subject, content, config)
        elif channel == "webhook":
            result = await _send_webhook_notification(recipient, payload, config)
        else:
            logger.info("Notification [%s]: %s", subject, content)
            result["sent"] = True

    except Exception as e:
        result["error"] = str(e)
        logger.error("Failed to send notification: %s", e)

    return result


async def _send_telegram_notification(chat_id: str | None, content: str, config: WorkerConfig) -> dict:
    token = config.__dict__.get("telegram_bot_token") or __import__("os").getenv("TELEGRAM_BOT_TOKEN")
    if not token or not chat_id:
        return {"channel": "telegram", "sent": False, "reason": "Token or chat_id not configured"}

    try:
        import aiohttp

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": content,
            "parse_mode": "Markdown",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return {"channel": "telegram", "sent": resp.status == 200, "status": resp.status}
    except Exception as e:
        return {"channel": "telegram", "sent": False, "error": str(e)}


async def _send_discord_notification(channel_id: str | None, content: str, config: WorkerConfig) -> dict:
    token = __import__("os").getenv("DISCORD_BOT_TOKEN")
    if not token or not channel_id:
        return {"channel": "discord", "sent": False, "reason": "Token or channel_id not configured"}

    try:
        import aiohttp

        url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
        headers = {
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json={"content": content}, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return {"channel": "discord", "sent": resp.status == 200, "status": resp.status}
    except Exception as e:
        return {"channel": "discord", "sent": False, "error": str(e)}


async def _send_slack_notification(channel: str | None, content: str, config: WorkerConfig) -> dict:
    token = __import__("os").getenv("SLACK_BOT_TOKEN")
    if not token or not channel:
        return {"channel": "slack", "sent": False, "reason": "Token or channel not configured"}

    try:
        import aiohttp

        url = "https://slack.com/api/chat.postMessage"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json={"channel": channel, "text": content}, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return {"channel": "slack", "sent": resp.status == 200, "status": resp.status}
    except Exception as e:
        return {"channel": "slack", "sent": False, "error": str(e)}


async def _send_email_notification(to: str | None, subject: str, content: str, config: WorkerConfig) -> dict:
    smtp_host = __import__("os").getenv("SMTP_HOST")
    if not smtp_host or not to:
        return {"channel": "email", "sent": False, "reason": "SMTP not configured or recipient missing"}

    try:
        import smtplib
        from email.mime.text import MIMEText

        msg = MIMEText(content, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = __import__("os").getenv("SMTP_FROM", "AgentDock <noreply@agentdock.ai>")
        msg["To"] = to

        smtp_port = int(__import__("os").getenv("SMTP_PORT", "587"))
        smtp_user = __import__("os").getenv("SMTP_USER")
        smtp_password = __import__("os").getenv("SMTP_PASSWORD")

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(msg)

        return {"channel": "email", "sent": True}
    except Exception as e:
        return {"channel": "email", "sent": False, "error": str(e)}


async def _send_webhook_notification(url: str | None, payload: dict, config: WorkerConfig) -> dict:
    if not url:
        return {"channel": "webhook", "sent": False, "reason": "URL not provided"}

    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return {"channel": "webhook", "sent": resp.status < 400, "status": resp.status}
    except Exception as e:
        return {"channel": "webhook", "sent": False, "error": str(e)}
