"""
Background Music API endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.background_music import add_music_to_video_by_id, get_music_presets

router = APIRouter(prefix="/api/music", tags=["music"])


class MusicRequest(BaseModel):
    video_id: int
    preset: str = "ambient"
    volume: float = 0.1


@router.get("/presets")
async def list_presets():
    """Get available music presets."""
    return {"presets": get_music_presets()}


@router.post("/add")
async def add_music(request: MusicRequest):
    """Add background music to a video."""
    try:
        result = await add_music_to_video_by_id(
            video_id=request.video_id, preset=request.preset, volume=request.volume,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
