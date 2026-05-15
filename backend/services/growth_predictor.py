"""
Channel Growth Predictor & Audience Insights Service.
"""
import asyncio, json
from datetime import datetime, timedelta

async def get_setting(key: str) -> str | None:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = await cursor.fetchone()
        return row[0] if row else None
    finally:
        await db.close()

async def predict_growth(niche: str, videos_per_week: int = 5, current_subs: int = 0, months: int = 6) -> dict:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE status = 'uploaded'")
        uploaded = (await cursor.fetchone())[0]
    finally:
        await db.close()
    predictions = []
    subs = current_subs
    for m in range(1, months + 1):
        growth = int(videos_per_week * 4 * m * (1 + m * 0.1) * 5)
        subs += growth
        views = growth * 50
        revenue = views * 0.002
        predictions.append({"month": m, "estimated_subs": subs, "estimated_views": views, "estimated_revenue_usd": round(revenue, 2)})
    return {"monthly_predictions": predictions, "milestones": [{"subs": 100, "estimated_months": 1, "tip": "Keep posting"}, {"subs": 1000, "estimated_months": 3, "tip": "Apply for YPP"}, {"subs": 10000, "estimated_months": 8, "tip": "Diversify content"}],
        "growth_rate": "moderate", "niche_potential": "medium", "recommendations": ["Post consistently", "Optimize SEO", "Create Shorts", "Engage audience", "Collaborate"],
        "best_content_types": ["Listicles", "How-to", "Shorts"], "estimated_monetization_date": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d"),
        "risk_factors": ["Algorithm changes", "Niche saturation"], "strengths": ["AI consistency", "High volume"]}

async def get_audience_insights(niche: str, language: str = "id") -> dict:
    return {"demographics": {"age_groups": [{"range": "18-24", "percentage": 35}, {"range": "25-34", "percentage": 30}, {"range": "35-44", "percentage": 20}, {"range": "45+", "percentage": 15}], "gender_split": {"male": 60, "female": 40}, "top_countries": ["Indonesia", "Malaysia", "Singapore"] if language == "id" else ["USA", "UK", "India"]},
        "behavior": {"peak_hours": ["19:00-21:00", "12:00-14:00", "07:00-09:00"], "avg_watch_time": "3-5 minutes", "preferred_video_length": "5-10 minutes", "device_split": {"mobile": 75, "desktop": 20, "tv": 5}},
        "content_preferences": {"most_engaging_formats": ["Listicle", "How-to", "Story-based"], "preferred_thumbnails": "Bold text + bright colors", "cta_that_works": ["Subscribe at end", "Comment question"], "topics_in_demand": [f"{niche} terbaru", f"{niche} pemula", f"Rahasia {niche}"]},
        "engagement_tips": ["Post at peak hours", "Reply to comments within 1 hour", "Use community posts", "Create polls"]}

async def ab_test_titles(titles: list[str], niche: str, language: str = "id") -> list[dict]:
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        return [{"title": t, "score": 70 - i * 5, "ctr_estimate": "medium", "reason": "AI not configured", "improvement": "Add Gemini API key"} for i, t in enumerate(titles)]
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    prompt = f"""Score these YouTube titles for CTR (0-100). Niche: {niche}.
Titles: {json.dumps(titles)}
Return JSON array sorted best to worst: [{{"title":"...","score":85,"ctr_estimate":"high","reason":"why","improvement":"suggestion"}}]
Return ONLY JSON array."""
    model = genai.GenerativeModel("gemini-pro")
    response = await asyncio.to_thread(model.generate_content, prompt)
    text = response.text.strip()
    if text.startswith("```"): text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try: return json.loads(text)
    except: return [{"title": t, "score": 50, "reason": "Parse error"} for t in titles]
