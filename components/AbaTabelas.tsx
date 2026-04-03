'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  FaPlus, FaTrash, FaSave, FaTimes, FaEdit,
  FaArrowUp, FaArrowDown, FaFileImport,
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

const PER_PAGE = 10

export default function AbaTabelas({
  paginaId, tabelas, setTabelas, tabelaAtiva, setTabelaAtiva,
  linhas, setLinhas, linhasPorTabela, setLinhasPorTabela,
  salvando, setSalvando, salvarMeta, carregarLinhas,
}: AbaTabemasProps) {
  const [novoNome, setNovoNome] = useState('')
  const [criandoNova, setCriandoNova] = useState(false)
  const [linhasEditando, setLinhasEditando] = useState<Record<number, string[]>>({})
  const [novaLinha, setNovaLinha] = useState<string[]>([])

  // Paginação local
  const [linhasVisiveis, setLinhasVisiveis] = useState(PER_PAGE)

  // Import
  const [modalImport, setModalImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importTemColunas, setImportTemColunas] = useState<boolean | null>(null)
  const [importLinhaHeader, setImportLinhaHeader] = useState(1)
  const [importSubstituir, setImportSubstituir] = useState<boolean | null>(null)
  const [importStep, setImportStep] = useState<'arquivo' | 'colunas' | 'substituir'>('arquivo')
  const [importando, setImportando] = useState(false)

  const tabelaAtivaMeta = tabelas.find(t => t.nome_tabela === tabelaAtiva)

  useEffect(() => {
    if (tabelaAtivaMeta) {
      setNovaLinha(tabelaAtivaMeta.colunas.map(() => ''))
      setLinhasVisiveis(PER_PAGE)
    }
  }, [tabelaAtiva])

  const linhasExibidas = linhas.slice(0, linhasVisiveis)
  const temMais = linhasVisiveis < linhas.length

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

  // ── Importação ──
  const resetImport = () => {
    setImportFile(null)
    setImportTemColunas(null)
    setImportLinhaHeader(1)
    setImportSubstituir(null)
    setImportStep('arquivo')
    setModalImport(false)
  }

  const processarImport = async () => {
    if (!importFile || !tabelaAtivaMeta) return
    setImportando(true)
    try {
      const buffer = await importFile.arrayBuffer()
      let rows: string[][] = []
      let novasColunas: string[] = tabelaAtivaMeta.colunas

      if (importFile.name.endsWith('.json')) {
        const json = JSON.parse(new TextDecoder().decode(buffer))
        const arr = Array.isArray(json) ? json : (json.data ?? [])
        if (arr.length === 0) return alert('JSON vazio.')
        const keys = Object.keys(arr[0])
        if (importTemColunas) novasColunas = keys
        rows = arr.map((r: Record<string, unknown>) => keys.map(k => String(r[k] ?? '')))
      } else {
        const wb = XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const all: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][]

        // Remove linhas completamente vazias
        const allFiltrado = all.filter(row => row.some(cell => String(cell).trim() !== ''))

        if (importTemColunas) {
          const headerRow = allFiltrado[importLinhaHeader - 1] ?? []

          // Descobre até qual coluna tem conteúdo no cabeçalho
          let lastColComDado = 0
          headerRow.forEach((cell, i) => {
            if (String(cell).trim() !== '') lastColComDado = i
          })

          novasColunas = headerRow.slice(0, lastColComDado + 1).map(String)

          // Aplica o mesmo corte nas linhas de dados
          rows = allFiltrado.slice(importLinhaHeader).map(r =>
            r.slice(0, lastColComDado + 1).map(String)
          )
        } else {
          // Sem cabeçalho: descobre o máximo de colunas com conteúdo em todas as linhas
          let lastColComDado = 0
          allFiltrado.forEach(row => {
            row.forEach((cell, i) => {
              if (String(cell).trim() !== '') lastColComDado = i
            })
          })

          rows = allFiltrado.map(r => r.slice(0, lastColComDado + 1).map(String))
          novasColunas = Array.from({ length: lastColComDado + 1 }, (_, i) => `Coluna ${i + 1}`)
        }

        // Remove linhas que ficaram todas vazias após o corte de colunas
        rows = rows.filter(r => r.some(cell => cell.trim() !== ''))
      }

      // Atualiza colunas se vieram do arquivo
      if (importTemColunas && novasColunas.length > 0) {
        const metaAtualizada = {
          ...tabelaAtivaMeta,
          colunas: novasColunas,
          colunas_pdf: novasColunas.map((_, i) => i),
        }
        setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? metaAtualizada : t))
        await salvarMeta(metaAtualizada)
      }

      // Substituir ou acrescentar
      if (importSubstituir) {
        await fetch(`/api/linhas/${paginaId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome_tabela: tabelaAtiva, todos: true }),
        })
      }

      await fetch(`/api/linhas/${paginaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_tabela: tabelaAtiva, linhas: rows }),
      })

      await carregarLinhas(tabelaAtiva)
      setLinhasVisiveis(PER_PAGE)
      resetImport()
      alert(`✅ ${rows.length} linhas e ${novasColunas.length} colunas importadas com sucesso!`)
    } catch (e) {
      console.error(e)
      alert('❌ Erro ao importar.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar tabelas */}
      <div className="w-48 flex-shrink-0">
        <p className="text-xs font-semibold text-black uppercase mb-2">Tabelas</p>
        <ul className="space-y-1 mb-3">
          {tabelas.map(t => (
            <li key={t.nome_tabela}>
              <div
                onClick={() => {
                  setTabelaAtiva(t.nome_tabela)
                  const meta = tabelas.find(x => x.nome_tabela === t.nome_tabela)
                  if (meta) setNovaLinha(meta.colunas.map(() => ''))
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition cursor-pointer ${
                  tabelaAtiva === t.nome_tabela ? 'bg-blue-600 text-white' : 'text-black hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{t.nome_tabela}</span>
                <button
                  onClick={e => { e.stopPropagation(); deletarTabela(t.nome_tabela) }}
                  className={`opacity-0 group-hover:opacity-100 ${tabelaAtiva === t.nome_tabela ? 'text-white' : 'text-red-400'}`}
                >
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

          {/* Título */}
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

          {/* Info contagem */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">
              Exibindo <strong>{Math.min(linhasVisiveis, linhas.length)}</strong> de <strong>{linhas.length}</strong> linha(s)
            </p>
          </div>

          {/* Tabela de linhas */}
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
                {/* Linha nova */}
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

                {/* Linhas existentes paginadas */}
                {linhasExibidas.map(l => (
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

          {/* Botão carregar mais */}
          {temMais && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setLinhasVisiveis(v => v + PER_PAGE)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs rounded-lg border border-gray-300 transition"
              >
                Carregar mais ({Math.min(PER_PAGE, linhas.length - linhasVisiveis)} de {linhas.length - linhasVisiveis} restantes)
              </button>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => salvarMeta(tabelaAtivaMeta)} disabled={salvando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60">
              <FaSave size={11} /> {salvando ? 'Salvando…' : 'Salvar tabela'}
            </button>
            <button onClick={() => { setModalImport(true); setImportStep('arquivo') }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition">
              <FaFileImport size={11} /> Importar planilha
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de importação ── */}
      {modalImport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-black text-lg">Importar planilha</h2>

            {/* Step 1: escolher arquivo */}
            {importStep === 'arquivo' && (
              <>
                <p className="text-sm text-gray-600">Selecione um arquivo <strong>.xlsx</strong>, <strong>.xls</strong> ou <strong>.json</strong>.</p>
                <input type="file" accept=".xlsx,.xls,.json"
                  onChange={e => setImportFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-black border rounded p-2" />
                {importFile && (
                  <p className="text-xs text-green-600">✅ {importFile.name}</p>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={resetImport} className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">Cancelar</button>
                  <button disabled={!importFile} onClick={() => setImportStep('colunas')}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-40 hover:bg-blue-700">Próximo →</button>
                </div>
              </>
            )}

            {/* Step 2: tem cabeçalho? */}
            {importStep === 'colunas' && (
              <>
                <p className="text-sm text-black font-medium">A planilha possui linha com nomes das colunas?</p>
                <div className="flex gap-2">
                  <button onClick={() => setImportTemColunas(true)}
                    className={`flex-1 py-2 rounded text-sm border-2 transition ${importTemColunas === true ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-black hover:border-gray-400'}`}>
                    ✅ Sim
                  </button>
                  <button onClick={() => setImportTemColunas(false)}
                    className={`flex-1 py-2 rounded text-sm border-2 transition ${importTemColunas === false ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-black hover:border-gray-400'}`}>
                    ❌ Não
                  </button>
                </div>

                {importTemColunas === true && (
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Em qual linha estão os nomes? (ex: 1 para a primeira linha)</label>
                    <input type="number" min={1} value={importLinhaHeader}
                      onChange={e => setImportLinhaHeader(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                )}

                {importTemColunas === false && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    As colunas serão nomeadas automaticamente como "Coluna 1", "Coluna 2", etc. Colunas e linhas vazias serão ignoradas automaticamente.
                  </p>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setImportStep('arquivo')} className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">← Voltar</button>
                  <button
                    disabled={importTemColunas === null}
                    onClick={() => {
                      if (linhas.length > 0) setImportStep('substituir')
                      else processarImport()
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-40 hover:bg-blue-700">
                    {linhas.length > 0 ? 'Próximo →' : importando ? 'Importando...' : 'Importar'}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: substituir ou acrescentar */}
            {importStep === 'substituir' && (
              <>
                <p className="text-sm text-black font-medium">
                  Esta tabela já possui <strong>{linhas.length}</strong> linha(s). O que deseja fazer?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setImportSubstituir(true)}
                    className={`flex-1 py-3 rounded text-sm border-2 transition ${importSubstituir === true ? 'border-red-500 bg-red-50 text-red-700 font-semibold' : 'border-gray-200 text-black hover:border-red-300'}`}>
                    🗑️ Substituir tudo
                  </button>
                  <button onClick={() => setImportSubstituir(false)}
                    className={`flex-1 py-3 rounded text-sm border-2 transition ${importSubstituir === false ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-black hover:border-blue-300'}`}>
                    ➕ Acrescentar abaixo
                  </button>
                </div>
                {importSubstituir === true && (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded">⚠️ Todos os dados atuais serão apagados permanentemente.</p>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setImportStep('colunas')} className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">← Voltar</button>
                  <button
                    disabled={importSubstituir === null || importando}
                    onClick={processarImport}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded disabled:opacity-40 hover:bg-blue-700">
                    {importando ? 'Importando...' : 'Importar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}