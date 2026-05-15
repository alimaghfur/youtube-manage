"""
Bulk Generate API endpoints.
"""

import asyncio
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from database import get_db
from routers.generate import run_generation, generation_progress, GenerateRequest

router = APIRouter(prefix="/api/bulk", tags=["bulk"])


class BulkGenerateRequest(BaseModel):
    keywords: list[str]
    niche: str
    video_type: str = "slideshow"
    language: str = "id"
    voice_engine: str = "edge-tts"
    duration_target: str = "medium"


class BulkFromTrendingRequest(BaseModel):
    niche: str
    count: int = 5
    video_type: str = "slideshow"
    language: str = "id"
    voice_engine: str = "edge-tts"
    duration_target: str = "medium"


@router.post("/generate")
async def bulk_generate(request: BulkGenerateRequest, background_tasks: BackgroundTasks):
    """Generate multiple videos at once from a list of keywords."""
    db = await get_db()
    video_ids = []

    try:
        for keyword in request.keywords:
            cursor = await db.execute(
                """INSERT INTO videos (keyword, niche, video_type, language, voice_engine, duration_target, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (keyword, request.niche, request.video_type, request.language,
                 request.voice_engine, request.duration_target, "generating")
            )
            video_id = cursor.lastrowid
            video_ids.append(video_id)

            # Initialize progress
            generation_progress[video_id] = {
                "status": "generating",
                "progress": 0,
                "step": "Queued...",
            }

        await db.commit()
    finally:
        await db.close()

    # Start generation for each video in background (sequentially to avoid rate limits)
    background_tasks.add_task(run_bulk_generation, video_ids, request)

    return {
        "status": "ok",
        "video_ids": video_ids,
        "total": len(video_ids),
        "message": f"Started generating {len(video_ids)} videos",
    }


async def run_bulk_generation(video_ids: list[int], request: BulkGenerateRequest):
    """Run bulk generation sequentially."""
    from services.generator import generate_video_pipeline
    from routers.generate import update_progress

    for i, video_id in enumerate(video_ids):
        generation_progress[video_id]["step"] = f"Processing ({i+1}/{len(video_ids)})..."

        # Get keyword for this video
        db = await get_db()
        try:
            cursor = await db.execute("SELECT keyword FROM videos WHERE id = ?", (video_id,))
            row = await cursor.fetchone()
            keyword = row[0] if row else request.keywords[i] if i < len(request.keywords) else ""
        finally:
            await db.close()

        try:
            await generate_video_pipeline(
                video_id=video_id,
                keyword=keyword,
                niche=request.niche,
                video_type=request.video_type,
                language=request.language,
                voice_engine=request.voice_engine,
                duration_target=request.duration_target,
                progress_callback=update_progress,
            )
        except Exception as e:
            generation_progress[video_id] = {
                "status": "failed",
                "progress": 0,
                "step": f"Error: {str(e)}",
            }

        # Small delay between generations to avoid rate limits
        await asyncio.sleep(2)


@router.post("/from-trending")
async def bulk_from_trending(request: BulkFromTrendingRequest, background_tasks: BackgroundTasks):
    """Generate videos from trending keywords automatically."""
    from services.trending import get_trending_keywords

    # Get trending keywords
    keywords_data = await get_trending_keywords(
        niche=request.niche,
        language=request.language,
        count=request.count,
    )

    keywords = [k["keyword"] for k in keywords_data[:request.count]]

    if not keywords:
        return {"status": "error", "message": "No trending keywords found for this niche"}

    # Use bulk generate
    bulk_request = BulkGenerateRequest(
        keywords=keywords,
        niche=request.niche,
        video_type=request.video_type,
        language=request.language,
        voice_engine=request.voice_engine,
        duration_target=request.duration_target,
    )

    return await bulk_generate(bulk_request, background_tasks)


@router.get("/progress")
async def get_bulk_progress():
    """Get progress of all generating videos."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, keyword, status FROM videos WHERE status = 'generating' ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        generating = []
        for row in rows:
            video = dict(zip(columns, row))
            video_id = video["id"]
            if video_id in generation_progress:
                video["progress"] = generation_progress[video_id]
            else:
                video["progress"] = {"status": "generating", "progress": 0, "step": "Queued"}
            generating.append(video)

        return {"generating": generating, "total": len(generating)}
    finally:
        await db.close()
