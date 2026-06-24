import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-pink-700">🐱 Guria dos Gatos</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{profile?.nome}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink to="/admin" end className={linkClass}>Início</NavLink>
          <NavLink to="/admin/agendamentos" className={linkClass}>Agendamentos</NavLink>
          {profile?.role === 'admin' && (
            <>
              <NavLink to="/admin/clientes" className={linkClass}>Clientes</NavLink>
              <NavLink to="/admin/usuarios" className={linkClass}>Usuárias</NavLink>
            </>
          )}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-red-500 py-2 text-left"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
