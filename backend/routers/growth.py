"""
Growth Predictor & Audience Insights API endpoints.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from services.growth_predictor import predict_growth, get_audience_insights, ab_test_titles

router = APIRouter(prefix="/api/growth", tags=["growth"])


class GrowthRequest(BaseModel):
    niche: str
    videos_per_week: int = 5
    current_subs: int = 0
    months: int = 6


class AudienceRequest(BaseModel):
    niche: str
    language: str = "id"


class ABTestRequest(BaseModel):
    titles: list[str]
    niche: str
    language: str = "id"


@router.post("/predict")
async def growth_prediction(request: GrowthRequest):
    result = await predict_growth(request.niche, request.videos_per_week, request.current_subs, request.months)
    return result


@router.post("/audience")
async def audience_insights(request: AudienceRequest):
    result = await get_audience_insights(request.niche, request.language)
    return result


@router.post("/ab-test")
async def title_ab_test(request: ABTestRequest):
    results = await ab_test_titles(request.titles, request.niche, request.language)
    return {"results": results}
