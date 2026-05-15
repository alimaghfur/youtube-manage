"""
Scheduler API endpoints.
"""

import json
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/api/scheduler", tags=["scheduler"])


class ScheduleCreate(BaseModel):
    upload_time: str  # HH:MM
    days: list[str]  # ["mon", "tue", ...]


class QueueAdd(BaseModel):
    video_id: int
    scheduled_date: str  # YYYY-MM-DD
    scheduled_time: str  # HH:MM


# --- Schedule CRUD ---

@router.get("/schedules")
async def get_schedules():
    """Get all schedules."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM schedules ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        schedules = []
        for row in rows:
            schedule = dict(zip(columns, row))
            schedule["days"] = json.loads(schedule["days"])
            schedules.append(schedule)
        return {"schedules": schedules}
    finally:
        await db.close()


@router.post("/schedules")
async def create_schedule(schedule: ScheduleCreate):
    """Create a new schedule."""
    db = await get_db()
    try:
        days_json = json.dumps(schedule.days)
        cursor = await db.execute(
            "INSERT INTO schedules (upload_time, days) VALUES (?, ?)",
            (schedule.upload_time, days_json)
        )
        await db.commit()
        return {"status": "ok", "id": cursor.lastrowid, "message": "Schedule created"}
    finally:
        await db.close()


@router.put("/schedules/{schedule_id}")
async def update_schedule(schedule_id: int, schedule: ScheduleCreate):
    """Update a schedule."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM schedules WHERE id = ?", (schedule_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Schedule not found")

        days_json = json.dumps(schedule.days)
        await db.execute(
            "UPDATE schedules SET upload_time = ?, days = ? WHERE id = ?",
            (schedule.upload_time, days_json, schedule_id)
        )
        await db.commit()
        return {"status": "ok", "message": "Schedule updated"}
    finally:
        await db.close()


@router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: int):
    """Delete a schedule."""
    db = await get_db()
    try:
        await db.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
        await db.commit()
        return {"status": "ok", "message": "Schedule deleted"}
    finally:
        await db.close()


@router.put("/schedules/{schedule_id}/toggle")
async def toggle_schedule(schedule_id: int):
    """Toggle schedule active/inactive."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT is_active FROM schedules WHERE id = ?", (schedule_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Schedule not found")

        new_status = 0 if row[0] else 1
        await db.execute(
            "UPDATE schedules SET is_active = ? WHERE id = ?",
            (new_status, schedule_id)
        )
        await db.commit()
        return {"status": "ok", "is_active": bool(new_status)}
    finally:
        await db.close()


# --- Queue Management ---

@router.get("/queue")
async def get_queue():
    """Get all items in the upload queue."""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT q.*, v.title, v.niche, v.video_type
            FROM queue q
            LEFT JOIN videos v ON q.video_id = v.id
            ORDER BY q.scheduled_date ASC, q.scheduled_time ASC
        """)
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        queue = [dict(zip(columns, row)) for row in rows]
        return {"queue": queue}
    finally:
        await db.close()


@router.post("/queue")
async def add_to_queue(item: QueueAdd):
    """Add a video to the upload queue."""
    db = await get_db()
    try:
        # Check if video exists and is ready
        cursor = await db.execute("SELECT status FROM videos WHERE id = ?", (item.video_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")
        if row[0] != "ready":
            raise HTTPException(status_code=400, detail="Video is not ready for upload")

        cursor = await db.execute(
            "INSERT INTO queue (video_id, scheduled_date, scheduled_time, status) VALUES (?, ?, ?, ?)",
            (item.video_id, item.scheduled_date, item.scheduled_time, "queued")
        )
        await db.commit()
        return {"status": "ok", "id": cursor.lastrowid, "message": "Added to queue"}
    finally:
        await db.close()


@router.delete("/queue/{queue_id}")
async def remove_from_queue(queue_id: int):
    """Remove an item from the upload queue."""
    db = await get_db()
    try:
        await db.execute("DELETE FROM queue WHERE id = ?", (queue_id,))
        await db.commit()
        return {"status": "ok", "message": "Removed from queue"}
    finally:
        await db.close()


@router.get("/next")
async def get_next_upload():
    """Get the next scheduled upload."""
    db = await get_db()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        cursor = await db.execute("""
            SELECT q.*, v.title
            FROM queue q
            LEFT JOIN videos v ON q.video_id = v.id
            WHERE q.status = 'queued' AND q.scheduled_date >= ?
            ORDER BY q.scheduled_date ASC, q.scheduled_time ASC
            LIMIT 1
        """, (today,))
        row = await cursor.fetchone()
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return {"message": "No upcoming uploads"}
    finally:
        await db.close()
