"""
Analytics & Revenue API endpoints.
"""

from fastapi import APIRouter
from services.analytics import get_analytics_overview, get_revenue_estimate, get_performance_by_niche

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def analytics_overview():
    """Get analytics overview."""
    return await get_analytics_overview()


@router.get("/revenue")
async def revenue_estimate():
    """Get estimated revenue."""
    return await get_revenue_estimate()


@router.get("/by-niche")
async def performance_by_niche():
    """Get performance grouped by niche."""
    data = await get_performance_by_niche()
    return {"niches": data}
