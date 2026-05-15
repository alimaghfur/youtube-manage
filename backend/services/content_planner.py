"""
AI Content Planner Service.
"""

import asyncio
import json
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


async def generate_content_plan(niche: str, language: str = "id", days: int = 30, videos_per_week: int = 5, style: str = "mixed") -> dict:
    """Generate a full content plan for N days."""
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        return generate_basic_plan(niche, language, days, videos_per_week)

    from google import genai
    client = genai.Client(api_key=api_key)
    lang_text = "Bahasa Indonesia" if language == "id" else "English"
    total_videos = (days // 7) * videos_per_week

    prompt = f"""You are a YouTube content strategist. Create a {days}-day content plan for a {niche} channel.
Language: {lang_text}. Videos per week: {videos_per_week}. Total: {total_videos}. Style: {style}.
Start date: {datetime.now().strftime('%Y-%m-%d')}

Return JSON:
{{"plan_name":"...","niche":"{niche}","total_videos":{total_videos},"strategy_notes":["..."],"best_upload_times":["10:00","15:00","19:00"],"growth_tips":["..."],"videos":[{{"title":"...","topic":"...","video_type":"slideshow","duration":"medium","day_offset":1,"tags":["..."],"hook":"...","target_audience":"..."}}]}}

Return ONLY JSON."""

    from services.gemini_helper import call_gemini
    text = await call_gemini(api_key, prompt)
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        plan = json.loads(text)
        start_date = datetime.now() + timedelta(days=1)
        for video in plan.get("videos", []):
            offset = video.get("day_offset", 1)
            video["scheduled_date"] = (start_date + timedelta(days=offset - 1)).strftime("%Y-%m-%d")
        return plan
    except json.JSONDecodeError:
        return generate_basic_plan(niche, language, days, videos_per_week)


def generate_basic_plan(niche: str, language: str, days: int, videos_per_week: int) -> dict:
    """Basic plan without AI."""
    total_videos = (days // 7) * videos_per_week
    start_date = datetime.now() + timedelta(days=1)
    videos = []
    for i in range(min(total_videos, 30)):
        day_offset = (i // videos_per_week) * 7 + (i % videos_per_week)
        videos.append({
            "title": f"Video {i+1} - {niche}", "topic": f"Topic {i+1}",
            "video_type": ["slideshow", "text-screen", "listicle"][i % 3],
            "duration": ["short", "medium", "long"][i % 3],
            "day_offset": day_offset + 1,
            "scheduled_date": (start_date + timedelta(days=day_offset)).strftime("%Y-%m-%d"),
            "tags": [niche.lower(), "trending"], "hook": "Did you know...", "target_audience": "General",
        })
    return {"plan_name": f"{niche} Content Plan", "niche": niche, "total_videos": len(videos),
            "strategy_notes": ["Post consistently", "Engage with comments", "Use trending hashtags"],
            "best_upload_times": ["10:00", "15:00", "19:00"],
            "growth_tips": ["Focus on watch time", "Create playlists"], "videos": videos}


async def analyze_competitors(channel_urls: list[str], niche: str, language: str = "id") -> dict:
    """Analyze competitor channels using AI."""
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        return {"error": "Gemini API key required"}
    from google import genai
    client = genai.Client(api_key=api_key)
    lang_text = "Bahasa Indonesia" if language == "id" else "English"
    prompt = f"""Analyze competitive landscape for "{niche}" niche. Language: {lang_text}.
Competitors: {', '.join(channel_urls) if channel_urls else 'General'}
Return JSON: {{"niche_overview":"...","content_gaps":["..."],"trending_formats":["..."],"title_patterns":["..."],"optimal_length":"...","growth_strategies":["..."],"differentiation_ideas":["..."],"keywords_to_target":["..."],"avoid":["..."]}}
Return ONLY JSON."""
    from services.gemini_helper import call_gemini
    text = await call_gemini(api_key, prompt)
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse response"}
