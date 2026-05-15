"""
Hashtag Generator API endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from services.hashtag import generate_hashtags, analyze_hashtag_performance

router = APIRouter(prefix="/api/hashtags", tags=["hashtags"])


class HashtagRequest(BaseModel):
    keyword: str
    niche: str
    language: str = "id"
    count: int = 30


class AnalyzeRequest(BaseModel):
    hashtags: list[str]
    niche: str


@router.post("/generate")
async def gen_hashtags(request: HashtagRequest):
    result = await generate_hashtags(request.keyword, request.niche, request.language, request.count)
    return result


@router.post("/analyze")
async def analyze_hashtags(request: AnalyzeRequest):
    results = await analyze_hashtag_performance(request.hashtags, request.niche)
    return {"results": results}
