"""
SEO Optimizer API endpoints.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.seo import optimize_seo

router = APIRouter(prefix="/api/seo", tags=["seo"])


class SEORequest(BaseModel):
    keyword: str
    niche: str
    language: str = "id"
    title: str = ""


@router.post("/optimize")
async def seo_optimize(request: SEORequest):
    """Generate SEO-optimized title, description, and tags."""
    result = await optimize_seo(
        keyword=request.keyword,
        niche=request.niche,
        language=request.language,
        title=request.title,
    )
    return result
