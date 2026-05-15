"""
Video Remix / Repurpose Service.
"""
import os, asyncio, subprocess

async def create_shorts_from_video(video_id: int, clip_count: int = 3) -> dict:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT video_path, title FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row or not row[0]: raise ValueError("Video not found")
        video_path, title = row[0], row[1] or f"Short_{video_id}"
        shorts_dir = os.path.join(os.path.dirname(video_path), "shorts")
        os.makedirs(shorts_dir, exist_ok=True)
        cmd = ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", video_path]
        result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True)
        total_duration = float(result.stdout.strip()) if result.stdout.strip() else 60.0
        clip_duration = min(58, total_duration / max(clip_count, 1))
        clips = []
        for i in range(clip_count):
            start_time = i * clip_duration
            if start_time >= total_duration: break
            output_path = os.path.join(shorts_dir, f"short_{i+1}.mp4")
            cmd = ["ffmpeg", "-y", "-i", video_path, "-ss", str(start_time), "-t", str(clip_duration), "-vf", "crop=ih*9/16:ih,scale=1080:1920", "-c:a", "aac", output_path]
            await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
            clips.append({"path": output_path, "start": start_time, "duration": clip_duration, "title": f"{title} - Part {i+1} #shorts"})
        return {"video_id": video_id, "shorts_created": len(clips), "clips": clips, "status": "ok"}
    finally:
        await db.close()

async def change_aspect_ratio(video_id: int, ratio: str = "9:16") -> dict:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT video_path FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row or not row[0]: raise ValueError("Video not found")
        video_path = row[0]
        ratio_map = {"9:16": ("crop=ih*9/16:ih,scale=1080:1920", "_vertical.mp4"), "1:1": ("crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080", "_square.mp4"), "4:5": ("crop=ih*4/5:ih,scale=1080:1350", "_4x5.mp4")}
        vf, suffix = ratio_map.get(ratio, ratio_map["9:16"])
        output_path = video_path.replace(".mp4", suffix)
        cmd = ["ffmpeg", "-y", "-i", video_path, "-vf", vf, "-c:a", "copy", output_path]
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
        return {"video_id": video_id, "output_path": output_path, "ratio": ratio, "status": "ok"}
    finally:
        await db.close()

async def create_highlight_reel(video_id: int, duration: int = 30) -> dict:
    from database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT video_path FROM videos WHERE id = ?", (video_id,))
        row = await cursor.fetchone()
        if not row or not row[0]: raise ValueError("Video not found")
        video_path = row[0]
        video_dir = os.path.dirname(video_path)
        cmd = ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", video_path]
        result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True)
        total_duration = float(result.stdout.strip()) if result.stdout.strip() else 60.0
        output_path = video_path.replace(".mp4", "_highlight.mp4")
        cmd = ["ffmpeg", "-y", "-i", video_path, "-t", str(min(duration, total_duration)), "-c", "copy", output_path]
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
        return {"video_id": video_id, "output_path": output_path, "duration": duration, "status": "ok"}
    finally:
        await db.close()
