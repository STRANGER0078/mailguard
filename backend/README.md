# Gmail Scam Detector — FastAPI Backend

## Folder structure

```
gmail_scam_detector/
├── app/
│   ├── main.py              # FastAPI app + CORS
│   ├── config.py            # Env-based settings
│   ├── dependencies.py      # JWT auth dependency
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py          # Google OAuth login + callback
│   │   └── emails.py        # Fetch, scan, label endpoints
│   └── services/
│       ├── gmail_service.py # Gmail API integration
│       └── ai_service.py    # Claude scam analysis
├── requirements.txt
├── .env.example
└── README.md
```

---

## Setup

### 1. Clone and create venv

```bash
git clone <repo>
cd gmail_scam_detector
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **Gmail API** and **Google+ API (People API)**
4. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/auth/callback`
5. Download the client ID and secret

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your values:
nano .env
```

Required values:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_hex(32))">
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for the interactive API docs.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth/login` | — | Redirect to Google OAuth |
| GET | `/auth/callback` | — | Exchange code → JWT |
| GET | `/emails/unread` | JWT | List unread emails (no AI) |
| GET | `/emails/scan/{id}` | JWT | AI scan one email |
| POST | `/emails/scan-all` | JWT | AI scan all unread (max 25) |
| POST | `/emails/label/{id}` | JWT | Apply Gmail scam label |
| GET | `/health` | — | Health check |

### Auth flow

```
1. GET /auth/login              → redirects to Google
2. User approves                → Google calls /auth/callback?code=...
3. /auth/callback returns       → { "access_token": "<jwt>" }
4. All subsequent requests:     → Authorization: Bearer <jwt>
```

### Example: scan one email

```bash
# 1. Get token via browser login flow, copy the JWT
TOKEN="eyJ..."

# 2. List unread
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/emails/unread

# 3. Scan specific email
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/emails/scan/18c4f3a9b2d1e5f7

# 4. Label as scam
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/emails/label/18c4f3a9b2d1e5f7
```

### Example response from `/emails/scan/{id}`

```json
{
  "email_id": "18c4f3a9b2d1e5f7",
  "subject": "Urgent: verify your PayPal account",
  "sender": "support@paypa1.net",
  "body_preview": "Dear customer, your account will be suspended...",
  "risk_score": 91,
  "risk_level": "scam",
  "signals": ["domain spoofing", "urgency language", "suspicious link", "generic greeting"],
  "explanation": "The sender domain 'paypa1.net' mimics PayPal but is unregistered. The email creates false urgency and requests account verification — a classic credential phishing pattern."
}
```

---

## Risk levels

| Score | Level | Meaning |
|-------|-------|---------|
| 0–29 | `safe` | Legitimate email |
| 30–69 | `suspicious` | Review recommended |
| 70–100 | `scam` | High confidence phishing/scam |

---

## Notes for hackathon

- The JWT embeds the Google access token — for production, store tokens server-side with refresh token rotation
- `scan-all` is capped at 25 emails to avoid Claude API rate limits during demo
- The scam label (`⚠ Scam Detected`) is created in Gmail automatically on first use
- `OAUTHLIB_INSECURE_TRANSPORT=1` may be needed locally if running HTTP (not HTTPS):
  ```bash
  export OAUTHLIB_INSECURE_TRANSPORT=1
  uvicorn app.main:app --reload
  ```
