import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, profile } = useAuth()

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  if (profile?.first_login) return <Navigate to="/admin/primeiro-acesso" replace />

  return children
}
