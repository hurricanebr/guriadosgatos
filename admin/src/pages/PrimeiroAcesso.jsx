import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function PrimeiroAcesso() {
  const { updatePassword, profile } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState('')
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm()
  const senha = watch('senha')

  async function onSubmit({ senha, confirmacao }) {
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }
    setErro('')
    try {
      await updatePassword(senha)
      navigate('/admin')
    } catch {
      setErro('Erro ao atualizar senha. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-pink-700 mb-1 text-center">
          Bem-vinda, {profile?.nome}!
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Crie sua senha pessoal para continuar.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              {...register('senha', { required: true, minLength: 8 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              {...register('confirmacao', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 text-white rounded-lg py-2 font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Criar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
