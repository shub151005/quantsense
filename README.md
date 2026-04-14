# QuantSense — AI-Powered Stock Intelligence Platform

> Know Before You Invest.

**Live Demo:** https://quantsense.vercel.app

---

## What is QuantSense?

QuantSense is a full-stack AI-powered fintech platform that gives Indian retail investors institutional-grade stock intelligence in plain English. Instead of complex charts and jargon, it answers one simple question — *should I be worried about this stock right now?*

---

## The Problem

India has 130 million+ registered retail investors. Most of them open Zerodha or Groww, see a stock, and have no idea if it is a good time to buy, hold, or run. They rely on YouTube finance gurus and WhatsApp tips. That is gambling, not investing.

---

## The Solution

QuantSense combines three AI layers into one signature score:

### The Satta Score (0–100)
Our original composite metric that tells you how speculative a stock is right now.
- **0–30** → Safe. Fundamentally sound.
- **31–60** → Moderate. Watch carefully.
- **61–100** → High risk. Satta territory.

### Three Intelligence Layers

| Layer | Technology | What It Does |
|---|---|---|
| Price Forecast | Facebook Prophet | Predicts next 30 days of price movement |
| Market Sentiment | VADER NLP + GNews | Reads 10 live news headlines and scores market mood |
| Risk Simulation | Monte Carlo (10,000 runs) | Calculates probability of positive returns |

---

## Features

- Search any NSE/BSE or US stock by plain name
- 30-day AI price forecast with confidence intervals
- Real-time market sentiment from live financial news
- Monte Carlo risk simulation with probability scores
- Historical price chart with period toggle
- EMA crossover backtest (Premium)
- Flash news alerts for breaking events (Premium)
- User accounts with watchlist and saved reports
- Freemium model — free tier with premium upgrades
- Live price ticker for top Indian stocks

---

## Tech Stack

### Backend
- Python + FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy ORM
- JWT Authentication + bcrypt
- yFinance (stock data)
- Facebook Prophet (forecasting)
- VADER Sentiment (NLP)
- NumPy (Monte Carlo simulation)
- GNews API (financial news)

### Frontend
- React + Vite
- TailwindCSS
- Recharts (data visualization)
- Fuse.js (fuzzy search)
- Lucide React (icons)
- Axios

### Deployment
- Backend: Render
- Frontend: Vercel
- Database: Supabase (PostgreSQL)

---

## Architecture
User searches "RELIANCE"
↓
React Frontend (Vercel)
↓ API call
FastAPI Backend (Render)
↓
┌─────────────────┐
│  yFinance       │ → Historical price data
│  Prophet AI     │ → 30-day forecast
│  VADER + GNews  │ → Sentiment score
│  Monte Carlo    │ → Risk probability
└─────────────────┘
↓
Satta Score calculated
↓
Results → Frontend Dashboard
---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- GNews API key (gnews.io)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file:
DATABASE_URL=your_supabase_url
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
GNEWS_API_KEY=your_gnews_key
Run backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stock/analyze/{ticker}` | Full analysis — master endpoint |
| GET | `/stock/forecast/{ticker}` | 30-day Prophet forecast |
| GET | `/stock/history/{ticker}` | Historical OHLCV data |
| GET | `/stock/ema/{ticker}` | EMA backtest signals |
| GET | `/sentiment/{ticker}` | VADER sentiment score |
| GET | `/sentiment/market-news` | Live market headlines |
| GET | `/risk/montecarlo/{ticker}` | Monte Carlo simulation |
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login and get JWT |
| GET | `/user/watchlist` | Get saved watchlist |
| POST | `/user/watchlist/add` | Add to watchlist |
| GET | `/user/reports` | Get saved reports |

---

## Monetization Model

| Feature | Free | Premium |
|---|---|---|
| Stock analysis | 3/day | Unlimited |
| Satta Score | ✅ | ✅ |
| 30-day forecast | ✅ | ✅ |
| Sentiment analysis | ✅ | ✅ |
| Risk simulation | ✅ | ✅ |
| Historical chart | ✅ | ✅ |
| Watchlist | ✅ | ✅ |
| Saved reports | ✅ | ✅ |
| EMA Backtest | ❌ | ✅ |
| Flash news alerts | ❌ | ✅ |

**Premium: ₹199/month**
**B2B API: ₹5,000–15,000/month**

---

## Built By

**Subham Mazumdar**
2nd Semester CSE Student — Assam Downtown University

Built session by session over 14 days as a portfolio and hackathon project.

---

## Disclaimer

QuantSense provides data-driven insights for educational purposes only. This is not financial advice. Always do your own research before investing.

