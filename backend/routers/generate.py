"""
Generate Video API endpoints.
"""

import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from database import get_db
from services.generator import generate_video_pipeline

router = APIRouter(prefix="/api/generate", tags=["generate"])

# Store progress info in memory
generation_progress: dict[int, dict] = {}


class GenerateRequest(BaseModel):
    keyword: str
    niche: str
    video_type: str  # slideshow, text-screen, listicle
    language: str = "id"
    voice_engine: str = "edge-tts"
    duration_target: str = "medium"


class GenerateResponse(BaseModel):
    video_id: int
    status: str
    message: str


async def update_progress(video_id: int, status: str, progress: int, step: str):
    """Callback to update generation progress."""
    generation_progress[video_id] = {
        "status": status,
        "progress": progress,
        "step": step,
    }


async def run_generation(video_id: int, request: GenerateRequest):
    """Background task for video generation."""
    try:
        await generate_video_pipeline(
            video_id=video_id,
            keyword=request.keyword,
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


@router.post("/", response_model=GenerateResponse)
async def start_generation(request: GenerateRequest, background_tasks: BackgroundTasks):
    """Start video generation process."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO videos (keyword, niche, video_type, language, voice_engine, duration_target, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (request.keyword, request.niche, request.video_type, request.language,
             request.voice_engine, request.duration_target, "generating")
        )
        await db.commit()
        video_id = cursor.lastrowid

        # Initialize progress
        generation_progress[video_id] = {
            "status": "generating",
            "progress": 0,
            "step": "Starting...",
        }

        # Start generation in background
        background_tasks.add_task(run_generation, video_id, request)

        return GenerateResponse(
            video_id=video_id,
            status="generating",
            message="Video generation started!",
        )
    finally:
        await db.close()


@router.get("/progress/{video_id}")
async def get_progress(video_id: int):
    """Get generation progress for a video."""
    if video_id in generation_progress:
        return generation_progress[video_id]

    # Check database
    db = await get_db()
    try:
        cursor = await db.execute("SELECT status FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if row:
            return {
                "status": row[0],
                "progress": 100 if row[0] == "ready" else 0,
                "step": "Complete" if row[0] == "ready" else row[0],
            }
        raise HTTPException(status_code=404, detail="Video not found")
    finally:
        await db.close()
