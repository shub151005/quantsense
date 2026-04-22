from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, stock, sentiment, risk, user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuantSense API",
    description="AI-powered stock intelligence for Indian retail investors",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://quantsense.vercel.app",
        "https://quantsense-backend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(stock.router, prefix="/stock", tags=["Stock"])
app.include_router(sentiment.router, prefix="/sentiment", tags=["Sentiment"])
app.include_router(risk.router, prefix="/risk", tags=["Risk"])
app.include_router(user.router, prefix="/user", tags=["User"])

@app.get("/")
def health_check():
    return {
        "status": "QuantSense API is live",
        "version": "1.0.0"
    }