# Gmail Scam Detector API

FastAPI backend with Google OAuth, Gmail API integration, and AI-powered scam detection.

## Folder Structure

```
gmail-scam-detector/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment config
│   ├── auth/
│   │   ├── __init__.py
│   │   └── google_oauth.py  # Google OAuth2 flow
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gmail.py         # Gmail API integration
│   │   └── ai_detector.py   # AI scam detection
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Auth endpoints
│       └── emails.py        # Email endpoints
├── .env.example
├── requirements.txt
└── README.md
```

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Gmail API**: APIs & Services → Enable APIs → Search "Gmail API"
4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/auth/callback`
5. Download credentials JSON — copy `client_id` and `client_secret`

### 2. Get Anthropic API Key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

### 3. Environment Variables

```bash
cp .env.example .env
# Fill in your values
```

### 4. Install & Run

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 5. API Flow

```
GET  /auth/login          → Redirects to Google OAuth
GET  /auth/callback       → Handles OAuth callback, returns access_token
GET  /emails/unread       → Fetch & analyze unread emails (Bearer token)
POST /emails/{id}/mark-scam → Mark email as scam (moves to spam)
```

### 6. Testing with curl

```bash
# 1. Visit in browser to authenticate:
open http://localhost:8000/auth/login

# 2. After redirect, copy the access_token, then:
TOKEN="your_token_here"

# 3. Fetch unread emails with scam analysis:
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/emails/unread

# 4. Mark email as scam:
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8000/emails/{email_id}/mark-scam
```
