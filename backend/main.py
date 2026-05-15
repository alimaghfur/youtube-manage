"""
Youtube Manage - API Server
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db
from routers import generate, settings, scheduler, library, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Initialize database on startup
    await init_db()
    yield


app = FastAPI(
    title="Youtube Manage API",
    description="API for YouTube Auto Content Generator",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(generate.router)
app.include_router(settings.router)
app.include_router(scheduler.router)
app.include_router(library.router)
app.include_router(upload.router)


@app.get("/")
async def root():
    return {"message": "Youtube Manage API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Check API health and connected services."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()
        api_keys = {row[0]: row[1] for row in rows}

        return {
            "status": "healthy",
            "services": {
                "gemini": "connected" if api_keys.get("gemini_api_key") else "not configured",
                "elevenlabs": "connected" if api_keys.get("elevenlabs_api_key") else "not configured",
                "leonardo": "connected" if api_keys.get("leonardo_api_key") else "not configured",
                "youtube": "connected" if api_keys.get("youtube_api_key") else "not configured",
            }
        }
    finally:
        await db.close()


@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics."""
    db = await get_db()
    try:
        # Total videos
        cursor = await db.execute("SELECT COUNT(*) FROM videos")
        total = (await cursor.fetchone())[0]

        # Uploaded
        cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE status = 'uploaded'")
        uploaded = (await cursor.fetchone())[0]

        # In queue
        cursor = await db.execute("SELECT COUNT(*) FROM queue WHERE status = 'queued'")
        in_queue = (await cursor.fetchone())[0]

        # Generating
        cursor = await db.execute("SELECT COUNT(*) FROM videos WHERE status = 'generating'")
        generating = (await cursor.fetchone())[0]

        # Recent videos
        cursor = await db.execute(
            "SELECT id, title, keyword, niche, status, created_at FROM videos ORDER BY created_at DESC LIMIT 5"
        )
        rows = await cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        recent = [dict(zip(columns, row)) for row in rows]

        return {
            "total_videos": total,
            "uploaded": uploaded,
            "scheduled": in_queue,
            "generating": generating,
            "recent_videos": recent,
        }
    finally:
        await db.close()
