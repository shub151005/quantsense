import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { analyzeStock, getStockHistory, getEMABacktest, addToWatchlist, saveReport } from '../api/stockApi'
import {
  TrendingUp, TrendingDown, Bookmark, AlertCircle,
  Zap, Activity, Radio, GitBranch, Lock
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts'
import axios from 'axios'

export default function Dashboard() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await analyzeStock(ticker)
        setData(result)
      } catch (err) {
        setError('Could not analyze this stock. Please check the ticker and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [ticker, authLoading])

  if (authLoading) return <LoadingState ticker={ticker} />
  if (loading) return <LoadingState ticker={ticker} />
  if (error) return <ErrorState error={error} navigate={navigate} />
  if (!data) return null

  return (
    <div className="min-h-screen bg-br-base">
       <FlashAlert ticker={ticker} userTier={user?.tier || 'free'} />
      <StockHeader info={data.info} ticker={ticker} data={data} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <SattaScoreCard satta={data.satta_score} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ForecastCard forecast={data.forecast} />
          <SentimentCard sentiment={data.sentiment} />
          <RiskCard risk={data.risk} />
        </div>
        <HistoricalChart ticker={ticker} />
        <EMACard ticker={ticker} userTier={user?.tier || 'free'} />
      </div>
      <DashboardFooter />
    </div>
  )
}




function ErrorState({ error, navigate }) {
  return (
    <div className="min-h-screen bg-br-base flex flex-col items-center justify-center gap-4">
      <AlertCircle size={48} className="text-br-crimson" />
      <p className="text-white text-lg">{error}</p>
      <button
        onClick={() => navigate('/')}
        className="bg-br-amber text-br-base px-6 py-2 rounded-full text-sm font-medium"
      >
        Go Back
      </button>
    </div>
  )
}



function StockHeader({ info, ticker, data }) {
  const { user, token } = useAuth()
  const [watchlisted, setWatchlisted] = useState(false)
  const [reportSaved, setReportSaved] = useState(false)
  const [wLoading, setWLoading] = useState(false)

  const handleWatchlist = async () => {
    if (!user) {
      alert('Please login to save to watchlist')
      return
    }
    setWLoading(true)
    try {
      await addToWatchlist(token, ticker)
      setWatchlisted(true)
    } catch (e) {
      if (e.response?.data?.detail === 'Already in watchlist') {
        setWatchlisted(true)
      }
    } finally {
      setWLoading(false)
    }
  }

  const handleSaveReport = async () => {
    if (!user) {
      alert('Please login to save reports')
      return
    }
    try {
      await saveReport(token, ticker, {
        satta_score: data?.satta_score?.score,
        forecast: data?.forecast,
        sentiment: data?.sentiment,
        risk: data?.risk
      })
      setReportSaved(true)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="bg-br-surface border-b border-br-teal/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <h1 className="text-white text-2xl font-semibold">{info?.name || ticker}</h1>
            <span className="text-xs bg-br-teal/20 text-br-teal px-2 py-1 rounded border border-br-teal/30">
              {info?.exchange || 'NSE'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{info?.sector} · {info?.industry}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-white text-2xl font-mono font-medium">
              ₹{info?.current_price?.toLocaleString('en-IN')}
            </p>
            <p className="text-gray-400 text-xs mt-1">{info?.currency}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider">52W High</p>
            <p className="text-br-teal font-mono text-sm">₹{info?.['52_week_high']?.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider">52W Low</p>
            <p className="text-br-crimson font-mono text-sm">₹{info?.['52_week_low']?.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Market Cap</p>
            <p className="text-white font-mono text-sm">
              ₹{info?.market_cap ? (info.market_cap / 1e12).toFixed(2) + 'T' : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider">P/E</p>
            <p className="text-white font-mono text-sm">{info?.pe_ratio?.toFixed(2) || 'N/A'}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWatchlist}
              disabled={wLoading || watchlisted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors border ${
                watchlisted
                  ? 'bg-br-teal/20 text-br-teal border-br-teal/40'
                  : 'text-gray-400 border-gray-700 hover:border-br-teal/40 hover:text-br-teal'
              }`}
            >
              <Bookmark size={12} fill={watchlisted ? 'currentColor' : 'none'} />
              {watchlisted ? 'Saved' : 'Watchlist'}
            </button>

            <button
              onClick={handleSaveReport}
              disabled={reportSaved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors border ${
                reportSaved
                  ? 'bg-br-amber/20 text-br-amber border-br-amber/40'
                  : 'text-gray-400 border-gray-700 hover:border-br-amber/40 hover:text-br-amber'
              }`}
            >
              {reportSaved ? '✓ Report Saved' : 'Save Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SattaScoreCard({ satta }) {
  const colorMap = {
    teal: { text: 'text-br-teal', border: 'border-br-teal/30', bg: 'bg-br-teal/10' },
    amber: { text: 'text-br-amber', border: 'border-br-amber/30', bg: 'bg-br-amber/10' },
    crimson: { text: 'text-br-crimson', border: 'border-br-crimson/30', bg: 'bg-br-crimson/10' },
  }
  const colors = colorMap[satta?.color] || colorMap.amber
  const score = satta?.score || 0
  const safeWidth = Math.min(score, 30) / 30 * 100
  const moderateWidth = Math.min(Math.max(score - 30, 0), 30) / 30 * 100
  const dangerWidth = Math.min(Math.max(score - 60, 0), 40) / 40 * 100

  return (
    <div className={`bg-br-surface border ${colors.border} rounded-2xl p-6`}>
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Zap size={16} className={colors.text} />
        </div>
        <span className="text-gray-400 text-xs uppercase tracking-widest">Satta Score</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-7xl font-mono font-medium ${colors.text}`}>{satta?.score}</p>
          <p className={`text-sm font-medium mt-2 ${colors.text}`}>{satta?.label}</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md">{satta?.advice}</p>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <ScorePill label="Volatility" value="40%" color="text-br-teal" border="border-br-teal/30" />
          <ScorePill label="Sentiment" value="30%" color="text-br-amber" border="border-br-amber/30" />
          <ScorePill label="Deviation" value="30%" color="text-br-crimson" border="border-br-crimson/30" />
        </div>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <div className="bg-br-teal" style={{ width: '30%' }} />
        <div className="bg-br-amber" style={{ width: '30%' }} />
        <div className="bg-br-crimson" style={{ width: '40%' }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-gray-600 text-xs">0 — Safe</span>
        <span className="text-gray-600 text-xs">50 — Moderate</span>
        <span className="text-gray-600 text-xs">100 — Satta</span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Volatility Risk</p>
            <p className="text-white font-mono">{satta?.breakdown?.volatility_contribution?.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Sentiment Risk</p>
            <p className="text-white font-mono">{satta?.breakdown?.sentiment_contribution?.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Deviation Risk</p>
            <p className="text-white font-mono">{satta?.breakdown?.deviation_contribution?.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScorePill({ label, value, color, border }) {
  return (
    <div className={`flex items-center gap-2 border ${border} rounded-full px-3 py-1.5`}>
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-xs font-mono font-medium ${color}`}>{value}</span>
    </div>
  )
}

function ForecastCard({ forecast }) {
  const chartData = forecast?.forecast?.map(d => ({
    date: d.date.slice(5),
    predicted: d.predicted,
    lower: d.lower,
    upper: d.upper,
  })) || []

  const isUp = forecast?.trend === 'UP'
  const explanation = isUp
    ? `Prophet AI predicts an upward trend of ${forecast?.expected_change_pct}% over the next 30 days. Current price ₹${forecast?.current_price} with forecast reaching up to ₹${forecast?.forecast?.[forecast.forecast.length - 1]?.upper?.toLocaleString('en-IN')} in the best case.`
    : `Prophet AI signals downward pressure of ${Math.abs(forecast?.expected_change_pct)}% over the next 30 days. Monitor support levels closely before entering a position.`

  return (
    <div className="bg-br-surface border border-br-teal/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-br-teal" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">30-Day Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          {isUp
            ? <TrendingUp size={16} className="text-br-teal" />
            : <TrendingDown size={16} className="text-br-crimson" />
          }
          <span className={`text-xs font-mono font-medium ${isUp ? 'text-br-teal' : 'text-br-crimson'}`}>
            {isUp ? '+' : ''}{forecast?.expected_change_pct}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#027f93" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#027f93" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2a30" />
          <XAxis dataKey="date" tick={{ fill: '#44445a', fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fill: '#44445a', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#153a42', border: '1px solid #027f93', borderRadius: 8 }}
            labelStyle={{ color: '#8888aa' }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Area type="monotone" dataKey="upper" stroke="none" fill="url(#forecastGrad)" />
          <Line type="monotone" dataKey="predicted" stroke="#027f93" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="lower" stroke="#027f93" strokeWidth={0.5} dot={false} strokeOpacity={0.4} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-gray-400 text-xs leading-relaxed mt-4 pt-4 border-t border-gray-800">
        {explanation}
      </p>
      <p className="text-gray-600 text-xs mt-2">
        Powered by Prophet AI · Data as of {new Date().toLocaleDateString('en-IN')}
      </p>
    </div>
  )
}

function SentimentCard({ sentiment }) {
  const isBullish = sentiment?.mood === 'BULLISH'
  const isBearish = sentiment?.mood === 'BEARISH'
  const scoreColor = isBullish ? 'text-br-amber' : isBearish ? 'text-br-crimson' : 'text-gray-400'
  const score = sentiment?.score || 0
  const markerPosition = ((score + 1) / 2) * 100

  const explanation = isBullish
    ? `Market sentiment around ${sentiment?.ticker} is positive. ${sentiment?.breakdown?.positive} out of ${sentiment?.total_articles} recent headlines carry bullish signals, suggesting favorable news flow.`
    : isBearish
    ? `Market sentiment is currently bearish with ${sentiment?.breakdown?.negative} negative headlines detected. Monitor news flow closely as negative sentiment can precede price pressure.`
    : `Sentiment is neutral with mixed signals. ${sentiment?.breakdown?.positive} positive and ${sentiment?.breakdown?.negative} negative headlines detected from recent news.`

  return (
    <div className="bg-br-surface border border-br-amber/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-br-amber" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">Market Sentiment</span>
        </div>
        <span className={`text-xs font-mono font-medium px-2 py-1 rounded border ${
          isBullish ? 'text-br-amber border-br-amber/30 bg-br-amber/10' :
          isBearish ? 'text-br-crimson border-br-crimson/30 bg-br-crimson/10' :
          'text-gray-400 border-gray-700'
        }`}>
          {sentiment?.mood}
        </span>
      </div>

      <div className="text-center mb-4">
        <p className={`text-5xl font-mono font-medium ${scoreColor}`}>
          {score > 0 ? '+' : ''}{score?.toFixed(3)}
        </p>
      </div>

      <div className="relative mb-4">
        <div className="h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #a30502, #8888aa, #f78b04)'
        }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-br-surface"
          style={{ left: `${markerPosition}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mb-4">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-br-teal/10 border border-br-teal/20 rounded-lg p-2 text-center">
          <p className="text-br-teal font-mono text-lg">{sentiment?.breakdown?.positive}</p>
          <p className="text-gray-500 text-xs">Positive</p>
        </div>
        <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-300 font-mono text-lg">{sentiment?.breakdown?.neutral}</p>
          <p className="text-gray-500 text-xs">Neutral</p>
        </div>
        <div className="flex-1 bg-br-crimson/10 border border-br-crimson/20 rounded-lg p-2 text-center">
          <p className="text-br-crimson font-mono text-lg">{sentiment?.breakdown?.negative}</p>
          <p className="text-gray-500 text-xs">Negative</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {sentiment?.headlines?.slice(0, 4).map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group"
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              h.sentiment === 'positive' ? 'bg-br-teal' :
              h.sentiment === 'negative' ? 'bg-br-crimson' :
              'bg-gray-600'
            }`} />
            <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-200 transition-colors line-clamp-1">
              {h.title}
            </p>
          </a>
        ))}
      </div>

      <p className="text-gray-400 text-xs leading-relaxed pt-4 border-t border-gray-800">
        {explanation}
      </p>
    </div>
  )
}

function RiskCard({ risk }) {
  const isLow = risk?.risk_label === 'LOW RISK'
  const isHigh = risk?.risk_label === 'HIGH RISK'
  const color = isLow ? 'text-br-teal' : isHigh ? 'text-br-crimson' : 'text-br-amber'
  const borderColor = isLow ? 'border-br-teal/20' : isHigh ? 'border-br-crimson/20' : 'border-br-amber/20'

  const distData = risk?.distribution?.map(d => ({
    range: d.price_range.split('-')[0],
    count: d.count,
    pct: d.percentage
  })) || []

  const maxCount = Math.max(...distData.map(d => d.count))

  const explanation = `Monte Carlo simulation ran ${risk?.simulations_run?.toLocaleString()} scenarios. There is a ${risk?.probability_positive}% probability of positive returns over ${risk?.forecast_days} days. Price is most likely to land around ₹${risk?.price_targets?.most_likely?.toLocaleString('en-IN')} with a worst case of ₹${risk?.price_targets?.worst_case?.toLocaleString('en-IN')} and best case of ₹${risk?.price_targets?.best_case?.toLocaleString('en-IN')}.`

  return (
    <div className={`bg-br-surface border ${borderColor} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-br-teal" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">Risk Simulation</span>
        </div>
        <span className={`text-xs font-mono ${color}`}>{risk?.risk_label}</span>
      </div>

      <div className="text-center mb-4">
        <p className={`text-5xl font-mono font-medium ${color}`}>
          {risk?.probability_positive}%
        </p>
        <p className="text-gray-400 text-xs mt-1">probability of positive outcome</p>
        <p className="text-gray-600 text-xs">Based on {risk?.simulations_run?.toLocaleString()} simulations</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-br-crimson/10 border border-br-crimson/20 rounded-lg p-2 text-center">
          <p className="text-br-crimson font-mono text-sm">₹{risk?.price_targets?.worst_case?.toLocaleString('en-IN')}</p>
          <p className="text-gray-500 text-xs">Worst</p>
          <p className="text-br-crimson text-xs">{risk?.price_targets?.pct_change_worst}%</p>
        </div>
        <div className="bg-br-teal/10 border border-br-teal/20 rounded-lg p-2 text-center">
          <p className="text-br-teal font-mono text-sm">₹{risk?.price_targets?.most_likely?.toLocaleString('en-IN')}</p>
          <p className="text-gray-500 text-xs">Likely</p>
          <p className="text-br-teal text-xs">{risk?.price_targets?.pct_change_likely}%</p>
        </div>
        <div className="bg-br-amber/10 border border-br-amber/20 rounded-lg p-2 text-center">
          <p className="text-br-amber font-mono text-sm">₹{risk?.price_targets?.best_case?.toLocaleString('en-IN')}</p>
          <p className="text-gray-500 text-xs">Best</p>
          <p className="text-br-amber text-xs">+{risk?.price_targets?.pct_change_best}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={distData} barSize={6}>
          <Tooltip
            contentStyle={{ background: '#153a42', border: '1px solid #027f93', borderRadius: 8, fontSize: 10 }}
            labelStyle={{ color: '#8888aa' }}
            formatter={(v) => [`${v} scenarios`]}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {distData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.count === maxCount ? '#027f93' : entry.count < maxCount * 0.3 ? '#a30502' : '#f78b04'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-gray-400 text-xs leading-relaxed mt-4 pt-4 border-t border-gray-800">
        {explanation}
      </p>
    </div>
  )
}

function HistoricalChart({ ticker }) {
  const [data, setData] = useState([])
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(true)
  

  const periods = ['1mo', '3mo', '6mo', '1y']

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const result = await getStockHistory(ticker, period)
        const formatted = result.data.map(d => ({
          date: new Date(d.Date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          close: d.Close,
          open: d.Open,
          high: d.High,
          low: d.Low,
          volume: d.Volume,
        }))
        setData(formatted)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [ticker, period])

  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.low)) * 0.99 : 0
  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.high)) * 1.01 : 0

  const explanation = data.length > 0
    ? `Over the selected period, ${ticker} traded between ₹${Math.min(...data.map(d => d.low)).toFixed(2)} and ₹${Math.max(...data.map(d => d.high)).toFixed(2)}. The closing price trend shows ${data[data.length - 1]?.close > data[0]?.close ? 'overall appreciation' : 'overall depreciation'} over this timeframe.`
    : ''

  const ChartContent = ({ height = 220 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#027f93" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#027f93" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2a30" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#44445a', fontSize: 10 }}
          tickLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fill: '#44445a', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={[minPrice, maxPrice]}
          tickFormatter={(v) => `₹${v.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{ background: '#153a42', border: '1px solid #027f93', borderRadius: 8 }}
          labelStyle={{ color: '#8888aa', fontSize: 11 }}
          itemStyle={{ color: '#ffffff', fontSize: 11 }}
          formatter={(value, name) => [`₹${value?.toFixed(2)}`, name]}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke="#027f93"
          strokeWidth={2}
          fill="url(#histGrad)"
          dot={false}
          name="Close"
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <>
      

      <div className="bg-br-surface border border-br-teal/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-br-teal" />
            <span className="text-gray-400 text-xs uppercase tracking-wider">Price History — {ticker}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    period === p ? 'bg-br-teal text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-400 text-sm animate-pulse">Loading chart...</p>
          </div>
        ) : (
          <ChartContent height={220} />
        )}

        <p className="text-gray-400 text-xs leading-relaxed mt-4 pt-4 border-t border-gray-800">
          {explanation}
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Data as of {new Date().toLocaleDateString('en-IN')} · Source: Yahoo Finance
        </p>
      </div>
    </>
  )
}

function EMACard({ ticker, userTier }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (userTier !== 'premium') return
    const fetch = async () => {
      setLoading(true)
      try {
        const result = await getEMABacktest(ticker)
        setData(result)
      } catch (e) {
        console.error('EMA fetch error:',e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [ticker, userTier])

  if (userTier !== 'premium') {
    return (
      <div className="bg-br-surface border border-br-amber/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-br-amber" />
            <span className="text-gray-400 text-xs uppercase tracking-wider">EMA Backtest</span>
          </div>
          <span className="text-xs bg-br-amber/20 text-br-amber px-2 py-1 rounded border border-br-amber/30 flex items-center gap-1">
            <Lock size={10} /> PRO
          </span>
        </div>
        <div className="blur-sm pointer-events-none">
          <div className="h-40 bg-br-base/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 text-sm">EMA Chart Preview</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Win Rate</p>
              <p className="text-white font-mono">68%</p>
            </div>
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Avg Return</p>
              <p className="text-br-teal font-mono">+4.2%</p>
            </div>
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Total Trades</p>
              <p className="text-white font-mono">12</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-br-base/70 rounded-2xl">
          <Lock size={24} className="text-br-amber mb-3" />
          <p className="text-white font-medium mb-1">EMA Backtesting — Premium Feature</p>
          <p className="text-gray-400 text-sm mb-4 text-center px-8">
            Unlock strategy signals, win rate analysis and P&L history
          </p>
          <button className="bg-br-amber text-br-base px-6 py-2 rounded-full text-sm font-medium hover:bg-amber-400 transition-colors">
            Upgrade to Premium — ₹199/mo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-br-surface border border-br-amber/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-br-amber" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">EMA Backtest</span>
        </div>
        <span className="text-xs bg-br-amber/20 text-br-amber px-2 py-1 rounded border border-br-amber/30">
          PRO
        </span>
      </div>

      {loading && (
        <div className="h-40 flex items-center justify-center">
          <p className="text-gray-400 text-sm animate-pulse">Loading backtest...</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Win Rate</p>
              <p className="text-br-teal font-mono text-lg">{data.win_rate}%</p>
            </div>
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Avg Return</p>
              <p className={`font-mono text-lg ${data.avg_return_pct >= 0 ? 'text-br-teal' : 'text-br-crimson'}`}>
                {data.avg_return_pct >= 0 ? '+' : ''}{data.avg_return_pct}%
              </p>
            </div>
            <div className="bg-br-base rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Total Trades</p>
              <p className="text-white font-mono text-lg">{data.total_trades}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Last Signals</p>
            {data.last_three_signals?.map((signal, i) => (
              <div key={i} className="flex items-center justify-between bg-br-base rounded-lg px-3 py-2">
                <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                  signal.signal === 'BUY'
                    ? 'bg-br-teal/20 text-br-teal'
                    : 'bg-br-crimson/20 text-br-crimson'
                }`}>
                  {signal.signal}
                </span>
                <span className="text-gray-400 text-xs">{signal.date}</span>
                <span className="text-white font-mono text-xs">₹{signal.price}</span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.chart_data?.slice(-60)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a30" />
              <XAxis dataKey="date" tick={{ fill: '#44445a', fontSize: 9 }} tickLine={false} interval={10} />
              <YAxis tick={{ fill: '#44445a', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#153a42', border: '1px solid #027f93', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ color: '#8888aa' }}
              />
              <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={1} dot={false} name="Price" />
              <Line type="monotone" dataKey="ema_short" stroke="#f78b04" strokeWidth={1.5} dot={false} name="EMA 12" />
              <Line type="monotone" dataKey="ema_long" stroke="#027f93" strokeWidth={1.5} dot={false} name="EMA 26" />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-gray-400 text-xs leading-relaxed mt-4 pt-4 border-t border-gray-800">
            EMA crossover strategy tested on last 1 year of data. Short EMA {data.short_period} crosses Long EMA {data.long_period} to generate signals. Win rate of {data.win_rate}% across {data.total_trades} completed trades.
          </p>
        </>
      )}
    </div>
  )
}

function DashboardFooter() {
  return (
    <footer className="border-t border-br-surface px-8 py-4 mt-6 flex items-center justify-between">
      <p className="text-gray-600 text-xs">
        ⚠️ Not financial advice. QuantSense provides data-driven insights for educational purposes only.
      </p>
      <p className="text-gray-600 text-xs">
        Data as of {new Date().toLocaleDateString('en-IN')}
      </p>
    </footer>
  )
  function ChartModal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-br-surface border border-br-teal/30 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-br-surface">
          <h3 className="text-white font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
}
function FlashAlert({ ticker, userTier }) {
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (userTier !== 'premium') return
    const checkAlert = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/sentiment/flash/${ticker}`)
        if (response.data.alert) {
          setAlert(response.data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkAlert()
    const interval = setInterval(checkAlert, 300000)
    return () => clearInterval(interval)
  }, [ticker, userTier])

  if (!alert || userTier !== 'premium') return null

  return (
    <div className={`mx-4 mt-4 px-6 py-3 rounded-xl border flex items-center justify-between ${
      alert.type === 'NEGATIVE'
        ? 'bg-br-crimson/10 border-br-crimson/40'
        : 'bg-br-teal/10 border-br-teal/40'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          alert.type === 'NEGATIVE' ? 'bg-br-crimson' : 'bg-br-teal'
        }`} />
        <div>
          <p className={`text-sm font-medium ${
            alert.type === 'NEGATIVE' ? 'text-br-crimson' : 'text-br-teal'
          }`}>
            {alert.message}
          </p>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{alert.headline}</p>
        </div>
      </div>
      <button
        onClick={() => setAlert(null)}
        className="text-gray-500 hover:text-white text-lg ml-4"
      >
        ✕
      </button>
    </div>
  )
}
function SkeletonCard() {
  return (
    <div className="bg-br-surface border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
      <div className="h-24 bg-gray-800 rounded mb-4" />
      <div className="h-3 bg-gray-800 rounded w-full mb-2" />
      <div className="h-3 bg-gray-800 rounded w-2/3" />
    </div>
  )
}
function LoadingState({ ticker }) {
  return (
    <div className="min-h-screen bg-br-base">
      <div className="bg-br-surface border-b border-br-teal/20 px-6 py-4 animate-pulse">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-800 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-32" />
          </div>
          <div className="h-8 bg-gray-800 rounded w-32" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-br-surface border border-gray-800 rounded-2xl p-6 animate-pulse">
          <div className="h-20 bg-gray-800 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="w-8 h-8 bg-br-amber/20 rounded-xl flex items-center justify-center animate-pulse">
            <Zap size={20} className="text-br-amber" />
          </div>
          <p className="text-gray-400 text-sm">Analyzing {ticker} — this takes 30-45 seconds</p>
        </div>
      </div>
    </div>
  )
}