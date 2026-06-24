import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import AgendamentoForm from './pages/AgendamentoForm'
import Clientes from './pages/Clientes'
import ClienteForm from './pages/ClienteForm'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/primeiro-acesso" element={<PrimeiroAcesso />} />

          <Route path="/admin" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />

            <Route path="agendamentos" element={<Agendamentos />} />
            <Route path="agendamentos/novo" element={
              <AdminRoute><AgendamentoForm /></AdminRoute>
            } />
            <Route path="agendamentos/:id" element={<AgendamentoForm />} />

            <Route path="clientes" element={
              <AdminRoute><Clientes /></AdminRoute>
            } />
            <Route path="clientes/novo" element={
              <AdminRoute><ClienteForm /></AdminRoute>
            } />
            <Route path="clientes/:id" element={
              <AdminRoute><ClienteForm /></AdminRoute>
            } />

            <Route path="usuarios" element={
              <AdminRoute><Usuarios /></AdminRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
