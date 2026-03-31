'use client'

import { useState } from 'react'

interface AbaHistoricoProps {
  blocosExibicao: any[]
  tabelas: any[]
  linhas: any[]
  tabelaAtivaMeta: any
  salvando: boolean
  setSalvando: (v: boolean) => void
  salvarMeta: (meta: any) => Promise<void>
  carregarLinhas: (nome?: string, di?: string, df?: string) => Promise<void>
  tabelaAtiva: string
  linhasPorTabela: Record<string, any[]>
}

export default function AbaHistorico({
  blocosExibicao, tabelas, linhas, tabelaAtivaMeta,
  salvando, setSalvando, salvarMeta, carregarLinhas,
  tabelaAtiva, linhasPorTabela,
}: AbaHistoricoProps) {
  const blocosComDados = blocosExibicao.filter((b: any) => b.tipo === 'tabela' || b.tipo === 'pdf')
  const [itemSelecionado, setItemSelecionado] = useState('geral')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  const salvar = async () => {
    setSalvando(true)
    try {
      const alvos = itemSelecionado === 'geral'
        ? blocosComDados.filter((b: any) => b.tipo === 'tabela').map((b: any) => b.nome_tabela)
        : [itemSelecionado]
      for (const nome of alvos) {
        const meta = tabelas.find((t: any) => t.nome_tabela === nome)
        if (meta) await salvarMeta({ ...meta, filtro_admin_inicio: filtroInicio || null, filtro_admin_fim: filtroFim || null })
      }
      alert('✅ Filtro padrão salvo!')
    } finally { setSalvando(false) }
  }

  return (
    <>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-800 mb-1">🔒 Filtro padrão para visitantes</p>
        <p className="text-xs text-blue-600 mb-4">Ao recarregar a página, os filtros do visitante voltam para este padrão.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-black mb-1">Aplicar em</label>
            <select value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)}
              className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="geral">Geral (todos)</option>
              {blocosComDados.map((b: any) => (
                <option key={b.id} value={b.tipo === 'tabela' ? b.nome_tabela : b.nome_pdf}>
                  {b.tipo === 'tabela' ? `📊 ${b.nome_tabela}` : `📄 ${b.nome_pdf}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-black mb-1">De</label>
            <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)}
              className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light', color: '#000' }} />
          </div>
          <div>
            <label className="block text-xs text-black mb-1">Até</label>
            <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)}
              className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light', color: '#000' }} />
          </div>
          <button onClick={salvar} disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60">
            {salvando ? 'Salvando…' : 'Salvar filtro padrão'}
          </button>
          <button onClick={() => { setFiltroInicio(''); setFiltroFim('') }}
            className="px-4 py-2 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">
            Limpar
          </button>
        </div>
      </div>

      {blocosComDados.filter((b: any) => b.tipo === 'tabela').map((bloco: any) => {
        const meta = tabelas.find((t: any) => t.nome_tabela === bloco.nome_tabela)
        const linhasBloco = linhasPorTabela[bloco.nome_tabela] || []
        if (!meta) return null
        return (
          <div key={bloco.id} className="mb-6">
            <p className="text-sm font-semibold text-black mb-2">📊 {meta.nome_tabela}</p>
            <div className="overflow-x-auto">
              <p className="text-xs text-black mb-2">{linhasBloco.length} registro(s)</p>
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {meta.colunas.map((col: string, i: number) => (
                      <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-black border">{col}</th>
                    ))}
                    <th className="px-3 py-2 text-left text-xs font-semibold text-black border">Adicionado em</th>
                  </tr>
                </thead>
                <tbody>
                  {linhasBloco.map((l: any) => (
                    <tr key={l.id} className="border-b hover:bg-gray-50">
                      {meta.colunas.map((_: any, ci: number) => (
                        <td key={ci} className="px-3 py-2 border text-black">{l.dados[ci]}</td>
                      ))}
                      <td className="px-3 py-2 border text-black text-xs">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}