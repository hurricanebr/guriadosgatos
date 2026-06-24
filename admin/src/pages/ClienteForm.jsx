import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

export default function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)
  const [gatos, setGatos] = useState([])
  const [novoGato, setNovoGato] = useState({ nome: '', observacoes: '' })
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (!isEdicao) return
    async function carregar() {
      const [{ data: cliente }, { data: gatosData }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('gatos').select('*').eq('cliente_id', id).order('nome'),
      ])
      if (cliente) reset(cliente)
      setGatos(gatosData || [])
    }
    carregar()
  }, [id])

  async function onSubmit(dados) {
    setErro('')
    const payload = {
      nome: dados.nome,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      observacoes: dados.observacoes || null,
    }
    if (isEdicao) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', id)
      if (error) { setErro(error.message); return }
    } else {
      const { error } = await supabase.from('clientes').insert(payload)
      if (error) { setErro(error.message); return }
    }
    navigate('/admin/clientes')
  }

  async function adicionarGato() {
    if (!novoGato.nome.trim()) return
    const { data } = await supabase
      .from('gatos')
      .insert({ cliente_id: id, nome: novoGato.nome, observacoes: novoGato.observacoes || null })
      .select()
      .single()
    if (data) {
      setGatos(prev => [...prev, data])
      setNovoGato({ nome: '', observacoes: '' })
    }
  }

  async function deletarGato(gatoId) {
    await supabase.from('gatos').delete().eq('id', gatoId)
    setGatos(prev => prev.filter(g => g.id !== gatoId))
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdicao ? 'Editar cliente' : 'Novo cliente'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            {...register('nome', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            {...register('telefone')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <input
            {...register('endereco')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clientes')}
            className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEdicao && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Gatos</h2>
          <div className="space-y-2 mb-4">
            {gatos.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum gato cadastrado.</p>
            )}
            {gatos.map(g => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{g.nome}</span>
                  {g.observacoes && <span className="text-gray-400 ml-2">— {g.observacoes}</span>}
                </div>
                <button
                  onClick={() => deletarGato(g.id)}
                  className="text-red-400 hover:underline text-xs"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Nome do gato *"
              value={novoGato.nome}
              onChange={e => setNovoGato(prev => ({ ...prev, nome: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
              placeholder="Observações"
              value={novoGato.observacoes}
              onChange={e => setNovoGato(prev => ({ ...prev, observacoes: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={adicionarGato}
              className="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-700"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
