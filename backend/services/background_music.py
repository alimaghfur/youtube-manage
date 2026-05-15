"""
Background Music Service.
Adds royalty-free background music to videos.
"""

import os
import asyncio
import subprocess


MUSIC_PRESETS = {
    "ambient": {"description": "Soft ambient background", "freq": 220, "volume": 0.08},
    "upbeat": {"description": "Upbeat energetic tone", "freq": 440, "volume": 0.06},
    "dramatic": {"description": "Dramatic deep tone", "freq": 110, "volume": 0.07},
    "chill": {"description": "Chill lo-fi vibe", "freq": 330, "volume": 0.05},
    "motivational": {"description": "Motivational uplifting", "freq": 523, "volume": 0.06},
    "none": {"description": "No background music", "freq": 0, "volume": 0},
}


async def generate_background_tone(preset: str, duration: float, output_path: str) -> str:
    """Generate a simple background tone using FFmpeg."""
    config = MUSIC_PRESETS.get(preset, MUSIC_PRESETS["ambient"])
    if config["freq"] == 0:
        cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono", "-t", str(duration), "-q:a", "9", output_path]
    else:
        freq = config["freq"]
        vol = config["volume"]
        filter_complex = (
            f"sine=f={freq}:d={duration}[s1];sine=f={freq*1.5}:d={duration}[s2];sine=f={freq*2}:d={duration}[s3];"
            f"[s1][s2][s3]amix=inputs=3:duration=longest,volume={vol},"
            f"afade=t=in:ss=0:d=3,afade=t=out:st={max(0, duration-3)}:d=3"
        )
        cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc=0:d={duration}", "-filter_complex", filter_complex, output_path]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    return output_path


async def add_background_music_to_video(video_path: str, output_path: str, preset: str = "ambient", volume: float = 0.1, custom_music_path: str | None = None) -> str:
    """Add background music to a video."""
    cmd = ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", video_path]
    result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True)
    try:
        duration = float(result.stdout.strip())
    except (ValueError, AttributeError):
        duration = 60.0

    music_path = custom_music_path
    if not music_path or not os.path.exists(music_path):
        music_path = output_path.replace(".mp4", "_bgm.mp3")
        await generate_background_tone(preset, duration, music_path)

    cmd = [
        "ffmpeg", "-y", "-i", video_path, "-i", music_path,
        "-filter_complex", f"[0:a]volume=1.0[a1];[1:a]volume={volume}[a2];[a1][a2]amix=inputs=2:duration=shortest[aout]",
        "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-shortest", output_path,
    ]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    if not custom_music_path and os.path.exists(music_path):
        os.remove(music_path)
    return output_path


async def add_music_to_video_by_id(video_id: int, preset: str = "ambient", volume: float = 0.1) -> dict:
    """Add background music to a video by ID."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT video_path FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row or not row[0]:
            raise ValueError("Video not found or no video file")
        video_path = row[0]
        output_path = video_path.replace(".mp4", "_music.mp4")
        await add_background_music_to_video(video_path, output_path, preset, volume)
        await db.execute("UPDATE videos SET video_path = ? WHERE id = ?", (output_path, video_id))
        await db.commit()
        return {"video_id": video_id, "video_path": output_path, "preset": preset, "status": "ok"}
    finally:
        await db.close()


def get_music_presets() -> list[dict]:
    """Get available music presets."""
    return [{"id": k, "description": v["description"]} for k, v in MUSIC_PRESETS.items()]
