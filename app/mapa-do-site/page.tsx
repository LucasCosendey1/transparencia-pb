'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'
import { usePreferences } from '@/contexts/PreferencesContext'

interface Button {
  chave: string
  titulo: string
  caminho: string | null
  description?: string
}

export default function MapaDoSitePage() {
  const { highContrast, fontSize } = usePreferences()
  const [buttons, setButtons] = useState<Button[]>([])
  const [busca, setBusca] = useState('')
  const hc = highContrast

  useEffect(() => {
  const load = async () => {
    try {
      const raw = localStorage.getItem('home-data-cache')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setButtons(parsed.data?.buttons ?? [])
          return
        }
      }
      // Cache vazio ou expirado — busca na API e salva
      const res = await fetch('/api/home-data')
      const data = await res.json()
      localStorage.setItem('home-data-cache', JSON.stringify({ data, timestamp: Date.now() }))
      setButtons(data.buttons ?? [])
    } catch {}
  }
  load()
}, [])

  const filtrados = buttons.filter(b =>
    b.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    b.description?.toLowerCase().includes(busca.toLowerCase()) ||
    b.caminho?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header />

      <div className={`${hc ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center text-sm">
          <Link href="/" className={`${hc ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
            <FaHome className="mr-1" /> Início
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className={hc ? 'text-yellow-300' : 'text-gray-600'}>Mapa do Site</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className={`text-2xl font-bold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>Mapa do Site</h1>
        <p className={`text-sm mb-6 ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>
          Listagem de todas as páginas e seções disponíveis no portal.
        </p>

        <input
          type="text"
          placeholder="Buscar página..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className={`mb-4 px-4 py-2 border rounded text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hc ? 'bg-black border-yellow-300 text-yellow-300' : 'bg-white border-gray-300 text-black'}`}
        />

        <div className={`rounded-xl shadow overflow-hidden ${hc ? 'bg-gray-900' : 'bg-white'}`}>
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-3 text-left font-semibold border border-blue-500">Nome</th>
                <th className="px-4 py-3 text-left font-semibold border border-blue-500">Descrição</th>
                <th className="px-4 py-3 text-left font-semibold border border-blue-500">Caminho</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-400">Nenhuma página encontrada.</td>
                </tr>
              ) : filtrados.map((b, i) => (
                <tr key={b.chave} className={i % 2 === 0 ? (hc ? 'bg-gray-800' : 'bg-gray-50') : (hc ? 'bg-gray-900' : 'bg-white')}>
                  <td className={`px-4 py-3 border font-medium ${hc ? 'border-gray-700 text-yellow-200' : 'border-gray-200 text-gray-800'}`}>
                    {b.titulo || b.chave}
                  </td>
                  <td className={`px-4 py-3 border ${hc ? 'border-gray-700 text-yellow-300' : 'border-gray-200 text-gray-600'}`}>
                    {b.description || '—'}
                  </td>
                  <td className={`px-4 py-3 border ${hc ? 'border-gray-700' : 'border-gray-200'}`}>
                    {b.caminho ? (
                      <Link
                        href={b.caminho}
                        target={b.caminho.startsWith('http') ? '_blank' : undefined}
                        className={`underline text-xs ${hc ? 'text-yellow-300' : 'text-blue-600'} hover:opacity-75`}
                      >
                        {b.caminho}
                      </Link>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={`text-xs mt-4 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>
          {filtrados.length} página(s) encontrada(s)
        </p>
      </main>
    </div>
  )
}