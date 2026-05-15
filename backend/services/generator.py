"""
Video generation service.
Handles: script generation (Gemini), TTS (Edge TTS / ElevenLabs), 
image generation (Leonardo AI), video composition (FFmpeg).
"""

import os
import json
import asyncio
import subprocess
import edge_tts
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


async def generate_script(keyword: str, niche: str, language: str, duration_target: str) -> str:
    """Generate video script using Google Gemini API."""
    api_key = await get_setting("gemini_api_key")
    if not api_key:
        raise ValueError("Gemini API key not configured. Please set it in Settings.")

    duration_map = {
        "short": "1 minute (about 150 words)",
        "medium": "3-5 minutes (about 500-800 words)",
        "long": "8-10 minutes (about 1200-1500 words)",
    }
    duration_text = duration_map.get(duration_target, "3-5 minutes")

    lang_text = "Bahasa Indonesia" if language == "id" else "English"

    prompt = f"""Create a YouTube video script about "{keyword}" in the {niche} niche.

Requirements:
- Language: {lang_text}
- Target duration: {duration_text}
- Format: Return a JSON object with the following structure:
  {{
    "title": "Video title (catchy, SEO-friendly)",
    "description": "YouTube description (with keywords)",
    "tags": ["tag1", "tag2", "tag3"],
    "scenes": [
      {{
        "narration": "The text to be spoken for this scene",
        "image_prompt": "Description of the image to generate for this scene (in English)"
      }}
    ]
  }}
- Make the narration engaging and conversational
- Each scene should be 2-4 sentences
- Create 5-15 scenes depending on duration target
- Image prompts should be descriptive and visual

Return ONLY the JSON, no other text."""

    from services.gemini_helper import call_gemini
    text = await call_gemini(api_key, prompt)

    # Remove markdown code blocks if present
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]

    return text


async def generate_audio_edge_tts(text: str, output_path: str, language: str = "id") -> str:
    """Generate audio using Edge TTS (free, unlimited)."""
    voice_map = {
        "id": "id-ID-ArdiNeural",
        "en": "en-US-ChristopherNeural",
    }
    voice = voice_map.get(language, "id-ID-ArdiNeural")

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    return output_path


async def generate_audio_elevenlabs(text: str, output_path: str) -> str:
    """Generate audio using ElevenLabs API (pro quality, limited)."""
    api_key = await get_setting("elevenlabs_api_key")
    if not api_key:
        raise ValueError("ElevenLabs API key not configured.")

    url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5,
        },
    }

    response = await asyncio.to_thread(
        requests.post, url, json=data, headers=headers
    )

    if response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        return output_path
    else:
        raise ValueError(f"ElevenLabs API error: {response.status_code} - {response.text}")


async def generate_image_leonardo(prompt: str, output_path: str) -> str:
    """Generate image using Leonardo AI API."""
    api_key = await get_setting("leonardo_api_key")
    if not api_key:
        raise ValueError("Leonardo AI API key not configured.")

    # Create generation
    url = "https://cloud.leonardo.ai/api/rest/v1/generations"
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "prompt": prompt,
        "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",  # Leonardo Creative
        "width": 1280,
        "height": 720,
        "num_images": 1,
    }

    response = await asyncio.to_thread(
        requests.post, url, json=data, headers=headers
    )

    if response.status_code != 200:
        raise ValueError(f"Leonardo AI API error: {response.status_code}")

    generation_id = response.json()["sdGenerationJob"]["generationId"]

    # Poll for completion
    for _ in range(30):  # Max 30 attempts, ~60 seconds
        await asyncio.sleep(2)
        poll_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
        poll_response = await asyncio.to_thread(
            requests.get, poll_url, headers=headers
        )
        result = poll_response.json()

        if result["generations_by_pk"]["status"] == "COMPLETE":
            image_url = result["generations_by_pk"]["generated_images"][0]["url"]
            # Download image
            img_response = await asyncio.to_thread(requests.get, image_url)
            with open(output_path, "wb") as f:
                f.write(img_response.content)
            return output_path

    raise ValueError("Image generation timed out")


async def generate_image_placeholder(prompt: str, output_path: str) -> str:
    """Generate a simple placeholder image using FFmpeg when no API key is available."""
    # Clean text for FFmpeg (remove special characters that break drawtext)
    short_prompt = prompt[:40] if len(prompt) > 40 else prompt
    # Remove characters that cause FFmpeg issues
    safe_text = short_prompt.replace("'", "").replace('"', "").replace(":", " ").replace("\\", "").replace("%", "").replace(";", " ").replace("(", "").replace(")", "").replace("[", "").replace("]", "")
    safe_text = "".join(c for c in safe_text if c.isascii())
    if not safe_text.strip():
        safe_text = "Video Scene"

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=0x1e3a5f:s=1280x720:d=1",
        "-vf", f"drawtext=text='{safe_text}':fontsize=30:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
        "-frames:v", "1",
        output_path
    ]
    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # If drawtext still fails, create plain colored image without text
        cmd_simple = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=0x1e3a5f:s=1280x720:d=1",
            "-frames:v", "1",
            output_path
        ]
        await asyncio.to_thread(subprocess.run, cmd_simple, capture_output=True, check=True)
    return output_path


