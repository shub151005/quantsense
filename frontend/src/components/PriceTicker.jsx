import { useState, useEffect } from 'react'
import axios from 'axios'
const BASE_URL = 'https://subh151005-quantsense-backend.hf.space'
const WATCH_TICKERS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'WIPRO', 'ICICIBANK', 'SBIN', 'ITC']

export default function PriceTicker() {
  const [prices, setPrices] = useState([])

  const fetchPrices = async () => {
    try {
      const results = await Promise.allSettled(
        WATCH_TICKERS.map(ticker =>
          axios.get(`https://quantsense-backend.onrender.com/stock/info/${ticker}`)
        )
      )
      const data = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.data)
        .filter(d => d.current_price)
      setPrices(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  if (prices.length === 0) return null

  const doubled = [...prices, ...prices]

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0e2830',
        borderBottom: '1px solid rgba(2,127,147,0.2)',
        padding: '6px 0',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '40px',
          whiteSpace: 'nowrap',
          animation: 'priceticker 30s linear infinite',
        }}
      >
        {doubled.map((stock, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ color: '#8888aa', fontSize: '11px', fontFamily: 'monospace' }}>
              {stock.name?.split(' ')[0].toUpperCase()}
            </span>
            <span style={{ color: '#f78b04', fontSize: '11px', fontFamily: 'monospace', fontWeight: 500 }}>
              ₹{stock.current_price?.toLocaleString('en-IN')}
            </span>
            <span style={{ color: '#027f93', fontSize: '10px' }}>●</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes priceticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}