import base64
import re
from typing import Optional
from email import message_from_bytes

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi import HTTPException


SCAM_LABEL_NAME = "⚠ Scam Detected"

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels",
]


def build_gmail_service(access_token: str, refresh_token: Optional[str] = None):
    """Build an authenticated Gmail API client."""
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("gmail", "v1", credentials=creds)


def fetch_unread_emails(access_token: str, max_results: int = 20) -> list[dict]:
    """
    Fetch unread emails from inbox.
    Returns a list of dicts with id, subject, sender, body, snippet.
    """
    service = build_gmail_service(access_token)

    try:
        result = (
            service.users()
            .messages()
            .list(userId="me", q="is:unread in:inbox", maxResults=max_results)
            .execute()
        )
    except HttpError as e:
        raise HTTPException(status_code=502, detail=f"Gmail API error: {e}")

    messages = result.get("messages", [])
    if not messages:
        return []

    emails = []
    for msg_ref in messages:
        email_data = _fetch_email_detail(service, msg_ref["id"])
        if email_data:
            emails.append(email_data)

    return emails


def _fetch_email_detail(service, message_id: str) -> Optional[dict]:
    """Fetch full email detail and extract subject, sender, body."""
    try:
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=message_id, format="full")
            .execute()
        )
    except HttpError:
        return None

    headers = {h["name"].lower(): h["value"] for h in msg["payload"].get("headers", [])}
    subject = headers.get("subject", "(No Subject)")
    sender = headers.get("from", "(Unknown)")
    snippet = msg.get("snippet", "")
    body = _extract_body(msg["payload"])

    return {
        "id": message_id,
        "subject": subject,
        "sender": sender,
        "snippet": snippet,
        "body": body,
        "raw_links": _extract_links(body),
    }


def _extract_body(payload: dict) -> str:
    """
    Recursively extract plain-text body from Gmail message payload.
    Falls back to HTML stripped of tags.
    """
    mime_type = payload.get("mimeType", "")
    body_data = payload.get("body", {}).get("data")

    if body_data:
        decoded = base64.urlsafe_b64decode(body_data + "==").decode("utf-8", errors="ignore")
        if "text/plain" in mime_type:
            return decoded.strip()
        if "text/html" in mime_type:
            return _strip_html(decoded).strip()

    # Recurse into multipart
    for part in payload.get("parts", []):
        result = _extract_body(part)
        if result:
            return result

    return ""


def _strip_html(html: str) -> str:
    """Strip HTML tags to get plain text."""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _extract_links(text: str) -> list[str]:
    """Extract URLs from email body."""
    url_pattern = r"https?://[^\s<>\"']+"
    return list(set(re.findall(url_pattern, text)))[:10]  # cap at 10


def get_or_create_scam_label(service) -> str:
    """Return the label ID for the scam label, creating it if necessary."""
    try:
        result = service.users().labels().list(userId="me").execute()
        for label in result.get("labels", []):
            if label["name"] == SCAM_LABEL_NAME:
                return label["id"]

        # Create the label
        label_body = {
            "name": SCAM_LABEL_NAME,
            "labelListVisibility": "labelShow",
            "messageListVisibility": "show",
        }
        created = service.users().labels().create(userId="me", body=label_body).execute()
        return created["id"]
    except HttpError as e:
        raise HTTPException(status_code=502, detail=f"Gmail label error: {e}")


def apply_scam_label(access_token: str, message_id: str) -> str:
    """Apply the scam label to a Gmail message. Returns label name."""
    service = build_gmail_service(access_token)
    label_id = get_or_create_scam_label(service)

    try:
        service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"addLabelIds": [label_id]},
        ).execute()
    except HttpError as e:
        raise HTTPException(status_code=502, detail=f"Failed to apply label: {e}")

    return SCAM_LABEL_NAME
