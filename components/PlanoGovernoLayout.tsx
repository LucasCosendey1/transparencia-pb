'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibras from 'vlibras-nextjs'
import {
  FaHome, FaCog, FaEye, FaPlus, FaTrash, FaEdit,
  FaSave, FaTimes, FaSearch, FaList, FaLayerGroup,
  FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight,
} from 'react-icons/fa'

// ── Tipos ──────────────────────────────────────────────────────
interface Eixo {
  id: number
  nome: string
  descricao: string | null
  ordem: number
}

interface Meta {
  id: number
  eixo_id: number
  eixo_nome: string
  objetivo_geral: string | null
  objetivo_especifico: string | null
  acao: string
  indicador: string | null
  meta_descricao: string | null
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
situacao_original: string | null
  ano_2025: boolean
  ano_2026: boolean
  ano_2027: boolean
  ano_2028: boolean
}

interface Props {
  paginaId: string
  titulo: string
  breadcrumb: string
}

type AbaAdmin = 'eixos' | 'metas'

const STATUS_LABEL: Record<string, string> = {
  nao_iniciado: 'Não Iniciado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

const STATUS_PILL: Record<string, string> = {
  nao_iniciado: 'bg-gray-100 text-gray-600 border border-gray-300',
  em_andamento: 'bg-blue-100 text-blue-700 border border-blue-300',
  concluido: 'bg-green-100 text-green-700 border border-green-300',
}

const STATUS_COLOR: Record<string, string> = {
  nao_iniciado: '#9ca3af',
  em_andamento: '#3b82f6',
  concluido: '#22c55e',
}

const PER_PAGE = 10

// ── Pizza SVG simples ──────────────────────────────────────────
function PizzaChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) return null
  const cx = 80, cy = 80, r = 70
  let angle = -Math.PI / 2
  const slices = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, count]) => {
      const pct = count / total
      const start = angle
      angle += pct * 2 * Math.PI
      const end = angle
      const x1 = cx + r * Math.cos(start)
      const y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end)
      const y2 = cy + r * Math.sin(end)
      const large = pct > 0.5 ? 1 : 0
      const mid = (start + end) / 2
      const lx = cx + r * 0.6 * Math.cos(mid)
      const ly = cy + r * 0.6 * Math.sin(mid)
      return { key, count, pct, lx, ly, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` }
    })
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
      {slices.map(s => (
        <g key={s.key}>
          <path d={s.path} fill={STATUS_COLOR[s.key]} stroke="white" strokeWidth="2" />
          {s.pct > 0.06 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="12" fontWeight="bold" fill="white">{s.count}</text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ── Modal de objetivo geral ────────────────────────────────────
function ModalObjetivo({ objetivo, metas, onClose }: {
  objetivo: string; metas: Meta[]; onClose: () => void
}) {
  const total = metas.length
  const counts = {
    concluido: metas.filter(m => m.status === 'concluido').length,
    em_andamento: metas.filter(m => m.status === 'em_andamento').length,
    nao_iniciado: metas.filter(m => m.status === 'nao_iniciado').length,
  }
  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"

        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div className="flex-1 pr-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Objetivo Geral</p>
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{objetivo}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5">
          {/* Gráfico + legenda */}
          <div className="flex items-center gap-5 mb-5">
            <PizzaChart counts={counts} total={total} />
            <div className="space-y-2 flex-1">
              {Object.entries(counts).map(([key, count]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[key] }} />
                  <span className="text-sm text-gray-700 flex-1">{STATUS_LABEL[key]}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-400">({pct(count)}%)</span>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1">Total</span>
                <span className="text-sm font-bold text-gray-900">{total}</span>
              </div>
            </div>
          </div>

          {/* Texto descritivo */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900 mb-1">Status</p>
            <p>
              Destes compromissos,{' '}
              <strong>{counts.nao_iniciado}</strong> não foram <strong>iniciados</strong>,{' '}
              <strong>{counts.em_andamento}</strong> estão <strong>em andamento</strong> e{' '}
              <strong>{counts.concluido}</strong> foram <strong>concluídos</strong>.
            </p>
          </div>

          {/* Barras de progresso */}
          <div className="mt-4 space-y-2">
            {Object.entries(counts).map(([key, count]) => (
              <div key={key}>
                <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                  <span>{STATUS_LABEL[key]}</span>
                  <span>{pct(count)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${pct(count)}%`, backgroundColor: STATUS_COLOR[key] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Barras horizontais por eixo ────────────────────────────────
function BarrasEixos({ eixos, metas, hc, onFiltrar }: {
  eixos: Eixo[]; metas: Meta[]; hc: boolean
  onFiltrar: (eixoId: number, status: string) => void
}) {  return (
    <div className="space-y-3">
      {eixos.map(e => {
        const ms = metas.filter(m => m.eixo_id === e.id)
        const total = ms.length
        if (total === 0) return null
        const concluido = ms.filter(m => m.status === 'concluido').length
        const andamento = ms.filter(m => m.status === 'em_andamento').length
        const nao = ms.filter(m => m.status === 'nao_iniciado').length
        return (
          <div key={e.id}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium truncate max-w-[65%] ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>
                {e.nome}
              </span>
              <span className={`text-xs ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>{total} ações</span>
            </div>
            <div className="flex h-5 rounded-lg overflow-hidden gap-0.5">
                {concluido > 0 && (
                    <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:brightness-110 transition"
                    style={{ width: `${(concluido / total) * 100}%` }} title={`Concluído: ${concluido} — clique para filtrar`}
                    onClick={() => onFiltrar(e.id, 'concluido')}>
                    {concluido > 0 ? concluido : ''}
                    </div>
                )}
                {andamento > 0 && (
                    <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:brightness-110 transition"
                    style={{ width: `${(andamento / total) * 100}%` }} title={`Em andamento: ${andamento} — clique para filtrar`}
                    onClick={() => onFiltrar(e.id, 'em_andamento')}>
                    {andamento > 3 ? andamento : ''}
                    </div>
                )}
                {nao > 0 && (
                    <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold cursor-pointer hover:brightness-110 transition"
                    style={{ width: `${(nao / total) * 100}%` }} title={`Não iniciado: ${nao} — clique para filtrar`}
                    onClick={() => onFiltrar(e.id, 'nao_iniciado')}>
                    {nao > 3 ? nao : ''}
                    </div>
                )}
                </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Card de eixo ───────────────────────────────────────────────
function EixoCard({ eixo, metas, hc, onClick }: {
  eixo: Eixo; metas: Meta[]; hc: boolean; onClick: () => void
}) {
  const total = metas.length
  const concluido = metas.filter(m => m.status === 'concluido').length
  const andamento = metas.filter(m => m.status === 'em_andamento').length
  const naoIniciado = metas.filter(m => m.status === 'nao_iniciado').length
  const pct = total > 0 ? Math.round((concluido / total) * 100) : 0

  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl p-5 border transition hover:shadow-md hover:border-blue-400 ${
        hc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-4 leading-snug ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
        {eixo.nome}
      </p>
      <div className={`w-full rounded-full h-2 mb-1 ${hc ? 'bg-gray-600' : 'bg-gray-100'}`}>
        <div className="h-2 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs mb-3 ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>{pct}% Concluído</p>
      <div className="flex flex-wrap gap-1.5">
        {concluido > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">✓ {concluido}</span>}
        {andamento > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">▶ {andamento}</span>}
        {naoIniciado > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-300">○ {naoIniciado}</span>}
      </div>
      <p className={`text-xs mt-2 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>{total} ação(ões)</p>
    </button>
  )
}

// ── Paginação ──────────────────────────────────────────────────
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
    <div className="flex items-center flex-wrap gap-2 mt-4">
      <span className="text-xs text-gray-500">
        Registro(s) {total === 0 ? 0 : from} ao {to} de um total de {total}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onChange(1)} disabled={page === 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleLeft size={11} /></button>
          <button onClick={() => onChange(page - 1)} disabled={page === 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleLeft size={11} /></button>
          {pages.map(p => (
            <button key={p} onClick={() => onChange(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleRight size={11} /></button>
          <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleRight size={11} /></button>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────
export default function PlanoGovernoLayout({ paginaId, titulo, breadcrumb }: Props) {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [abaAdmin, setAbaAdmin] = useState<AbaAdmin>('metas')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [eixos, setEixos] = useState<Eixo[]>([])
  const [metas, setMetas] = useState<Meta[]>([])

  // Modal objetivo geral
  const [modalObjetivo, setModalObjetivo] = useState<string | null>(null)

  // Filtros
  const [busca, setBusca] = useState('')
  const [buscaTemp, setBuscaTemp] = useState('')
  const [eixoFiltro, setEixoFiltro] = useState<number | null>(null)
  const [statusFiltro, setStatusFiltro] = useState('')
  const [objetivoFiltro, setObjetivoFiltro] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Admin
  const [eixoForm, setEixoForm] = useState<Partial<Eixo>>({})
  const [editandoEixo, setEditandoEixo] = useState<number | null>(null)
  const [criandoEixo, setCriandoEixo] = useState(false)
  const [metaForm, setMetaForm] = useState<Partial<Meta>>({})
  const [editandoMeta, setEditandoMeta] = useState<number | null>(null)
  const [criandoMeta, setCriandoMeta] = useState(false)
  const [eixoAdminFiltro, setEixoAdminFiltro] = useState<number | null>(null)

  const adjustFontSize = (n: number) => setFontSize(p => Math.max(12, Math.min(24, p + n)))
  const hc = highContrast

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregar()
  }, [])

  const carregar = async () => {
    setLoading(true)
    try {
      const [rE, rM] = await Promise.all([
        fetch(`/api/plano-eixos/${paginaId}`),
        fetch(`/api/plano-metas/${paginaId}`),
      ])
      setEixos(await rE.json().then((d: any) => Array.isArray(d) ? d : []))
      setMetas(await rM.json().then((d: any) => Array.isArray(d) ? d : []))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Objetivos gerais únicos (por eixo ativo ou todos)
  const objetivosUnicos = Array.from(new Set(
  metas
    .filter(m => !eixoFiltro || m.eixo_id === eixoFiltro)
    .map(m => m.objetivo_geral)
    .filter(Boolean)
)) as string[]

const objetivosPorEixo = eixos.map(e => ({
  eixo: e,
  objetivos: Array.from(new Set(
    metas.filter(m => m.eixo_id === e.id).map(m => m.objetivo_geral).filter(Boolean)
  )) as string[],
})).filter(g => g.objetivos.length > 0 && (!eixoFiltro || g.eixo.id === eixoFiltro))

  // Metas filtradas para a tabela
  const metasFiltradas = metas.filter(m => {
    if (eixoFiltro && m.eixo_id !== eixoFiltro) return false
    if (statusFiltro && m.status !== statusFiltro) return false
    if (objetivoFiltro && m.objetivo_geral !== objetivoFiltro) return false
    if (busca.trim()) {
      const t = busca.toLowerCase()
      return m.acao.toLowerCase().includes(t) ||
        (m.indicador || '').toLowerCase().includes(t) ||
        (m.meta_descricao || '').toLowerCase().includes(t) ||
        m.eixo_nome.toLowerCase().includes(t) ||
        STATUS_LABEL[m.status].toLowerCase().includes(t)
    }
    return true
  })
  const metasPaginadas = metasFiltradas.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const pesquisar = () => { setBusca(buscaTemp); setPage(1) }

  // KPIs gerais
  const totalMetas = metas.length
  const concluidas = metas.filter(m => m.status === 'concluido').length
  const emAndamento = metas.filter(m => m.status === 'em_andamento').length
  const naoIniciadas = metas.filter(m => m.status === 'nao_iniciado').length
  const pctGeral = totalMetas > 0 ? Math.round((concluidas / totalMetas) * 100) : 0

  // ── CRUD ────────────────────────────────────────────────────
  const salvarEixo = async () => {
    if (!eixoForm.nome?.trim()) return alert('Informe o nome.')
    setSalvando(true)
    try {
      await fetch(`/api/plano-eixos/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eixoForm),
      })
      await carregar(); setEixoForm({}); setEditandoEixo(null); setCriandoEixo(false)
    } catch { alert('❌ Erro.') } finally { setSalvando(false) }
  }

  const deletarEixo = async (id: number) => {
    if (!confirm('Deletar eixo e todas as metas?')) return
    await fetch(`/api/plano-eixos/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar()
  }

  const salvarMeta = async () => {
    if (!metaForm.acao?.trim()) return alert('Informe a ação.')
    if (!metaForm.eixo_id) return alert('Selecione um eixo.')
    setSalvando(true)
    try {
      await fetch(`/api/plano-metas/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaForm),
      })
      await carregar(); setMetaForm({}); setEditandoMeta(null); setCriandoMeta(false)
    } catch { alert('❌ Erro.') } finally { setSalvando(false) }
  }

  const deletarMeta = async (id: number) => {
    if (!confirm('Deletar esta meta?')) return
    await fetch(`/api/plano-metas/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar()
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header highContrast={hc} fontSize={fontSize} adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast} setFontSize={setFontSize} />

      {/* Breadcrumb */}
      <div className={`${hc ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${hc ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-black">&gt;</span>
            <span className={hc ? 'text-yellow-300' : 'text-black'}>{breadcrumb}</span>
          </div>
          {isAdmin && (
            <button onClick={() => setPainelAberto(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition ${
                painelAberto ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              {painelAberto ? <><FaEye size={11} /> Ver página</> : <><FaCog size={11} /> Gerenciar Conteúdo</>}
            </button>
          )}
        </div>
      </div>

      <main className={`${hc ? 'bg-black' : 'bg-gray-50'} py-10`}>
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : painelAberto ? (

            /* ══════════ PAINEL ADMIN ══════════ */
            <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
              <div className="flex border-b overflow-x-auto">
                {([
                  { key: 'metas', label: 'Metas / Ações', icon: <FaList size={12} /> },
                  { key: 'eixos', label: 'Eixos Temáticos', icon: <FaLayerGroup size={12} /> },
                ] as { key: AbaAdmin; label: string; icon: React.ReactNode }[]).map(a => (
                  <button key={a.key} onClick={() => setAbaAdmin(a.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                      abaAdmin === a.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-black hover:text-gray-700'
                    }`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
              <div className="p-6">

                {/* ABA EIXOS */}
                {abaAdmin === 'eixos' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-black">Eixos Temáticos</h3>
                      <button onClick={() => { setCriandoEixo(true); setEixoForm({ ordem: eixos.length + 1 }) }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        <FaPlus size={9} /> Novo Eixo
                      </button>
                    </div>
                    {criandoEixo && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                        <input value={eixoForm.nome || ''} onChange={e => setEixoForm(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Nome do eixo *"
                          className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea value={eixoForm.descricao || ''} onChange={e => setEixoForm(p => ({ ...p, descricao: e.target.value }))}
                          placeholder="Descrição" rows={2}
                          className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={salvarEixo} disabled={salvando}
                            className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-60">
                            {salvando ? 'Salvando…' : 'Salvar'}
                          </button>
                          <button onClick={() => { setCriandoEixo(false); setEixoForm({}) }}
                            className="px-4 py-2 bg-gray-200 text-black text-xs rounded">Cancelar</button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {eixos.map(eixo => (
                        <div key={eixo.id} className="border rounded-lg p-4">
                          {editandoEixo === eixo.id ? (
                            <div className="space-y-3">
                              <input value={eixoForm.nome || ''} onChange={e => setEixoForm(p => ({ ...p, nome: e.target.value }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <textarea value={eixoForm.descricao || ''} onChange={e => setEixoForm(p => ({ ...p, descricao: e.target.value }))}
                                rows={2} className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                              <div className="flex gap-2">
                                <button onClick={salvarEixo} disabled={salvando}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded">{salvando ? 'Salvando…' : 'Salvar'}</button>
                                <button onClick={() => { setEditandoEixo(null); setEixoForm({}) }}
                                  className="px-3 py-1.5 bg-gray-200 text-black text-xs rounded">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-black text-sm">{eixo.nome}</p>
                                {eixo.descricao && <p className="text-xs text-gray-500 mt-1">{eixo.descricao}</p>}
                                <p className="text-xs text-gray-400 mt-1">{metas.filter(m => m.eixo_id === eixo.id).length} ação(ões)</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { setEditandoEixo(eixo.id); setEixoForm({ ...eixo }) }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FaEdit size={12} /></button>
                                <button onClick={() => deletarEixo(eixo.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded"><FaTrash size={12} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ABA METAS */}
                {abaAdmin === 'metas' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-black">Metas / Ações</h3>
                        <select value={eixoAdminFiltro ?? ''} onChange={e => setEixoAdminFiltro(e.target.value ? Number(e.target.value) : null)}
                          className="px-3 py-1.5 border rounded text-black text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Todos os eixos</option>
                          {eixos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                        </select>
                      </div>
                      <button onClick={() => { setCriandoMeta(true); setEditandoMeta(null); setMetaForm({ status: 'nao_iniciado', eixo_id: eixoAdminFiltro ?? eixos[0]?.id }) }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        <FaPlus size={9} /> Nova Meta
                      </button>
                    </div>
                    {(criandoMeta || editandoMeta !== null) && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-black mb-3">{criandoMeta ? 'Nova Meta' : 'Editar Meta'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs text-black mb-1 block">Eixo *</label>
                            <select value={metaForm.eixo_id ?? ''} onChange={e => setMetaForm(p => ({ ...p, eixo_id: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Selecione...</option>
                              {eixos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-black mb-1 block">Objetivo Geral</label>
                            <input value={metaForm.objetivo_geral || ''} onChange={e => setMetaForm(p => ({ ...p, objetivo_geral: e.target.value }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="text-xs text-black mb-1 block">Objetivo Específico</label>
                            <input value={metaForm.objetivo_especifico || ''} onChange={e => setMetaForm(p => ({ ...p, objetivo_especifico: e.target.value }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-black mb-1 block">Ação *</label>
                            <textarea value={metaForm.acao || ''} onChange={e => setMetaForm(p => ({ ...p, acao: e.target.value }))}
                              rows={2} className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                          </div>
                          <div>
                            <label className="text-xs text-black mb-1 block">Indicador</label>
                            <input value={metaForm.indicador || ''} onChange={e => setMetaForm(p => ({ ...p, indicador: e.target.value }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="text-xs text-black mb-1 block">Meta</label>
                            <input value={metaForm.meta_descricao || ''} onChange={e => setMetaForm(p => ({ ...p, meta_descricao: e.target.value }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="text-xs text-black mb-1 block">Status</label>
                            <select value={metaForm.status || 'nao_iniciado'} onChange={e => setMetaForm(p => ({ ...p, status: e.target.value as Meta['status'] }))}
                              className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="nao_iniciado">Não Iniciado</option>
                              <option value="em_andamento">Em andamento</option>
                              <option value="concluido">Concluído</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={salvarMeta} disabled={salvando}
                            className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-60">
                            <FaSave size={10} className="inline mr-1" />{salvando ? 'Salvando…' : 'Salvar'}
                          </button>
                          <button onClick={() => { setCriandoMeta(false); setEditandoMeta(null); setMetaForm({}) }}
                            className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300">
                            <FaTimes size={10} className="inline mr-1" />Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            <th className="px-3 py-2 text-left">Eixo</th>
                            <th className="px-3 py-2 text-left">Ação</th>
                            <th className="px-3 py-2 text-left">Meta</th>
                            <th className="px-3 py-2 text-left">Status</th>
                           {['2025','2026','2027','2028'].map(ano => (
                            <th key={ano} className="px-2 py-2 text-center">{ano}</th>
                            ))}
                            <th className="w-16 px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {metas.filter(m => !eixoAdminFiltro || m.eixo_id === eixoAdminFiltro).map(m => (
                            <tr key={m.id} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2 text-black max-w-[120px]"><span className="line-clamp-2">{m.eixo_nome}</span></td>
                              <td className="px-3 py-2 text-black max-w-[300px]"><span className="line-clamp-2">{m.acao}</span></td>
                              <td className="px-3 py-2 text-black max-w-[200px]"><span className="line-clamp-2">{m.meta_descricao || '—'}</span></td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_PILL[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                              </td>
                              {(['ano_2025','ano_2026','ano_2027','ano_2028'] as const).map(campo => (
                                <td key={campo} className="px-2 py-2 text-center">
                                    {m[campo]
                                    ? <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                                    : <span className="inline-block w-3 h-3 rounded-full bg-gray-200" />
                                    }
                                </td>
                                ))}
                                <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <button onClick={() => { setEditandoMeta(m.id); setCriandoMeta(false); setMetaForm({ ...m }) }}
                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"><FaEdit size={10} /></button>
                                  <button onClick={() => deletarMeta(m.id)}
                                    className="p-1 text-red-400 hover:bg-red-50 rounded"><FaTrash size={10} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

          ) : (

            /* ══════════ VISUALIZAÇÃO PÚBLICA ══════════ */
            <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>

            {/* Banner ponta a ponta */}
            <div className={`w-full px-8 py-10 ${hc ? 'bg-blue-950' : 'bg-blue-700'}`}>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
                Prefeitura Municipal de Itabaiana · Mandato 2025–2028
                </p>
                <h1 className="text-white text-3xl font-bold mb-4 leading-tight">
                Plano de Governo
                </h1>
                <p className="text-blue-100 text-base leading-relaxed max-w-3xl mb-3">
                Esta página apresenta todas as metas e ações propostas pelo Prefeito Municipal
                de Itabaiana à Justiça Eleitoral para o mandato <strong>2025–2028</strong>.
                </p>
                <p className="text-blue-200 text-base leading-relaxed max-w-3xl">
                Acompanhe em tempo real o andamento de cada compromisso, organizados por eixo
                temático, com total transparência e acesso público à população.
                </p>
            </div>

            <div className="p-6 space-y-8">

                {/* ── RESUMO ── */}
                <section>
                    <ul className="mb-6 space-y-1">
                    {eixos.map(e => (
                      <li key={e.id} className={`text-sm ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>
                        • <strong>{e.nome.toUpperCase()}:</strong>{' '}
                        {metas.filter(m => m.eixo_id === e.id).length} ações
                      </li>
                    ))}
                  </ul>
                  <div className={`${hc ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-5`}>
                    <p className={`text-xs font-semibold uppercase mb-3 ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>
                      Distribuição por eixo
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs mb-4">
                      {[{ label: 'Concluído', cls: 'bg-green-500' }, { label: 'Em andamento', cls: 'bg-blue-500' }, { label: 'Não iniciado', cls: 'bg-gray-200' }].map(l => (
                        <span key={l.label} className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
                          <span className={hc ? 'text-yellow-200' : 'text-gray-600'}>{l.label}</span>
                        </span>
                      ))}
                    </div>
                    <BarrasEixos eixos={eixos} metas={metas} hc={hc} onFiltrar={(eixoId, status) => {
                        setEixoFiltro(eixoId)
                        setStatusFiltro(status)
                        setObjetivoFiltro(null)
                        setPage(1)
                        setTimeout(() => document.getElementById('compromissos')?.scrollIntoView({ behavior: 'smooth' }), 50)
                        }} />
                  </div>
                </section>

                <hr className={hc ? 'border-gray-700' : 'border-gray-100'} />

                {/* ── STATUS ── */}
                <section>
                  <h2 className={`text-2xl font-bold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Status</h2>
                  <p className={`text-sm mb-5 ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>
                    Destes compromissos, <strong>{naoIniciadas}</strong> não foram <strong>iniciados</strong>,{' '}
                    <strong>{emAndamento}</strong> estão <strong>em andamento</strong> e{' '}
                    <strong>{concluidas}</strong> foram <strong>concluídos</strong>.
                  </p>

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Total', value: totalMetas, cls: 'border-gray-200 bg-gray-50', text: 'text-gray-800' },
                      { label: 'Concluídas', value: concluidas, cls: 'border-green-200 bg-green-50', text: 'text-green-700' },
                      { label: 'Em Andamento', value: emAndamento, cls: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
                      { label: 'Não Iniciadas', value: naoIniciadas, cls: 'border-gray-200 bg-gray-50', text: 'text-gray-500' },
                    ].map(c => (
                      <div key={c.label} className={`border rounded-xl p-4 text-center ${c.cls}`}>
                        <div className={`text-3xl font-bold ${c.text}`}>{c.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progresso geral */}
                  <div className={`${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-5`}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>Progresso geral</span>
                      <span className="text-sm font-bold text-green-600">{pctGeral}% concluído</span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden ${hc ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className="h-4 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${pctGeral}%` }} />
                    </div>
                  </div>

                  {/* Cards de eixos */}
                  <h3 className={`text-base font-semibold mb-3 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Eixos Temáticos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {eixos.map(e => (
                      <EixoCard key={e.id} eixo={e} hc={hc}
                        metas={metas.filter(m => m.eixo_id === e.id)}
                        onClick={() => { setEixoFiltro(e.id); setPage(1); setObjetivoFiltro(null); setTimeout(() => document.getElementById('compromissos')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
                      />
                    ))}
                  </div>
                </section>

                <hr className={hc ? 'border-gray-700' : 'border-gray-100'} />

                {/* ── COMPROMISSOS ── */}
                <section id="compromissos">
                  <h2 className={`text-2xl font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Ação</h2>

                 
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-3 mb-4 items-end">
                    <div className="flex flex-1 min-w-[200px]">
                      <input type="text" value={buscaTemp}
                        onChange={e => setBuscaTemp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && pesquisar()}
                        placeholder="Pesquisar por descritivo ou status..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={pesquisar}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap">
                        <FaSearch size={11} /> Pesquisar
                      </button>
                    </div>
                    <select value={eixoFiltro ?? ''} onChange={e => { setEixoFiltro(e.target.value ? Number(e.target.value) : null); setObjetivoFiltro(null); setPage(1) }}
                      className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Todos os eixos</option>
                      {eixos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                    <select value={statusFiltro} onChange={e => { setStatusFiltro(e.target.value); setPage(1) }}
                      className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Todos os status</option>
                      <option value="nao_iniciado">Não Iniciado</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                    {(eixoFiltro || statusFiltro || busca || objetivoFiltro) && (
                      <button onClick={() => { setEixoFiltro(null); setStatusFiltro(''); setBusca(''); setBuscaTemp(''); setObjetivoFiltro(null); setPage(1) }}
                        className="px-3 py-2 bg-gray-100 text-black text-sm rounded hover:bg-gray-200 flex items-center gap-1">
                        <FaTimes size={10} /> Limpar filtros
                      </button>
                    )}
                  </div>

                   {/* Botões quadrados de Objetivo Geral */}
                    {objetivosPorEixo.length > 0 && (
                    <div className="mb-5">
                        <div className="flex flex-wrap gap-3">
                        {objetivosPorEixo.flatMap(({ eixo, objetivos }) =>
                            objetivos.map(obj => {
                            const ms = metas.filter(m => m.objetivo_geral === obj && m.eixo_id === eixo.id)
                            const conc = ms.filter(m => m.status === 'concluido').length
                            const pct = ms.length > 0 ? Math.round((conc / ms.length) * 100) : 0
                            const ativo = objetivoFiltro === obj
                            return (
                                <button key={`${eixo.id}-${obj}`}
                                onClick={() => setModalObjetivo(obj)}
                                onContextMenu={e => { e.preventDefault(); setObjetivoFiltro(ativo ? null : obj); setPage(1) }}
                                className={`relative w-36 h-36 rounded-xl border-2 p-3 flex flex-col items-start justify-between text-left transition hover:shadow-md ${
                                    ativo
                                    ? 'border-blue-600 bg-blue-50'
                                    : hc ? 'border-gray-600 bg-gray-800 hover:border-blue-400' : 'border-gray-200 bg-white hover:border-blue-400'
                                }`}
                                title="Clique para detalhes | Clique direito para filtrar"
                                >
                                <p className={`text-xs font-semibold leading-tight line-clamp-4 ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>
                                    {obj}
                                </p>
                                <div className="w-full">
                                    <div className="flex justify-between text-xs mb-0.5">
                                    <span className={hc ? 'text-yellow-200' : 'text-gray-500'}>{ms.length} ações</span>
                                    <span className="font-bold text-green-600">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                                {ativo && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />}
                                </button>
                            )
                            })
                        )}
                        </div>
                        <p className={`text-xs mt-2 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>
                        Clique para ver detalhes • Clique direito para filtrar a lista
                        </p>
                    </div>
                    )}

                  {/* Indicador de filtro ativo */}
                  {objetivoFiltro && (
                    <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                      <span>Filtrando por objetivo: <strong>{objetivoFiltro.slice(0, 80)}{objetivoFiltro.length > 80 ? '…' : ''}</strong></span>
                      <button onClick={() => { setObjetivoFiltro(null); setPage(1) }} className="ml-auto text-blue-500 hover:text-blue-700">
                        <FaTimes size={10} />
                      </button>
                    </div>
                  )}

                  {/* Tabela */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className={`border-b-2 ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                          <th className={`px-4 py-3 text-left font-semibold ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Ação</th>
                          <th className={`px-4 py-3 text-left font-semibold w-36 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Status</th>
                          {['2025','2026','2027','2028'].map(ano => (
                            <th key={ano} className={`px-3 py-3 text-center font-semibold w-16 hidden lg:table-cell ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>{ano}</th>
                            ))}
                            <th className={`px-4 py-3 text-left font-semibold w-44 hidden md:table-cell ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Eixo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metasPaginadas.length === 0 ? (
                          <tr>
                            <td colSpan={3} className={`text-center py-12 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>
                              Nenhum compromisso encontrado.
                            </td>
                          </tr>
                        ) : metasPaginadas.map((m, i) => (
                          <tr key={m.id} className={`border-b transition ${
                            hc ? 'border-gray-700 hover:bg-gray-800'
                              : i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                          }`}>
                            <td className={`px-4 py-3 ${hc ? 'text-yellow-200' : 'text-gray-800'}`}>{m.acao}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_PILL[m.status]}`}>
                                {STATUS_LABEL[m.status]}
                              </span>
                            </td>
                            {(['ano_2025','ano_2026','ano_2027','ano_2028'] as const).map(campo => (
                            <td key={campo} className="px-3 py-3 text-center hidden lg:table-cell">
                                {m[campo]
                                ? <span className="inline-block w-4 h-4 rounded-full bg-green-500" title="Sim" />
                                : <span className="inline-block w-4 h-4 rounded-full bg-gray-200" title="Não" />
                                }
                            </td>
                            ))}
                            <td className={`px-4 py-3 hidden md:table-cell text-xs ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>
                            {m.eixo_nome}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Paginacao total={metasFiltradas.length} page={page} perPage={PER_PAGE} onChange={setPage} />
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal objetivo geral */}
      {modalObjetivo && (
        <ModalObjetivo
          objetivo={modalObjetivo}
          metas={metas.filter(m => m.objetivo_geral === modalObjetivo && (!eixoFiltro || m.eixo_id === eixoFiltro))}
          onClose={() => setModalObjetivo(null)}
        />
      )}

      <VLibras forceOnload />
    </div>
  )
}