async def compose_video(images: list[str], audio_files: list[str], output_path: str) -> str:
    """Compose final video from images and audio using FFmpeg."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Get audio duration for each scene
    scenes_data = []
    for i, (img, audio) in enumerate(zip(images, audio_files)):
        # Get audio duration
        cmd = [
            "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
            "-of", "csv=p=0", audio
        ]
        result = await asyncio.to_thread(
            subprocess.run, cmd, capture_output=True, text=True
        )
        duration = float(result.stdout.strip()) if result.stdout.strip() else 3.0
        scenes_data.append({"image": img, "audio": audio, "duration": duration})

    # Create concat file for video
    concat_file = output_path.replace(".mp4", "_concat.txt")
    with open(concat_file, "w") as f:
        for scene in scenes_data:
            f.write(f"file '{scene['image']}'\n")
            f.write(f"duration {scene['duration']}\n")
        # Add last image again (FFmpeg requirement)
        if scenes_data:
            f.write(f"file '{scenes_data[-1]['image']}'\n")

    # Create video from images
    temp_video = output_path.replace(".mp4", "_temp_video.mp4")
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_file,
        "-vsync", "vfr", "-pix_fmt", "yuv420p",
        temp_video
    ]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)

    # Concatenate all audio files
    audio_concat_file = output_path.replace(".mp4", "_audio_concat.txt")
    with open(audio_concat_file, "w") as f:
        for scene in scenes_data:
            f.write(f"file '{scene['audio']}'\n")

    temp_audio = output_path.replace(".mp4", "_temp_audio.mp3")
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", audio_concat_file,
        "-c", "copy",
        temp_audio
    ]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)

    # Merge video and audio
    cmd = [
        "ffmpeg", "-y",
        "-i", temp_video,
        "-i", temp_audio,
        "-c:v", "copy", "-c:a", "aac",
        "-shortest",
        output_path
    ]
    await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)

    # Cleanup temp files
    for f in [concat_file, audio_concat_file, temp_video, temp_audio]:
        if os.path.exists(f):
            os.remove(f)

    return output_path


async def generate_video_pipeline(
    video_id: int,
    keyword: str,
    niche: str,
    video_type: str,
    language: str,
    voice_engine: str,
    duration_target: str,
    progress_callback=None,
) -> dict:
    """
    Full video generation pipeline.
    Returns dict with video info.
    """
    from database import get_db

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_dir = os.path.join(OUTPUT_DIR, f"video_{video_id}_{timestamp}")
    os.makedirs(video_dir, exist_ok=True)

    try:
        # Step 1: Generate script
        if progress_callback:
            await progress_callback(video_id, "generating", 10, "Generating script...")

        script_json = await generate_script(keyword, niche, language, duration_target)
        script_data = json.loads(script_json)

        # Apply YouTube compliance: engagement hooks + content variation
        from services.youtube_compliance import (
            inject_engagement_hooks, add_content_variation,
            generate_compliant_description, generate_compliant_tags,
        )

        script_data = inject_engagement_hooks(script_data, language)
        script_data = add_content_variation(script_data, video_id)

        # Generate compliant description and tags
        compliant_desc = generate_compliant_description(
            title=script_data.get("title", keyword),
            keyword=keyword,
            niche=niche,
            language=language,
            tags=script_data.get("tags", []),
            scenes=script_data.get("scenes", []),
        )
        compliant_tags = generate_compliant_tags(
            keyword=keyword, niche=niche, language=language,
            extra_tags=script_data.get("tags", []),
        )

        # Store compliant metadata back into script
        script_data["description"] = compliant_desc
        script_data["tags"] = compliant_tags
        script_json = json.dumps(script_data, ensure_ascii=False)

        # Save script
        script_path = os.path.join(video_dir, "script.json")
        with open(script_path, "w") as f:
            json.dump(script_data, f, indent=2, ensure_ascii=False)

        # Update DB with title and script
        db = await get_db()
        try:
            await db.execute(
                "UPDATE videos SET title = ?, script = ?, seo_description = ?, seo_tags = ? WHERE id = ?",
                (script_data["title"], script_json, compliant_desc, json.dumps(compliant_tags), video_id)
            )
        except Exception:
            # Fallback if seo columns don't exist yet
            await db.execute(
                "UPDATE videos SET title = ?, script = ? WHERE id = ?",
                (script_data["title"], script_json, video_id)
            )
        await db.commit()
        await db.close()

        # Step 2: Generate audio for each scene
        if progress_callback:
            await progress_callback(video_id, "generating", 25, "Generating audio...")

        audio_files = []
        for i, scene in enumerate(script_data["scenes"]):
            audio_path = os.path.join(video_dir, f"audio_{i:03d}.mp3")
            if voice_engine == "elevenlabs":
                await generate_audio_elevenlabs(scene["narration"], audio_path)
            else:
                await generate_audio_edge_tts(scene["narration"], audio_path, language)
            audio_files.append(audio_path)

        # Step 3: Humanize audio (make TTS sound more natural)
        if progress_callback:
            await progress_callback(video_id, "generating", 40, "Humanizing audio...")

        humanize_preset = "none"
        h_settings = {}

        try:
            from services.humanizer import (
                humanize_audio, add_ambient_noise, add_natural_pauses,
                humanize_video, get_humanization_presets
            )

            # Get humanization settings from database
            humanize_preset = await get_setting("humanize_preset") or "natural"
            presets = get_humanization_presets()
            h_settings = presets.get(humanize_preset, presets["natural"])["settings"]

            if humanize_preset != "none":
                # Humanize each audio file
                humanized_audio = []
                for i, audio_path in enumerate(audio_files):
                    h_path = os.path.join(video_dir, f"audio_h_{i:03d}.mp3")
                    try:
                        await humanize_audio(audio_path, h_path, h_settings)
                        humanized_audio.append(h_path)
                    except Exception:
                        humanized_audio.append(audio_path)

                # Add natural pauses between scenes
                if h_settings.get("natural_pauses"):
                    try:
                        humanized_audio = await add_natural_pauses(humanized_audio, video_dir)
                    except Exception:
                        pass

                # Add ambient noise to each audio
                if h_settings.get("ambient_noise", "none") != "none":
                    ambient_audio = []
                    for i, h_path in enumerate(humanized_audio):
                        amb_path = os.path.join(video_dir, f"audio_amb_{i:03d}.mp3")
                        try:
                            await add_ambient_noise(h_path, amb_path, h_settings["ambient_noise"])
                            ambient_audio.append(amb_path)
                        except Exception:
                            ambient_audio.append(h_path)
                    audio_files = ambient_audio
                else:
                    audio_files = humanized_audio
        except Exception:
            # If humanization fails completely, continue with original audio
            pass

        # Step 4: Generate images for each scene
        if progress_callback:
            await progress_callback(video_id, "generating", 55, "Generating images...")

        images = []
        leonardo_key = await get_setting("leonardo_api_key")
        for i, scene in enumerate(script_data["scenes"]):
            img_path = os.path.join(video_dir, f"image_{i:03d}.png")
            if leonardo_key:
                try:
                    await generate_image_leonardo(scene["image_prompt"], img_path)
                except Exception:
                    await generate_image_placeholder(scene["image_prompt"], img_path)
            else:
                await generate_image_placeholder(scene["image_prompt"], img_path)
            images.append(img_path)

        # Step 5: Compose video
        if progress_callback:
            await progress_callback(video_id, "generating", 75, "Composing video...")

        video_path = os.path.join(video_dir, "final_video.mp4")
        await compose_video(images, audio_files, video_path)

        # Step 6: Humanize final video (Ken Burns, color, vignette)
        try:
            if humanize_preset != "none" and (h_settings.get("ken_burns") or h_settings.get("color_variation")):
                if progress_callback:
                    await progress_callback(video_id, "generating", 90, "Applying humanization to video...")

                humanized_video_path = os.path.join(video_dir, "final_humanized.mp4")
                await humanize_video(video_path, humanized_video_path, h_settings)
                if os.path.exists(humanized_video_path) and os.path.getsize(humanized_video_path) > 0:
                    video_path = humanized_video_path
        except Exception:
            # If video humanization fails, use original video
            pass

        # Step 7: Update database
        if progress_callback:
            await progress_callback(video_id, "ready", 100, "Complete!")

        db = await get_db()
        await db.execute(
            "UPDATE videos SET status = ?, video_path = ?, audio_path = ? WHERE id = ?",
            ("ready", video_path, json.dumps(audio_files), video_id)
        )
        await db.commit()
        await db.close()

        return {
            "video_id": video_id,
            "title": script_data["title"],
            "description": script_data["description"],
            "tags": script_data["tags"],
            "video_path": video_path,
            "status": "ready",
        }

    except Exception as e:
        # Update status to failed
        db = await get_db()
        await db.execute(
            "UPDATE videos SET status = ? WHERE id = ?",
            ("failed", video_id)
        )
        await db.commit()
        await db.close()
        raise e
