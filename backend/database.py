"""
Database module for YouTube Manage project.
Uses aiosqlite for async SQLite operations.
"""

import os
import aiosqlite

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "youtube_manage.db")


async def get_db() -> aiosqlite.Connection:
    """Get an aiosqlite database connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON")
    return db


async def init_db() -> None:
    """Initialize the database and create all tables if they don't exist."""
    # Ensure the database directory exists
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")

        # Settings table - Store API keys and preferences
        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                updated_at TIMESTAMP
            )
        """)

        # Videos table - Store generated videos info
        await db.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                keyword TEXT,
                niche TEXT,
                video_type TEXT,
                language TEXT,
                voice_engine TEXT,
                duration_target TEXT,
                script TEXT,
                audio_path TEXT,
                video_path TEXT,
                thumbnail_path TEXT,
                status TEXT DEFAULT 'generating',
                youtube_url TEXT,
                seo_title TEXT,
                seo_description TEXT,
                seo_tags TEXT,
                template_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_at TIMESTAMP
            )
        """)

        # Schedules table - Store upload schedules
        await db.execute("""
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                upload_time TEXT NOT NULL,
                days TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Queue table - Upload queue
        await db.execute("""
            CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER REFERENCES videos(id),
                scheduled_date TEXT,
                scheduled_time TEXT,
                status TEXT DEFAULT 'queued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Templates table - Save reusable video generation templates
        await db.execute("""
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                niche TEXT,
                video_type TEXT,
                language TEXT DEFAULT 'id',
                voice_engine TEXT DEFAULT 'edge-tts',
                duration_target TEXT DEFAULT 'medium',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Notifications table - Store notification settings
        await db.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                webhook_url TEXT,
                is_active INTEGER DEFAULT 1,
                events TEXT DEFAULT '["generate_complete","upload_complete","error"]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Notification logs
        await db.execute("""
            CREATE TABLE IF NOT EXISTS notification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notification_id INTEGER REFERENCES notifications(id),
                event TEXT,
                message TEXT,
                status TEXT DEFAULT 'sent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.commit()
