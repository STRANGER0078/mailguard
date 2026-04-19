from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmailSummary(BaseModel):
    id: str
    subject: str
    sender: str
    snippet: str
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    explanation: Optional[str] = None


class ScamAnalysis(BaseModel):
    email_id: str
    subject: str
    sender: str
    body_preview: str
    risk_score: int          # 0–100
    risk_level: str          # safe | suspicious | scam
    signals: list[str]
    explanation: str


class LabelResponse(BaseModel):
    email_id: str
    labeled: bool
    label_name: str
    message: str
