import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SessionRoute({ children }) {
  const { session } = useAuth()

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return children
}
