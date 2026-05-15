"""
Video Remix / Repurpose API endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.video_remix import create_shorts_from_video, change_aspect_ratio, create_highlight_reel

router = APIRouter(prefix="/api/remix", tags=["remix"])


class ShortsRequest(BaseModel):
    video_id: int
    clip_count: int = 3


class AspectRatioRequest(BaseModel):
    video_id: int
    ratio: str = "9:16"


class HighlightRequest(BaseModel):
    video_id: int
    duration: int = 30


@router.post("/shorts")
async def make_shorts(request: ShortsRequest):
    try:
        result = await create_shorts_from_video(request.video_id, request.clip_count)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/aspect-ratio")
async def convert_aspect_ratio(request: AspectRatioRequest):
    try:
        result = await change_aspect_ratio(request.video_id, request.ratio)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/highlight")
async def make_highlight(request: HighlightRequest):
    try:
        result = await create_highlight_reel(request.video_id, request.duration)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/formats")
async def get_formats():
    return {"formats": [
        {"id": "9:16", "name": "Vertical (Shorts/TikTok)", "resolution": "1080x1920"},
        {"id": "1:1", "name": "Square (Instagram)", "resolution": "1080x1080"},
        {"id": "4:5", "name": "Portrait (Instagram Feed)", "resolution": "1080x1350"},
    ]}
