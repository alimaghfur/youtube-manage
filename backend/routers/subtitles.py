"""
Subtitle Generator API endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.subtitle import generate_subtitles_for_video

router = APIRouter(prefix="/api/subtitles", tags=["subtitles"])


class SubtitleRequest(BaseModel):
    video_id: int
    style: str = "default"  # default, bold, minimal, colorful


@router.post("/generate")
async def generate_subtitles(request: SubtitleRequest):
    """Generate and burn subtitles into a video."""
    try:
        result = await generate_subtitles_for_video(
            video_id=request.video_id, style=request.style,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/styles")
async def list_styles():
    """Get available subtitle styles."""
    return {
        "styles": [
            {"id": "default", "name": "Default", "description": "White text with black outline"},
            {"id": "bold", "name": "Bold", "description": "Large bold white text with strong outline"},
            {"id": "minimal", "name": "Minimal", "description": "Small clean text with light shadow"},
            {"id": "colorful", "name": "Colorful", "description": "Cyan colored bold text"},
        ]
    }
