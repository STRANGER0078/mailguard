from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, emails

app = FastAPI(
    title="Gmail Scam Detector API",
    description="Detects phishing and scam emails using AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
    "https://mailguard-zytn.vercel.app",,],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(emails.router, prefix="/emails", tags=["emails"])


@app.get("/health")
def health():
    return {"status": "ok"}
