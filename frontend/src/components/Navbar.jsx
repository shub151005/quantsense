import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, LogOut, User, Search, X, TrendingUp } from 'lucide-react'
import Fuse from 'fuse.js'

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
]

const fuse = new Fuse(NSE_STOCKS, {
  keys: ['ticker', 'name'],
  threshold: 0.4,
})

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const results = fuse.search(query.trim())
    setSuggestions(results.slice(0, 5).map(r => r.item))
    setShowSuggestions(true)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      const results = fuse.search(query.trim())
      const ticker = results.length > 0
        ? results[0].item.ticker
        : query.trim().toUpperCase()
      setQuery('')
      setShowSuggestions(false)
      setSearchOpen(false)
      navigate(`/dashboard/${ticker}`)
    }
  }

  const handleSelect = (ticker) => {
    setQuery('')
    setShowSuggestions(false)
    setSearchOpen(false)
    navigate(`/dashboard/${ticker}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="w-full bg-br-surface border-b border-br-teal/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-br-amber rounded flex items-center justify-center">
          <Zap size={16} className="text-br-base" />
        </div>
        <span className="text-white font-semibold text-lg tracking-wide">
          QuantSense
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6 mx-6">
  <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
    Overview
  </Link>
  <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
    Reports
  </Link>
  <a
    href="https://quantsense-docs.vercel.app"
    className="text-gray-600 text-sm cursor-not-allowed opacity-50"
    onClick={(e) => e.preventDefault()}
  >
    Backtests
  </a>
</div>

      <div className="hidden md:block flex-1 max-w-sm mx-4 relative" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <div className="flex items-center bg-br-base border border-br-teal/20 rounded-full px-4 py-2 gap-2 focus-within:border-br-teal/60 transition-colors">
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowSuggestions(true)}
              placeholder="Search any stock..."
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]) }}
                className="text-gray-500 hover:text-gray-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-br-surface border border-br-teal/30 rounded-xl overflow-hidden z-50 shadow-xl">
            {suggestions.map((stock) => (
              <button
                key={stock.ticker}
                type="button"
                onClick={() => handleSelect(stock.ticker)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-br-teal/10 transition-colors text-left"
              >
                <div>
                  <p className="text-white text-xs font-mono font-medium">{stock.ticker}</p>
                  <p className="text-gray-400 text-xs">{stock.name}</p>
                </div>
                <TrendingUp size={12} className="text-br-teal" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-br-teal animate-pulse" />
          <span className="text-gray-400 text-xs">Live</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-br-base px-3 py-1.5 rounded-full hover:bg-br-base/80 transition-colors"
            >
              <div className="w-6 h-6 bg-br-amber/20 border border-br-amber rounded flex items-center justify-center">
                <User size={12} className="text-br-amber" />
              </div>
              <span className="text-white text-sm">{user.name}</span>
              <span className="text-xs bg-br-teal/20 text-br-teal px-2 py-0.5 rounded-full border border-br-teal/30">
                {user.tier === 'premium' ? 'PRO' : 'FREE'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-br-crimson transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-br-teal border border-br-teal/50 px-4 py-1.5 rounded-full text-sm hover:bg-br-teal/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-br-amber text-br-base px-4 py-1.5 rounded-full text-sm font-medium hover:bg-amber-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}