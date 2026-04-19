from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.models.schemas import ScamAnalysis, LabelResponse, EmailSummary
from app.services import gmail_service, ai_service

router = APIRouter()


@router.get("/unread", response_model=list[EmailSummary])
def list_unread_emails(
    max_results: int = Query(default=5, ge=1, le=10),
    user: dict = Depends(get_current_user),
):
    """
    Fetch unread inbox emails and return them without AI scoring.
    Useful for the inbox list view — call /scan/:id to score individually.
    """
    access_token = user["google_access_token"]
    emails = gmail_service.fetch_unread_emails(access_token, max_results=max_results)

    return [
        EmailSummary(
            id=e["id"],
            subject=e["subject"],
            sender=e["sender"],
            snippet=e["snippet"],
        )
        for e in emails
    ]


@router.get("/scan/{email_id}", response_model=ScamAnalysis)
def scan_email(
    email_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Fetch a single email by ID and run AI scam analysis on it.
    Returns risk_score (0-100), risk_level, signals, explanation.
    """
    access_token = user["google_access_token"]

    from googleapiclient.errors import HttpError
    service = gmail_service.build_gmail_service(access_token)

    try:
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=email_id, format="full")
            .execute()
        )
    except HttpError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Email not found: {e}")

    headers = {h["name"].lower(): h["value"] for h in msg["payload"].get("headers", [])}
    subject = headers.get("subject", "(No Subject)")
    sender = headers.get("from", "(Unknown)")
    snippet = msg.get("snippet", "")
    body = gmail_service._extract_body(msg["payload"])
    links = gmail_service._extract_links(body)

    analysis = ai_service.analyze_email(
        subject=subject,
        sender=sender,
        body=body,
        links=links,
    )

    return ScamAnalysis(
        email_id=email_id,
        subject=subject,
        sender=sender,
        body_preview=snippet,
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"],
        signals=analysis["signals"],
        explanation=analysis["explanation"],
    )


@router.post("/scan-all", response_model=list[ScamAnalysis])
def scan_all_unread(
    max_results: int = Query(default=3, ge=1, le=5),
    user: dict = Depends(get_current_user),
):
    """
    Fetch unread emails and run AI analysis on all of them.
    Capped at 25 to avoid rate-limit issues during hackathon demos.
    """
    access_token = user["google_access_token"]
    emails = gmail_service.fetch_unread_emails(access_token, max_results=max_results)

    results = []
    for email in emails:
        analysis = ai_service.analyze_email(
            subject=email["subject"],
            sender=email["sender"],
            body=email["body"],
            links=email["raw_links"],
        )
        results.append(
            ScamAnalysis(
                email_id=email["id"],
                subject=email["subject"],
                sender=email["sender"],
                body_preview=email["snippet"],
                risk_score=analysis["risk_score"],
                risk_level=analysis["risk_level"],
                signals=analysis["signals"],
                explanation=analysis["explanation"],
            )
        )

    return results


@router.post("/label/{email_id}", response_model=LabelResponse)
def label_as_scam(
    email_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Apply the '⚠ Scam Detected' Gmail label to a message.
    Creates the label automatically if it doesn't exist.
    """
    access_token = user["google_access_token"]
    label_name = gmail_service.apply_scam_label(access_token, email_id)

    return LabelResponse(
        email_id=email_id,
        labeled=True,
        label_name=label_name,
        message=f"Email successfully labeled as '{label_name}' in Gmail.",
    )
