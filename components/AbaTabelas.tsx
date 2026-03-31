'use client'

import { useState } from 'react'
import {
  FaPlus, FaTrash, FaSave, FaTimes, FaEdit,
  FaArrowUp, FaArrowDown,
} from 'react-icons/fa'

interface TabelaMeta {
  id: number
  nome_tabela: string
  titulo_tabela: string
  texto_intro: string
  texto_final: string
  colunas: string[]
  modo_exibicao: 'tabela' | 'lista' | 'pdf'
  colunas_pdf: number[]
  blocos_pdf?: any[]
  blocos_exibicao?: any[]
  graficos?: any[]
  filtro_admin_inicio?: string | null
  filtro_admin_fim?: string | null
}

interface Linha {
  id: number
  dados: string[]
  created_at: string
}

interface AbaTabemasProps {
  paginaId: string
  tabelas: TabelaMeta[]
  setTabelas: React.Dispatch<React.SetStateAction<TabelaMeta[]>>
  tabelaAtiva: string
  setTabelaAtiva: (v: string) => void
  linhas: Linha[]
  setLinhas: React.Dispatch<React.SetStateAction<Linha[]>>
  linhasPorTabela: Record<string, Linha[]>
  setLinhasPorTabela: React.Dispatch<React.SetStateAction<Record<string, Linha[]>>>
  salvando: boolean
  setSalvando: (v: boolean) => void
  salvarMeta: (meta: Partial<TabelaMeta> & { nome_tabela: string }) => Promise<void>
  carregarLinhas: (nome?: string, di?: string, df?: string) => Promise<void>
}

