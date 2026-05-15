"""
YouTube upload service using YouTube Data API v3.
"""

import os
import json
import asyncio
from datetime import datetime


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


async def upload_to_youtube(
    video_path: str,
    title: str,
    description: str,
    tags: list[str],
    category: str = "22",  # People & Blogs
    visibility: str = "public",
) -> dict:
    """
    Upload a video to YouTube using the Data API v3.
    
    Note: This requires OAuth2 authentication. For the initial version,
    we'll use a simple API key approach. Full OAuth flow will be implemented
    when connecting the YouTube channel.
    """
    from database import get_db

    api_key = await get_setting("youtube_api_key")
    client_id = await get_setting("youtube_client_id")
    client_secret = await get_setting("youtube_client_secret")

    if not all([api_key, client_id, client_secret]):
        raise ValueError(
            "YouTube API credentials not configured. "
            "Please set YouTube API Key, Client ID, and Client Secret in Settings."
        )

    # Category mapping
    category_map = {
        "education": "27",
        "entertainment": "24",
        "science": "28",
        "howto": "26",
        "people": "22",
        "news": "25",
        "gaming": "20",
        "music": "10",
    }
    yt_category = category_map.get(category, "22")

    # Privacy status mapping
    privacy_map = {
        "public": "public",
        "unlisted": "unlisted",
        "private": "private",
    }
    privacy_status = privacy_map.get(visibility, "public")

    # For now, return a simulated response
    # Full OAuth2 implementation requires user interaction (browser redirect)
    # This will be implemented with a proper OAuth flow
    
    # Check if video file exists
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    # Simulated upload response (will be replaced with actual API call)
    # In production, this would use google-api-python-client with OAuth2
    return {
        "status": "pending_auth",
        "message": "YouTube upload requires OAuth2 authentication. Please connect your YouTube channel in Settings first.",
        "video_details": {
            "title": title,
            "description": description,
            "tags": tags,
            "category": yt_category,
            "privacy_status": privacy_status,
            "file_path": video_path,
        }
    }


async def get_youtube_channel_info() -> dict | None:
    """Get connected YouTube channel information."""
    from database import get_db
    
    db = await get_db()
    try:
        cursor = await db.execute("SELECT value FROM settings WHERE key = 'youtube_channel_info'")
        row = await cursor.fetchone()
        if row and row[0]:
            return json.loads(row[0])
        return None
    finally:
        await db.close()
