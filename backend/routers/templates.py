"""
Templates API endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateCreate(BaseModel):
    name: str
    niche: str = ""
    video_type: str = "slideshow"
    language: str = "id"
    voice_engine: str = "edge-tts"
    duration_target: str = "medium"
    description: str = ""


@router.get("/")
async def get_templates():
    """Get all templates."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM templates ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        templates = [dict(zip(columns, row)) for row in rows]
        return {"templates": templates}
    finally:
        await db.close()


@router.get("/{template_id}")
async def get_template(template_id: int):
    """Get a single template."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Template not found")
        columns = [description[0] for description in cursor.description]
        return dict(zip(columns, row))
    finally:
        await db.close()


@router.post("/")
async def create_template(template: TemplateCreate):
    """Create a new template."""
    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO templates (name, niche, video_type, language, voice_engine, duration_target, description)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (template.name, template.niche, template.video_type, template.language,
             template.voice_engine, template.duration_target, template.description)
        )
        await db.commit()
        return {"status": "ok", "id": cursor.lastrowid, "message": "Template created"}
    finally:
        await db.close()


@router.put("/{template_id}")
async def update_template(template_id: int, template: TemplateCreate):
    """Update a template."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM templates WHERE id = ?", (template_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Template not found")

        await db.execute(
            """UPDATE templates SET name = ?, niche = ?, video_type = ?, language = ?,
               voice_engine = ?, duration_target = ?, description = ? WHERE id = ?""",
            (template.name, template.niche, template.video_type, template.language,
             template.voice_engine, template.duration_target, template.description, template_id)
        )
        await db.commit()
        return {"status": "ok", "message": "Template updated"}
    finally:
        await db.close()


@router.delete("/{template_id}")
async def delete_template(template_id: int):
    """Delete a template."""
    db = await get_db()
    try:
        await db.execute("DELETE FROM templates WHERE id = ?", (template_id,))
        await db.commit()
        return {"status": "ok", "message": "Template deleted"}
    finally:
        await db.close()
