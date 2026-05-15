"""
Analytics & Revenue Tracker Service.
"""

from datetime import datetime, timedelta


async def get_analytics_overview() -> dict:
    """Get overall analytics overview."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT status, COUNT(*) FROM videos GROUP BY status")
        status_counts = {row[0]: row[1] for row in await cursor.fetchall()}
        cursor = await db.execute("SELECT niche, COUNT(*) FROM videos WHERE niche IS NOT NULL GROUP BY niche ORDER BY COUNT(*) DESC")
        niche_counts = [{"niche": row[0], "count": row[1]} for row in await cursor.fetchall()]
        cursor = await db.execute("SELECT video_type, COUNT(*) FROM videos WHERE video_type IS NOT NULL GROUP BY video_type ORDER BY COUNT(*) DESC")
        type_counts = [{"type": row[0], "count": row[1]} for row in await cursor.fetchall()]

        weekly_data = []
        for i in range(4):
            start = (datetime.now() - timedelta(weeks=i+1)).strftime("%Y-%m-%d")
            end = (datetime.now() - timedelta(weeks=i)).strftime("%Y-%m-%d")
            cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE created_at BETWEEN ? AND ?", (start, end))
            count = (await cursor.fetchone())[0]
            weekly_data.append({"week": f"Week {4-i}", "videos": count})

        total = sum(status_counts.values()) if status_counts else 0
        uploaded = status_counts.get("uploaded", 0)
        success_rate = (uploaded / total * 100) if total > 0 else 0

        return {
            "overview": {"total_videos": total, "uploaded": uploaded, "ready": status_counts.get("ready", 0),
                         "failed": status_counts.get("failed", 0), "generating": status_counts.get("generating", 0),
                         "success_rate": round(success_rate, 1)},
            "by_niche": niche_counts, "by_type": type_counts, "weekly": weekly_data,
        }
    finally:
        await db.close()


async def get_revenue_estimate() -> dict:
    """Estimate potential revenue."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE status = 'uploaded'")
        uploaded = (await cursor.fetchone())[0]
        cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE status = 'uploaded' AND uploaded_at >= date('now', '-30 days')")
        monthly_uploads = (await cursor.fetchone())[0]

        estimate_low = uploaded * 100 * (1.0 / 1000)
        estimate_high = uploaded * 1000 * (5.0 / 1000)
        monthly_low = monthly_uploads * 100 * (1.0 / 1000)
        monthly_high = monthly_uploads * 1000 * (5.0 / 1000)

        return {
            "uploaded_videos": uploaded, "monthly_uploads": monthly_uploads,
            "estimated_revenue": {"total_low": round(estimate_low, 2), "total_high": round(estimate_high, 2),
                                  "monthly_low": round(monthly_low, 2), "monthly_high": round(monthly_high, 2), "currency": "USD"},
            "tips": ["Post consistently", "Target high-CPM niches", "Optimize for watch time", "Enable monetization at 1K subs"],
        }
    finally:
        await db.close()


async def get_performance_by_niche() -> list[dict]:
    """Get performance by niche."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT niche, COUNT(*) as total,
                   SUM(CASE WHEN status='uploaded' THEN 1 ELSE 0 END) as uploaded,
                   SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed
            FROM videos WHERE niche IS NOT NULL GROUP BY niche ORDER BY total DESC
        """)
        columns = [d[0] for d in cursor.description]
        return [dict(zip(columns, row)) for row in await cursor.fetchall()]
    finally:
        await db.close()
