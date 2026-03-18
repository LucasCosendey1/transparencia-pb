'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import {
  FaHome, FaCog, FaEye, FaEdit, FaSave, FaTimes, FaSearch,
  FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight,
  FaFilePdf, FaFileExcel, FaChevronDown, FaChevronUp, FaInfoCircle,
} from 'react-icons/fa'

// ── Tipos ──────────────────────────────────────────────────────
interface Diretriz { id: number; pagina_id: string; numero: string; descricao: string; ordem: number }
interface Objetivo { id: number; diretriz_id: number; pagina_id: string; numero: string; descricao: string; ordem: number }
interface Meta {
  id: number; objetivo_id: number; pagina_id: string; numero: string; descricao: string
  indicador: string | null; linha_base_valor: string | null; linha_base_ano: string | null
  unidade_medida: string | null; meta_plano: string | null
  meta_2026: string | null; meta_2027: string | null; meta_2028: string | null; meta_2029: string | null
  realizado_2026: string | null; realizado_2027: string | null; realizado_2028: string | null; realizado_2029: string | null
  data_realizado_2026: string | null; data_realizado_2027: string | null; data_realizado_2028: string | null; data_realizado_2029: string | null
  obs_2026: string | null; obs_2027: string | null; obs_2028: string | null; obs_2029: string | null
  ordem: number
}
interface Grafico { id: number; titulo: string; tipo: 'barra' | 'pizza' | 'card' | 'linha'; filtro_diretriz_id: number | null; filtro_objetivo_id: number | null; ordem: number }
interface Props { paginaId: string; breadcrumb: string }

const ANOS = ['2026', '2027', '2028', '2029'] as const
type Ano = typeof ANOS[number]

const COR_ANO: Record<Ano, string> = {
  '2026': 'text-green-600', '2027': 'text-blue-600', '2028': 'text-orange-500', '2029': 'text-purple-600'
}
const BG_ANO: Record<Ano, string> = {
  '2026': 'bg-green-500', '2027': 'bg-blue-500', '2028': 'bg-orange-400', '2029': 'bg-purple-500'
}

const CORES_DIRETRIZ = ['bg-green-700','bg-blue-700','bg-purple-700','bg-orange-600','bg-teal-700','bg-rose-700','bg-indigo-700']
const BORDER_DIRETRIZ = ['border-green-500','border-blue-500','border-purple-500','border-orange-400','border-teal-500','border-rose-500','border-indigo-500']
const BADGE_DIRETRIZ = ['bg-green-100 text-green-700','bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-orange-100 text-orange-700','bg-teal-100 text-teal-700','bg-rose-100 text-rose-700','bg-indigo-100 text-indigo-700']

const PER_PAGE_TABELA = 10


// ── Utilitários ────────────────────────────────────────────────
function pct(realizado: string | null, meta: string | null): number {
  const r = parseFloat(realizado || '0')
  const m = parseFloat(meta || '0')
  if (!m || isNaN(r) || isNaN(m)) return 0
  return Math.min(Math.round((r / m) * 100), 100)
}

function BarraProgresso({ valor, cor, label }: { valor: number; cor: string; label?: string }) {
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-500">{label}</span><span className="font-bold text-gray-700">{valor}%</span></div>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-500 ${cor}`} style={{ width: `${valor}%` }} />
      </div>
    </div>
  )
}

