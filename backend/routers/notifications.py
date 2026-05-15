"""
Notifications API endpoints.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from services.notifications import send_notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    type: str  # telegram, discord
    webhook_url: str
    events: list[str] = ["generate_complete", "upload_complete", "error"]


@router.get("/")
async def get_notifications():
    """Get all notification configurations."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM notifications ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        notifications = []
        for row in rows:
            n = dict(zip(columns, row))
            n["events"] = json.loads(n["events"]) if n["events"] else []
            notifications.append(n)
        return {"notifications": notifications}
    finally:
        await db.close()


@router.post("/")
async def create_notification(notif: NotificationCreate):
    """Create a notification channel."""
    db = await get_db()
    try:
        events_json = json.dumps(notif.events)
        cursor = await db.execute(
            "INSERT INTO notifications (type, webhook_url, events) VALUES (?, ?, ?)",
            (notif.type, notif.webhook_url, events_json)
        )
        await db.commit()
        return {"status": "ok", "id": cursor.lastrowid, "message": f"{notif.type} notification added"}
    finally:
        await db.close()


@router.delete("/{notif_id}")
async def delete_notification(notif_id: int):
    """Delete a notification channel."""
    db = await get_db()
    try:
        await db.execute("DELETE FROM notifications WHERE id = ?", (notif_id,))
        await db.commit()
        return {"status": "ok", "message": "Notification deleted"}
    finally:
        await db.close()


@router.put("/{notif_id}/toggle")
async def toggle_notification(notif_id: int):
    """Toggle notification active/inactive."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT is_active FROM notifications WHERE id = ?", (notif_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Notification not found")

        new_status = 0 if row[0] else 1
        await db.execute("UPDATE notifications SET is_active = ? WHERE id = ?", (new_status, notif_id))
        await db.commit()
        return {"status": "ok", "is_active": bool(new_status)}
    finally:
        await db.close()


@router.post("/test")
async def test_notification(notif: NotificationCreate):
    """Send a test notification."""
    try:
        # Temporarily create and send
        if notif.type == "telegram":
            from services.notifications import send_telegram
            await send_telegram(notif.webhook_url, "Test notification from Youtube Manage! If you see this, notifications are working.", {})
        elif notif.type == "discord":
            from services.notifications import send_discord
            await send_discord(notif.webhook_url, "Test notification from Youtube Manage! If you see this, notifications are working.", {})
        return {"status": "ok", "message": "Test notification sent!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to send: {str(e)}")


@router.get("/logs")
async def get_notification_logs(limit: int = 50):
    """Get notification logs."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT ?", (limit,)
        )
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        logs = [dict(zip(columns, row)) for row in rows]
        return {"logs": logs}
    finally:
        await db.close()
