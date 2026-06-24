import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

const CREATE_USER_URL = import.meta.env.VITE_SUPABASE_FUNCTION_CREATE_USER

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { role: 'catsitter' }
  })

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role, first_login, created_at')
      .order('nome')
    setUsuarios(data || [])
    setLoading(false)
  }

  async function onSubmit({ nome, email, senha, role }) {
    setErro('')
    setSucesso('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(CREATE_USER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ nome, email, senha, role }),
    })

    const json = await res.json()
    if (!res.ok) {
      setErro(json.error || 'Erro ao criar usuária.')
      return
    }

    setSucesso(`Usuária ${nome} criada com sucesso!`)
    reset()
    setMostrarForm(false)
    carregar()
  }

  const ROLE_LABEL = { admin: 'Admin', catsitter: 'Cat Sitter' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuárias</h1>
        <button
          onClick={() => { setMostrarForm(true); setErro(''); setSucesso('') }}
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          + Nova usuária
        </button>
      </div>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
          {sucesso}
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-gray-700">Nova usuária</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                {...register('nome', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <select
                {...register('role')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="catsitter">Cat Sitter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial *</label>
            <input
              type="password"
              {...register('senha', { required: true, minLength: 8 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <p className="text-xs text-gray-400 mt-1">A usuária troca no primeiro acesso.</p>
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Criando...' : 'Criar usuária'}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-gray-400">Carregando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {usuarios.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400">Nenhuma usuária cadastrada.</p>
        )}
        {usuarios.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <div>
              <p className="font-medium text-gray-800">{u.nome}</p>
              <p className="text-sm text-gray-400">{ROLE_LABEL[u.role]}</p>
            </div>
            {u.first_login && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Aguardando 1º acesso
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
