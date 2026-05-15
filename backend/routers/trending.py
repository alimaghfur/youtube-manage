"""
Trending Topics API endpoints.
"""

from fastapi import APIRouter, Query
from services.trending import get_trending_keywords, get_trending_topics_ai

router = APIRouter(prefix="/api/trending", tags=["trending"])


@router.get("/keywords")
async def fetch_trending_keywords(
    niche: str = Query("", description="Niche to get keywords for"),
    language: str = Query("id", description="Language: id or en"),
    count: int = Query(20, description="Number of keywords to return"),
):
    """Get trending keywords from YouTube suggestions."""
    keywords = await get_trending_keywords(niche=niche, language=language, count=count)
    return {"keywords": keywords, "total": len(keywords)}


@router.get("/topics")
async def fetch_trending_topics(
    niche: str = Query("", description="Niche to get topics for"),
    language: str = Query("id", description="Language: id or en"),
    count: int = Query(10, description="Number of topics to return"),
):
    """Get AI-suggested trending video topics."""
    topics = await get_trending_topics_ai(niche=niche, language=language, count=count)
    return {"topics": topics, "total": len(topics)}
