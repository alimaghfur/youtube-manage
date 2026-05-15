"""
Humanization Service.
Makes AI-generated videos appear more natural and human-made.
Techniques: variable speed, natural pauses, ambient noise, random transitions, slight imperfections.
"""

import os
import asyncio
import subprocess
import random
import json


# Transition effects available in FFmpeg
TRANSITIONS = [
    "fade", "fadeblack", "fadewhite", "slideleft", "slideright",
    "slideup", "slidedown", "circlecrop", "dissolve",
]

# Ambient noise profiles
AMBIENT_PROFILES = {
    "room": {"description": "Subtle room tone", "freq_low": 60, "freq_high": 200, "volume": 0.008},
    "cafe": {"description": "Light cafe ambience", "freq_low": 100, "freq_high": 400, "volume": 0.012},
    "nature": {"description": "Soft nature/wind", "freq_low": 80, "freq_high": 300, "volume": 0.010},
    "none": {"description": "No ambient noise", "freq_low": 0, "freq_high": 0, "volume": 0},
}


async def humanize_audio(audio_path: str, output_path: str, settings: dict = None) -> str:
    """
    Humanize audio file:
    - Slight speed variation (0.95-1.05x)
    - Natural breathing pauses
    - Subtle ambient noise
    - Minor volume fluctuations
    """
    if settings is None:
        settings = {}

    speed_variation = settings.get("speed_variation", True)
    add_ambient = settings.get("ambient_noise", "room")
    add_pauses = settings.get("natural_pauses", True)
    volume_variation = settings.get("volume_variation", True)

    filters = []

    # 1. Slight speed variation (makes TTS sound less robotic)
    if speed_variation:
        speed = random.uniform(0.96, 1.04)
        filters.append(f"atempo={speed:.3f}")

    # 2. Subtle volume fluctuation (human voice isn't perfectly constant)
    if volume_variation:
        # Add very slight tremolo (volume wobble)
        filters.append("tremolo=f=0.3:d=0.02")

    # 3. Add warmth (slight EQ boost in vocal range)
    filters.append("equalizer=f=2500:t=q:w=1:g=1.5")
    filters.append("equalizer=f=200:t=q:w=1:g=0.8")

    # 4. Slight compression (makes it sound more broadcast-like)
    filters.append("acompressor=threshold=0.089:ratio=4:attack=200:release=1000")

    filter_str = ",".join(filters)

    cmd = [
        "ffmpeg", "-y", "-i", audio_path,
        "-af", filter_str,
        output_path,
    ]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # Fallback: just copy if processing fails
        import shutil
        shutil.copy(audio_path, output_path)

    return output_path


async def add_ambient_noise(audio_path: str, output_path: str, profile: str = "room") -> str:
    """Add subtle ambient background noise to make audio sound recorded in a real environment."""
    config = AMBIENT_PROFILES.get(profile, AMBIENT_PROFILES["room"])

    if config["volume"] == 0:
        import shutil
        shutil.copy(audio_path, output_path)
        return output_path

    # Get audio duration
    cmd = ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", audio_path]
    result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True)
    try:
        duration = float(result.stdout.strip())
    except (ValueError, AttributeError):
        duration = 60.0

    vol = config["volume"]
    freq_low = config["freq_low"]
    freq_high = config["freq_high"]

    # Generate pink-ish noise that sounds like room ambience
    cmd = [
        "ffmpeg", "-y",
        "-i", audio_path,
        "-f", "lavfi", "-i", f"anoisesrc=d={duration}:c=pink:r=44100:a={vol}",
        "-filter_complex",
        f"[1:a]highpass=f={freq_low},lowpass=f={freq_high}[noise];[0:a][noise]amix=inputs=2:duration=first:dropout_transition=3[out]",
        "-map", "[out]",
        output_path,
    ]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        import shutil
        shutil.copy(audio_path, output_path)

    return output_path


async def add_natural_pauses(audio_files: list[str], output_dir: str) -> list[str]:
    """Add random natural pauses (0.3-1.5s silence) between audio segments."""
    result_files = []

    for i, audio_path in enumerate(audio_files):
        output_path = os.path.join(output_dir, f"paused_{i:03d}.mp3")

        # Random pause duration (human-like variation)
        pause_before = random.uniform(0.1, 0.5) if i > 0 else 0
        pause_after = random.uniform(0.3, 1.2)

        # Add silence padding
        cmd = [
            "ffmpeg", "-y",
            "-i", audio_path,
            "-af", f"adelay={int(pause_before * 1000)}|{int(pause_before * 1000)},apad=pad_dur={pause_after}",
            output_path,
        ]

        try:
            await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
            result_files.append(output_path)
        except subprocess.CalledProcessError:
            result_files.append(audio_path)

    return result_files