export default function AbaTabelas({
  paginaId, tabelas, setTabelas, tabelaAtiva, setTabelaAtiva,
  linhas, setLinhas, linhasPorTabela, setLinhasPorTabela,
  salvando, setSalvando, salvarMeta, carregarLinhas,
}: AbaTabemasProps) {
  const [novoNome, setNovoNome] = useState('')
  const [criandoNova, setCriandoNova] = useState(false)
  const [linhasEditando, setLinhasEditando] = useState<Record<number, string[]>>({})
  const [novaLinha, setNovaLinha] = useState<string[]>([])

  const tabelaAtivaMeta = tabelas.find(t => t.nome_tabela === tabelaAtiva)

  // Sync novaLinha quando tabelaAtiva muda (o pai já cuida do carregarLinhas)
  // O pai deve chamar setNovaLinha via useEffect — aqui mantemos local
  useState(() => {
    if (tabelaAtivaMeta) setNovaLinha(tabelaAtivaMeta.colunas.map(() => ''))
  })

  // ── Tabelas CRUD ──
  const criarTabela = async () => {
    if (!novoNome.trim()) return alert('Informe um nome.')
    if (tabelas.some(t => t.nome_tabela === novoNome.trim())) return alert('Nome já existe.')
    const nova: TabelaMeta = {
      id: Date.now(), nome_tabela: novoNome.trim(), titulo_tabela: novoNome.trim(),
      texto_intro: '', texto_final: '', colunas: ['Coluna 1', 'Coluna 2', 'Coluna 3'],
      modo_exibicao: 'tabela', colunas_pdf: [0, 1, 2], graficos: [],
    }
    setTabelas(p => [...p, nova])
    setTabelaAtiva(nova.nome_tabela)
    setNovaLinha(['', '', ''])
    setNovoNome('')
    setCriandoNova(false)
    fetch(`/api/tabela/${paginaId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nova),
    }).catch(() => alert('❌ Erro ao salvar no banco.'))
  }

  const deletarTabela = async (nome: string) => {
    if (!confirm(`Deletar tabela "${nome}"?`)) return
    const restantes = tabelas.filter(t => t.nome_tabela !== nome)
    setTabelas(restantes)
    if (tabelaAtiva === nome) { setTabelaAtiva(restantes[0]?.nome_tabela || ''); setLinhas([]) }
    fetch(`/api/tabela/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_tabela: nome }),
    }).catch(() => alert('❌ Erro ao deletar.'))
  }

  // ── Linhas CRUD ──
  const adicionarLinha = async () => {
    if (novaLinha.every(c => !c.trim()) || !tabelaAtivaMeta) return
    setSalvando(true)
    try {
      await fetch(`/api/linhas/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_tabela: tabelaAtiva, linhas: [novaLinha] }),
      })
      setNovaLinha(tabelaAtivaMeta.colunas.map(() => ''))
      await carregarLinhas(tabelaAtiva)
    } catch { alert('❌ Erro ao adicionar.') }
    finally { setSalvando(false) }
  }

  const salvarLinha = async (id: number) => {
    setSalvando(true)
    try {
      await fetch(`/api/linhas/${paginaId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dados: linhasEditando[id] }),
      })
      setLinhasEditando(p => { const n = { ...p }; delete n[id]; return n })
      await carregarLinhas(tabelaAtiva)
    } catch { alert('❌ Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  const deletarLinha = async (id: number) => {
    if (!confirm('Deletar esta linha?')) return
    await fetch(`/api/linhas/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregarLinhas(tabelaAtiva)
  }

  // ── Colunas ──
  const addColuna = () => {
    if (!tabelaAtivaMeta) return
    const novas = [...tabelaAtivaMeta.colunas, `Coluna ${tabelaAtivaMeta.colunas.length + 1}`]
    setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva
      ? { ...t, colunas: novas, colunas_pdf: novas.map((_, i) => i) } : t))
    setNovaLinha(novas.map(() => ''))
  }

  const removeColuna = async (ci: number) => {
    if (!tabelaAtivaMeta || tabelaAtivaMeta.colunas.length <= 1) return
    if (!confirm(`Remover coluna "${tabelaAtivaMeta.colunas[ci]}"? Os dados desta coluna serão apagados.`)) return

    const novasColunas = tabelaAtivaMeta.colunas.filter((_, i) => i !== ci)
    const novasColunasPdf = tabelaAtivaMeta.colunas_pdf
      .filter(i => i !== ci)
      .map(i => i > ci ? i - 1 : i)

    setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva
      ? { ...t, colunas: novasColunas, colunas_pdf: novasColunasPdf } : t))
    setNovaLinha(novasColunas.map(() => ''))

    const linhasAtualizadas = linhas.map(l => ({
      ...l, dados: l.dados.filter((_, i) => i !== ci),
    }))
    setLinhas(linhasAtualizadas)
    setLinhasPorTabela(p => ({ ...p, [tabelaAtiva]: linhasAtualizadas }))

    for (const l of linhasAtualizadas) {
      await fetch(`/api/linhas/${paginaId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: l.id, dados: l.dados }),
      })
    }
  }

  const moverColuna = (ci: number, dir: 'esq' | 'dir') => {
    if (!tabelaAtivaMeta) return
    const ni = dir === 'esq' ? ci - 1 : ci + 1
    if (ni < 0 || ni >= tabelaAtivaMeta.colunas.length) return

    const novasColunas = [...tabelaAtivaMeta.colunas]
    ;[novasColunas[ci], novasColunas[ni]] = [novasColunas[ni], novasColunas[ci]]

    const mapa: Record<number, number> = {}
    tabelaAtivaMeta.colunas.forEach((_, i) => { mapa[i] = i })
    mapa[ci] = ni; mapa[ni] = ci
    const novasColunasPdf = tabelaAtivaMeta.colunas_pdf.map(i => mapa[i] ?? i).sort((a, b) => a - b)

    setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva
      ? { ...t, colunas: novasColunas, colunas_pdf: novasColunasPdf } : t))

    const linhasAtualizadas = linhas.map(l => {
      const nd = [...l.dados]
      ;[nd[ci], nd[ni]] = [nd[ni], nd[ci]]
      return { ...l, dados: nd }
    })
    setLinhas(linhasAtualizadas)
    setLinhasPorTabela(p => ({ ...p, [tabelaAtiva]: linhasAtualizadas }))
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar tabelas */}
      <div className="w-48 flex-shrink-0">
        <p className="text-xs font-semibold text-black uppercase mb-2">Tabelas</p>
        <ul className="space-y-1 mb-3">
          {tabelas.map(t => (
            <li key={t.nome_tabela}>
              <div onClick={() => { setTabelaAtiva(t.nome_tabela); const meta = tabelas.find(x => x.nome_tabela === t.nome_tabela); if (meta) setNovaLinha(meta.colunas.map(() => '')) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition cursor-pointer ${
                  tabelaAtiva === t.nome_tabela ? 'bg-blue-600 text-white' : 'text-black hover:bg-gray-100'
                }`}>
                <span className="truncate">{t.nome_tabela}</span>
                <button onClick={e => { e.stopPropagation(); deletarTabela(t.nome_tabela) }}
                  className={`opacity-0 group-hover:opacity-100 ${tabelaAtiva === t.nome_tabela ? 'text-white' : 'text-red-400'}`}>
                  <FaTrash size={10} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {criandoNova ? (
          <div className="space-y-2">
            <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && criarTabela()} placeholder="Nome da tabela"
              className="w-full px-2 py-1.5 border rounded text-sm text-black focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <div className="flex gap-1">
              <button onClick={criarTabela} className="flex-1 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Criar</button>
              <button onClick={() => { setCriandoNova(false); setNovoNome('') }} className="py-1 px-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300"><FaTimes size={10} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCriandoNova(true)}
            className="w-full flex items-center gap-1 px-3 py-2 border-2 border-dashed border-gray-300 text-black hover:border-blue-400 hover:text-blue-500 rounded-lg text-xs transition">
            <FaPlus size={10} /> Nova tabela
          </button>
        )}
      </div>

      {/* Editor tabela ativa */}
      {tabelaAtivaMeta && (
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <label className="block text-xs font-medium text-black mb-1">Título</label>
            <input value={tabelaAtivaMeta.titulo_tabela}
              onChange={e => setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? { ...t, titulo_tabela: e.target.value } : t))}
              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Colunas */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-black">Colunas</label>
              <button onClick={addColuna} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                <FaPlus size={9} /> Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabelaAtivaMeta.colunas.map((col, ci) => (
                <div key={ci} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  <button onClick={() => moverColuna(ci, 'esq')} disabled={ci === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><FaArrowUp size={8} /></button>
                  <input value={col} onChange={e => setTabelas(p => p.map(t => {
                    if (t.nome_tabela !== tabelaAtiva) return t
                    const c = [...t.colunas]; c[ci] = e.target.value; return { ...t, colunas: c }
                  }))} className="w-24 bg-transparent text-black text-xs focus:outline-none" />
                  <button onClick={() => moverColuna(ci, 'dir')} disabled={ci === tabelaAtivaMeta.colunas.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><FaArrowDown size={8} /></button>
                  <button onClick={() => removeColuna(ci)} className="text-red-400 hover:text-red-600"><FaTimes size={8} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Linhas */}
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="w-8 p-1" />
                  {tabelaAtivaMeta.colunas.map((col, ci) => <th key={ci} className="px-3 py-2 text-left">{col}</th>)}
                  <th className="w-16 p-1">Criado em</th>
                  <th className="w-16 p-1" />
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50 border-b border-green-200">
                  <td className="p-1 text-center text-green-500 font-bold">+</td>
                  {tabelaAtivaMeta.colunas.map((_, ci) => (
                    <td key={ci} className="p-1">
                      <input value={novaLinha[ci] ?? ''}
                        onChange={e => setNovaLinha(p => { const n = [...p]; n[ci] = e.target.value; return n })}
                        onKeyDown={e => e.key === 'Enter' && adicionarLinha()}
                        className="w-full px-2 py-1 border border-green-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-green-400"
                        placeholder="Novo valor" />
                    </td>
                  ))}
                  <td className="p-1" />
                  <td className="p-1">
                    <button onClick={adicionarLinha} disabled={salvando}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50">Add</button>
                  </td>
                </tr>
                {linhas.map(l => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="p-1 text-center">
                      <button onClick={() => deletarLinha(l.id)} className="text-red-400 hover:text-red-600"><FaTrash size={9} /></button>
                    </td>
                    {tabelaAtivaMeta.colunas.map((_, ci) => (
                      <td key={ci} className="p-1">
                        {linhasEditando[l.id] ? (
                          <input value={linhasEditando[l.id][ci] ?? ''}
                            onChange={e => setLinhasEditando(p => {
                              const n = { ...p }; n[l.id] = [...(n[l.id] || l.dados)]; n[l.id][ci] = e.target.value; return n
                            })}
                            className="w-full px-2 py-1 border rounded text-black focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        ) : <span className="text-black px-2">{l.dados[ci]}</span>}
                      </td>
                    ))}
                    <td className="p-1 text-black text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-1">
                      {linhasEditando[l.id] ? (
                        <div className="flex gap-1">
                          <button onClick={() => salvarLinha(l.id)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaSave size={9} /></button>
                          <button onClick={() => setLinhasEditando(p => { const n = { ...p }; delete n[l.id]; return n })} className="px-2 py-1 bg-gray-300 text-black text-xs rounded hover:bg-gray-400"><FaTimes size={9} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setLinhasEditando(p => ({ ...p, [l.id]: [...l.dados] }))} className="px-2 py-1 bg-gray-100 text-black text-xs rounded hover:bg-gray-200"><FaEdit size={9} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => salvarMeta(tabelaAtivaMeta)} disabled={salvando}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60">
            <FaSave size={11} /> {salvando ? 'Salvando…' : 'Salvar tabela'}
          </button>
        </div>
      )}
    </div>
  )
}