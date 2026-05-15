"""
SEO Optimizer Service.
Generates SEO-optimized titles, descriptions, and tags.
"""

import asyncio
import json


async def get_setting(key: str) -> str | None:
    """Get a setting value from database."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = await cursor.fetchone()
        return row[0] if row else None
    finally:
        await db.close()


async def optimize_seo(keyword: str, niche: str, language: str = "id", title: str = "") -> dict:
    """
    Generate SEO-optimized title, description, and tags using Gemini AI.
    """
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        # Fallback: basic SEO without AI
        return generate_basic_seo(keyword, niche, language, title)

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    lang_text = "Bahasa Indonesia" if language == "id" else "English"

    prompt = f"""You are a YouTube SEO expert. Optimize the following video for maximum discoverability.

Video keyword/topic: "{keyword}"
Niche: {niche}
Language: {lang_text}
{"Current title: " + title if title else ""}

Generate:
1. 5 SEO-optimized title options (catchy, keyword-rich, under 60 chars)
2. An optimized description (500-800 chars, keyword-rich, with CTA)
3. 20 relevant tags/keywords
4. 5 relevant hashtags

Return as JSON:
{{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "description": "Full optimized description here...",
  "tags": ["tag1", "tag2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "tips": ["SEO tip 1", "SEO tip 2", "SEO tip 3"]
}}

Return ONLY the JSON, no other text."""

    model = genai.GenerativeModel("gemini-pro")
    response = await asyncio.to_thread(model.generate_content, prompt)

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]

    try:
        result = json.loads(text)
        return result
    except json.JSONDecodeError:
        return generate_basic_seo(keyword, niche, language, title)


def generate_basic_seo(keyword: str, niche: str, language: str, title: str = "") -> dict:
    """Generate basic SEO without AI (fallback)."""
    base_title = title or keyword

    if language == "id":
        titles = [
            f"{base_title} - Yang Jarang Diketahui!",
            f"{base_title} | Fakta Mengejutkan",
            f"Terungkap! {base_title}",
            f"{base_title} - Wajib Tahu!",
            f"5 Hal Tentang {base_title} Yang Bikin Kaget",
        ]
        desc = f"""{base_title}

Dalam video ini kita akan membahas tentang {keyword} yang sangat menarik untuk disimak.

Jangan lupa SUBSCRIBE, LIKE, dan SHARE video ini!

#{niche.replace(' ', '')} #{keyword.split()[0] if keyword.split() else 'video'} #viral"""
    else:
        titles = [
            f"{base_title} - You Won't Believe This!",
            f"{base_title} | Shocking Facts",
            f"The Truth About {base_title}",
            f"{base_title} - Must Watch!",
            f"5 Things About {base_title} That Will Blow Your Mind",
        ]
        desc = f"""{base_title}

In this video, we explore {keyword} and discover fascinating insights.

Don't forget to SUBSCRIBE, LIKE, and SHARE!

#{niche.replace(' ', '')} #{keyword.split()[0] if keyword.split() else 'video'} #viral"""

    words = keyword.lower().split()
    tags = words + [niche.lower(), "youtube", "viral", "trending"] + [f"{w} {niche.lower()}" for w in words[:3]]

    return {
        "titles": titles,
        "description": desc,
        "tags": list(set(tags))[:20],
        "hashtags": [f"#{niche.replace(' ', '')}", f"#{words[0]}" if words else "#video", "#viral", "#trending", "#youtube"],
        "tips": [
            "Use the keyword in the first 60 characters of the title",
            "Include the main keyword in the first 2 lines of description",
            "Add 3-5 hashtags at the end of description",
        ],
    }
