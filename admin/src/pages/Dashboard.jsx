import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  agendado:  'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  realizado:  'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const hoje = new Date()
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

      const { data } = await supabase
        .from('agendamentos')
        .select(`
          id, data_hora, status, valor, endereco_visita,
          clientes(nome, telefone),
          profiles!cat_sitter_id(nome)
        `)
        .gte('data_hora', inicio)
        .lt('data_hora', fim)
        .order('data_hora')

      setAgendamentos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá, {profile?.nome}!</h1>
          <p className="text-sm text-gray-400 capitalize">{hojeFormatado}</p>
        </div>
        {profile?.role === 'admin' && (
          <Link
            to="/admin/agendamentos/novo"
            className="bg-brand text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
          >
            + Novo agendamento
          </Link>
        )}
      </div>

      <h2 className="text-base font-semibold text-gray-600 mb-3">Agendamentos de hoje</h2>

      {loading && <p className="text-gray-400 text-sm">Carregando...</p>}

      {!loading && agendamentos.length === 0 && (
        <p className="text-gray-400 text-sm">Nenhum agendamento para hoje.</p>
      )}

      <div className="space-y-2">
        {agendamentos.map(ag => (
          <Link
            key={ag.id}
            to={`/admin/agendamentos/${ag.id}`}
            className="flex items-start justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-light transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-800">{ag.clientes?.nome}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {' · '}{ag.profiles?.nome}
              </p>
              {ag.endereco_visita && (
                <p className="text-xs text-gray-400 mt-1">{ag.endereco_visita}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ag.status]}`}>
              {ag.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
