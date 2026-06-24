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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FDFBFF 0%, #E8D5FF 60%, #FFB8C6 100%)' }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm"
        style={{ boxShadow: '0 8px 32px rgba(123, 53, 216, 0.15)' }}
      >
        <h1 className="font-heading text-3xl text-brand text-center mb-1">
          Bem-vinda, {profile?.nome}!
        </h1>
        <p className="text-sm text-[#666666] text-center mb-6">
          Crie sua senha pessoal para continuar.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#2D2D2D] mb-1">Nova senha</label>
            <input
              type="password"
              {...register('senha', { required: true, minLength: 8 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
            />
            <p className="text-xs text-[#666666] mt-1">Mínimo 8 caracteres</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D2D2D] mb-1">Confirmar senha</label>
            <input
              type="password"
              {...register('confirmacao', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-white rounded-full py-2.5 font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {isSubmitting ? 'Salvando...' : 'Criar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
