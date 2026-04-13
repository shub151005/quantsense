from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import User, Watchlist, Report
from utils.auth_utils import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == payload["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "tier": current_user.tier,
        "created_at": str(current_user.created_at)
    }

@router.get("/watchlist")
def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id
    ).all()
    return {"watchlist": [{"ticker": i.ticker, "added_at": str(i.added_at)} for i in items]}

@router.post("/watchlist/add")
def add_watchlist(
    ticker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.ticker == ticker.upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")
    item = Watchlist(user_id=current_user.id, ticker=ticker.upper())
    db.add(item)
    db.commit()
    return {"message": f"{ticker.upper()} added to watchlist"}

@router.delete("/watchlist/{ticker}")
def remove_watchlist(
    ticker: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.ticker == ticker.upper()
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found in watchlist")
    db.delete(item)
    db.commit()
    return {"message": f"{ticker.upper()} removed from watchlist"}
class ReportSaveRequest(BaseModel):
    ticker: str
    satta_score: float = None
    forecast: dict = None
    sentiment: dict = None
    risk: dict = None

@router.post("/reports/save")
def save_report(
    req: ReportSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = Report(
        user_id=current_user.id,
        ticker=req.ticker.upper(),
        satta_score=req.satta_score,
        forecast=req.forecast,
        sentiment=req.sentiment,
        risk=req.risk
    )
    db.add(report)
    db.commit()
    return {"message": f"Report saved for {req.ticker.upper()}"}

@router.get("/reports")
def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.created_at.desc()).all()
    return {
        "reports": [
            {
                "id": str(r.id),
                "ticker": r.ticker,
                "satta_score": r.satta_score,
                "created_at": str(r.created_at)
            }
            for r in reports
        ]
    }