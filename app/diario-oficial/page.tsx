// app/diario-oficial/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import { usePreferences } from '@/contexts/PreferencesContext'

import {
  FaHome, FaCog, FaEye, FaEdit, FaSave, FaTimes, FaSearch,
  FaFilePdf, FaExternalLinkAlt, FaAngleLeft, FaAngleRight,
  FaAngleDoubleLeft, FaAngleDoubleRight, FaNewspaper, FaPlus,
  FaCalendarAlt, FaTag,
} from 'react-icons/fa'

interface Diario {
  id: number
  titulo: string
  data_publicacao: string
  url: string
  categoria: string | null
  ordem: number
  created_at: string
}

const PER_PAGE = 20

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function formatarData(iso: string) {
  if (!iso) return { dia: '??', mes: 'Janeiro', ano: 0, semana: '', mesNum: 0, curto: '??/??/????' }
  const limpa = iso.split('T')[0]
  const d = new Date(limpa + 'T00:00:00')
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = MESES[d.getMonth()]
  const ano = d.getFullYear()
  const semana = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'][d.getDay()]
  return { dia, mes, ano, semana, mesNum: d.getMonth(), curto: `${dia}/${String(d.getMonth()+1).padStart(2,'0')}/${ano}` }
}

function Paginacao({ total, page, perPage, onChange }: {
  total: number; page: number; perPage: number; onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / perPage)
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const pages: number[] = []
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  for (let i = start; i <= Math.min(start + 4, totalPages); i++) pages.push(i)
  return (
    <div className="flex items-center flex-wrap gap-2 mt-6">
      <span className="text-xs text-gray-500">Mostrando {total === 0 ? 0 : from}–{to} de {total} edições</span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onChange(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleLeft size={10} /></button>
          <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleLeft size={10} /></button>
          {pages.map(p => <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded text-xs font-medium ${p === page ? 'bg-blue-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{p}</button>)}
          <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleRight size={10} /></button>
          <button onClick={() => onChange(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleRight size={10} /></button>
        </div>
      )}
    </div>
  )
}

// Cores por categoria
const COR_CATEGORIA: Record<string, string> = {
  'Decreto': 'bg-blue-100 text-blue-700',
  'Portaria': 'bg-purple-100 text-purple-700',
  'Lei': 'bg-green-100 text-green-700',
  'Edição Extra': 'bg-orange-100 text-orange-700',
  'Geral': 'bg-gray-100 text-gray-600',
}
function corCategoria(cat: string | null | undefined) {
  if (!cat) return 'bg-gray-100 text-gray-500'
  return COR_CATEGORIA[cat] || 'bg-gray-100 text-gray-600'
}

// Cores por mês (para o destaque da data)
const COR_MES = [
  'bg-blue-600','bg-purple-600','bg-green-700','bg-teal-600',
  'bg-cyan-600','bg-indigo-600','bg-orange-600','bg-yellow-600',
  'bg-amber-600','bg-lime-700','bg-emerald-600','bg-sky-700',
]

export default function DiarioOficial() {
  const { highContrast, fontSize, setHighContrast, setFontSize, adjustFontSize: adjustFontSizeContext } = usePreferences()
  const [isAdmin, setIsAdmin] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [diarios, setDiarios] = useState<Diario[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Filtros
  const [busca, setBusca] = useState('')
  const [buscaTemp, setBuscaTemp] = useState('')
  const [dataIni, setDataIni] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Modal PDF
  const [modalPdf, setModalPdf] = useState<Diario | null>(null)

  // Admin form
  const [editando, setEditando] = useState<number | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<Partial<Diario>>({})

  const hc = highContrast

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalPdf ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalPdf])

  const carregar = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (busca) params.set('busca', busca)
      if (dataIni) params.set('dataIni', dataIni)
      if (dataFim) params.set('dataFim', dataFim)
      const res = await fetch(`/api/diario-oficial?${params}`)
      const data = await res.json()
      setDiarios(Array.isArray(data.rows) ? data.rows : [])
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [busca, dataIni, dataFim, page])

  useEffect(() => { carregar(page) }, [page])

  const pesquisar = () => { setBusca(buscaTemp); setPage(1); }

  useEffect(() => {
    if (page === 1) carregar(1)
  }, [busca, dataIni, dataFim])

  const salvar = async () => {
    if (!form.titulo?.trim()) return alert('Informe o título.')
    if (!form.url?.trim()) return alert('Informe a URL do PDF.')
    if (!form.data_publicacao) return alert('Informe a data.')
    setSalvando(true)
    try {
      await fetch('/api/diario-oficial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      await carregar(page)
      setEditando(null); setCriando(false); setForm({})
    } catch { alert('❌ Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  const deletar = async (id: number) => {
    if (!confirm('Deletar esta edição?')) return
    await fetch('/api/diario-oficial', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar(page)
  }

  const temFiltro = busca || dataIni || dataFim
  const limparFiltros = () => { setBusca(''); setBuscaTemp(''); setDataIni(''); setDataFim(''); setPage(1) }

  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header />

      {/* Breadcrumb */}
      <div className={`${hc ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${hc ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-black">&gt;</span>
            <span className={hc ? 'text-yellow-300' : 'text-black'}>Diário Oficial</span>
          </div>
          {isAdmin && (
            <button onClick={() => setPainelAberto(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition ${painelAberto ? 'bg-gray-200 text-black' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
              {painelAberto ? <><FaEye size={11} /> Ver página</> : <><FaCog size={11} /> Gerenciar Conteúdo</>}
            </button>
          )}
        </div>
      </div>

      <main className={`${hc ? 'bg-black' : 'bg-gray-50'} py-10`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>

            {/* Banner */}
            <div className="w-full px-8 py-10 bg-gradient-to-r from-blue-900 to-blue-700">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
                Prefeitura Municipal de Itabaiana · Transparência
              </p>
              <h1 className="text-white text-3xl font-bold mb-2 flex items-center gap-3">
                <FaNewspaper className="text-blue-300" /> Diário Oficial
              </h1>
              <p className="text-blue-100 text-sm font-medium mb-1">Município de Itabaiana — Paraíba</p>
              <p className="text-blue-200 text-sm leading-relaxed max-w-3xl">
                Acesse todas as edições do Diário Oficial do Município. Use os filtros para encontrar edições por período ou título.
              </p>
            </div>

            <div className="p-6 space-y-6">

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">{total}</div>
                  <div className="text-xs text-gray-500 mt-1">Edições encontradas</div>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800">{diarios[0] ? formatarData(diarios[0].data_publicacao).ano : '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">Edição mais recente</div>
                </div>
                <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-lg font-bold text-indigo-700">
                    {diarios[0] ? `${formatarData(diarios[0].data_publicacao).dia} de ${formatarData(diarios[0].data_publicacao).mes}` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Última publicação</div>
                </div>
              </div>

              {/* Filtros */}
              {!painelAberto && (
                <div className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-1 min-w-[220px]">
                    <input type="text" value={buscaTemp}
                      onChange={e => setBuscaTemp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && pesquisar()}
                      placeholder="Buscar por título..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={pesquisar}
                      className="px-4 py-2 bg-blue-700 text-white text-sm rounded-r hover:bg-blue-800 flex items-center gap-1">
                      <FaSearch size={11} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 flex-shrink-0">De:</label>
                    <input type="date" value={dataIni} onChange={e => { setDataIni(e.target.value); setPage(1) }}
                      className="px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 flex-shrink-0">Até:</label>
                    <input type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); setPage(1) }}
                      className="px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {temFiltro && (
                    <button onClick={limparFiltros}
                      className="px-3 py-2 bg-gray-100 text-black text-sm rounded hover:bg-gray-200 flex items-center gap-1">
                      <FaTimes size={10} /> Limpar
                    </button>
                  )}
                </div>
              )}

              {/* Grid de cards */}
              {!painelAberto && (
                loading ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
                  </div>
                ) : diarios.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FaNewspaper size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma edição encontrada.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {diarios.map(d => {
                        const dt = formatarData(d.data_publicacao)
                        const corMes = COR_MES[dt.mesNum]
                        return (
                          <button key={d.id} onClick={() => setModalPdf(d)}
                            className={`text-left rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group flex flex-col overflow-hidden`}>
                            {/* Cabeçalho colorido com data */}
                            <div className={`${corMes} px-4 py-3 flex items-center gap-3`}>
                              <div className="bg-white/20 rounded-lg px-3 py-1 text-center flex-shrink-0">
                                <div className="text-white text-2xl font-bold leading-none">{dt.dia}</div>
                                <div className="text-white/80 text-xs font-medium">{dt.mes.slice(0, 3).toUpperCase()}</div>
                              </div>
                              <div>
                                <div className="text-white text-xs font-semibold">{dt.semana}</div>
                                <div className="text-white/70 text-xs">{dt.ano}</div>
                              </div>
                            </div>
                            {/* Corpo do card */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                              <div className="flex items-start gap-2">
                                <FaFilePdf className="text-blue-500 flex-shrink-0 mt-0.5" size={14} />
                                <p className={`text-sm font-medium leading-snug ${hc ? 'text-yellow-200' : 'text-gray-800'} group-hover:text-blue-700 transition`}>
                                  {d.titulo}
                                </p>
                              </div>
                              {d.categoria && (
                                <span className={`self-start text-xs px-2 py-0.5 rounded font-medium ${corCategoria(d.categoria)}`}>
                                  <FaTag size={8} className="inline mr-1" />{d.categoria}
                                </span>
                              )}
                              <div className="mt-auto pt-2 border-t border-gray-100">
                                <span className="text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                                  <FaEye size={10} /> Visualizar edição
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <Paginacao total={total} page={page} perPage={PER_PAGE} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                  </>
                )
              )}

              {/* Painel Admin */}
              {painelAberto && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-black">Gerenciar Edições</h2>
                    <button onClick={() => { setCriando(true); setEditando(null); setForm({}) }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-xs rounded-lg hover:bg-blue-800">
                      <FaPlus size={10} /> Nova Edição
                    </button>
                  </div>

                  {/* Formulário */}
                  {(criando || editando !== null) && (
                    <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm font-semibold text-black mb-4">{criando ? 'Nova Edição' : 'Editar Edição'}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-600 block mb-1">Título *</label>
                          <input value={form.titulo || ''} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                            placeholder="Ex: Diário Oficial Nº 1234 — Edição Especial"
                            className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-600 block mb-1">URL do PDF *</label>
                          <input value={form.url || ''} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Data de Publicação *</label>
                          <input type="date" value={form.data_publicacao || ''} onChange={e => setForm(p => ({ ...p, data_publicacao: e.target.value }))}
                            className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Categoria <span className="text-gray-400">(opcional)</span></label>
                          <input value={form.categoria || ''} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                            placeholder="Ex: Decreto, Portaria, Lei..."
                            className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={salvar} disabled={salvando}
                          className="px-4 py-2 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 disabled:opacity-60 flex items-center gap-1">
                          <FaSave size={10} />{salvando ? 'Salvando…' : 'Salvar'}
                        </button>
                        <button onClick={() => { setCriando(false); setEditando(null); setForm({}) }}
                          className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300 flex items-center gap-1">
                          <FaTimes size={10} /> Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista admin */}
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {diarios.map(d => {
                        const dt = formatarData(d.data_publicacao)
                        return (
                          <div key={d.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3 bg-gray-50 hover:bg-white transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FaCalendarAlt size={11} className="text-blue-500" />
                                <span className="text-xs text-gray-500">{dt.curto}</span>
                                {d.categoria && (
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${corCategoria(d.categoria)}`}>{d.categoria}</span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-800">{d.titulo}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-lg">{d.url}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => window.open(d.url, '_blank')}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Visualizar PDF">
                                <FaFilePdf size={13} />
                              </button>
                              <button onClick={() => { setEditando(d.id); setCriando(false); setForm({ ...d }) }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                                <FaEdit size={13} />
                              </button>
                              <button onClick={() => deletar(d.id)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                                <FaTimes size={13} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="mt-4">
                    <Paginacao total={total} page={page} perPage={PER_PAGE} onChange={p => { setPage(p); carregar(p) }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal PDF */}
      {modalPdf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setModalPdf(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
            style={{ height: '92vh' }}
            onClick={e => e.stopPropagation()}>
            {/* Header do modal */}
           

<div className="bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-4 flex items-start justify-between gap-4 flex-shrink-0">
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <FaFilePdf className="text-blue-300" size={14} />
      <span className="text-blue-200 text-xs font-semibold">Diário Oficial — Itabaiana/PB</span>
    </div>
    <p className="text-white text-sm font-semibold leading-snug">{modalPdf.titulo}</p>
    <p className="text-blue-200 text-xs mt-0.5">
      {formatarData(modalPdf.data_publicacao).semana}, {formatarData(modalPdf.data_publicacao).dia} de {formatarData(modalPdf.data_publicacao).mes} de {formatarData(modalPdf.data_publicacao).ano}
    </p>
  </div>
  <div className="flex items-center gap-2 flex-shrink-0">
    {(() => {
      const match = modalPdf.url.match(/\/d\/([a-zA-Z0-9_-]+)/)
      const fileId = match ? match[1] : null
      return fileId ? (
        <a href={`https://drive.google.com/uc?export=download&id=${fileId}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition">
          <FaFilePdf size={10} /> Baixar PDF
        </a>
      ) : null
    })()}
    <a href={modalPdf.url} target="_blank" rel="noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition">
      <FaExternalLinkAlt size={10} /> Abrir em nova aba
    </a>
    <button onClick={() => setModalPdf(null)} className="text-white/80 hover:text-white p-1">
      <FaTimes size={18} />
    </button>
  </div>
</div>
            {/* iframe */}
{modalPdf.url.includes('1drv.ms') || modalPdf.url.includes('sharepoint.com') ? (
  <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-gray-50">
    <FaExternalLinkAlt size={40} className="text-gray-400" />
    <p className="text-gray-600 text-sm">OneDrive não permite visualização inline.</p>
    <a href={modalPdf.url} target="_blank" rel="noreferrer"
      className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center gap-2">
      <FaExternalLinkAlt /> Abrir PDF em nova aba
    </a>
  </div>
) : (
  <iframe src={modalPdf.url} className="flex-1 w-full" title={modalPdf.titulo} />
)}
          </div>
        </div>
      )}

      <VLibrasWrapper />
    </div>
  )
}