function Paginacao({ total, page, perPage, onChange }: { total: number; page: number; perPage: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / perPage)
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const pages: number[] = []
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  for (let i = start; i <= Math.min(start + 4, totalPages); i++) pages.push(i)
  return (
    <div className="flex items-center flex-wrap gap-2 mt-3">
      <span className="text-xs text-gray-500">Mostrando {total === 0 ? 0 : from}–{to} de {total}</span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onChange(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleLeft size={10} /></button>
          <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleLeft size={10} /></button>
          {pages.map(p => <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded text-xs font-medium ${p === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{p}</button>)}
          <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleRight size={10} /></button>
          <button onClick={() => onChange(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleRight size={10} /></button>
        </div>
      )}
    </div>
  )
}

// ── Modal da Diretriz ──────────────────────────────────────────
function ModalDiretriz({ diretriz, objetivos, metas, indice, onClose }: {
  diretriz: Diretriz; objetivos: Objetivo[]; metas: Meta[]; indice: number; onClose: () => void
}) {
  const objs = objetivos.filter(o => o.diretriz_id === diretriz.id)
  const metasDiretriz = metas.filter(m => objs.find(o => o.id === m.objetivo_id))
  const corBg = CORES_DIRETRIZ[indice % CORES_DIRETRIZ.length]

  // Progresso geral da diretriz (média dos % de conclusão de todas as metas com meta_plano)
  const metasComMeta = metasDiretriz.filter(m => m.meta_plano && parseFloat(m.meta_plano) > 0)
  const progGeral = metasComMeta.length > 0
    ? Math.round(metasComMeta.reduce((acc, m) => {
        const totalRealizado = ANOS.reduce((s, a) => s + parseFloat((m as any)[`realizado_${a}`] || '0'), 0)
        const totalMeta = parseFloat(m.meta_plano || '0')
        return acc + Math.min((totalRealizado / totalMeta) * 100, 100)
      }, 0) / metasComMeta.length)
    : 0

  // Por objetivo
  const porObjetivo = objs.map(o => {
    const ms = metas.filter(m => m.objetivo_id === o.id && m.meta_plano && parseFloat(m.meta_plano || '0') > 0)
    const prog = ms.length > 0
      ? Math.round(ms.reduce((acc, m) => {
          const r = ANOS.reduce((s, a) => s + parseFloat((m as any)[`realizado_${a}`] || '0'), 0)
          return acc + Math.min((r / parseFloat(m.meta_plano || '1')) * 100, 100)
        }, 0) / ms.length)
      : 0
    return { obj: o, prog, total: metas.filter(m => m.objetivo_id === o.id).length }
  })

  // Por ano
  const porAno = ANOS.map(ano => {
    const ms = metasDiretriz.filter(m => (m as any)[`meta_${ano}`] && parseFloat((m as any)[`meta_${ano}`] || '0') > 0)
    const prog = ms.length > 0
      ? Math.round(ms.reduce((acc, m) => {
          const r = parseFloat((m as any)[`realizado_${ano}`] || '0')
          const mt = parseFloat((m as any)[`meta_${ano}`] || '1')
          return acc + Math.min((r / mt) * 100, 100)
        }, 0) / ms.length)
      : 0
    return { ano, prog }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`${corBg} px-6 py-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded mb-2">Diretriz {diretriz.numero}</span>
              <p className="text-white text-sm font-semibold leading-snug">{diretriz.descricao}</p>
              <p className="text-white/70 text-xs mt-1">{objs.length} objetivos · {metasDiretriz.length} metas</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white"><FaTimes size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progresso geral */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progresso Geral da Diretriz</span>
              <span className="text-lg font-bold text-green-600">{progGeral}%</span>
            </div>
            <BarraProgresso valor={progGeral} cor="bg-green-500" />
          </div>

          {/* Gráfico por ano */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Andamento por Ano</h3>
            <div className="grid grid-cols-4 gap-3">
              {porAno.map(({ ano, prog }) => (
                <div key={ano} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                  <div className={`text-xl font-bold ${COR_ANO[ano as Ano]}`}>{prog}%</div>
                  <div className="text-xs text-gray-500 mt-0.5">{ano}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${BG_ANO[ano as Ano]}`} style={{ width: `${prog}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico por objetivo */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Progresso por Objetivo</h3>
            <div className="space-y-3">
              {porObjetivo.map(({ obj, prog, total }) => (
                <div key={obj.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${BADGE_DIRETRIZ[indice % BADGE_DIRETRIZ.length]}`}>{obj.numero}</span>
                      <span className="text-xs text-gray-700">{obj.descricao}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 flex-shrink-0">{prog}%</span>
                  </div>
                  <BarraProgresso valor={prog} cor={BG_ANO['2026']} />
                  <p className="text-xs text-gray-400 mt-1">{total} meta(s)</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pizza distribuição */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Distribuição de Metas por Objetivo</h3>
            <div className="flex items-center gap-6">
              <svg width="140" height="140" viewBox="0 0 160 160" className="flex-shrink-0">
                {(() => {
                  const data = porObjetivo.filter(x => x.total > 0).map((x, i) => ({
                    key: x.obj.numero, value: x.total,
                    color: ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'][i % 7],
                  }))
                  const tot = data.reduce((s, d) => s + d.value, 0)
                  if (tot === 0) return null
                  if (data.length === 1) return <><circle cx="80" cy="80" r="70" fill={data[0].color} /><text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="white">{data[0].value}</text></>
                  const cx = 80, cy = 80, r = 70
                  let angle = -Math.PI / 2
                  return data.map(d => {
                    const p = d.value / tot
                    const start = angle; angle += p * 2 * Math.PI
                    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
                    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle)
                    const mid = (start + angle) / 2
                    return (
                      <g key={d.key}>
                        <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${p > 0.5 ? 1 : 0},1 ${x2},${y2} Z`} fill={d.color} stroke="white" strokeWidth="2" />
                        {p > 0.08 && <text x={cx+r*0.6*Math.cos(mid)} y={cy+r*0.6*Math.sin(mid)} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="white">{d.value}</text>}
                      </g>
                    )
                  })
                })()}
              </svg>
              <div className="flex-1 space-y-1">
                {porObjetivo.filter(x => x.total > 0).map((x, i) => (
                  <div key={x.obj.id} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'][i % 7] }} />
                    <span className="text-gray-600 truncate">{x.obj.numero}</span>
                    <span className="ml-auto font-bold text-gray-800">{x.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────
export default function PmsLayout({ paginaId, breadcrumb }: Props) {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [abaAdmin, setAbaAdmin] = useState<'metas' | 'graficos'>('metas')

  const [diretrizes, setDiretrizes] = useState<Diretriz[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [graficos, setGraficos] = useState<Grafico[]>([])

  const [modalDiretriz, setModalDiretriz] = useState<{ d: Diretriz; idx: number } | null>(null)

  // Filtros públicos
  const [busca, setBusca] = useState('')
  const [buscaTemp, setBuscaTemp] = useState('')
  const [filtroDiretriz, setFiltroDiretriz] = useState<number | ''>('')
  const [filtroObjetivo, setFiltroObjetivo] = useState<number | ''>('')
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set())
  const [paginasPorDiretriz, setPaginasPorDiretriz] = useState<Record<number, number>>({})
  const getPaginaDiretriz = (id: number) => paginasPorDiretriz[id] ?? 1
  const setPaginaDiretriz = (id: number, p: number) => setPaginasPorDiretriz(prev => ({ ...prev, [id]: p }))

  // Admin
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Meta>>({})
  const [filtroDiretrizAdmin, setFiltroDiretrizAdmin] = useState<number | ''>('')
  const [filtroObjetivoAdmin, setFiltroObjetivoAdmin] = useState<number | ''>('')
  const [buscaAdmin, setBuscaAdmin] = useState('')
  const [buscaTempAdmin, setBuscaTempAdmin] = useState('')
  const [pageAdmin, setPageAdmin] = useState(1)
  const [graficoForm, setGraficoForm] = useState<Partial<Grafico>>({})
  const [editandoGrafico, setEditandoGrafico] = useState<number | null>(null)
  const [criandoGrafico, setCriandoGrafico] = useState(false)

  const hc = highContrast
  const adjustFontSize = (n: number) => setFontSize(p => Math.max(12, Math.min(24, p + n)))

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregar()
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalDiretriz ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalDiretriz])

  const carregar = async () => {
    setLoading(true)
    try {
      const [rD, rG] = await Promise.all([
        fetch(`/api/pms-diretrizes/${paginaId}`),
        fetch(`/api/pms-graficos/${paginaId}`),
      ])
      const [dD, dG] = await Promise.all([rD.json(), rG.json()])
      const dirs: Diretriz[] = Array.isArray(dD.diretrizes) ? dD.diretrizes : []
      setDiretrizes(dirs)
      setObjetivos(Array.isArray(dD.objetivos) ? dD.objetivos : [])
      setMetas(Array.isArray(dD.metas) ? dD.metas : [])
      setGraficos(Array.isArray(dG) ? dG : [])
      setExpandidas(new Set())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const salvar = async () => {
    if (!form.id) return
    setSalvando(true)
    try {
      await fetch(`/api/pms-metas/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      await carregar(); setEditando(null); setForm({})
    } catch { alert('❌ Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  const salvarGrafico = async () => {
    if (!graficoForm.titulo?.trim()) return alert('Informe o título.')
    if (!graficoForm.tipo) return alert('Selecione o tipo.')
    setSalvando(true)
    try {
      await fetch(`/api/pms-graficos/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graficoForm),
      })
      await carregar(); setGraficoForm({}); setEditandoGrafico(null); setCriandoGrafico(false)
    } catch { alert('❌ Erro.') } finally { setSalvando(false) }
  }

  const deletarGrafico = async (id: number) => {
    if (!confirm('Deletar este gráfico?')) return
    await fetch(`/api/pms-graficos/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar()
  }

  // KPIs globais
  const totalMetas = metas.length
  const progGlobal = (() => {
    const ms = metas.filter(m => m.meta_plano && parseFloat(m.meta_plano) > 0)
    if (!ms.length) return 0
    return Math.round(ms.reduce((acc, m) => {
      const r = ANOS.reduce((s, a) => s + parseFloat((m as any)[`realizado_${a}`] || '0'), 0)
      return acc + Math.min((r / parseFloat(m.meta_plano!)) * 100, 100)
    }, 0) / ms.length)
  })()

  // Filtros públicos
  const objsFiltrados = filtroObjetivo
    ? objetivos.filter(o => o.id === filtroObjetivo)
    : filtroDiretriz
      ? objetivos.filter(o => o.diretriz_id === filtroDiretriz)
      : objetivos

  const metasFiltradas = metas.filter(m => {
    if (!objsFiltrados.find(o => o.id === m.objetivo_id)) return false
    if (busca.trim()) {
      const t = busca.toLowerCase()
      return m.descricao.toLowerCase().includes(t) || m.numero.toLowerCase().includes(t) || (m.indicador || '').toLowerCase().includes(t)
    }
    return true
  })

  // Agrupado por diretriz para exibição
  const diretrizesVisiveis = filtroDiretriz ? diretrizes.filter(d => d.id === filtroDiretriz) : diretrizes

  // Admin
  const objsAdmin = filtroObjetivoAdmin ? objetivos.filter(o => o.id === filtroObjetivoAdmin)
    : filtroDiretrizAdmin ? objetivos.filter(o => o.diretriz_id === filtroDiretrizAdmin) : objetivos
  const metasAdmin = metas.filter(m => {
    if (!objsAdmin.find(o => o.id === m.objetivo_id)) return false
    if (buscaAdmin.trim()) {
      const t = buscaAdmin.toLowerCase()
      return m.descricao.toLowerCase().includes(t) || m.numero.toLowerCase().includes(t)
    }
    return true
  })
  const metasAdminPag = metasAdmin.slice((pageAdmin - 1) * PER_PAGE_TABELA, pageAdmin * PER_PAGE_TABELA)

  // Exportar PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFontSize(13); doc.setTextColor(20, 83, 45)
    doc.text('Plano Municipal de Saúde 2026-2029', 14, 14)
    autoTable(doc, {
      startY: 22,
      head: [['Nº', 'Meta', 'Indicador', 'Un.', 'Meta Plano', 'Meta 2026', 'Real. 2026', 'Meta 2027', 'Real. 2027', 'Meta 2028', 'Real. 2028', 'Meta 2029', 'Real. 2029']],
      body: metasFiltradas.map(m => [
        m.numero, m.descricao, m.indicador || '—', m.unidade_medida || '—', m.meta_plano || '—',
        m.meta_2026 || '—', m.realizado_2026 || '—',
        m.meta_2027 || '—', m.realizado_2027 || '—',
        m.meta_2028 || '—', m.realizado_2028 || '—',
        m.meta_2029 || '—', m.realizado_2029 || '—',
      ]),
      styles: { fontSize: 6, cellPadding: 1.5 },
      headStyles: { fillColor: [21, 128, 61], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 55 }, 2: { cellWidth: 45 } },
    })
    doc.save('PMS-metas.pdf')
  }

  const exportarXLSX = async () => {
    const XLSX = await import('xlsx')
    const dados = metasFiltradas.map(m => ({
      'Nº': m.numero, 'Descrição': m.descricao, 'Indicador': m.indicador || '',
      'Unidade': m.unidade_medida || '', 'Meta Plano': m.meta_plano || '',
      'Meta 2026': m.meta_2026 || '', 'Realizado 2026': m.realizado_2026 || '', 'Data 2026': m.data_realizado_2026 || '', 'Obs 2026': m.obs_2026 || '',
      'Meta 2027': m.meta_2027 || '', 'Realizado 2027': m.realizado_2027 || '', 'Data 2027': m.data_realizado_2027 || '', 'Obs 2027': m.obs_2027 || '',
      'Meta 2028': m.meta_2028 || '', 'Realizado 2028': m.realizado_2028 || '', 'Data 2028': m.data_realizado_2028 || '', 'Obs 2028': m.obs_2028 || '',
      'Meta 2029': m.meta_2029 || '', 'Realizado 2029': m.realizado_2029 || '', 'Data 2029': m.data_realizado_2029 || '', 'Obs 2029': m.obs_2029 || '',
    }))
    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Metas PMS')
    XLSX.writeFile(wb, 'PMS-metas.xlsx')
  }

  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header highContrast={hc} fontSize={fontSize} adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast} setFontSize={setFontSize} />

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
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition ${painelAberto ? 'bg-gray-200 text-black' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {painelAberto ? <><FaEye size={11} /> Ver página</> : <><FaCog size={11} /> Gerenciar Conteúdo</>}
            </button>
          )}
        </div>
      </div>

      <main className={`${hc ? 'bg-black' : 'bg-gray-50'} py-10`}>
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
          ) : (
            <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>

              {/* Banner */}
              <div className="w-full px-8 py-10 bg-gradient-to-r from-green-800 to-green-600">
                <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-3">Prefeitura Municipal de Itabaiana · Secretaria de Saúde</p>
                <h1 className="text-white text-3xl font-bold mb-2">Plano Municipal de Saúde</h1>
                <p className="text-green-100 text-sm font-medium mb-2">Período: 2026 – 2029</p>
                <p className="text-green-200 text-sm leading-relaxed max-w-3xl">Acompanhe em tempo real o andamento das diretrizes, objetivos e metas do Plano Municipal de Saúde. Clique em uma diretriz para ver gráficos detalhados de progresso.</p>
              </div>

              <div className="p-6 space-y-8">

                {/* KPIs */}
                <section>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-700">{diretrizes.length}</div>
                      <div className="text-xs text-gray-500 mt-1">Diretrizes</div>
                    </div>
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-700">{objetivos.length}</div>
                      <div className="text-xs text-gray-500 mt-1">Objetivos</div>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-gray-800">{totalMetas}</div>
                      <div className="text-xs text-gray-500 mt-1">Metas</div>
                    </div>
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-700">{progGlobal}%</div>
                      <div className="text-xs text-gray-500 mt-1">Progresso Geral</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progresso geral do plano</span>
                      <span className="text-sm font-bold text-green-600">{progGlobal}% concluído</span>
                    </div>
                    <BarraProgresso valor={progGlobal} cor="bg-green-500" />
                  </div>
                </section>

                {/* Cards diretrizes */}
                {!painelAberto && (
                  <section>
                    <h2 className={`text-xl font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Diretrizes — clique para ver gráficos detalhados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {diretrizes.map((d, idx) => {
                        const objs = objetivos.filter(o => o.diretriz_id === d.id)
                        const ms = metas.filter(m => objs.find(o => o.id === m.objetivo_id))
                        const msComMeta = ms.filter(m => m.meta_plano && parseFloat(m.meta_plano) > 0)
                        const prog = msComMeta.length > 0
                          ? Math.round(msComMeta.reduce((acc, m) => {
                              const r = ANOS.reduce((s, a) => s + parseFloat((m as any)[`realizado_${a}`] || '0'), 0)
                              return acc + Math.min((r / parseFloat(m.meta_plano!)) * 100, 100)
                            }, 0) / msComMeta.length)
                          : 0
                        return (
                          <button key={d.id} onClick={() => setModalDiretriz({ d, idx })}
                            className={`text-left rounded-xl border-2 ${BORDER_DIRETRIZ[idx % BORDER_DIRETRIZ.length]} bg-white hover:shadow-md transition-all p-4 group`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${BADGE_DIRETRIZ[idx % BADGE_DIRETRIZ.length]}`}>Diretriz {d.numero}</span>
                              <FaInfoCircle size={12} className="text-gray-400 group-hover:text-gray-600" />
                            </div>
                            <p className="text-xs text-gray-700 leading-snug mb-3 line-clamp-2">{d.descricao}</p>
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-gray-500">{objs.length} obj · {ms.length} metas</span>
                              <span className="font-bold text-green-600">{prog}%</span>
                            </div>
                            <BarraProgresso valor={prog} cor="bg-green-500" />
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Gráficos customizados */}
                {graficos.length > 0 && !painelAberto && (
                  <section>
                    <h2 className={`text-xl font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Análises</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {graficos.map(g => {
                        const objsG = g.filtro_diretriz_id ? objetivos.filter(o => o.diretriz_id === g.filtro_diretriz_id)
                          : g.filtro_objetivo_id ? objetivos.filter(o => o.id === g.filtro_objetivo_id) : objetivos
                        const metasG = metas.filter(m => objsG.find(o => o.id === m.objetivo_id))
                        const tot = metasG.length
                        const porObj = objsG.map(o => ({ label: o.numero, desc: o.descricao, total: metas.filter(m => m.objetivo_id === o.id).length })).filter(x => x.total > 0)
                        const maxV = Math.max(...porObj.map(x => x.total), 1)
                        return (
                          <div key={g.id} className={`rounded-xl p-5 border ${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-sm font-semibold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{g.titulo}</p>
                            {g.tipo === 'card' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl p-3 text-center border border-blue-200 bg-blue-50"><div className="text-2xl font-bold text-blue-700">{objsG.length}</div><div className="text-xs text-gray-500 mt-1">Objetivos</div></div>
                                <div className="rounded-xl p-3 text-center border border-gray-200 bg-white"><div className="text-2xl font-bold text-gray-800">{tot}</div><div className="text-xs text-gray-500 mt-1">Metas</div></div>
                              </div>
                            )}
                            {g.tipo === 'barra' && (
                              <div className="space-y-2">
                                {porObj.map(o => (
                                  <div key={o.label}>
                                    <div className="flex justify-between text-xs mb-0.5">
                                      <span className="truncate max-w-[75%] text-gray-700" title={o.desc}>{o.label} — {o.desc.substring(0, 40)}{o.desc.length > 40 ? '...' : ''}</span>
                                      <span className="font-bold text-gray-600">{o.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="h-3 rounded-full bg-green-500" style={{ width: `${(o.total / maxV) * 100}%` }} /></div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {g.tipo === 'pizza' && tot > 0 && (
                              <svg width="150" height="150" viewBox="0 0 160 160" className="mx-auto">
                                {(() => {
                                  const data = porObj.slice(0, 6).map((o, i) => ({ key: o.label, value: o.total, color: ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4'][i % 6] }))
                                  const t2 = data.reduce((s, d) => s + d.value, 0)
                                  if (data.length === 1) return <><circle cx="80" cy="80" r="70" fill={data[0].color} /><text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="white">{data[0].value}</text></>
                                  const cx = 80, cy = 80, r = 70; let angle = -Math.PI / 2
                                  return data.map(d => {
                                    const p = d.value / t2; const start = angle; angle += p * 2 * Math.PI
                                    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
                                    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle)
                                    const mid = (start + angle) / 2
                                    return (<g key={d.key}><path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${p > 0.5 ? 1 : 0},1 ${x2},${y2} Z`} fill={d.color} stroke="white" strokeWidth="2" />{p > 0.08 && <text x={cx+r*0.6*Math.cos(mid)} y={cy+r*0.6*Math.sin(mid)} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="white">{d.value}</text>}</g>)
                                  })
                                })()}
                              </svg>
                            )}
                            <p className={`text-xs mt-3 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>{tot} meta(s)</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                <hr className={hc ? 'border-gray-700' : 'border-gray-100'} />

                {/* Tabelas públicas */}
                {!painelAberto && (
                  <section>
                    <h2 className={`text-xl font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Metas e Indicadores</h2>

                    {/* Filtros + Exportação */}
                    <div className="flex flex-wrap gap-3 mb-5 items-end">
                  <div className="flex flex-1 min-w-[200px]">
                    <input type="text" value={buscaTemp}
                      onChange={e => setBuscaTemp(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') setBusca(buscaTemp) }}
                      placeholder="Buscar por meta, número ou indicador..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button onClick={() => setBusca(buscaTemp)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-r hover:bg-green-700"><FaSearch size={11} /></button>
                  </div>
                  <select value={filtroDiretriz} onChange={e => { setFiltroDiretriz(e.target.value ? Number(e.target.value) : ''); setFiltroObjetivo('') }}
                    className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Todas as diretrizes</option>
                    {diretrizes.map(d => <option key={d.id} value={d.id}>Diretriz {d.numero}</option>)}
                  </select>
                  <select value={filtroObjetivo} onChange={e => setFiltroObjetivo(e.target.value ? Number(e.target.value) : '')}
                    className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Todos os objetivos</option>
                    {(filtroDiretriz ? objetivos.filter(o => o.diretriz_id === filtroDiretriz) : objetivos).map(o => (
                      <option key={o.id} value={o.id}>Objetivo {o.numero}</option>
                    ))}
                  </select>
                  {(busca || filtroDiretriz || filtroObjetivo) && (
                    <button onClick={() => { setBusca(''); setBuscaTemp(''); setFiltroDiretriz(''); setFiltroObjetivo('') }}
                      className="px-3 py-2 bg-gray-100 text-black text-sm rounded hover:bg-gray-200 flex items-center gap-1">
                      <FaTimes size={10} /> Limpar
                    </button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button onClick={exportarPDF} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                      <FaFilePdf size={12} /> PDF
                    </button>
                    <button onClick={exportarXLSX} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">
                      <FaFileExcel size={12} /> XLSX
                    </button>
                  </div>
                </div>  
                

                    {/* Tabela agrupada por diretriz */}
                    <div className="space-y-4">
                      {diretrizesVisiveis.map((d, idx) => {
                        const objsDir = objetivos.filter(o => o.diretriz_id === d.id)
                        const allMetasDir = metasFiltradas.filter(m => objsDir.find(o => o.id === m.objetivo_id))

                        const pagDir = getPaginaDiretriz(d.id)
                        const metasDirPaginadas = allMetasDir.slice((pagDir - 1) * PER_PAGE_TABELA, pagDir * PER_PAGE_TABELA)
                        if (allMetasDir.length === 0) return null
                        const exp = expandidas.has(d.id)

                        return (
                          <div key={d.id} className={`border-2 ${BORDER_DIRETRIZ[idx % BORDER_DIRETRIZ.length]} rounded-xl overflow-hidden`}>
                            <button onClick={() => setExpandidas(prev => { const n = new Set(prev); n.has(d.id) ? n.delete(d.id) : n.add(d.id); return n })}
                              className={`w-full flex items-center gap-3 px-5 py-3 text-left ${CORES_DIRETRIZ[idx % CORES_DIRETRIZ.length]} hover:opacity-90 transition`}>
                              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">Diretriz {d.numero}</span>
                              <p className="text-white text-xs font-medium flex-1 line-clamp-1">{d.descricao}</p>
                              <span className="text-white flex-shrink-0">{exp ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}</span>
                            </button>










                            {exp && (
                              <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                      <th className="px-3 py-2.5 text-left font-semibold text-gray-700 w-14 border-r border-gray-200">Nº</th>
                                      <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200">Meta / Indicador</th>
                                      <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-14 border-r border-gray-200">Un.</th>
                                      <th className="px-3 py-2.5 text-center font-semibold text-gray-700 w-18 border-r border-gray-200">Meta Plano</th>
                                      {ANOS.map(ano => (
                                        <th key={ano} colSpan={3} className={`px-2 py-2.5 text-center font-bold ${COR_ANO[ano as Ano]} border-r border-gray-200`}>
                                          {ano}
                                        </th>
                                      ))}
                                    </tr>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                      <th colSpan={4} className="border-r border-gray-200" />
                                      {ANOS.map(ano => (
                                        <>
                                          <th key={`${ano}-m`} className="px-2 py-1.5 text-center text-gray-500 font-medium w-16">Meta</th>
                                          <th key={`${ano}-r`} className={`px-2 py-1.5 text-center font-medium w-16 ${COR_ANO[ano as Ano]}`}>Real.</th>
                                          <th key={`${ano}-p`} className="px-2 py-1.5 text-center text-gray-400 font-medium w-16 border-r border-gray-200">%</th>
                                        </>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {metasDirPaginadas.map((m, i) => {
                                      const obj = objetivos.find(o => o.id === m.objetivo_id)
                                      return (
                                        <tr key={m.id} className={`border-b transition ${i % 2 === 0 ? 'bg-white hover:bg-green-50' : 'bg-gray-50 hover:bg-green-50'}`}>
                                          <td className="px-3 py-2 border-r border-gray-100">
                                            <div className="font-bold text-green-700">{m.numero}</div>
                                            {obj && <div className="text-gray-400 text-xs">Obj.{obj.numero}</div>}
                                          </td>
                                          <td className="px-3 py-2 border-r border-gray-100">
                                            <p className="text-gray-800 leading-relaxed">{m.descricao}</p>
                                            {m.indicador && <p className="text-gray-400 text-xs mt-0.5 italic">{m.indicador}</p>}
                                          </td>
                                          <td className="px-3 py-2 text-center text-gray-500 border-r border-gray-100">{m.unidade_medida || '—'}</td>
                                          <td className="px-3 py-2 text-center font-medium text-gray-700 border-r border-gray-100">{m.meta_plano || '—'}</td>
                                          {ANOS.map(ano => {
                                            const meta = (m as any)[`meta_${ano}`]
                                            const real = (m as any)[`realizado_${ano}`]
                                            const data = (m as any)[`data_realizado_${ano}`]
                                            const obs = (m as any)[`obs_${ano}`]
                                            const p = pct(real, meta)
                                            return (
                                              <>
                                                <td key={`${ano}-m`} className="px-2 py-2 text-center text-gray-600">{meta || '—'}</td>
                                                <td key={`${ano}-r`} className={`px-2 py-2 text-center font-bold ${COR_ANO[ano as Ano]}`}>
                                                  {real || '—'}
                                                  {data && <div className="text-gray-400 font-normal text-xs">{data}</div>}
                                                  {obs && <div className="text-gray-400 font-normal text-xs italic truncate max-w-[80px]" title={obs}>{obs}</div>}
                                                </td>
                                                <td key={`${ano}-p`} className="px-2 py-2 border-r border-gray-100">
                                                  {meta ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                      <span className={`text-xs font-bold ${p >= 100 ? 'text-green-600' : p >= 50 ? 'text-yellow-600' : 'text-gray-500'}`}>{p}%</span>
                                                      <div className="w-10 bg-gray-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${p >= 100 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-400' : 'bg-gray-400'}`} style={{ width: `${p}%` }} />
                                                      </div>
                                                    </div>
                                                  ) : <span className="text-gray-300">—</span>}
                                                </td>
                                              </>
                                            )
                                          })}
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                                <div className="px-4 pb-3">
                                  <Paginacao total={allMetasDir.length} page={getPaginaDiretriz(d.id)} perPage={PER_PAGE_TABELA} onChange={p => setPaginaDiretriz(d.id, p)} />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                  </section>
                )}

                {/* Painel Admin */}
                {painelAberto && (
                  <section>
                    <div className="flex border-b mb-5 -mx-6 px-6">
                      {([{ key: 'metas', label: 'Editar Metas' }, { key: 'graficos', label: 'Gráficos' }] as const).map(a => (
                        <button key={a.key} onClick={() => setAbaAdmin(a.key)}
                          className={`px-5 py-2 text-sm font-medium border-b-2 transition ${abaAdmin === a.key ? 'border-green-600 text-green-600' : 'border-transparent text-black hover:text-gray-700'}`}>
                          {a.label}
                        </button>
                      ))}
                    </div>

                    {abaAdmin === 'metas' ? (
                      <div>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <select value={filtroDiretrizAdmin} onChange={e => { setFiltroDiretrizAdmin(e.target.value ? Number(e.target.value) : ''); setFiltroObjetivoAdmin(''); setPageAdmin(1) }}
                            className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Todas as diretrizes</option>
                            {diretrizes.map(d => <option key={d.id} value={d.id}>Diretriz {d.numero}</option>)}
                          </select>
                          <select value={filtroObjetivoAdmin} onChange={e => { setFiltroObjetivoAdmin(e.target.value ? Number(e.target.value) : ''); setPageAdmin(1) }}
                            className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Todos os objetivos</option>
                            {(filtroDiretrizAdmin ? objetivos.filter(o => o.diretriz_id === filtroDiretrizAdmin) : objetivos).map(o => <option key={o.id} value={o.id}>Objetivo {o.numero}</option>)}
                          </select>
                          <div className="flex flex-1 min-w-[180px]">
                            <input type="text" value={buscaTempAdmin} onChange={e => setBuscaTempAdmin(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && (setBuscaAdmin(buscaTempAdmin), setPageAdmin(1))}
                              placeholder="Buscar meta..." className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <button onClick={() => { setBuscaAdmin(buscaTempAdmin); setPageAdmin(1) }} className="px-4 py-2 bg-green-600 text-white text-sm rounded-r hover:bg-green-700"><FaSearch size={11} /></button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {metasAdminPag.map(m => {
                            const obj = objetivos.find(o => o.id === m.objetivo_id)
                            const dir = obj ? diretrizes.find(d => d.id === obj.diretriz_id) : null
                            return (
                              <div key={m.id} className={`border rounded-xl p-4 ${hc ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{m.numero}</span>
                                      {dir && <span className="text-xs text-gray-400">Diretriz {dir.numero}</span>}
                                      {obj && <span className="text-xs text-gray-400">· Obj. {obj.numero}</span>}
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed">{m.descricao}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Meta plano: <strong>{m.meta_plano || '—'}</strong> · Unidade: {m.unidade_medida || '—'}</p>
                                  </div>
                                  {editando !== m.id && (
                                    <button onClick={() => { setEditando(m.id); setForm({ ...m }) }} className="p-2 text-green-500 hover:bg-green-50 rounded flex-shrink-0"><FaEdit size={14} /></button>
                                  )}
                                </div>

                                {editando === m.id ? (
                                  <div className="mt-4 space-y-4">
                                    {ANOS.map(ano => (
                                      <div key={ano} className={`border rounded-lg p-3 ${hc ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-xs font-bold mb-2 ${COR_ANO[ano as Ano]}`}>{ano}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">Meta</label>
                                            <input value={(form as any)[`meta_${ano}`] ?? ''} onChange={e => setForm(p => ({ ...p, [`meta_${ano}`]: e.target.value }))}
                                              className="w-full px-2 py-1.5 border rounded text-black text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                          </div>
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">Realizado</label>
                                            <input value={(form as any)[`realizado_${ano}`] ?? ''} onChange={e => setForm(p => ({ ...p, [`realizado_${ano}`]: e.target.value }))}
                                              className="w-full px-2 py-1.5 border rounded text-black text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                          </div>
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">Data realizado</label>
                                            <input type="date" value={(form as any)[`data_realizado_${ano}`] ?? ''} onChange={e => setForm(p => ({ ...p, [`data_realizado_${ano}`]: e.target.value }))}
                                              className="w-full px-2 py-1.5 border rounded text-black text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                          </div>
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">Observação</label>
                                            <input value={(form as any)[`obs_${ano}`] ?? ''} onChange={e => setForm(p => ({ ...p, [`obs_${ano}`]: e.target.value }))}
                                              placeholder="Opcional..."
                                              className="w-full px-2 py-1.5 border rounded text-black text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="flex gap-2">
                                      <button onClick={salvar} disabled={salvando} className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-60 flex items-center gap-1">
                                        <FaSave size={10} />{salvando ? 'Salvando…' : 'Salvar'}
                                      </button>
                                      <button onClick={() => { setEditando(null); setForm({}) }} className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300 flex items-center gap-1">
                                        <FaTimes size={10} />Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {ANOS.map(ano => {
                                      const meta = (m as any)[`meta_${ano}`]
                                      const real = (m as any)[`realizado_${ano}`]
                                      const data = (m as any)[`data_realizado_${ano}`]
                                      const obs = (m as any)[`obs_${ano}`]
                                      const p = pct(real, meta)
                                      return (
                                        <div key={ano} className={`rounded-lg p-2 border ${hc ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                          <p className={`text-xs font-bold mb-1 ${COR_ANO[ano as Ano]}`}>{ano}</p>
                                          <div className="text-xs space-y-0.5">
                                            <p className="text-gray-500">Meta: <span className="font-medium text-gray-700">{meta || '—'}</span></p>
                                            <p className="text-gray-500">Real.: <span className={`font-bold ${COR_ANO[ano as Ano]}`}>{real || '—'}</span></p>
                                            {data && <p className="text-gray-400">{data}</p>}
                                            {obs && <p className="text-gray-400 italic truncate" title={obs}>{obs}</p>}
                                            {meta && <BarraProgresso valor={p} cor={BG_ANO[ano as Ano]} />}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <Paginacao total={metasAdmin.length} page={pageAdmin} perPage={PER_PAGE_TABELA} onChange={setPageAdmin} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-black">Gráficos Customizados</h3>
                          <button onClick={() => { setCriandoGrafico(true); setEditandoGrafico(null); setGraficoForm({ tipo: 'card', ordem: graficos.length + 1 }) }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">+ Novo Gráfico</button>
                        </div>
                        {(criandoGrafico || editandoGrafico !== null) && (
                          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs font-semibold text-black mb-3">{criandoGrafico ? 'Novo Gráfico' : 'Editar Gráfico'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="md:col-span-2">
                                <label className="text-xs text-black mb-1 block">Título *</label>
                                <input value={graficoForm.titulo || ''} onChange={e => setGraficoForm(p => ({ ...p, titulo: e.target.value }))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                              </div>
                              <div>
                                <label className="text-xs text-black mb-1 block">Tipo *</label>
                                <select value={graficoForm.tipo || ''} onChange={e => setGraficoForm(p => ({ ...p, tipo: e.target.value as Grafico['tipo'] }))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                  <option value="">Selecione...</option>
                                  <option value="card">Card numérico</option>
                                  <option value="barra">Barra (metas por objetivo)</option>
                                  <option value="pizza">Pizza (distribuição)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-black mb-1 block">Filtrar por Diretriz</label>
                                <select value={graficoForm.filtro_diretriz_id ?? ''} onChange={e => setGraficoForm(p => ({ ...p, filtro_diretriz_id: e.target.value ? Number(e.target.value) : null, filtro_objetivo_id: null }))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                  <option value="">Todas</option>
                                  {diretrizes.map(d => <option key={d.id} value={d.id}>Diretriz {d.numero}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-black mb-1 block">Filtrar por Objetivo</label>
                                <select value={graficoForm.filtro_objetivo_id ?? ''} onChange={e => setGraficoForm(p => ({ ...p, filtro_objetivo_id: e.target.value ? Number(e.target.value) : null }))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                  <option value="">Todos</option>
                                  {(graficoForm.filtro_diretriz_id ? objetivos.filter(o => o.diretriz_id === graficoForm.filtro_diretriz_id) : objetivos).map(o => <option key={o.id} value={o.id}>Objetivo {o.numero}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-black mb-1 block">Ordem</label>
                                <input type="number" value={graficoForm.ordem ?? ''} onChange={e => setGraficoForm(p => ({ ...p, ordem: Number(e.target.value) }))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button onClick={salvarGrafico} disabled={salvando} className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-60"><FaSave size={10} className="inline mr-1" />{salvando ? 'Salvando…' : 'Salvar'}</button>
                              <button onClick={() => { setCriandoGrafico(false); setEditandoGrafico(null); setGraficoForm({}) }} className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300"><FaTimes size={10} className="inline mr-1" />Cancelar</button>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          {graficos.map(g => (
                            <div key={g.id} className="border rounded-lg p-4 flex items-start justify-between">
                              <div>
                                <p className="font-medium text-black text-sm">{g.titulo}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {g.tipo.toUpperCase()}
                                  {g.filtro_diretriz_id && ` · Diretriz: ${diretrizes.find(d => d.id === g.filtro_diretriz_id)?.numero}`}
                                  {g.filtro_objetivo_id && ` · Objetivo: ${objetivos.find(o => o.id === g.filtro_objetivo_id)?.numero}`}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { setEditandoGrafico(g.id); setCriandoGrafico(false); setGraficoForm({ ...g }) }} className="p-1.5 text-green-500 hover:bg-green-50 rounded"><FaEdit size={12} /></button>
                                <button onClick={() => deletarGrafico(g.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><FaTimes size={12} /></button>
                              </div>
                            </div>
                          ))}
                          {graficos.length === 0 && !criandoGrafico && <p className="text-sm text-gray-400 text-center py-8">Nenhum gráfico criado ainda.</p>}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {modalDiretriz && (
        <ModalDiretriz
          diretriz={modalDiretriz.d}
          objetivos={objetivos}
          metas={metas}
          indice={modalDiretriz.idx}
          onClose={() => setModalDiretriz(null)}
        />
      )}

      <VLibrasWrapper />
    </div>
  )
}