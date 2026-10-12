import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import companies, peaks, stats

app = FastAPI(title="Reputational Risk Dashboard API")

allowed_origin = os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(peaks.router, prefix="/peaks", tags=["peaks"])


@app.get("/")
def root():
    return {"status": "ok"}
