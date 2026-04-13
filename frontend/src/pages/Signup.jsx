import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signupUser } from '../api/authApi'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await signupUser(name, email, password)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-br-base flex items-center justify-center px-4">
      <div
        className="w-full max-w-md bg-br-surface border border-br-teal/20 rounded-2xl p-8"
        style={{ boxShadow: '0 0 40px rgba(2,127,147,0.06)' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-br-amber rounded-lg flex items-center justify-center mb-3">
            <Zap size={20} className="text-br-base" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Start investing smarter today</p>
        </div>

        {error && (
          <div className="bg-br-crimson/10 border border-br-crimson/30 text-br-crimson text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjun Sharma"
              required
              className="w-full bg-br-base border border-gray-700 focus:border-br-teal rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-br-base border border-gray-700 focus:border-br-teal rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-br-base border border-gray-700 focus:border-br-teal rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-br-amber text-br-base font-medium py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-br-teal hover:underline">
              Sign in
            </Link>
          </p>
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400 mt-3 block transition-colors">
            Continue as guest →
          </Link>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Your data is encrypted and never sold.
        </p>
      </div>
    </div>
  )
}