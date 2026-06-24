import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
    isActive
      ? 'bg-brand-light text-brand'
      : 'text-[#666666] hover:bg-brand-hover hover:text-brand'
  }`

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <aside className="w-56 bg-white border-r border-brand-light flex flex-col">
        <div className="p-4 border-b border-brand-light">
          <h2 className="font-heading text-xl text-brand leading-tight">Guria dos Gatos</h2>
          <p className="text-xs text-[#666666] mt-0.5 truncate">{profile?.nome}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink to="/admin" end className={linkClass}>Início</NavLink>
          <NavLink to="/admin/agendamentos" className={linkClass}>Agendamentos</NavLink>
          {profile?.role === 'admin' && (
            <>
              <NavLink to="/admin/clientes" className={linkClass}>Clientes</NavLink>
              <NavLink to="/admin/usuarios" className={linkClass}>Cat Sitters</NavLink>
            </>
          )}
        </nav>
        <div className="p-3 border-t border-brand-light">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-[#666666] hover:text-red-500 py-2 text-left transition-colors cursor-pointer"
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
