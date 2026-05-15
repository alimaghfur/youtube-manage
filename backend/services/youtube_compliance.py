"""
YouTube Compliance Service.
Ensures generated content follows YouTube's guidelines:
- AI disclosure in description
- Unique value injection (timestamps, CTAs, engagement hooks)
- Content variation (avoid repetitive patterns)
- Metadata best practices
"""

import random
import json
from datetime import datetime


# YouTube required AI disclosure texts
AI_DISCLOSURES = {
    "id": "\n\n---\nVideo ini dibuat dengan bantuan teknologi AI untuk narasi dan visual. Konten telah diedit dan dikurasi oleh kreator.\nAltered or synthetic content: AI-assisted narration and visuals.",
    "en": "\n\n---\nThis video uses AI-assisted narration and visuals. Content has been edited and curated by the creator.\nAltered or synthetic content: AI-assisted narration and visuals.",
}

# Engagement hooks to make content unique
ENGAGEMENT_HOOKS = {
    "id": {
        "intro": [
            "Halo! Sebelum mulai, pastikan kamu subscribe dan nyalakan loncengnya ya!",
            "Hai semuanya! Di video kali ini kita akan bahas sesuatu yang menarik banget.",
            "Selamat datang kembali di channel ini! Kali ini topiknya seru banget.",
            "Penasaran? Yuk langsung aja kita bahas!",
            "Siap-siap, karena informasi ini bakal bikin kamu terkejut!",
        ],
        "mid": [
            "Nah, kalau kamu suka konten kayak gini, jangan lupa like dan share ya!",
            "Gimana menurut kamu? Tulis di kolom komentar!",
            "Menarik kan? Masih ada lagi nih yang lebih seru.",
            "Kalau kamu setuju, kasih double tap!",
        ],
        "outro": [
            "Terima kasih sudah nonton sampai akhir! Jangan lupa subscribe!",
            "Kalau suka video ini, like dan share ke teman-teman kamu ya!",
            "Sampai jumpa di video berikutnya! Bye bye!",
            "Jangan lupa cek video lainnya di channel ini. See you!",
            "Comment di bawah topik apa yang kamu mau bahas selanjutnya!",
        ],
    },
    "en": {
        "intro": [
            "Hey everyone! Before we start, make sure to subscribe and hit that bell!",
            "Welcome back! Today we're diving into something really interesting.",
            "What's up guys! You're gonna love today's topic.",
            "Ready? Let's jump right in!",
            "Get ready, because this information will surprise you!",
        ],
        "mid": [
            "If you're enjoying this, drop a like and share with friends!",
            "What do you think? Let me know in the comments!",
            "Pretty interesting, right? There's more coming up.",
            "If you agree, smash that like button!",
        ],
        "outro": [
            "Thanks for watching until the end! Don't forget to subscribe!",
            "If you liked this video, like and share with your friends!",
            "See you in the next one! Peace out!",
            "Don't forget to check out my other videos. See you!",
            "Comment below what topic you want me to cover next!",
        ],
    },
}

# Unique timestamp format templates
TIMESTAMP_TEMPLATES = {
    "id": "Timestamps:\n{timestamps}",
    "en": "Timestamps:\n{timestamps}",
}


def generate_compliant_description(
    title: str,
    keyword: str,
    niche: str,
    language: str = "id",
    tags: list[str] = None,
    scenes: list[dict] = None,
) -> str:
    """Generate a YouTube-compliant description with AI disclosure and unique content."""
    if tags is None:
        tags = []
    if scenes is None:
        scenes = []

    lang = language if language in ["id", "en"] else "id"
    parts = []

    # 1. Video description (first 2 lines most important for SEO)
    if lang == "id":
        parts.append(f"{title}\n\nDalam video ini, kita membahas tentang {keyword} yang sangat menarik untuk disimak.")
    else:
        parts.append(f"{title}\n\nIn this video, we explore {keyword} and discover fascinating insights.")

    # 2. Timestamps (if scenes available)
    if scenes:
        timestamps = generate_timestamps(scenes, language)
        parts.append(f"\n{timestamps}")

    # 3. Engagement CTA
    if lang == "id":
        parts.append("\nJangan lupa SUBSCRIBE, LIKE, dan SHARE video ini ke teman-teman kamu!")
        parts.append("Comment di bawah pendapat kamu tentang topik ini!")
    else:
        parts.append("\nDon't forget to SUBSCRIBE, LIKE, and SHARE this video!")
        parts.append("Comment below your thoughts on this topic!")

    # 4. Tags as hashtags (max 15)
    if tags:
        hashtags = [f"#{t.replace(' ', '')}" for t in tags[:15]]
        parts.append(f"\n{' '.join(hashtags)}")

    # 5. AI Disclosure (REQUIRED by YouTube)
    parts.append(AI_DISCLOSURES[lang])

    return "\n".join(parts)


