import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, telefone, endereco')
      .order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function deletar(id, nome) {
    if (!confirm(`Deletar cliente "${nome}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (!error) setClientes(prev => prev.filter(c => c.id !== id))
  }

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <Link
          to="/admin/clientes/novo"
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          + Novo cliente
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />

      {loading && <p className="text-gray-400 text-sm">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtrados.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhum cliente encontrado.</p>
        )}
        {filtrados.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{c.nome}</p>
              <p className="text-sm text-gray-400">{c.telefone}</p>
            </div>
            <div className="flex gap-3">
              <Link to={`/admin/clientes/${c.id}`} className="text-sm text-brand hover:underline">
                Editar
              </Link>
              <button
                onClick={() => deletar(c.id, c.nome)}
                className="text-sm text-red-400 hover:underline"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
