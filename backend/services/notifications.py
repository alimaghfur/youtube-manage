"""
Notification Service.
Sends notifications via Telegram or Discord webhooks.
"""

import asyncio
import json
import requests
from datetime import datetime


async def send_notification(event: str, message: str, data: dict = None):
    """Send notification to all active notification channels."""
    from database import get_db

    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM notifications WHERE is_active = 1"
        )
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        notifications = [dict(zip(columns, row)) for row in rows]

        for notif in notifications:
            events = json.loads(notif["events"]) if notif["events"] else []
            if event not in events and "all" not in events:
                continue

            try:
                if notif["type"] == "telegram":
                    await send_telegram(notif["webhook_url"], message, data)
                elif notif["type"] == "discord":
                    await send_discord(notif["webhook_url"], message, data)

                # Log success
                await db.execute(
                    "INSERT INTO notification_logs (notification_id, event, message, status) VALUES (?, ?, ?, ?)",
                    (notif["id"], event, message, "sent")
                )
            except Exception as e:
                # Log failure
                await db.execute(
                    "INSERT INTO notification_logs (notification_id, event, message, status) VALUES (?, ?, ?, ?)",
                    (notif["id"], event, f"Failed: {str(e)}", "failed")
                )

        await db.commit()
    finally:
        await db.close()


async def send_telegram(bot_token_chat_id: str, message: str, data: dict = None):
    """
    Send Telegram notification.
    webhook_url format: "BOT_TOKEN:CHAT_ID"
    """
    parts = bot_token_chat_id.split(":", 1)
    if len(parts) != 2:
        raise ValueError("Invalid Telegram config. Format: BOT_TOKEN:CHAT_ID")

    # Actually format is "bot_token|chat_id" to avoid confusion with token colons
    if "|" in bot_token_chat_id:
        bot_token, chat_id = bot_token_chat_id.rsplit("|", 1)
    else:
        raise ValueError("Invalid Telegram config. Format: BOT_TOKEN|CHAT_ID")

    text = f"🎬 *Youtube Manage*\n\n{message}"
    if data:
        if data.get("title"):
            text += f"\n📹 Title: {data['title']}"
        if data.get("status"):
            text += f"\n📊 Status: {data['status']}"

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }

    await asyncio.to_thread(requests.post, url, json=payload)


async def send_discord(webhook_url: str, message: str, data: dict = None):
    """Send Discord webhook notification."""
    embed = {
        "title": "Youtube Manage",
        "description": message,
        "color": 0x3b82f6,  # Blue
        "timestamp": datetime.now().isoformat(),
        "fields": [],
    }

    if data:
        if data.get("title"):
            embed["fields"].append({"name": "Video", "value": data["title"], "inline": True})
        if data.get("status"):
            embed["fields"].append({"name": "Status", "value": data["status"], "inline": True})

    payload = {"embeds": [embed]}

    await asyncio.to_thread(requests.post, webhook_url, json=payload)


async def notify_generate_complete(video_title: str, video_id: int):
    """Notify when video generation is complete."""
    await send_notification(
        "generate_complete",
        f"Video generation complete!",
        {"title": video_title, "status": "ready", "video_id": video_id}
    )


async def notify_upload_complete(video_title: str, youtube_url: str = ""):
    """Notify when video upload is complete."""
    msg = f"Video uploaded to YouTube!"
    if youtube_url:
        msg += f"\n🔗 {youtube_url}"
    await send_notification(
        "upload_complete",
        msg,
        {"title": video_title, "status": "uploaded"}
    )


async def notify_error(error_message: str, context: str = ""):
    """Notify on error."""
    await send_notification(
        "error",
        f"Error: {error_message}\n{context}",
        {"status": "error"}
    )
