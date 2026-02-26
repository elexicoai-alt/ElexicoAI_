import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = onLogin(code)
    
    if (!success) {
      setError(true)
      setIsShaking(true)
      setTimeout(() => {
        setIsShaking(false)
        setError(false)
      }, 500)
      setCode('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 p-4 relative overflow-hidden">
      {/* Animated background orbs - subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-200/25 rounded-full blur-3xl animate-float-slow" />
      </div>
      
      <div 
        className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10 w-full max-w-md border border-white/60 ${isShaking ? 'animate-shake' : ''}`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {/* Animated gradient ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-xl opacity-75 blur-md animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-2">ElexicoAI</h1>
          <p className="text-sm text-gray-600 font-medium">Backend Learning Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
              Access Code
            </label>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter access code"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                <span>⚠</span> Invalid code, please try again
              </p>
            )}
          </div>

          <button
            type="submit"
            className="group relative w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold hover:shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              Access Dashboard
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Secure Access • Professional Edition
          </p>
        </div>
      </div>
    </div>
  )
}
