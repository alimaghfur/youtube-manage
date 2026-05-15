"""
Thumbnail Generator Service.
Generates eye-catching thumbnails using AI or FFmpeg text overlay.
"""

import os
import asyncio
import subprocess
import requests
from datetime import datetime

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "output")


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


async def generate_thumbnail_ai(title: str, niche: str, output_path: str) -> str:
    """Generate thumbnail using Leonardo AI."""
    api_key = await get_setting("leonardo_api_key")
    if not api_key:
        return await generate_thumbnail_ffmpeg(title, niche, output_path)

    prompt = f"YouTube thumbnail, bold vibrant colors, {niche} theme, cinematic, professional, 16:9 aspect ratio, trending youtube thumbnail style, eye-catching, high contrast, no text"

    url = "https://cloud.leonardo.ai/api/rest/v1/generations"
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "prompt": prompt,
        "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
        "width": 1280,
        "height": 720,
        "num_images": 1,
    }

    try:
        response = await asyncio.to_thread(requests.post, url, json=data, headers=headers)
        if response.status_code != 200:
            return await generate_thumbnail_ffmpeg(title, niche, output_path)

        generation_id = response.json()["sdGenerationJob"]["generationId"]

        # Poll for completion
        for _ in range(30):
            await asyncio.sleep(2)
            poll_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
            poll_response = await asyncio.to_thread(requests.get, poll_url, headers=headers)
            result = poll_response.json()

            if result["generations_by_pk"]["status"] == "COMPLETE":
                image_url = result["generations_by_pk"]["generated_images"][0]["url"]
                img_response = await asyncio.to_thread(requests.get, image_url)
                
                # Save base image
                base_path = output_path.replace(".png", "_base.png")
                with open(base_path, "wb") as f:
                    f.write(img_response.content)

                # Add text overlay
                await add_text_overlay(base_path, title, output_path)
                return output_path

        return await generate_thumbnail_ffmpeg(title, niche, output_path)
    except Exception:
        return await generate_thumbnail_ffmpeg(title, niche, output_path)


async def generate_thumbnail_ffmpeg(title: str, niche: str, output_path: str) -> str:
    """Generate thumbnail using FFmpeg with gradient background and text."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Color schemes per niche
    color_schemes = {
        "Fakta Unik": ("0x1a1a2e", "0x16213e", "0xe94560"),
        "Edukasi": ("0x0f3460", "0x16213e", "0x53a8b6"),
        "Teknologi": ("0x0d1117", "0x161b22", "0x58a6ff"),
        "Motivasi": ("0x2d1b69", "0x11052c", "0xf39c12"),
        "Kesehatan": ("0x1b4332", "0x0d2818", "0x52b788"),
        "Sejarah": ("0x3d0c02", "0x1a0000", "0xd4a574"),
        "Sains": ("0x0a0e27", "0x1a1f4e", "0x00d4ff"),
        "Bisnis": ("0x1a1a1a", "0x0d0d0d", "0xffd700"),
        "Gaming": ("0x2d0a4e", "0x0f0326", "0xff006e"),
        "Kuliner": ("0x3d1f00", "0x1a0d00", "0xff6b35"),
        "Travel": ("0x003d5b", "0x001b2e", "0x00bcd4"),
        "Olahraga": ("0x1b0000", "0x0d0000", "0xff1744"),
    }

    bg1, bg2, accent = color_schemes.get(niche, ("0x1a1a2e", "0x16213e", "0xe94560"))

    # Truncate title for display
    display_title = title if len(title) <= 40 else title[:37] + "..."
    # Escape special characters for FFmpeg
    display_title = display_title.replace("'", "").replace(":", " -").replace('"', '')

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i",
        f"color=c={bg1}:s=1280x720:d=1",
        "-vf",
        f"drawbox=x=0:y=0:w=1280:h=720:color={bg2}@0.5:t=fill,"
        f"drawbox=x=40:y=560:w=1200:h=120:color={accent}@0.9:t=fill,"
        f"drawtext=text='{display_title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=585:shadowcolor=black:shadowx=3:shadowy=3,"
        f"drawtext=text='{niche.upper()}':fontsize=28:fontcolor={accent}:x=60:y=40",
        "-frames:v", "1",
        output_path,
    ]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # Fallback: simpler thumbnail
        cmd_simple = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"color=c={bg1}:s=1280x720:d=1",
            "-vf", f"drawtext=text='{display_title}':fontsize=44:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
            "-frames:v", "1",
            output_path,
        ]
        await asyncio.to_thread(subprocess.run, cmd_simple, capture_output=True, check=True)

    return output_path


async def add_text_overlay(input_path: str, title: str, output_path: str) -> str:
    """Add text overlay to an image."""
    display_title = title if len(title) <= 40 else title[:37] + "..."
    display_title = display_title.replace("'", "").replace(":", " -").replace('"', '')

    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-vf",
        f"drawbox=x=0:y=520:w=1280:h=200:color=black@0.7:t=fill,"
        f"drawtext=text='{display_title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=580:shadowcolor=black:shadowx=3:shadowy=3",
        output_path,
    ]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # If overlay fails, just copy
        import shutil
        shutil.copy(input_path, output_path)

    return output_path


async def generate_thumbnail_variants(title: str, niche: str, video_id: int, count: int = 3) -> list[str]:
    """Generate multiple thumbnail variants for A/B testing."""
    thumbnails = []
    video_dir = os.path.join(OUTPUT_DIR, f"video_{video_id}_thumbnails")
    os.makedirs(video_dir, exist_ok=True)

    for i in range(count):
        output_path = os.path.join(video_dir, f"thumbnail_v{i+1}.png")
        if i == 0:
            await generate_thumbnail_ai(title, niche, output_path)
        else:
            await generate_thumbnail_ffmpeg(title, niche, output_path)
        thumbnails.append(output_path)

    return thumbnails
