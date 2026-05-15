"""
Settings API endpoints.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingsResponse(BaseModel):
    gemini_api_key: str = ""
    elevenlabs_api_key: str = ""
    leonardo_api_key: str = ""
    youtube_api_key: str = ""
    youtube_client_id: str = ""
    youtube_client_secret: str = ""
    default_niche: str = ""
    default_language: str = "id"
    humanize_preset: str = "natural"
    compliance_enabled: str = "true"


@router.get("/", response_model=SettingsResponse)
async def get_settings():
    """Get all settings (API keys are masked)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()

        settings = {}
        api_key_fields = [
            "gemini_api_key", "elevenlabs_api_key", "leonardo_api_key",
            "youtube_api_key", "youtube_client_id", "youtube_client_secret",
        ]

        for row in rows:
            key, value = row[0], row[1]
            if key in api_key_fields and value:
                # Mask API keys - show only last 4 characters
                settings[key] = "•" * 20 + value[-4:] if len(value) > 4 else value
            else:
                settings[key] = value or ""

        return SettingsResponse(**settings)
    finally:
        await db.close()


@router.get("/raw")
async def get_settings_raw():
    """Get all settings unmasked (for internal use)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()
        return {row[0]: row[1] for row in rows}
    finally:
        await db.close()


@router.put("/")
async def update_setting(setting: SettingUpdate):
    """Update a single setting."""
    db = await get_db()
    try:
        now = datetime.now().isoformat()
        await db.execute(
            """INSERT INTO settings (key, value, updated_at) 
               VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?""",
            (setting.key, setting.value, now, setting.value, now)
        )
        await db.commit()
        return {"status": "ok", "message": f"Setting '{setting.key}' updated"}
    finally:
        await db.close()


@router.put("/bulk")
async def update_settings_bulk(settings: dict[str, str]):
    """Update multiple settings at once."""
    db = await get_db()
    try:
        now = datetime.now().isoformat()
        for key, value in settings.items():
            # Don't save masked values
            if value and not value.startswith("•"):
                await db.execute(
                    """INSERT INTO settings (key, value, updated_at) 
                       VALUES (?, ?, ?)
                       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?""",
                    (key, value, now, value, now)
                )
        await db.commit()
        return {"status": "ok", "message": f"Updated {len(settings)} settings"}
    finally:
        await db.close()


@router.get("/health")
async def check_api_health():
    """Check which APIs are configured."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()
        settings = {row[0]: row[1] for row in rows}

        return {
            "gemini": "connected" if settings.get("gemini_api_key") else "not configured",
            "elevenlabs": "connected" if settings.get("elevenlabs_api_key") else "not configured",
            "leonardo": "connected" if settings.get("leonardo_api_key") else "not configured",
            "youtube": "connected" if settings.get("youtube_api_key") else "not configured",
        }
    finally:
        await db.close()
