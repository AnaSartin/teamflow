'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'TeamFlow'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      setError('E-mail ou senha incorretos. Verifique e tente novamente.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0F1117] rounded-xl mb-4">
            <span className="text-white font-black text-sm tracking-tighter">TF</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">TeamFlow</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">{company} · Sistema de Gestão</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Entrar na plataforma</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">E-mail corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 bg-white transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Acesso restrito a colaboradores autorizados · Adaptive
        </p>
      </div>
    </div>
  )
}
