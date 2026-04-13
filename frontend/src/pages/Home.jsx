import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, Zap, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { getMarketNews } from '../api/stockApi'
import { useAuth } from '../context/AuthContext'

const NSE_STOCKS = [
  { ticker: 'RELIANCE', name: 'Reliance Industries Limited' },
  { ticker: 'TCS', name: 'Tata Consultancy Services' },
  { ticker: 'INFY', name: 'Infosys Limited' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Limited' },
  { ticker: 'WIPRO', name: 'Wipro Limited' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Limited' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Limited' },
  { ticker: 'SBIN', name: 'State Bank of India' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Limited' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Limited' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Limited' },
  { ticker: 'AXISBANK', name: 'Axis Bank Limited' },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  { ticker: 'LT', name: 'Larsen and Toubro Limited' },
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries' },
  { ticker: 'ONGC', name: 'Oil and Natural Gas Corporation' },
  { ticker: 'TITAN', name: 'Titan Company Limited' },
  { ticker: 'ADANIENT', name: 'Adani Enterprises Limited' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
  { ticker: 'ASIANPAINT', name: 'Asian Paints Limited' },
  { ticker: 'HCLTECH', name: 'HCL Technologies Limited' },
  { ticker: 'TATASTEEL', name: 'Tata Steel Limited' },
  { ticker: 'ITC', name: 'ITC Limited' },
  { ticker: 'AAPL', name: 'Apple Inc' },
  { ticker: 'TSLA', name: 'Tesla Inc' },
  { ticker: 'GOOGL', name: 'Alphabet Google' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'NVDA', name: 'Nvidia Corporation' },
  { ticker: 'META', name: 'Meta Platforms Facebook' },
  { ticker: 'AMZN', name: 'Amazon Inc' },
]

const fuse = new Fuse(NSE_STOCKS, {
  keys: ['ticker', 'name'],
  threshold: 0.4,
  includeScore: true,
})

const TRENDING = NSE_STOCKS.slice(0, 6)

function NewsTicker() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMarketNews()
      .then(data => setNews(data.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || news.length === 0) return null

  const doubled = [...news, ...news]

  return (
    <div style={{
      width: '100%',
      borderTop: '1px solid rgba(2,127,147,0.2)',
      backgroundColor: 'rgba(21,58,66,0.5)',
      padding: '10px 0',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          flexShrink: 0,
          backgroundColor: '#f78b04',
          padding: '2px 10px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#2b1718',
          marginLeft: '12px',
        }}>
          LIVE NEWS
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{
            display: 'flex',
            gap: '32px',
            whiteSpace: 'nowrap',
            animation: 'ticker 40s linear infinite',
          }}>
            {doubled.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, textDecoration: 'none' }}
              >
                <span style={{ color: '#027f93', fontSize: '10px' }}>●</span>
                <span style={{ color: '#aaaaaa', fontSize: '11px' }}>{item.title}</span>
                <span style={{ color: '#555555', fontSize: '11px' }}>— {item.source}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showLimitBanner, setShowLimitBanner] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const results = fuse.search(query.trim())
    setSuggestions(results.slice(0, 6).map(r => r.item))
    setShowSuggestions(true)
  }, [query])

  const checkSearchLimit = () => {
    const searches = JSON.parse(localStorage.getItem('guest_searches') || '[]')
    const today = new Date().toDateString()
    return searches.filter(s => s.date === today).length
  }

  const incrementSearchCount = () => {
    const searches = JSON.parse(localStorage.getItem('guest_searches') || '[]')
    const today = new Date().toDateString()
    searches.push({ date: today })
    localStorage.setItem('guest_searches', JSON.stringify(searches))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (!user && checkSearchLimit() >= 3) {
        setShowLimitBanner(true)
        return
      }
      const results = fuse.search(query.trim())
      const ticker = results.length > 0
        ? results[0].item.ticker
        : query.trim().toUpperCase()
      if (!user) incrementSearchCount()
      setShowSuggestions(false)
      navigate(`/dashboard/${ticker}`)
    }
  }

  const handleSelect = (ticker) => {
    if (!user && checkSearchLimit() >= 3) {
      setShowLimitBanner(true)
      return
    }
    if (!user) incrementSearchCount()
    setShowSuggestions(false)
    setQuery('')
    navigate(`/dashboard/${ticker}`)
  }

  const handleTrending = (ticker) => {
    if (!user && checkSearchLimit() >= 3) {
      setShowLimitBanner(true)
      return
    }
    if (!user) incrementSearchCount()
    navigate(`/dashboard/${ticker}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#2b1718' }}>

      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.35,
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(to bottom, rgba(43,23,24,0.3) 0%, rgba(43,23,24,0.7) 50%, rgba(43,23,24,0.98) 100%)',
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px',
        position: 'relative',
        zIndex: 10,
      }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '40px', height: '40px',
              backgroundColor: '#f78b04',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#2b1718" />
            </div>
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 300,
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '-1px',
            lineHeight: 1.1,
          }}>
            Know Before You <span style={{ color: '#f78b04' }}>Invest.</span>
          </h1>
          <p style={{ color: '#8888aa', fontSize: '18px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            AI-powered stock intelligence for India's retail investors.
            Forecast. Sentiment. Risk. All in one score.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '640px', marginBottom: '16px', position: 'relative' }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#153a42',
              border: '1px solid rgba(247,139,4,0.4)',
              borderRadius: '50px',
              padding: '12px 24px',
              gap: '12px',
            }}>
              <Search size={20} color="#f78b04" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="Enter stock name — e.g. Reliance, TCS, Apple..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '15px',
                }}
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                  <X size={16} />
                </button>
              )}
              <button type="submit" style={{
                backgroundColor: '#f78b04',
                color: '#2b1718',
                border: 'none',
                borderRadius: '50px',
                padding: '8px 24px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer',
                flexShrink: 0,
              }}>
                Analyze
              </button>
            </div>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              marginTop: '8px',
              backgroundColor: '#153a42',
              border: '1px solid rgba(2,127,147,0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
              zIndex: 50,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
              {suggestions.map((stock) => (
                <button
                  key={stock.ticker}
                  type="button"
                  onClick={() => handleSelect(stock.ticker)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(2,127,147,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <p style={{ color: '#ffffff', fontSize: '13px', fontFamily: 'monospace', fontWeight: 500 }}>{stock.ticker}</p>
                    <p style={{ color: '#8888aa', fontSize: '11px' }}>{stock.name}</p>
                  </div>
                  <TrendingUp size={14} color="#027f93" />
                </button>
              ))}
            </div>
          )}
        </div>

        {showLimitBanner && (
          <div style={{
            width: '100%', maxWidth: '640px',
            backgroundColor: '#153a42',
            border: '1px solid rgba(247,139,4,0.4)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <p style={{ color: '#f78b04', fontSize: '14px', fontWeight: 500 }}>Daily search limit reached</p>
              <p style={{ color: '#8888aa', fontSize: '12px', marginTop: '4px' }}>Sign up free to get unlimited searches</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/signup" style={{
                backgroundColor: '#f78b04', color: '#2b1718',
                padding: '6px 16px', borderRadius: '50px',
                fontSize: '12px', fontWeight: 500, textDecoration: 'none',
              }}>
                Sign Up Free
              </Link>
              <button onClick={() => setShowLimitBanner(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '18px' }}>
                ✕
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '64px' }}>
          {TRENDING.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleTrending(stock.ticker)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#153a42',
                border: '1px solid rgba(2,127,147,0.2)',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '13px',
                color: '#cccccc',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(2,127,147,0.6)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(2,127,147,0.2)'; e.currentTarget.style.color = '#cccccc' }}
            >
              <TrendingUp size={12} color="#f78b04" />
              {stock.ticker}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', width: '100%' }}>
          <div style={{ backgroundColor: '#153a42', border: '1px solid rgba(2,127,147,0.2)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(2,127,147,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <TrendingUp size={16} color="#027f93" />
            </div>
            <h3 style={{ color: '#ffffff', fontWeight: 500, marginBottom: '8px' }}>30-Day Forecast</h3>
            <p style={{ color: '#8888aa', fontSize: '14px', lineHeight: 1.6 }}>
              Prophet AI analyzes 2 years of price history to predict where a stock is headed next month.
            </p>
          </div>
          <div style={{ backgroundColor: '#153a42', border: '1px solid rgba(247,139,4,0.2)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(247,139,4,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Zap size={16} color="#f78b04" />
            </div>
            <h3 style={{ color: '#ffffff', fontWeight: 500, marginBottom: '8px' }}>Sentiment Analysis</h3>
            <p style={{ color: '#8888aa', fontSize: '14px', lineHeight: 1.6 }}>
              VADER NLP reads 10 live financial headlines and converts market emotion into a mood score.
            </p>
          </div>
          <div style={{ backgroundColor: '#153a42', border: '1px solid rgba(163,5,2,0.2)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(163,5,2,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <TrendingDown size={16} color="#a30502" />
            </div>
            <h3 style={{ color: '#ffffff', fontWeight: 500, marginBottom: '8px' }}>Risk Simulation</h3>
            <p style={{ color: '#8888aa', fontSize: '14px', lineHeight: 1.6 }}>
              Monte Carlo runs 10,000 simulations of possible futures to calculate your probability of profit.
            </p>
          </div>
        </div>

      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <NewsTicker />
        <footer style={{
          borderTop: '1px solid #153a42',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ color: '#44445a', fontSize: '12px' }}>© 2026 QuantSense. Not financial advice.</p>
          <p style={{ color: '#44445a', fontSize: '12px' }}>Data powered by Yahoo Finance and GNews</p>
        </footer>
      </div>

    </div>
  )
}