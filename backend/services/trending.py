"""
Trending Topics Service.
Fetches trending topics and keyword suggestions.
"""

import asyncio
import requests
import json


async def get_trending_keywords(niche: str = "", language: str = "id", count: int = 20) -> list[dict]:
    """
    Get trending keywords using YouTube search suggestions.
    Uses Google's autocomplete API (free, no key needed).
    """
    base_queries = {
        "Fakta Unik": ["fakta unik", "tahukah kamu", "fakta menarik", "fakta mengejutkan"],
        "Edukasi": ["cara", "tutorial", "belajar", "tips"],
        "Teknologi": ["teknologi terbaru", "review", "gadget", "AI"],
        "Motivasi": ["motivasi sukses", "kata bijak", "inspirasi", "semangat hidup"],
        "Kesehatan": ["tips kesehatan", "cara sehat", "diet", "olahraga"],
        "Sejarah": ["sejarah", "kisah", "peristiwa bersejarah", "masa lalu"],
        "Sains": ["sains", "eksperimen", "alam semesta", "penemuan"],
        "Bisnis": ["bisnis online", "cara menghasilkan uang", "usaha", "investasi"],
        "Gaming": ["game terbaru", "review game", "tips gaming", "gameplay"],
        "Kuliner": ["resep", "makanan viral", "review makanan", "cara masak"],
        "Travel": ["tempat wisata", "hidden gem", "jalan-jalan", "travel vlog"],
        "Olahraga": ["highlights", "berita olahraga", "tips olahraga", "workout"],
    }

    if language == "en":
        base_queries = {
            "Fakta Unik": ["amazing facts", "did you know", "interesting facts", "mind blowing"],
            "Edukasi": ["how to", "tutorial", "learn", "explained"],
            "Teknologi": ["tech news", "review", "gadget", "AI news"],
            "Motivasi": ["motivation", "success mindset", "inspiration", "life advice"],
            "Kesehatan": ["health tips", "healthy lifestyle", "diet", "fitness"],
            "Sejarah": ["history", "historical events", "ancient", "untold stories"],
            "Sains": ["science", "experiment", "universe", "discovery"],
            "Bisnis": ["business ideas", "make money online", "side hustle", "investing"],
            "Gaming": ["new game", "game review", "gaming tips", "gameplay"],
            "Kuliner": ["recipe", "viral food", "food review", "cooking"],
            "Travel": ["travel guide", "hidden gems", "best places", "travel vlog"],
            "Olahraga": ["highlights", "sports news", "workout", "training"],
        }

    queries = base_queries.get(niche, ["trending", "viral", "terbaru", "populer"])
    results = []

    for query in queries[:4]:
        try:
            suggestions = await get_youtube_suggestions(query, language)
            for s in suggestions[:5]:
                results.append({
                    "keyword": s,
                    "source": "youtube_suggest",
                    "niche": niche,
                    "query": query,
                })
        except Exception:
            continue

    # Remove duplicates
    seen = set()
    unique_results = []
    for r in results:
        if r["keyword"] not in seen:
            seen.add(r["keyword"])
            unique_results.append(r)

    return unique_results[:count]


async def get_youtube_suggestions(query: str, language: str = "id") -> list[str]:
    """Get YouTube autocomplete suggestions."""
    # Try multiple endpoints for reliability
    endpoints = [
        {
            "url": "https://suggestqueries.google.com/complete/search",
            "params": {"client": "firefox", "q": query, "hl": language, "ds": "yt"},
        },
        {
            "url": "https://clients1.google.com/complete/search",
            "params": {"client": "youtube", "q": query, "hl": language, "ds": "yt", "gs_ri": "youtube"},
        },
    ]

    for endpoint in endpoints:
        try:
            response = await asyncio.to_thread(
                requests.get,
                endpoint["url"],
                params=endpoint["params"],
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
                timeout=10,
            )
            if response.status_code != 200:
                continue

            text = response.text

            # Try parsing as JSON first (firefox client returns pure JSON)
            try:
                data = json.loads(text)
                if isinstance(data, list) and len(data) > 1:
                    suggestions = []
                    for item in data[1]:
                        if isinstance(item, str):
                            suggestions.append(item)
                        elif isinstance(item, list) and len(item) > 0:
                            suggestions.append(item[0] if isinstance(item[0], str) else str(item[0]))
                    return suggestions
            except json.JSONDecodeError:
                pass

            # Try JSONP parsing
            try:
                start = text.index("(") + 1
                end = text.rindex(")")
                data = json.loads(text[start:end])
                if isinstance(data, list) and len(data) > 1:
                    suggestions = []
                    for item in data[1]:
                        if isinstance(item, str):
                            suggestions.append(item)
                        elif isinstance(item, list) and len(item) > 0:
                            suggestions.append(item[0] if isinstance(item[0], str) else str(item[0]))
                    return suggestions
            except (ValueError, IndexError, json.JSONDecodeError):
                pass

        except Exception:
            continue

    # Fallback: generate suggestions locally based on niche
    return generate_fallback_suggestions(query, language)


def generate_fallback_suggestions(query: str, language: str) -> list[str]:
    """Generate fallback suggestions when API fails."""
    if language == "id":
        suffixes = [
            "terbaru 2026", "yang jarang diketahui", "fakta menarik",
            "tips dan trik", "untuk pemula", "paling viral",
            "yang wajib diketahui", "ternyata", "rahasia",
        ]
    else:
        suffixes = [
            "2026", "you didn't know", "facts",
            "tips and tricks", "for beginners", "most viral",
            "everyone should know", "actually", "secrets",
        ]
    return [f"{query} {s}" for s in suffixes[:5]]


async def get_trending_topics_ai(niche: str, language: str = "id", count: int = 10) -> list[dict]:
    """Use Gemini AI to suggest trending video topics."""
    from services.generator import get_setting

    api_key = await get_setting("gemini_api_key")
    if not api_key:
        return []

    from google import genai
    client = genai.Client(api_key=api_key)

    lang_text = "Bahasa Indonesia" if language == "id" else "English"

    prompt = f"""Suggest {count} trending YouTube video topics for the "{niche}" niche.
Language: {lang_text}

For each topic, provide:
1. A catchy video title
2. A brief description of the content
3. Estimated search volume (high/medium/low)
4. Competition level (high/medium/low)

Return as JSON array:
[
  {{
    "title": "Video title here",
    "description": "Brief content description",
    "search_volume": "high",
    "competition": "medium",
    "keywords": ["keyword1", "keyword2"]
  }}
]

Return ONLY the JSON array, no other text."""

    from services.gemini_helper import call_gemini
    text = await call_gemini(api_key, prompt)
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]

    try:
        topics = json.loads(text)
        return topics
    except json.JSONDecodeError:
        return []
