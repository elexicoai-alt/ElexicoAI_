import { useState } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (code) => {
    if (code === '2026') {
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  return (
    <div className="min-h-screen bg-white">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

export default App
