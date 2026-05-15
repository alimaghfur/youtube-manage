# Youtube Manage

YouTube Auto Content Generator — Generate AI-powered videos and upload them automatically to YouTube. Complete with humanization to make content appear natural and YouTube-compliant.

## Features

### Core Video Generation
- **Generate Video** — AI script generation (Gemini) + TTS (Edge TTS/ElevenLabs) + AI images (Leonardo AI) + FFmpeg video composition
- **Bulk Generate** — Batch generate multiple videos from keywords or trending topics
- **Script Editor** — View, edit, regenerate individual scenes before finalizing
- **Background Music** — Add ambient/upbeat/dramatic/chill/motivational music
- **Auto Subtitles** — Generate SRT and burn subtitles into video (4 styles)

### AI Intelligence
- **Trending Topics** — YouTube keyword suggestions + AI-generated topic ideas
- **SEO Optimizer** — Auto-generate optimized titles, descriptions, tags
- **Hashtag Generator** — AI-powered viral hashtags with categories
- **Content Planner** — 30-day AI content calendar with strategy
- **Competitor Analysis** — Niche analysis, content gaps, growth strategies
- **Growth Predictor** — Predict subscribers, views, revenue over time
- **Audience Insights** — Demographics, behavior, content preferences
- **A/B Title Test** — Score and compare titles for CTR

### Video Enhancement
- **Thumbnail Generator** — AI thumbnails + A/B variants for testing
- **Video Remix** — Convert to Shorts (9:16), change aspect ratio, highlight reels
- **Humanization** — Make AI videos appear natural (speed variation, ambient noise, Ken Burns, color shifts)
- **YouTube Compliance** — Auto AI disclosure, engagement hooks, timestamps, content variation

### Management
- **Library** — All videos with filter by status, delete, metadata
- **Scheduler** — Set upload schedule + queue management
- **Upload** — Direct upload to YouTube with metadata
- **Templates** — Save/reuse video generation presets
- **Notifications** — Telegram + Discord alerts (generate complete, upload, errors)
- **Analytics** — Stats, revenue estimates, weekly production charts
- **Settings** — API keys, humanization level, compliance toggle

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14 + Tailwind CSS + TypeScript |
| **Backend** | Python (FastAPI) |
| **Database** | SQLite (aiosqlite) |
| **Video** | FFmpeg |
| **AI Script** | Google Gemini API |
| **TTS** | Edge TTS (free) / ElevenLabs (pro) |
| **Images** | Leonardo AI |
| **Upload** | YouTube Data API v3 |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- FFmpeg (`brew install ffmpeg`)

### Installation

```bash
# Clone
git clone https://github.com/alimaghfur/youtube-manage.git
cd youtube-manage

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Open
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Configuration

1. Open **Settings** page (http://localhost:3000/settings)
2. Add API keys:
   - **Gemini API** (required) — [Get free key](https://ai.google.dev)
   - **ElevenLabs** (optional) — Pro voice quality
   - **Leonardo AI** (optional) — AI image generation
   - **YouTube API** (optional) — Auto upload
3. Set **Humanization Level**: Natural (recommended), Subtle, Heavy, or None
4. Enable **YouTube Compliance** for auto AI disclosure

## How It Works

```
[1. Input keyword/topic]
        ↓
[2. AI generates script (Gemini)]
        ↓
[3. Compliance: hooks + variation injected]
        ↓
[4. TTS audio generated (Edge TTS)]
        ↓
[5. Audio humanized (speed, pauses, ambient)]
        ↓
[6. AI images generated (Leonardo/placeholder)]
        ↓
[7. Video composed (FFmpeg)]
        ↓
[8. Video humanized (Ken Burns, color, vignette)]
        ↓
[9. Ready! → Upload to YouTube]
```

## Humanization System

Makes AI-generated videos appear natural:

| Technique | Effect |
|-----------|--------|
| Speed Variation | Voice not monotone (0.96-1.04x random) |
| Tremolo | Subtle volume wobble (like breathing) |
| EQ Warmth | Boost vocal range for natural sound |
| Ambient Noise | Room/cafe/nature background noise |
| Natural Pauses | 0.3-1.5s random silence between scenes |
| Ken Burns | Subtle zoom/pan on images |
| Color Variation | Slight temperature shift |
| Vignette | Lens-like edge darkening |

## YouTube Compliance

Automatically follows YouTube guidelines:

- **AI Disclosure** — Required text auto-added to description
- **Engagement Hooks** — Subscribe/like CTAs in intro, mid, outro
- **Timestamps** — Video chapters generated from scenes
- **Content Variation** — Unique seed + scene shuffle per video
- **Compliant Tags** — Relevant, under 500 char limit

## Project Structure

```
youtube-manage/
├── frontend/           → Next.js web dashboard (17 pages)
│   └── src/
│       ├── app/        → Pages (dashboard, generate, bulk, trending, etc.)
│       ├── components/ → Layout (Sidebar, Header, Providers)
│       ├── context/    → ThemeContext (dark/light mode)
│       └── lib/        → API client helper
├── backend/            → FastAPI server
│   ├── main.py         → App entry + router registration
│   ├── database.py     → SQLite schema + connection
│   ├── routers/        → 19 API routers
│   └── services/       → 12 backend services
├── database/           → SQLite database file
├── output/             → Generated videos
└── README.md
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/generate/` | Start video generation |
| `GET /api/generate/progress/{id}` | Poll generation progress |
| `POST /api/bulk/generate` | Batch generate videos |
| `POST /api/bulk/from-trending` | Generate from trending topics |
| `GET /api/trending/keywords` | Get trending keywords |
| `GET /api/trending/topics` | AI topic suggestions |
| `POST /api/thumbnail/generate` | Generate thumbnail |
| `POST /api/seo/optimize` | SEO optimization |
| `POST /api/hashtags/generate` | Generate hashtags |
| `POST /api/growth/predict` | Growth prediction |
| `POST /api/growth/audience` | Audience insights |
| `POST /api/growth/ab-test` | A/B title testing |
| `POST /api/planner/generate` | Content plan |
| `POST /api/planner/competitor-analysis` | Competitor analysis |
| `GET /api/library/` | List all videos |
| `POST /api/upload/` | Upload to YouTube |
| `POST /api/music/add` | Add background music |
| `POST /api/subtitles/generate` | Generate subtitles |
| `POST /api/remix/shorts` | Create YouTube Shorts |
| `GET /api/analytics/overview` | Analytics dashboard |
| `GET /api/analytics/revenue` | Revenue estimates |
| `GET /api/settings/` | Get settings |
| `PUT /api/settings/bulk` | Update settings |

## Free API Tiers

| Service | Free Limit |
|---------|-----------|
| Google Gemini | 60 requests/min |
| Edge TTS | Unlimited |
| Leonardo AI | 150 tokens/day |
| ElevenLabs | 10,000 chars/month |
| YouTube API | ~6 uploads/day |

## License

MIT
