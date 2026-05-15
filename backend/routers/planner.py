"""
AI Content Planner & Competitor Analysis API endpoints.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.content_planner import generate_content_plan, analyze_competitors

router = APIRouter(prefix="/api/planner", tags=["planner"])


class PlanRequest(BaseModel):
    niche: str
    language: str = "id"
    days: int = 30
    videos_per_week: int = 5
    style: str = "mixed"


class CompetitorRequest(BaseModel):
    niche: str
    channel_urls: list[str] = []
    language: str = "id"


@router.post("/generate")
async def create_content_plan(request: PlanRequest):
    """Generate AI content plan."""
    plan = await generate_content_plan(
        niche=request.niche, language=request.language,
        days=request.days, videos_per_week=request.videos_per_week, style=request.style,
    )
    return plan


@router.post("/competitor-analysis")
async def competitor_analysis(request: CompetitorRequest):
    """Analyze competitors in your niche."""
    result = await analyze_competitors(
        channel_urls=request.channel_urls, niche=request.niche, language=request.language,
    )
    return result
