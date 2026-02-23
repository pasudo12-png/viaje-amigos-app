import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import PublicPage from './pages/PublicPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Spinner() {
  return (
    <div className="w-8 h-8 border-2 border-zinc-700 border-t-ocean-500 rounded-full animate-spin" />
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="/viaje-publico/:tripId" element={<PublicPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}