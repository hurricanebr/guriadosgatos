import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  async function onSubmit({ email, password }) {
    setErro('')
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setErro('Email ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-pink-700 mb-2 text-center">🐱 Guria dos Gatos</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Painel Administrativo</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              autoComplete="current-password"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 text-white rounded-lg py-2 font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
