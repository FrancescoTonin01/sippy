import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export const Login = () => {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  })

  // Redirect se già loggato
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // Validazione password real-time per signup
  const validatePassword = (password: string) => {
    const validation = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    }
    setPasswordValidation(validation)
    return validation
  }

  const isPasswordValid = (password: string) => {
    const validation = validatePassword(password)
    return validation.length && validation.uppercase && validation.lowercase && validation.number
  }

  const getErrorMessage = (error: { message?: string }) => {
    if (!error?.message) return 'Errore imprevisto'
    
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return 'Email o password non corretti'
    }
    if (message.includes('user already registered')) {
      return 'Email già registrata'
    }
    if (message.includes('password should be at least')) {
      return 'Password deve avere almeno 6 caratteri'
    }
    if (message.includes('invalid email')) {
      return 'Email non valida'
    }
    if (message.includes('signup is disabled')) {
      return 'Registrazione temporaneamente disabilitata'
    }
    
    return error.message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validazione client-side
    if (!email.trim()) {
      setError('Email richiesta')
      setLoading(false)
      return
    }
    if (!password.trim()) {
      setError('Password richiesta')
      setLoading(false)
      return
    }
    if (!isLogin && !username.trim()) {
      setError('Username richiesto')
      setLoading(false)
      return
    }
    if (!isLogin && !isPasswordValid(password)) {
      setError('Password non conforme ai requisiti di sicurezza')
      setLoading(false)
      return
    }
    if (isLogin && password.length < 6) {
      setError('Password deve avere almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(getErrorMessage(error))
        } else {
          // Login riuscito - il redirect avverrà tramite useEffect
        }
      } else {
        const { error } = await signUp(email, password, username)
        if (error) {
          setError(getErrorMessage(error))
        } else {
          setError('Controlla la tua email per confermare la registrazione')
        }
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🥃 Sippy</h1>
          <p className="text-gray-600">Traccia e sfida i tuoi amici</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="la-tua@email.com"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="il-tuo-username"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (!isLogin) {
                  validatePassword(e.target.value)
                }
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {!isLogin && password && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Requisiti password:</p>
                <div className="space-y-1">
                  <div className={`text-xs flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{passwordValidation.length ? '✓' : '○'}</span>
                    Almeno 6 caratteri
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{passwordValidation.uppercase ? '✓' : '○'}</span>
                    Una lettera maiuscola (A-Z)
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{passwordValidation.lowercase ? '✓' : '○'}</span>
                    Una lettera minuscola (a-z)
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{passwordValidation.number ? '✓' : '○'}</span>
                    Un numero (0-9)
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}