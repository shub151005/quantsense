# QuantSense — AI-Powered Stock Intelligence Platform

> Know Before You Invest.

**🌐 Live Demo:** https://quantsense.vercel.app

---

## What is QuantSense?

QuantSense is a full-stack AI-powered fintech platform that gives Indian retail investors institutional-grade stock intelligence in plain English. Instead of complex charts and jargon, it answers one simple question — *should I be worried about this stock right now?*

India has 130 million+ registered retail investors. Most of them make investment decisions based on YouTube tips and WhatsApp forwards. QuantSense changes that.

---

## The Satta Score — Our Signature Feature

A single number from 0 to 100 that tells you how speculative a stock is right now.

| Score | Label | Meaning |
|---|---|---|
| 0–30 | 🟢 SAFE | Fundamentally sound |
| 31–60 | 🟡 MODERATE | Watch carefully |
| 61–100 | 🔴 HIGH RISK | Satta territory |

---

## Three AI Intelligence Layers

| Layer | Technology | What It Does |
|---|---|---|
| 📈 Price Forecast | Facebook Prophet | Predicts next 30 days of price movement with confidence intervals |
| 📰 Market Sentiment | VADER NLP + GNews | Reads 10 live financial headlines and scores market mood |
| 🎲 Risk Simulation | Monte Carlo (10,000 runs) | Calculates probability of positive returns |

---

## Features

- 🔍 Search any NSE, BSE or US stock by plain name — no ticker knowledge needed
- 📊 30-day AI price forecast with upper and lower confidence bands
- 📰 Real-time market sentiment from live financial headlines
- 🎲 Monte Carlo risk simulation with probability distribution chart
- 📉 Historical price chart with 1W/1M/3M/6M/1Y toggle
- 📡 Live price ticker showing top Indian stocks in real time
- 🔒 EMA crossover backtest strategy (Premium)
- ⚡ Flash news alerts for breaking market events (Premium)
- 👤 User accounts with watchlist and saved reports
- 💰 Freemium model — free tier with premium upgrades at ₹199/month
- 📱 Mobile responsive design

---

## Tech Stack

### Backend
- Python + FastAPI
- Neon PostgreSQL (serverless)
- SQLAlchemy ORM
- JWT Authentication + bcrypt
- yFinance + Alpha Vantage (stock data)
- Facebook Prophet (time series forecasting)
- VADER Sentiment Analysis (NLP)
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
- Backend: Hugging Face Spaces (Docker)
- Frontend: Vercel
- Database: Neon PostgreSQL

---

## Architecture
User searches "RELIANCE"
↓
React Frontend (Vercel)
↓ REST API call
FastAPI Backend (Hugging Face)
↓
┌─────────────────────────┐
│  Alpha Vantage + yFinance│ → Live stock data
│  Facebook Prophet        │ → 30-day forecast
│  VADER + GNews           │ → Sentiment score
│  Monte Carlo (NumPy)     │ → Risk probability
└─────────────────────────┘
↓
Satta Score calculated (composite of all 3)
↓
Full analysis → React Dashboard

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Neon or Supabase PostgreSQL account
- GNews API key (gnews.io)
- Alpha Vantage API key (alphavantage.co)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file:
DATABASE_URL=your_neon_or_supabase_url
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
GNEWS_API_KEY=your_gnews_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key

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
| GET | `/stock/analyze/{ticker}` | Full AI analysis — master endpoint |
| GET | `/stock/forecast/{ticker}` | 30-day Prophet forecast |
| GET | `/stock/history/{ticker}` | Historical OHLCV price data |
| GET | `/stock/ema/{ticker}` | EMA crossover backtest |
| GET | `/sentiment/{ticker}` | VADER sentiment score |
| GET | `/sentiment/market-news` | Live Indian market headlines |
| GET | `/risk/montecarlo/{ticker}` | Monte Carlo risk simulation |
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/user/watchlist` | Get saved watchlist |
| POST | `/user/watchlist/add` | Add stock to watchlist |
| GET | `/user/reports` | Get saved analysis reports |

---

## Monetization Model

| Feature | Free | Premium ₹199/mo |
|---|---|---|
| Stock searches | 3/day | Unlimited |
| Satta Score | ✅ | ✅ |
| 30-day forecast | ✅ | ✅ |
| Sentiment analysis | ✅ | ✅ |
| Risk simulation | ✅ | ✅ |
| Historical chart | ✅ | ✅ |
| Watchlist | ✅ | ✅ |
| Saved reports | ✅ | ✅ |
| EMA Backtest | ❌ | ✅ |
| Flash news alerts | ❌ | ✅ |

---

## Built By

**Subham Mazumdar**
2nd Semester CSE Student — Assam Downtown University
Guwahati, Assam, India

Built over 14 days as a portfolio and hackathon project — backend, ML models, frontend, and full deployment included.

---

## Disclaimer

QuantSense provides data-driven insights for educational purposes only. This is not financial advice. Always do your own research before making investment decisions.

---

⭐ If you found this useful, consider starring the repository!