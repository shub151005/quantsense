import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getWatchlist, removeFromWatchlist } from '../api/authApi'
import { User, Bookmark, FileText, Trash2, Eye, TrendingUp, Crown } from 'lucide-react'
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

export default function Profile() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('watchlist')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [user, token])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wl, rp] = await Promise.all([
        getWatchlist(token),
        axios.get(`${BASE_URL}/user/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      setWatchlist(wl.watchlist || [])
      setReports(rp.data.reports || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveWatchlist = async (ticker) => {
    try {
      await removeFromWatchlist(token, ticker)
      setWatchlist(prev => prev.filter(w => w.ticker !== ticker))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-br-base">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="md:col-span-1">
            <div className="bg-br-surface border border-br-teal/20 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-br-amber/20 border-2 border-br-amber rounded-xl flex items-center justify-center mb-4">
                  <User size={28} className="text-br-amber" />
                </div>
                <h2 className="text-white font-semibold text-lg">{user?.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${
                  user?.tier === 'premium'
                    ? 'bg-br-amber/20 text-br-amber border-br-amber/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {user?.tier === 'premium' && <Crown size={10} />}
                  {user?.tier === 'premium' ? 'Premium' : 'Free Tier'}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Watchlist</span>
                  <span className="text-white font-mono">{watchlist.length} stocks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Reports saved</span>
                  <span className="text-white font-mono">{reports.length}</span>
                </div>
              </div>

              {user?.tier !== 'premium' && (
                <div className="bg-br-amber/10 border border-br-amber/20 rounded-xl p-4 mb-4">
                  <p className="text-br-amber text-xs font-medium mb-1">Upgrade to Premium</p>
                  <p className="text-gray-400 text-xs mb-3">Unlock EMA backtest and flash news alerts</p>
                  <button className="w-full bg-br-amber text-br-base text-xs font-medium py-2 rounded-full hover:bg-amber-400 transition-colors">
                    ₹199/month
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-gray-400 hover:text-br-crimson text-sm transition-colors text-center py-2 border border-gray-700 rounded-full hover:border-br-crimson/40"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  activeTab === 'watchlist'
                    ? 'bg-br-teal text-white'
                    : 'text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <Bookmark size={14} />
                Watchlist ({watchlist.length})
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-br-teal text-white'
                    : 'text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <FileText size={14} />
                Reports ({reports.length})
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-400 animate-pulse">Loading...</p>
              </div>
            ) : activeTab === 'watchlist' ? (
              <div className="bg-br-surface border border-br-teal/20 rounded-2xl overflow-hidden">
                {watchlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <Bookmark size={32} className="text-gray-600" />
                    <p className="text-gray-400">No stocks saved yet</p>
                    <Link to="/" className="text-br-teal text-sm hover:underline">
                      Search and add stocks →
                    </Link>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-6 py-3 text-gray-400 text-xs uppercase tracking-wider">Ticker</th>
                        <th className="text-left px-6 py-3 text-gray-400 text-xs uppercase tracking-wider">Added</th>
                        <th className="text-right px-6 py-3 text-gray-400 text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchlist.map((item, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-br-teal/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-white font-mono font-medium">{item.ticker}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-400 text-sm">
                              {new Date(item.added_at).toLocaleDateString('en-IN')}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => navigate(`/dashboard/${item.ticker}`)}
                                className="text-br-teal hover:text-white transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveWatchlist(item.ticker)}
                                className="text-gray-600 hover:text-br-crimson transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reports.length === 0 ? (
                  <div className="col-span-2 bg-br-surface border border-br-teal/20 rounded-2xl flex flex-col items-center justify-center h-48 gap-3">
                    <FileText size={32} className="text-gray-600" />
                    <p className="text-gray-400">No reports saved yet</p>
                    <Link to="/" className="text-br-teal text-sm hover:underline">
                      Analyze a stock and save the report →
                    </Link>
                  </div>
                ) : (
                  reports.map((report, i) => (
                    <div
                      key={i}
                      className="bg-br-surface border border-br-teal/20 rounded-2xl p-5 hover:border-br-teal/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-br-amber font-mono text-xl font-medium">{report.ticker}</p>
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          report.satta_score <= 30
                            ? 'bg-br-teal/20 text-br-teal'
                            : report.satta_score <= 60
                            ? 'bg-br-amber/20 text-br-amber'
                            : 'bg-br-crimson/20 text-br-crimson'
                        }`}>
                          {report.satta_score?.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4">
                        {new Date(report.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <button
                        onClick={() => navigate(`/dashboard/${report.ticker}`)}
                        className="w-full text-center text-br-teal border border-br-teal/30 rounded-full py-2 text-xs hover:bg-br-teal/10 transition-colors"
                      >
                        View Analysis →
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}