def generate_timestamps(scenes: list[dict], language: str = "id") -> str:
    """Generate timestamps for video chapters."""
    timestamps = []
    current_time = 0

    for i, scene in enumerate(scenes):
        # Estimate duration per scene (roughly 15-30 seconds per scene)
        minutes = current_time // 60
        seconds = current_time % 60
        time_str = f"{int(minutes):02d}:{int(seconds):02d}"

        # Create chapter title from narration
        narration = scene.get("narration", f"Part {i+1}")
        chapter_title = narration[:50].split(".")[0] if narration else f"Part {i+1}"

        timestamps.append(f"{time_str} - {chapter_title}")
        current_time += random.randint(15, 35)  # Estimated scene duration

    return "\n".join(timestamps)


def inject_engagement_hooks(script_data: dict, language: str = "id") -> dict:
    """Inject engagement hooks into script to make content more human and engaging."""
    lang = language if language in ENGAGEMENT_HOOKS else "id"
    hooks = ENGAGEMENT_HOOKS[lang]
    scenes = script_data.get("scenes", [])

    if not scenes:
        return script_data

    enhanced_scenes = []

    # Add intro hook to first scene
    if scenes:
        intro_hook = random.choice(hooks["intro"])
        first_scene = scenes[0].copy()
        first_scene["narration"] = f"{intro_hook} {first_scene.get('narration', '')}"
        enhanced_scenes.append(first_scene)

    # Middle scenes - occasionally add mid hooks
    for i, scene in enumerate(scenes[1:-1], 1):
        s = scene.copy()
        # Add mid-hook every 3-4 scenes
        if i > 0 and i % random.randint(3, 4) == 0:
            mid_hook = random.choice(hooks["mid"])
            s["narration"] = f"{s.get('narration', '')} {mid_hook}"
        enhanced_scenes.append(s)

    # Add outro hook to last scene
    if len(scenes) > 1:
        outro_hook = random.choice(hooks["outro"])
        last_scene = scenes[-1].copy()
        last_scene["narration"] = f"{last_scene.get('narration', '')} {outro_hook}"
        enhanced_scenes.append(last_scene)

    script_data["scenes"] = enhanced_scenes
    return script_data


def add_content_variation(script_data: dict, video_id: int) -> dict:
    """Add unique elements to each video to avoid repetitive content patterns."""
    scenes = script_data.get("scenes", [])

    if not scenes:
        return script_data

    # 1. Randomize scene order slightly (not first/last, just middle)
    if len(scenes) > 4:
        middle = scenes[1:-1]
        # Slight shuffle (swap 1-2 adjacent scenes)
        if len(middle) > 2:
            idx = random.randint(0, len(middle) - 2)
            middle[idx], middle[idx + 1] = middle[idx + 1], middle[idx]
        script_data["scenes"] = [scenes[0]] + middle + [scenes[-1]]

    # 2. Add unique identifier (makes each video different even with same topic)
    script_data["_unique_seed"] = f"{video_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{random.randint(1000, 9999)}"

    return script_data


def generate_compliant_tags(keyword: str, niche: str, language: str = "id", extra_tags: list[str] = None) -> list[str]:
    """Generate YouTube-compliant tags (max 500 chars total, relevant only)."""
    if extra_tags is None:
        extra_tags = []

    base_tags = [keyword]

    # Add keyword variations
    words = keyword.split()
    if len(words) > 1:
        base_tags.append(" ".join(words[:2]))
        base_tags.append(" ".join(words[-2:]))

    # Niche tags
    base_tags.append(niche)
    base_tags.append(f"{niche} {datetime.now().year}")

    # Language-specific tags
    if language == "id":
        base_tags.extend(["indonesia", "viral", "terbaru", "edukasi"])
    else:
        base_tags.extend(["english", "viral", "trending", "education"])

    # Add extra tags
    base_tags.extend(extra_tags)

    # Remove duplicates and limit total chars to 500
    unique_tags = list(dict.fromkeys(base_tags))
    final_tags = []
    total_chars = 0
    for tag in unique_tags:
        if total_chars + len(tag) + 1 <= 500:
            final_tags.append(tag)
            total_chars += len(tag) + 1  # +1 for comma separator

    return final_tags


def get_compliance_checklist() -> list[dict]:
    """Return YouTube compliance checklist for users."""
    return [
        {"item": "AI Disclosure", "required": True, "status": "auto", "description": "AI disclosure automatically added to description"},
        {"item": "Original Script", "required": True, "status": "auto", "description": "Script generated uniquely for each video"},
        {"item": "Engagement Hooks", "required": False, "status": "auto", "description": "Subscribe/like CTAs injected naturally"},
        {"item": "Timestamps", "required": False, "status": "auto", "description": "Chapter timestamps generated from scenes"},
        {"item": "Unique Variation", "required": True, "status": "auto", "description": "Content varies between videos (no repetitive patterns)"},
        {"item": "Proper Tags", "required": True, "status": "auto", "description": "Tags are relevant and within 500 char limit"},
        {"item": "Not Misleading", "required": True, "status": "manual", "description": "Title/thumbnail match actual content"},
        {"item": "Value to Viewer", "required": True, "status": "manual", "description": "Video provides educational/entertainment value"},
    ]
