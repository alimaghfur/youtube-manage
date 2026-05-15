from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Youtube Manage API",
    description="API for YouTube Auto Content Generator",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Youtube Manage API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "gemini": "not configured",
            "elevenlabs": "not configured",
            "leonardo": "not configured",
            "youtube": "not configured",
        }
    }


@app.get("/api/stats")
async def get_stats():
    return {
        "total_videos": 0,
        "uploaded": 0,
        "scheduled": 0,
        "in_queue": 0,
    }
