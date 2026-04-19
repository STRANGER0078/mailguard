import json
import re
from fastapi import HTTPException
from app.config import settings

SYSTEM_PROMPT = """You are an expert email security analyst specializing in phishing and scam detection.
Analyze the provided email and return ONLY valid JSON - no prose, no markdown fences, no explanation outside the JSON object.

Your JSON must exactly follow this schema:
{
  "risk_score": <integer 0-100>,
  "risk_level": "<safe|suspicious|scam>",
  "signals": [<list of short signal strings>],
  "explanation": "<2-4 sentence explanation>"
}

Scoring: 0-29 safe, 30-69 suspicious, 70-100 scam"""


def analyze_email(subject: str, sender: str, body: str, links: list) -> dict:
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)

        user_content = json.dumps({
            "from": sender,
            "subject": subject,
            "body": body[:3000],
            "links": links[:10],
        }, ensure_ascii=False)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            max_tokens=512,
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```json?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI API error: {e}")

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "risk_score": 0,
            "risk_level": "safe",
            "signals": ["analysis_failed"],
            "explanation": "AI analysis could not be completed.",
        }

    score = max(0, min(100, int(result.get("risk_score", 0))))
    result["risk_score"] = score
    result["risk_level"] = "scam" if score >= 70 else "suspicious" if score >= 30 else "safe"
    result["signals"] = result.get("signals", [])
    result["explanation"] = result.get("explanation", "No explanation returned.")
    return result
