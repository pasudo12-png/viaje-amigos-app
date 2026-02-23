import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Credenciales inválidas. Verifica tu email y contraseña.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500/20 to-sand-500/20 border border-zinc-700/60 mb-4">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="font-display text-3xl text-zinc-100 mb-1">Ahorro de Viaje</h1>
          <p className="text-zinc-500 text-sm">Panel de administración</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Entrando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Solo la administradora puede ingresar aquí.
        </p>
      </div>
    </div>
  )
}