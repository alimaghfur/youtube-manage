"""
Upload API endpoints.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from services.youtube_upload import upload_to_youtube

router = APIRouter(prefix="/api/upload", tags=["upload"])


class UploadRequest(BaseModel):
    video_id: int
    title: str
    description: str
    tags: str = ""  # comma-separated
    category: str = "people"
    visibility: str = "public"


@router.post("/")
async def upload_video(request: UploadRequest):
    """Upload a video to YouTube."""
    db = await get_db()
    try:
        # Get video info
        cursor = await db.execute(
            "SELECT video_path, status FROM videos WHERE id = ?",
            (request.video_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")
        if row[0] is None:
            raise HTTPException(status_code=400, detail="Video file not found. Generate the video first.")
        if row[1] == "uploaded":
            raise HTTPException(status_code=400, detail="Video already uploaded")

        video_path = row[0]
        tags = [t.strip() for t in request.tags.split(",") if t.strip()]

        # Upload to YouTube
        result = await upload_to_youtube(
            video_path=video_path,
            title=request.title,
            description=request.description,
            tags=tags,
            category=request.category,
            visibility=request.visibility,
        )

        # Update video status
        if result.get("status") != "pending_auth":
            now = datetime.now().isoformat()
            await db.execute(
                "UPDATE videos SET status = ?, youtube_url = ?, uploaded_at = ? WHERE id = ?",
                ("uploaded", result.get("youtube_url", ""), now, request.video_id)
            )
            await db.commit()

        return result
    finally:
        await db.close()


@router.get("/ready")
async def get_ready_videos():
    """Get all videos that are ready to upload."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, title, keyword, niche, video_type, duration_target, created_at FROM videos WHERE status = 'ready' ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        videos = [dict(zip(columns, row)) for row in rows]
        return {"videos": videos}
    finally:
        await db.close()
