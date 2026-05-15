"""
AI Hashtag Generator Service.
"""
import asyncio, json

async def get_setting(key: str) -> str | None:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = await cursor.fetchone()
        return row[0] if row else None
    finally:
        await db.close()

async def generate_hashtags(keyword: str, niche: str, language: str = "id", count: int = 30) -> dict:
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        return generate_fallback_hashtags(keyword, niche, language, count)
    from google import genai
    client = genai.Client(api_key=api_key)
    lang_text = "Bahasa Indonesia" if language == "id" else "English"
    prompt = f"""Generate optimized YouTube hashtags for: "{keyword}" in {niche} niche ({lang_text}).
Return JSON: {{"primary":["#tag1"],"secondary":["#tag2"],"trending":["#tag3"],"niche_specific":["#tag4"],"long_tail":["#tag5"],"total_count":30,"tips":["tip"],"best_combination":"#t1 #t2 #t3"}}
Primary=5 high-volume, Secondary=8, Trending=7, Niche=5, LongTail=5. Return ONLY JSON."""
    response = await asyncio.to_thread(client.models.generate_content, model="gemini-2.0-flash", contents=prompt)
    text = response.text.strip()
    if text.startswith("```"): text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try: return json.loads(text)
    except: return generate_fallback_hashtags(keyword, niche, language, count)

def generate_fallback_hashtags(keyword: str, niche: str, language: str, count: int) -> dict:
    words = keyword.lower().split()
    niche_tag = f"#{niche.lower().replace(' ', '')}"
    base = [f"#{w}" for w in words if len(w) > 2]
    trending = ["#viral", "#fyp", "#trending", "#viral2026", "#youtube", "#shorts", "#foryou"]
    return {"primary": (base + [niche_tag])[:5], "secondary": trending[:8],
            "trending": ["#trending2026", "#viraltoday", "#foryoupage", "#explore", "#youtubeshorts", "#new", "#hot"],
            "niche_specific": [niche_tag, f"{niche_tag}2026", f"#{words[0]}facts" if words else "#facts", f"#{niche.lower().replace(' ','')}tips", f"#best{niche.lower().replace(' ','')}"],
            "long_tail": [f"#{''.join(words[:2])}" if len(words)>=2 else "#content", f"#{keyword.replace(' ','').lower()[:15]}", f"#top{niche.lower().replace(' ','')}", f"#{words[0]}2026" if words else "#2026", "#mustwatch"],
            "total_count": 30, "tips": ["Use 3-5 hashtags in title", "Put rest in description", "Mix popular + niche"],
            "best_combination": " ".join((base + [niche_tag])[:5])}

async def analyze_hashtag_performance(hashtags: list[str], niche: str) -> list[dict]:
    results = []
    for tag in hashtags:
        tag_clean = tag.replace("#", "").lower()
        score = max(10, min(100, 100 - (len(tag_clean) * 3)))
        if any(w in tag_clean for w in ["viral", "trending", "fyp", "shorts"]): score = min(100, score + 20)
        results.append({"hashtag": tag, "estimated_reach": "high" if score > 70 else "medium" if score > 40 else "low", "competition": "high" if score > 70 else "medium" if score > 40 else "low", "score": score})
    return sorted(results, key=lambda x: x["score"], reverse=True)
