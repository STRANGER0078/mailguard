from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.config import settings
from app.models.schemas import TokenResponse

router = APIRouter()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
]


def _make_flow() -> Flow:
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )


@router.get("/login")
def login():
    """Redirect user to Google OAuth consent screen."""
    flow = _make_flow()
    auth_url, _ = flow.authorization_url(
        prompt="consent",
        access_type="offline",
        include_granted_scopes="true",
    )
    return RedirectResponse(url=auth_url)


@router.get("/callback", response_model=TokenResponse)
def callback(code: str):
    """
    Google redirects here with ?code=...
    Exchange code for tokens, issue our own JWT.
    """
    flow = _make_flow()
    try:
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth token exchange failed: {e}")

    creds: Credentials = flow.credentials

    # Get user email for JWT sub claim
    user_info_service = build("oauth2", "v2", credentials=creds)
    user_info = user_info_service.userinfo().get().execute()
    email = user_info.get("email", "unknown")

    # Pack Google tokens into our JWT — frontend manages only one token
    payload = {
        "sub": email,
        "google_access_token": creds.token,
        "google_refresh_token": creds.refresh_token,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return RedirectResponse(url=f"https://mailguard-zytn.vercel.app?token={token}",)