async def humanize_video(video_path: str, output_path: str, settings: dict = None) -> str:
    """
    Humanize video file:
    - Random Ken Burns effect (subtle zoom/pan)
    - Slight color temperature variation
    - Minor brightness fluctuation
    - Random crop jitter (very subtle)
    """
    if settings is None:
        settings = {}

    apply_ken_burns = settings.get("ken_burns", True)
    color_variation = settings.get("color_variation", True)

    filters = []

    # 1. Ken Burns effect (subtle zoom/pan - makes static images feel alive)
    if apply_ken_burns:
        zoom_start = random.uniform(1.0, 1.03)
        zoom_end = random.uniform(1.02, 1.06)
        x_drift = random.uniform(-10, 10)
        y_drift = random.uniform(-5, 5)
        filters.append(
            f"zoompan=z='if(eq(on,1),{zoom_start},{zoom_start}+(({zoom_end}-{zoom_start})/duration*on))'"
            f":x='iw/2-(iw/zoom/2)+{x_drift}*on/duration'"
            f":y='ih/2-(ih/zoom/2)+{y_drift}*on/duration'"
            f":d=1:s=1280x720:fps=30"
        )

    # 2. Subtle color temperature shift (warm/cool, human cameras aren't perfect)
    if color_variation:
        r_shift = random.uniform(0.98, 1.02)
        b_shift = random.uniform(0.97, 1.03)
        filters.append(f"colorbalance=rs={random.uniform(-0.02, 0.02)}:bs={random.uniform(-0.02, 0.02)}")

    # 3. Very slight vignette (like a real camera lens)
    filters.append("vignette=PI/6")

    if filters:
        filter_str = ",".join(filters)
        cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vf", filter_str,
            "-c:a", "copy",
            output_path,
        ]
    else:
        cmd = ["ffmpeg", "-y", "-i", video_path, "-c", "copy", output_path]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # If complex filters fail, try simpler approach
        simple_cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vf", "vignette=PI/6",
            "-c:a", "copy",
            output_path,
        ]
        try:
            await asyncio.to_thread(subprocess.run, simple_cmd, capture_output=True, check=True)
        except subprocess.CalledProcessError:
            import shutil
            shutil.copy(video_path, output_path)

    return output_path


async def randomize_scene_durations(base_duration: float, scene_count: int) -> list[float]:
    """Generate human-like varying scene durations instead of uniform timing."""
    durations = []
    remaining = base_duration * scene_count

    for i in range(scene_count):
        if i == scene_count - 1:
            durations.append(remaining)
        else:
            # Vary by ±30% from base
            variation = random.uniform(0.7, 1.3)
            d = base_duration * variation
            durations.append(d)
            remaining -= d

    # Ensure no negative durations
    return [max(1.0, d) for d in durations]


async def apply_random_transitions(images: list[str], durations: list[float], output_path: str) -> str:
    """Apply random transitions between scenes instead of hard cuts."""
    # Build complex filter with crossfade transitions
    if len(images) < 2:
        return images[0] if images else output_path

    # For simplicity, use concat with xfade between scenes
    filter_parts = []
    inputs = []

    for i, (img, dur) in enumerate(zip(images, durations)):
        inputs.extend(["-loop", "1", "-t", str(dur), "-i", img])

    # Build xfade chain
    if len(images) == 2:
        transition = random.choice(["fade", "slideleft", "slideright", "dissolve"])
        filter_str = f"[0:v][1:v]xfade=transition={transition}:duration=0.5:offset={durations[0]-0.5}[v]"
        cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", filter_str, "-map", "[v]", "-pix_fmt", "yuv420p", output_path]
    else:
        # For multiple images, use concat (xfade chains get complex)
        concat_file = output_path.replace(".mp4", "_concat.txt")
        with open(concat_file, "w") as f:
            for i, (img, dur) in enumerate(zip(images, durations)):
                f.write(f"file '{img}'\n")
                f.write(f"duration {dur}\n")
            f.write(f"file '{images[-1]}'\n")

        cmd = [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", concat_file,
            "-vf", "fade=t=in:st=0:d=0.5",
            "-vsync", "vfr", "-pix_fmt", "yuv420p",
            output_path,
        ]

    try:
        await asyncio.to_thread(subprocess.run, cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        pass

    return output_path


def get_humanization_presets() -> dict:
    """Get available humanization presets."""
    return {
        "natural": {
            "name": "Natural",
            "description": "Balanced humanization - recommended for most content",
            "settings": {
                "speed_variation": True,
                "ambient_noise": "room",
                "natural_pauses": True,
                "volume_variation": True,
                "ken_burns": True,
                "color_variation": True,
                "random_transitions": True,
            }
        },
        "subtle": {
            "name": "Subtle",
            "description": "Minimal processing - keeps AI quality but adds slight imperfections",
            "settings": {
                "speed_variation": True,
                "ambient_noise": "none",
                "natural_pauses": True,
                "volume_variation": False,
                "ken_burns": False,
                "color_variation": True,
                "random_transitions": False,
            }
        },
        "heavy": {
            "name": "Heavy",
            "description": "Maximum humanization - sounds most like real recording",
            "settings": {
                "speed_variation": True,
                "ambient_noise": "cafe",
                "natural_pauses": True,
                "volume_variation": True,
                "ken_burns": True,
                "color_variation": True,
                "random_transitions": True,
            }
        },
        "none": {
            "name": "None",
            "description": "No humanization applied",
            "settings": {
                "speed_variation": False,
                "ambient_noise": "none",
                "natural_pauses": False,
                "volume_variation": False,
                "ken_burns": False,
                "color_variation": False,
                "random_transitions": False,
            }
        },
    }
