import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = { agendado: 'Agendado', confirmado: 'Confirmado', realizado: 'Realizado', cancelado: 'Cancelado' }
const STATUS_COLORS = {
  agendado:  'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  realizado:  'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
}

export default function Agendamentos() {
  const { profile } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [sitters, setSitters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroSitter, setFiltroSitter] = useState('')

  useEffect(() => {
    carregar()
    if (profile?.role === 'admin') carregarSitters()
  }, [profile])

  async function carregarSitters() {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome')
      .order('nome')
    setSitters(data || [])
  }

  async function carregar() {
    const { data } = await supabase
      .from('agendamentos')
      .select(`
        id, data_hora, status, valor,
        clientes(nome),
        profiles!cat_sitter_id(id, nome)
      `)
      .order('data_hora', { ascending: false })
    setAgendamentos(data || [])
    setLoading(false)
  }

  const filtrados = agendamentos.filter(ag => {
    if (filtroStatus && ag.status !== filtroStatus) return false
    if (filtroData && !ag.data_hora.startsWith(filtroData)) return false
    if (filtroSitter && ag.profiles?.id !== filtroSitter) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
        {profile?.role === 'admin' && (
          <Link
            to="/admin/agendamentos/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700"
          >
            + Novo agendamento
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {profile?.role === 'admin' && (
          <select
            value={filtroSitter}
            onChange={e => setFiltroSitter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Todas as cat sitters</option>
            {sitters.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        )}
        {(filtroStatus || filtroData || filtroSitter) && (
          <button
            onClick={() => { setFiltroStatus(''); setFiltroData(''); setFiltroSitter('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtrados.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhum agendamento encontrado.</p>
        )}
        {filtrados.map((ag, i) => (
          <Link
            key={ag.id}
            to={`/admin/agendamentos/${ag.id}`}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{ag.clientes?.nome}</p>
              <p className="text-sm text-gray-400">
                {new Date(ag.data_hora).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {' · '}{ag.profiles?.nome}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {ag.valor && (
                <span className="text-sm text-gray-500">
                  R$ {Number(ag.valor).toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ag.status]}`}>
                {STATUS_LABELS[ag.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
