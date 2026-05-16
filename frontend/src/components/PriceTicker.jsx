const STATIC_PRICES = [
  { name: 'RELIANCE', price: '₹1,327' },
  { name: 'TCS', price: '₹3,421' },
  { name: 'INFY', price: '₹1,292' },
  { name: 'HDFCBANK', price: '₹1,810' },
  { name: 'WIPRO', price: '₹257' },
  { name: 'ICICIBANK', price: '₹1,321' },
  { name: 'SBIN', price: '₹793' },
  { name: 'ITC', price: '₹417' },
]

export default function PriceTicker() {
  const doubled = [...STATIC_PRICES, ...STATIC_PRICES]

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#0e2830',
      borderBottom: '1px solid rgba(2,127,147,0.2)',
      padding: '6px 0',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        gap: '40px',
        whiteSpace: 'nowrap',
        animation: 'priceticker 30s linear infinite',
      }}>
        {doubled.map((stock, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ color: '#8888aa', fontSize: '11px', fontFamily: 'monospace' }}>
              {stock.name}
            </span>
            <span style={{ color: '#f78b04', fontSize: '11px', fontFamily: 'monospace', fontWeight: 500 }}>
              {stock.price}
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