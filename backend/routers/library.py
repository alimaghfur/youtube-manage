"""
Library API endpoints.
"""

import os
from fastapi import APIRouter, HTTPException, Query
from database import get_db

router = APIRouter(prefix="/api/library", tags=["library"])


@router.get("/")
async def get_videos(
    status: str = Query(None, description="Filter by status: ready, uploaded, generating, failed"),
    limit: int = Query(50, description="Max number of videos to return"),
    offset: int = Query(0, description="Offset for pagination"),
):
    """Get all videos from library."""
    db = await get_db()
    try:
        query = "SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params = [limit, offset]

        if status:
            query = "SELECT * FROM videos WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params = [status, limit, offset]

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()

        # Get column names
        columns = [description[0] for description in cursor.description]
        videos = [dict(zip(columns, row)) for row in rows]

        # Get total count
        count_query = "SELECT COUNT(*) FROM videos"
        if status:
            count_query += " WHERE status = ?"
            count_cursor = await db.execute(count_query, (status,))
        else:
            count_cursor = await db.execute(count_query)
        total = (await count_cursor.fetchone())[0]

        return {
            "videos": videos,
            "total": total,
            "limit": limit,
            "offset": offset,
        }
    finally:
        await db.close()


@router.get("/{video_id}")
async def get_video(video_id: int):
    """Get a single video by ID."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        columns = [description[0] for description in cursor.description]
        return dict(zip(columns, row))
    finally:
        await db.close()


@router.delete("/{video_id}")
async def delete_video(video_id: int):
    """Delete a video and its files."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT video_path FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        # Delete video file if exists
        video_path = row[0]
        if video_path and os.path.exists(video_path):
            # Delete the entire video directory
            video_dir = os.path.dirname(video_path)
            import shutil
            shutil.rmtree(video_dir, ignore_errors=True)

        # Delete from queue
        await db.execute("DELETE FROM queue WHERE video_id = ?", (video_id,))
        # Delete from videos table
        await db.execute("DELETE FROM videos WHERE id = ?", (video_id,))
        await db.commit()

        return {"status": "ok", "message": f"Video {video_id} deleted"}
    finally:
        await db.close()


@router.put("/{video_id}")
async def update_video(video_id: int, data: dict):
    """Update video metadata (title, description, etc.)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        allowed_fields = ["title", "niche", "status"]
        updates = []
        values = []
        for key, value in data.items():
            if key in allowed_fields:
                updates.append(f"{key} = ?")
                values.append(value)

        if updates:
            values.append(video_id)
            await db.execute(
                f"UPDATE videos SET {', '.join(updates)} WHERE id = ?",
                values
            )
            await db.commit()

        return {"status": "ok", "message": f"Video {video_id} updated"}
    finally:
        await db.close()
