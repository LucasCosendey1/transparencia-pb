'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type View = 'login' | 'criar-conta'

export default function AdminLoginPage() {
  const [view, setView] = useState<View>('login')

  // Login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Criar conta
  const [novoNome, setNovoNome] = useState('')
  const [novoUsername, setNovoUsername] = useState('')
  const [novoPassword, setNovoPassword] = useState('')
  const [novoNivel, setNovoNivel] = useState<1 | 2>(2)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('isAdmin', 'true')
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminNivel', String(data.user.nivel))
        localStorage.setItem('adminNome', data.user.nome ?? '')
        router.push('/')
      } else {
        setError(data.message || 'Credenciais inválidas')
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCriarConta = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    const token = localStorage.getItem('adminToken')
    const nivel = Number(localStorage.getItem('adminNivel'))

    if (!token || nivel !== 1) {
      setError('Apenas administradores nível 1 podem criar contas.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: novoUsername, password: novoPassword, nome: novoNome, nivel: novoNivel })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Conta criada com sucesso!')
        setNovoNome(''); setNovoUsername(''); setNovoPassword(''); setNovoNivel(2)
      } else {
        setError(data.message || 'Erro ao criar conta.')
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const nivelAtual = Number(localStorage.getItem('adminNivel') ?? 0)

  return (
  <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md my-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Área Administrativa</h1>
          <p className="text-gray-600">Portal de Transparência — Itabaiana</p>
        </div>

        {/* Abas */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button onClick={() => { setView('login'); setError(''); setSuccess('') }}
            className={`flex-1 py-2 text-sm font-semibold transition ${view === 'login' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Login
          </button>
          {nivelAtual === 1 && (
            <button onClick={() => { setView('criar-conta'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 text-sm font-semibold transition ${view === 'criar-conta' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Nova Conta
            </button>
          )}
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="Digite seu usuário"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {/* ── CRIAR CONTA ── */}
        {view === 'criar-conta' && (
          <form onSubmit={handleCriarConta} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} required
                placeholder="Nome do administrador"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário (CPF)</label>
              <input type="text" value={novoUsername} onChange={e => setNovoUsername(e.target.value)} required
                placeholder="CPF sem pontuação"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input type="password" value={novoPassword} onChange={e => setNovoPassword(e.target.value)} required
                placeholder="Senha da nova conta"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível de acesso</label>
              <div className="flex gap-3">
                {([1, 2] as const).map(n => (
                  <button key={n} type="button" onClick={() => setNovoNivel(n)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition ${novoNivel === n ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                    Nível {n} {n === 1 ? '(Master)' : '(Comum)'}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 transition">
            ← Voltar para o Portal
          </Link>
        </div>
      </div>
    </div>
  )
}