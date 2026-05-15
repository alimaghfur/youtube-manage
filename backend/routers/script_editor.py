"""
Script Editor API endpoints.
View & edit video scripts before generating.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/api/script", tags=["script"])


class ScriptUpdate(BaseModel):
    script: str  # Full JSON script


class RegenerateSceneRequest(BaseModel):
    video_id: int
    scene_index: int


@router.get("/{video_id}")
async def get_script(video_id: int):
    """Get video script for editing."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, title, keyword, niche, script, status FROM videos WHERE id = ?", (video_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        columns = [d[0] for d in cursor.description]
        video = dict(zip(columns, row))

        # Parse script JSON
        script_data = None
        if video["script"]:
            try:
                script_data = json.loads(video["script"])
            except json.JSONDecodeError:
                script_data = None

        return {
            "video_id": video["id"],
            "title": video["title"],
            "keyword": video["keyword"],
            "niche": video["niche"],
            "status": video["status"],
            "script": script_data,
        }
    finally:
        await db.close()


@router.put("/{video_id}")
async def update_script(video_id: int, update: ScriptUpdate):
    """Update video script."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM videos WHERE id = ?", (video_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Video not found")

        # Validate JSON
        try:
            script_data = json.loads(update.script)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON script")

        # Update title from script if available
        title = script_data.get("title", None)
        if title:
            await db.execute(
                "UPDATE videos SET script = ?, title = ? WHERE id = ?",
                (update.script, title, video_id)
            )
        else:
            await db.execute(
                "UPDATE videos SET script = ? WHERE id = ?",
                (update.script, video_id)
            )
        await db.commit()
        return {"status": "ok", "message": "Script updated"}
    finally:
        await db.close()


@router.post("/regenerate-scene")
async def regenerate_scene(request: RegenerateSceneRequest):
    """Regenerate a single scene using AI."""
    import asyncio
    from services.generator import get_setting

    api_key = await get_setting("gemini_api_key")
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API key required")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT script, niche, language FROM videos WHERE id = ?", (request.video_id,))
        row = await cursor.fetchone()
        if not row or not row[0]:
            raise HTTPException(status_code=404, detail="Video or script not found")

        script_data = json.loads(row[0])
        niche = row[1]
        language = row[2] or "id"
        scenes = script_data.get("scenes", [])

        if request.scene_index >= len(scenes):
            raise HTTPException(status_code=400, detail="Scene index out of range")

        current_scene = scenes[request.scene_index]

        from google import genai
        client = genai.Client(api_key=api_key)

        lang_text = "Bahasa Indonesia" if language == "id" else "English"
        prompt = f"""Regenerate this video scene for a {niche} video in {lang_text}.
Current narration: "{current_scene.get('narration', '')}"

Create a new version that is more engaging. Return JSON:
{{"narration": "new narration text", "image_prompt": "description for image generation"}}

Return ONLY the JSON."""

        from services.gemini_helper import call_gemini
        text = await call_gemini(api_key, prompt)
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]

        new_scene = json.loads(text)
        scenes[request.scene_index] = new_scene
        script_data["scenes"] = scenes

        new_script_json = json.dumps(script_data, ensure_ascii=False)
        await db.execute("UPDATE videos SET script = ? WHERE id = ?", (new_script_json, request.video_id))
        await db.commit()

        return {"status": "ok", "scene_index": request.scene_index, "new_scene": new_scene}
    finally:
        await db.close()


@router.post("/preview-voice")
async def preview_voice(text: str = "", language: str = "id", voice_engine: str = "edge-tts"):
    """Preview voice for a text snippet (returns audio path)."""
    import os
    import tempfile
    from services.generator import generate_audio_edge_tts

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Limit preview to 200 chars
    preview_text = text[:200]
    output_dir = tempfile.mkdtemp()
    output_path = os.path.join(output_dir, "preview.mp3")

    await generate_audio_edge_tts(preview_text, output_path, language)

    return {"status": "ok", "audio_path": output_path, "text": preview_text, "language": language}
