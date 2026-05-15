"""
Thumbnail Generator API endpoints.
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from services.thumbnail import generate_thumbnail_ai, generate_thumbnail_ffmpeg, generate_thumbnail_variants

router = APIRouter(prefix="/api/thumbnail", tags=["thumbnail"])

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "output")


class ThumbnailRequest(BaseModel):
    title: str
    niche: str
    video_id: int | None = None


class ThumbnailVariantsRequest(BaseModel):
    title: str
    niche: str
    video_id: int
    count: int = 3


@router.post("/generate")
async def generate_thumbnail(request: ThumbnailRequest):
    """Generate a single thumbnail."""
    video_id = request.video_id or 0
    output_dir = os.path.join(OUTPUT_DIR, f"video_{video_id}_thumbnails")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "thumbnail.png")

    try:
        path = await generate_thumbnail_ai(request.title, request.niche, output_path)

        # Update video record if video_id provided
        if request.video_id:
            db = await get_db()
            try:
                await db.execute(
                    "UPDATE videos SET thumbnail_path = ? WHERE id = ?",
                    (path, request.video_id)
                )
                await db.commit()
            finally:
                await db.close()

        return {
            "status": "ok",
            "path": path,
            "message": "Thumbnail generated successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate thumbnail: {str(e)}")


@router.post("/variants")
async def generate_variants(request: ThumbnailVariantsRequest):
    """Generate multiple thumbnail variants for A/B testing."""
    try:
        paths = await generate_thumbnail_variants(
            title=request.title,
            niche=request.niche,
            video_id=request.video_id,
            count=request.count,
        )
        return {
            "status": "ok",
            "thumbnails": paths,
            "count": len(paths),
            "message": f"Generated {len(paths)} thumbnail variants",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate thumbnails: {str(e)}")
