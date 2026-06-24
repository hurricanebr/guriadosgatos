import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AgendamentoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isEdicao = Boolean(id)
  const isAdmin = profile?.role === 'admin'
  const [clientes, setClientes] = useState([])
  const [sitters, setSitters] = useState([])
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { status: 'agendado' }
  })

  useEffect(() => {
    carregarOpcoes()
    if (isEdicao) carregarAgendamento()
  }, [id])

  async function carregarOpcoes() {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('profiles').select('id, nome').order('nome'),
    ])
    setClientes(c || [])
    setSitters(s || [])
  }

  async function carregarAgendamento() {
    const { data } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      const dt = new Date(data.data_hora)
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      reset({ ...data, data_hora: local })
    }
  }

  async function onSubmit(dados) {
    setErro('')
    const payload = {
      cliente_id:     dados.cliente_id,
      cat_sitter_id:  dados.cat_sitter_id,
      data_hora:      new Date(dados.data_hora).toISOString(),
      status:         dados.status,
      valor:          dados.valor || null,
      endereco_visita: dados.endereco_visita || null,
      observacoes:    dados.observacoes || null,
    }
    if (isEdicao) {
      const { error } = await supabase.from('agendamentos').update(payload).eq('id', id)
      if (error) { setErro(error.message); return }
    } else {
      const { error } = await supabase.from('agendamentos')
        .insert({ ...payload, created_by: profile.id })
      if (error) { setErro(error.message); return }
    }
    navigate('/admin/agendamentos')
  }

  const disabled = !isAdmin

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdicao
          ? isAdmin ? 'Editar agendamento' : 'Detalhes do agendamento'
          : 'Novo agendamento'}
      </h1>

      <form
        onSubmit={isAdmin ? handleSubmit(onSubmit) : e => e.preventDefault()}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            {...register('cliente_id', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          >
            <option value="">Selecione...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cat Sitter *</label>
          <select
            {...register('cat_sitter_id', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          >
            <option value="">Selecione...</option>
            {sitters.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label>
          <input
            type="datetime-local"
            {...register('data_hora', { required: true })}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          >
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('valor')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço da visita</label>
          <input
            {...register('endereco_visita')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
          />
        </div>
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <div className="flex gap-3 pt-2">
          {isAdmin && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/agendamentos')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            {isAdmin ? 'Cancelar' : '← Voltar'}
          </button>
        </div>
      </form>
    </div>
  )
}
