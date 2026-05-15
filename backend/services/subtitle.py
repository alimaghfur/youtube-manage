"""
Subtitle/Caption Generator Service.
"""

import os
import asyncio
import subprocess
import json


async def generate_srt_from_script(script_json: str, audio_files: list[str], output_path: str) -> str:
    """Generate SRT subtitle file from script and audio durations."""
    script_data = json.loads(script_json) if isinstance(script_json, str) else script_json
    scenes = script_data.get("scenes", [])
    srt_entries = []
    current_time = 0.0

    for i, scene in enumerate(scenes):
        audio_path = audio_files[i] if i < len(audio_files) else None
        duration = 3.0
        if audio_path and os.path.exists(audio_path):
            cmd = ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", audio_path]
            result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True)
            try:
                duration = float(result.stdout.strip())
            except (ValueError, AttributeError):
                duration = 3.0

        narration = scene.get("narration", "")
        words = narration.split()
        chunks = [" ".join(words[j:j+10]) for j in range(0, len(words), 10)]
        chunk_duration = duration / max(len(chunks), 1)

        for j, chunk in enumerate(chunks):
            start_time = current_time + (j * chunk_duration)
            end_time = start_time + chunk_duration
            srt_entries.append({"index": len(srt_entries) + 1, "start": format_srt_time(start_time), "end": format_srt_time(end_time), "text": chunk})
        current_time += duration

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for entry in srt_entries:
            f.write(f"{entry['index']}\n{entry['start']} --> {entry['end']}\n{entry['text']}\n\n")
    return output_path


def format_srt_time(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


async def burn_subtitles(video_path: str, srt_path: str, output_path: str, style: str = "default") -> str:
    """Burn subtitles into video."""
    style_map = {
        "default": "FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1",
        "bold": "FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=2,Bold=1",
        "minimal": "FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,Outline=1,Shadow=0",
        "colorful": "FontSize=26,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Bold=1",
    }
    force_style = style_map.get(style, style_map["default"])
    cmd = ["ffmpeg", "-y", "-i", video_path, "-vf", f"subtitles={srt_path}:force_style='{force_style}'", "-c:a", "copy", output_path]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    return output_path


async def generate_subtitles_for_video(video_id: int, style: str = "default") -> dict:
    """Full subtitle pipeline for a video."""
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT script, audio_path, video_path FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row:
            raise ValueError("Video not found")
        script_json, audio_path_json, video_path = row[0], row[1], row[2]
        if not script_json or not video_path:
            raise ValueError("Video script or video file not found")
        audio_files = []
        if audio_path_json:
            try:
                audio_files = json.loads(audio_path_json)
            except json.JSONDecodeError:
                audio_files = [audio_path_json]
        video_dir = os.path.dirname(video_path)
        srt_path = os.path.join(video_dir, "subtitles.srt")
        await generate_srt_from_script(script_json, audio_files, srt_path)
        output_path = video_path.replace(".mp4", "_subtitled.mp4")
        await burn_subtitles(video_path, srt_path, output_path, style)
        await db.execute("UPDATE videos SET video_path = ? WHERE id = ?", (output_path, video_id))
        await db.commit()
        return {"video_id": video_id, "srt_path": srt_path, "video_path": output_path, "status": "ok"}
    finally:
        await db.close()
