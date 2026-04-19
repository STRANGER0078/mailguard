# MailGuard — AI Gmail Scam Detector

> An AI-powered phishing and scam detection system that scans your Gmail inbox in real time, scores every email 0–100 for risk, explains why it's dangerous, and labels it directly in Gmail.

---

## Demo

| Safe email | Suspicious email | Scam detected |
|---|---|---|
| Score 0–39, green | Score 40–69, yellow | Score 70–100, red + modal warning |

---

## Features

- **Google OAuth login** — one click, no password stored
- **Real-time inbox scan** — fetches unread Gmail via Gmail API
- **AI risk scoring** — every email scored 0–100 using Groq (Llama 3)
- **Explanation panel** — clear reasons why an email is risky
- **Scam warning modal** — instant popup for high-risk emails (score ≥ 70)
- **Phrase highlighting** — risky phrases highlighted in yellow inside the email body
- **Mark as scam** — applies `⚠ Scam Detected` label directly in Gmail
- **Mark as safe** — dismiss false positives instantly
- **Filter tabs** — view All / Scam / Suspicious / Safe

---

## Tech Stack

**Backend**
- Python 3.11
- FastAPI
- Google Gmail API + OAuth 2.0
- Groq API (Llama 3.3 70B)
- PyJWT

**Frontend**
- React 18 + Vite
- No UI framework — pure inline styles
- Syne + DM Sans + DM Mono fonts

---

## Project Structure

```
mailguard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment settings
│   │   ├── dependencies.py      # JWT auth dependency
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── routers/
│   │   │   ├── auth.py          # Google OAuth
│   │   │   └── emails.py        # Fetch / scan / label
│   │   └── services/
│   │       ├── gmail_service.py # Gmail API integration
│   │       └── ai_service.py    # Groq AI analysis
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/index.js
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useEmails.js
    │   └── components/
    │       ├── Dashboard.jsx
    │       ├── EmailCard.jsx
    │       ├── ScamWarningModal.jsx
    │       ├── HighlightedBody.jsx
    │       ├── RiskBadge.jsx
    │       └── StatsBar.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud account (free)
- Groq account (free)

### 1. Clone the repo

```bash
git clone https://github.com/STRANGER0078/mailguard.git
cd mailguard
```

### 2. Google Cloud setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Gmail API** and **People API**
4. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Type: Web application
   - Redirect URI: `http://localhost:8000/auth/callback`
5. Copy Client ID and Client Secret

### 3. Groq API key (free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up free → API Keys → Create Key
3. Copy the key

### 4. Backend setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your keys:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
GROQ_API_KEY=your-groq-key
SECRET_KEY=generate-with-python-secrets-module
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Generate a secret key:
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the backend:
```powershell
$env:OAUTHLIB_INSECURE_TRANSPORT = "1"
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage

1. Open `http://localhost:3000`
2. Click **"Continue with Google"**
3. Approve Gmail permissions
4. Click **"Scan inbox"**
5. View risk scores, explanations, and highlighted phrases
6. Click any email to expand the AI analysis panel
7. High-risk emails (≥70) show an automatic warning popup
8. Use **"Mark as scam"** to label in Gmail or **"Mark as safe"** to dismiss

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/login` | Redirect to Google OAuth |
| GET | `/auth/callback` | Exchange code for JWT |
| GET | `/emails/unread` | List unread emails |
| GET | `/emails/scan/{id}` | AI scan one email |
| POST | `/emails/scan-all` | AI scan all unread |
| POST | `/emails/label/{id}` | Apply Gmail scam label |
| GET | `/health` | Health check |

---

## Risk Score Guide

| Score | Level | Action |
|-------|-------|--------|
| 0–39 | Safe | No action needed |
| 40–69 | Suspicious | Review before clicking |
| 70–100 | Scam | Block immediately |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GROQ_API_KEY` | Groq API key for AI analysis |
| `SECRET_KEY` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry (default 1440) |

---

## Built for

This project was built as a hackathon prototype demonstrating real-world AI application for cybersecurity — specifically targeting the gap between Gmail's basic spam filter and sophisticated phishing attacks that target financial credentials.

---

## License

MIT
