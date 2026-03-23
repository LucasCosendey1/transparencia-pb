'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import {
  FaHome, FaSearch, FaDownload, FaChevronLeft, FaChevronRight,
  FaChevronDown, FaChevronUp, FaInfoCircle, FaSync, FaFilter,
  FaFileCsv, FaFileExcel, FaFileCode, FaFilePdf, FaFileAlt,
  FaFileWord, FaSortUp, FaSortDown, FaSort, FaEye,
  FaTable, FaChartBar, FaQuestionCircle, FaCalendarAlt,
} from 'react-icons/fa'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, RadialBarChart, RadialBar,
} from 'recharts'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ApiColumn {
  key: string
  label: string
  type?: 'currency' | 'text' | 'number' | 'date'
  tooltip?: string
  chartRole?: 'category' | 'bar' | 'line'
  hidden?: boolean
}

export interface ApiCard {
  label: string
  valueKey: string
  compute?: (data: Record<string, unknown>[]) => number | string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  tooltip?: string
  format?: 'currency' | 'number' | 'text'
}

export interface ApiPageConfig {
  paginaId: string
  titulo: string
  subtitulo?: string
  breadcrumb: string
  fonte?: string
  apiUrl: string
  apiVersion?: string
  ctx?: string
  extraParams?: Record<string, string>
  columns: ApiColumn[]
  cards?: ApiCard[]
  showYearFilter?: boolean
  showMonthFilter?: boolean
  showSearchFilter?: boolean
  showMovimentoFilter?: boolean
  glossario?: { termo: string; definicao: string }[]
}

interface Props {
  config: ApiPageConfig
  highContrast: boolean
  fontSize: number
  adjustFontSize: (n: number) => void
  setHighContrast: (v: boolean) => void
  setFontSize: (v: number) => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const ANOS_DISPONIVEIS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)
const MESES = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Fev' },
  { value: '03', label: 'Mar' }, { value: '04', label: 'Abr' },
  { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' },
  { value: '09', label: 'Set' }, { value: '10', label: 'Out' },
  { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' },
]

const CHART_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']
const ANO_COLORS: Record<number, string> = {}
ANOS_DISPONIVEIS.forEach((a, i) => { ANO_COLORS[a] = CHART_COLORS[i % CHART_COLORS.length] })

type ChartView = 'combinado' | 'pizza' | 'barrasH' | 'evolucao' | 'gauge'
type ChartCompare = 'total' | 'ano' | 'mes'

// ─── Utilitários ──────────────────────────────────────────────────────────────

function fmt(value: unknown, type?: string): string {
  if (value === null || value === undefined) return '—'
  if (type === 'currency') {
    const n = Number(value)
    return isNaN(n) ? String(value) : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  if (type === 'number') {
    const n = Number(value)
    return isNaN(n) ? String(value) : n.toLocaleString('pt-BR')
  }
  return String(value)
}

function fmtShort(value: unknown): string {
  const v = Number(value)
  if (Math.abs(v) >= 1_000_000_000) return `R$ ${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1e3).toFixed(0)}K`
  return `R$ ${v.toFixed(0)}`
}

const CARD_COLORS: Record<string, string> = {
  blue: 'bg-blue-600', green: 'bg-emerald-600',
  red: 'bg-red-600', yellow: 'bg-amber-500', purple: 'bg-purple-600',
}
const CARD_COLORS_HC: Record<string, string> = {
  blue: 'border-blue-400 text-blue-300', green: 'border-emerald-400 text-emerald-300',
  red: 'border-red-400 text-red-300', yellow: 'border-yellow-300 text-yellow-300',
  purple: 'border-purple-400 text-purple-300',
}

// ─── Exportação ───────────────────────────────────────────────────────────────

function exportData(data: Record<string, unknown>[], columns: ApiColumn[], format: string, titulo: string) {
  const visibleCols = columns.filter(c => !c.hidden)
  const headers = visibleCols.map(c => c.label)
  const rows = data.map(row => visibleCols.map(c => row[c.key] ?? ''))

  if (format === 'json') {
    download(new Blob([JSON.stringify({ data }, null, 2)], { type: 'application/json' }), `${titulo}.json`)
  } else if (format === 'csv') {
    download(new Blob([[headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')], { type: 'text/csv;charset=utf-8;' }), `${titulo}.csv`)
  } else if (format === 'txt') {
    download(new Blob([[headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')], { type: 'text/plain;charset=utf-8;' }), `${titulo}.txt`)
  } else if (format === 'rtf') {
    const rtf = `{\\rtf1\\ansi\n{\\b ${headers.join(' | ')}}\\par\n${rows.map(r => r.join(' | ')).join('\\par\n')}\n}`
    download(new Blob([rtf], { type: 'application/rtf' }), `${titulo}.rtf`)
  } else if (format === 'xlsx') {
    download(new Blob([[headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')], { type: 'application/vnd.ms-excel' }), `${titulo}.xls`)
  } else if (format === 'pdf') {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>${titulo}</title>
      <style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}th{background:#1e40af;color:white;padding:6px;font-size:10px}td{border:1px solid #ddd;padding:5px;font-size:10px}</style>
      </head><body><h2>${titulo}</h2><p style="font-size:10px;color:#666">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></body></html>`)
    win.document.close()
    win.print()
  }
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ApiPageLayout({ config, highContrast, fontSize, adjustFontSize, setHighContrast, setFontSize }: Props) {
  const hc = highContrast

  const [dataByYear, setDataByYear] = useState<Record<number, Record<string, unknown>[]>>({})
  const [loadingYears, setLoadingYears] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('')

  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [busca, setBusca] = useState('')
  const [somenteMovimento, setSomenteMovimento] = useState(false)

  const [page, setPage] = useState(1)
  const perPage = 20
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    new Set(config.columns.filter(c => c.hidden).map(c => c.key))
  )

  const [activeTab, setActiveTab] = useState<'tabela' | 'grafico'>('tabela')
  const [showGlossario, setShowGlossario] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const [chartIndex, setChartIndex] = useState(0)
  const [chartCompare, setChartCompare] = useState<ChartCompare>('total')

  const CHARTS: { id: ChartView; label: string }[] = [
    { id: 'combinado', label: 'Gráfico de Barras + Linha' },
    { id: 'pizza',     label: 'Gráfico de pizza' },
    { id: 'barrasH',   label: 'Gráfico de Ranking' },
    { id: 'evolucao',  label: 'Gráfico de Evolução Mensal' },
    { id: 'gauge',     label: 'Gráfico de Realizado em %' },
  ]

  // ── Fetch por ano ──
  const fetchYear = useCallback(async (year: number) => {
    setDataByYear(prev => {
      if (prev[year]) return prev
      return prev
    })
    setLoadingYears(prev => {
      if (dataByYear[year]) return prev
      return new Set(prev).add(year)
    })

    if (dataByYear[year]) return

    setError(null)
    try {
      const ctx = config.ctx ?? '201089'
      const version = config.apiVersion ?? '1.0'
      const url = new URL(config.apiUrl.replace('{ctx}', ctx))
      url.searchParams.set('api-version', version)
      url.searchParams.set('exercicio', String(year))
      if (config.extraParams) Object.entries(config.extraParams).forEach(([k, v]) => url.searchParams.set(k, v))
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url.toString())}`)
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = await res.json()
      const arr: Record<string, unknown>[] = Array.isArray(json) ? json : (json.data ?? [])
      setDataByYear(prev => ({ ...prev, [year]: arr.map(r => ({ ...r, _ano: year })) }))
      if (json.infoUltimaAtualizacao) setUltimaAtualizacao(json.infoUltimaAtualizacao)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoadingYears(prev => { const s = new Set(prev); s.delete(year); return s })
    }
  }, [config, dataByYear])

  useEffect(() => {
    selectedYears.forEach(y => { if (!dataByYear[y]) fetchYear(y) })
  }, [selectedYears]) // eslint-disable-line

  function toggleYear(year: number) {
    setSelectedYears(prev =>
      prev.includes(year) ? (prev.length > 1 ? prev.filter(y => y !== year) : prev) : [...prev, year].sort((a, b) => b - a)
    )
    setPage(1)
  }

  function toggleMonth(m: string) {
    setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
    setPage(1)
  }

  const allData = useMemo(() => selectedYears.flatMap(y => dataByYear[y] ?? []), [selectedYears, dataByYear])

  const filtered = useMemo(() => {
    let d = [...allData]
    if (somenteMovimento) d = d.filter(r => r['movimento'] === 'S')
    if (selectedMonths.length > 0) {
      d = d.filter(r => {
        const m = String(r['competência'] ?? '').split('/')[0]
        return selectedMonths.includes(m)
      })
    }
    if (busca.trim()) {
      const q = busca.toLowerCase()
      d = d.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
    }
    if (sortKey) {
      d.sort((a, b) => {
        const an = Number(a[sortKey]); const bn = Number(b[sortKey])
        if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an
        return sortDir === 'asc' ? String(a[sortKey]).localeCompare(String(b[sortKey])) : String(b[sortKey]).localeCompare(String(a[sortKey]))
      })
    }
    return d
  }, [allData, somenteMovimento, selectedMonths, busca, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)
  const loading = loadingYears.size > 0

  function computeCard(card: ApiCard): string {
    const base = filtered.filter(r => r['movimento'] === 'S')
    if (card.compute) {
      const val = card.compute(base)
      if (card.format === 'currency') return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      return String(val)
    }
    const sum = base.reduce((acc, r) => acc + (Number(r[card.valueKey]) || 0), 0)
    if (card.format === 'currency') return sum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return sum.toLocaleString('pt-BR')
  }

  const chartCategoryCol = config.columns.find(c => c.chartRole === 'category')
  const chartBarCols = config.columns.filter(c => c.chartRole === 'bar')
  const chartLineCols = config.columns.filter(c => c.chartRole === 'line')

  const comboData = useMemo(() => {
    return filtered.filter(r => r['movimento'] === 'S').slice(0, 12).map(row => {
      const entry: Record<string, unknown> = {}
      if (chartCategoryCol) {
        const raw = String(row[chartCategoryCol.key] ?? '')
        entry['_label'] = raw.length > 22 ? raw.slice(0, 22) + '…' : raw
      }
      entry['_ano'] = row['_ano']
      ;[...chartBarCols, ...chartLineCols].forEach(c => { entry[c.key] = Number(row[c.key]) || 0 })
      return entry
    })
  }, [filtered, chartCategoryCol, chartBarCols, chartLineCols])

  const pizzaData = useMemo(() => {
    const barKey = chartBarCols[0]?.key
    if (!barKey || !chartCategoryCol) return []
    const map: Record<string, number> = {}
    filtered.filter(r => r['movimento'] === 'S').forEach(r => {
      const label = String(r[chartCategoryCol.key] ?? '').slice(0, 30)
      map[label] = (map[label] || 0) + (Number(r[barKey]) || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }))
  }, [filtered, chartBarCols, chartCategoryCol])

  const evolucaoData = useMemo(() => {
    const barKey = chartBarCols[0]?.key
    const lineKey = chartLineCols[0]?.key
    if (!barKey) return []
    if (chartCompare === 'ano') {
      const map: Record<string, Record<number, number>> = {}
      MESES.forEach(m => { map[m.value] = {} })
      filtered.filter(r => r['movimento'] === 'S').forEach(r => {
        const [m] = String(r['competência'] ?? '').split('/')
        const ano = Number(r['_ano'])
        if (map[m]) map[m][ano] = (map[m][ano] || 0) + (Number(r[barKey]) || 0)
      })
      return MESES.map(m => {
        const entry: Record<string, unknown> = { _label: m.label }
        selectedYears.forEach(y => { entry[`ano_${y}`] = map[m.value][y] || 0 })
        return entry
      })
    }
    const map2: Record<string, { previsto: number; realizado: number }> = {}
    MESES.forEach(m => { map2[m.value] = { previsto: 0, realizado: 0 } })
    filtered.filter(r => r['movimento'] === 'S').forEach(r => {
      const [m] = String(r['competência'] ?? '').split('/')
      if (map2[m]) {
        map2[m].previsto += Number(r[barKey]) || 0
        if (lineKey) map2[m].realizado += Number(r[lineKey]) || 0
      }
    })
    return MESES.map(m => ({ _label: m.label, Previsto: map2[m.value].previsto, Realizado: map2[m.value].realizado }))
  }, [filtered, chartBarCols, chartLineCols, chartCompare, selectedYears])

  const gaugeData = useMemo(() => {
    const barKey = chartBarCols[0]?.key
    const lineKey = chartLineCols[0]?.key
    if (!barKey || !lineKey) return { pct: 0, previsto: 0, realizado: 0 }
    const base = filtered.filter(r => r['movimento'] === 'S')
    const previsto = base.reduce((a, r) => a + (Number(r[barKey]) || 0), 0)
    const realizado = base.reduce((a, r) => a + (Number(r[lineKey]) || 0), 0)
    return { pct: previsto > 0 ? Math.min(100, (realizado / previsto) * 100) : 0, previsto, realizado }
  }, [filtered, chartBarCols, chartLineCols])

  const radialData = [
    { name: 'Realizado', value: gaugeData.pct, fill: '#10b981' },
    { name: 'Restante', value: 100 - gaugeData.pct, fill: hc ? '#333' : '#e5e7eb' },
  ]

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }
  function toggleCol(key: string) {
    setHiddenCols(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s })
  }
  const visibleCols = config.columns.filter(c => !hiddenCols.has(c.key))
  const currentChart = CHARTS[chartIndex]

  const CARD_BG = hc ? 'bg-gray-900 border border-yellow-300' : 'bg-white shadow-md'
  const INPUT = hc ? 'bg-gray-900 border border-yellow-300 text-yellow-300 placeholder-yellow-600' : 'bg-white border border-gray-300 text-gray-700'
  const BTN_PRIMARY = hc ? 'bg-yellow-300 text-black hover:bg-yellow-400' : 'bg-blue-600 text-white hover:bg-blue-700'
  const TH = hc ? 'bg-gray-800 text-yellow-300 border-b border-yellow-300' : 'bg-blue-700 text-white'
  const TR_EVEN = hc ? 'bg-gray-900' : 'bg-gray-50'
  const TR_ODD = hc ? 'bg-black' : 'bg-white'
  const TD_BORDER = hc ? 'border-b border-gray-700' : 'border-b border-gray-100'

  return (
    <div className={`min-h-screen ${hc ? 'bg-black text-yellow-300' : 'bg-gray-50 text-gray-800'}`} style={{ fontSize: `${fontSize}px` }}>
      <Header highContrast={hc} fontSize={fontSize} adjustFontSize={adjustFontSize} setHighContrast={setHighContrast} setFontSize={setFontSize} />

      <div className={`${hc ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center text-sm">
          <Link href="/" className={`${hc ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
            <FaHome className="mr-1" /> Início
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className={hc ? 'text-yellow-300' : 'text-gray-600'}>{config.breadcrumb}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">

        {/* Título */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{config.titulo}</h1>
            {config.subtitulo && <p className={`mt-1 text-sm ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>{config.subtitulo}</p>}
            {ultimaAtualizacao && (
              <p className={`mt-1 text-xs flex items-center gap-1 ${hc ? 'text-yellow-400' : 'text-gray-400'}`}>
                <FaSync size={10} /> {ultimaAtualizacao}
              </p>
            )}
          </div>
          {config.glossario?.length && (
            <button onClick={() => setShowGlossario(g => !g)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
              <FaQuestionCircle /> Glossário
            </button>
          )}
        </div>

        {/* Glossário */}
        {showGlossario && config.glossario?.length && (
          <div className={`${CARD_BG} rounded-xl p-5 space-y-2`}>
            <h2 className={`font-semibold mb-3 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>📖 Glossário</h2>
            {config.glossario.map(g => (
              <div key={g.termo} className="flex gap-2">
                <span className={`font-medium text-sm min-w-[200px] ${hc ? 'text-yellow-300' : 'text-blue-700'}`}>{g.termo}</span>
                <span className={`text-sm ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>{g.definicao}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {config.cards?.length && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.cards.map(card => (
              <div key={card.label} className={`rounded-xl p-5 ${hc ? `bg-gray-900 border-2 ${CARD_COLORS_HC[card.color ?? 'blue']}` : `${CARD_COLORS[card.color ?? 'blue']} text-white`}`}>
                <div className="flex items-start justify-between">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${hc ? '' : 'opacity-80'}`}>{card.label}</p>
                  {card.tooltip && <span title={card.tooltip} className="cursor-help opacity-60"><FaInfoCircle size={12} /></span>}
                </div>
                <p className="text-xl font-bold mt-2 leading-tight">{loading ? '...' : computeCard(card)}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── FILTROS ── */}
        <div className={`${CARD_BG} rounded-xl`}>
          <button onClick={() => setShowFilters(f => !f)}
            className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
            <span className="flex items-center gap-2"><FaFilter /> Filtros</span>
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showFilters && (
            <div className="px-5 pb-6 space-y-5">

              {/* Anos — chips modernos */}
              {config.showYearFilter !== false && (
                <div>
                  <p className={`text-xs font-semibold mb-3 flex items-center gap-1 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>
                    <FaCalendarAlt /> Ano(s) — selecione um ou mais
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ANOS_DISPONIVEIS.map(year => {
                      const isSelected = selectedYears.includes(year)
                      const isLoading = loadingYears.has(year)
                      return (
                        <button key={year} onClick={() => toggleYear(year)}
                          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 select-none ${
                            isSelected
                              ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'text-white border-transparent shadow-md'
                              : hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 bg-white'
                          }`}
                          style={isSelected && !hc ? { backgroundColor: ANO_COLORS[year], borderColor: ANO_COLORS[year] } : {}}>
                          {isLoading
                            ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : isSelected && <span className="text-xs">✓</span>
                          }
                          {year}
                        </button>
                      )
                    })}
                  </div>
                  {selectedYears.length > 1 && (
                    <p className={`text-xs mt-2 italic ${hc ? 'text-yellow-400' : 'text-blue-500'}`}>
                      {selectedYears.length} anos selecionados — dados combinados na tabela, comparados nos gráficos
                    </p>
                  )}
                </div>
              )}

              {/* Meses — chips */}
              {config.showMonthFilter !== false && (
                <div>
                  <p className={`text-xs font-semibold mb-3 flex items-center gap-1 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>
                    <FaCalendarAlt /> Mês(es) — deixe em branco para todos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MESES.map(m => {
                      const isSelected = selectedMonths.includes(m.value)
                      return (
                        <button key={m.value} onClick={() => toggleMonth(m.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                            isSelected
                              ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'bg-blue-600 text-white border-blue-600'
                              : hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-200 text-gray-500 bg-white hover:border-blue-300 hover:text-blue-500'
                          }`}>
                          {m.label}
                        </button>
                      )
                    })}
                    {selectedMonths.length > 0 && (
                      <button onClick={() => setSelectedMonths([])}
                        className={`px-3 py-1.5 rounded-full text-xs border-2 transition ${hc ? 'border-red-400 text-red-400 hover:bg-red-400 hover:text-black' : 'border-red-300 text-red-400 bg-white hover:bg-red-50'}`}>
                        ✕ Limpar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Busca + Movimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.showSearchFilter !== false && (
                  <div>
                    <label className={`text-xs font-semibold mb-1 flex items-center gap-1 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>
                      <FaSearch /> Buscar
                    </label>
                    <input type="text" value={busca}
                      onChange={e => { setBusca(e.target.value); setPage(1) }}
                      placeholder="Pesquise por descrição, código..."
                      className={`w-full rounded-lg px-3 py-2 text-sm border focus:outline-none ${INPUT}`} />
                  </div>
                )}
                {config.showMovimentoFilter !== false && (
                  <div className="flex items-end pb-1">
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                      <input type="checkbox" checked={somenteMovimento}
                        onChange={e => { setSomenteMovimento(e.target.checked); setPage(1) }}
                        className="w-4 h-4 accent-blue-600 rounded" />
                      Somente com movimento
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Abas + Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`flex rounded-lg overflow-hidden border ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
            {(['tabela', 'grafico'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${activeTab === tab ? (hc ? 'bg-yellow-300 text-black' : 'bg-blue-600 text-white') : (hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')}`}>
                {tab === 'tabela' ? <><FaTable /> Tabela</> : <><FaChartBar /> Gráficos</>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className={`flex items-center gap-1 text-xs px-3 py-2 rounded-lg border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                <FaEye size={11} /> Colunas
              </button>
              <div className={`absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg border p-3 min-w-[200px] hidden group-hover:block ${hc ? 'bg-gray-900 border-yellow-300' : 'bg-white border-gray-200'}`}>
                {config.columns.map(col => (
                  <label key={col.key} className={`flex items-center gap-2 py-1 text-xs cursor-pointer ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                    <input type="checkbox" checked={!hiddenCols.has(col.key)} onChange={() => toggleCol(col.key)} className="w-4 h-4 accent-blue-600" />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setExportOpen(o => !o)}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                <FaDownload size={11} /> Exportar {exportOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
              </button>
              {exportOpen && (
                <div className={`absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden ${hc ? 'bg-gray-900 border-yellow-300' : 'bg-white border-gray-200'}`}>
                  {[
                    { fmt: 'csv',  icon: <FaFileCsv />,  label: 'CSV' },
                    { fmt: 'xlsx', icon: <FaFileExcel />, label: 'Excel (XLS)' },
                    { fmt: 'json', icon: <FaFileCode />,  label: 'JSON' },
                    { fmt: 'pdf',  icon: <FaFilePdf />,   label: 'PDF (imprimir)' },
                    { fmt: 'txt',  icon: <FaFileAlt />,   label: 'TXT' },
                    { fmt: 'rtf',  icon: <FaFileWord />,  label: 'RTF' },
                  ].map(({ fmt: f, icon, label }) => (
                    <button key={f} onClick={() => { exportData(filtered, config.columns, f, config.titulo); setExportOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-xs text-left transition ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Erro */}
        {loading && (
          <div className={`${CARD_BG} rounded-xl p-10 flex flex-col items-center gap-3`}>
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${hc ? 'border-yellow-300 border-t-transparent' : 'border-blue-600 border-t-transparent'}`} />
            <p className={`text-sm ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>
              Carregando {loadingYears.size > 1 ? `${loadingYears.size} anos` : 'dados'}...
            </p>
          </div>
        )}
        {error && !loading && (
          <div className={`rounded-xl p-6 flex items-start gap-3 ${hc ? 'bg-gray-900 border border-red-400' : 'bg-red-50 border border-red-200'}`}>
            <FaInfoCircle className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className={`font-semibold text-sm ${hc ? 'text-red-400' : 'text-red-700'}`}>Erro ao carregar dados</p>
              <p className={`text-xs mt-1 ${hc ? 'text-red-300' : 'text-red-500'}`}>{error}</p>
              <button onClick={() => selectedYears.forEach(y => fetchYear(y))} className={`mt-3 text-xs px-3 py-1.5 rounded ${BTN_PRIMARY}`}>
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* ── TABELA ── */}
        {!loading && !error && activeTab === 'tabela' && (
          <div className={`${CARD_BG} rounded-xl overflow-hidden`}>
            <div className={`px-5 py-3 flex items-center justify-between border-b ${hc ? 'border-yellow-300' : 'border-gray-100'}`}>
              <p className={`text-sm ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>
                {filtered.length.toLocaleString('pt-BR')} registros
                {selectedYears.length > 1 && ` — anos: ${selectedYears.join(', ')}`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {selectedYears.length > 1 && <th className={`px-3 py-3 text-left font-semibold whitespace-nowrap ${TH}`}>Ano</th>}
                    {visibleCols.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)}
                        className={`px-3 py-3 text-left font-semibold cursor-pointer select-none whitespace-nowrap ${TH}`}>
                        <span className="flex items-center gap-1">
                          {col.label}
                          {col.tooltip && <span title={col.tooltip} className="opacity-60 cursor-help"><FaInfoCircle size={9} /></span>}
                          {sortKey === col.key ? (sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="opacity-30" />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr><td colSpan={visibleCols.length + 1} className={`text-center py-10 ${hc ? 'text-yellow-400' : 'text-gray-400'}`}>Nenhum registro encontrado</td></tr>
                  ) : pageData.map((row, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? TR_EVEN : TR_ODD} hover:bg-blue-50 transition`}>
                      {selectedYears.length > 1 && (
                        <td className={`px-3 py-2.5 ${TD_BORDER}`}>
                          <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ backgroundColor: ANO_COLORS[Number(row['_ano'])] }}>
                            {String(row['_ano'])}
                          </span>
                        </td>
                      )}
                      {visibleCols.map(col => (
                        <td key={col.key} className={`px-3 py-2.5 ${TD_BORDER} ${col.type === 'currency' ? 'text-right font-mono' : ''}`}>
                          {col.type === 'currency'
                            ? <span className={Number(row[col.key]) < 0 ? 'text-red-500' : ''}>{fmt(row[col.key], col.type)}</span>
                            : fmt(row[col.key], col.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-t ${hc ? 'border-yellow-300' : 'border-gray-100'}`}>
                <p className={`text-xs ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>Página {page} de {totalPages}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>«</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}><FaChevronLeft size={10} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                    return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-medium ${p === page ? (hc ? 'bg-yellow-300 text-black' : 'bg-blue-600 text-white') : (hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')}`}>{p}</button>
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}><FaChevronRight size={10} /></button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>»</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GRÁFICOS (Carrossel) ── */}
        {!loading && !error && activeTab === 'grafico' && (
          <div className={`${CARD_BG} rounded-xl overflow-hidden`}>
            {/* Header carrossel */}
            <div className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b ${hc ? 'border-yellow-300' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setChartIndex(i => (i - 1 + CHARTS.length) % CHARTS.length)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  <FaChevronLeft size={12} />
                </button>
                <span className={`font-semibold text-sm ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>{currentChart.label}</span>
                <button onClick={() => setChartIndex(i => (i + 1) % CHARTS.length)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  <FaChevronRight size={12} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {CHARTS.map((c, i) => (
                  <button key={c.id} onClick={() => setChartIndex(i)}
                    title={c.label}
                    className={`rounded-full transition-all duration-300 ${i === chartIndex ? (hc ? 'w-6 h-2.5 bg-yellow-300' : 'w-6 h-2.5 bg-blue-600') : (hc ? 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400')}`} />
                ))}
              </div>

              {/* Comparação — só para evolução */}
              {currentChart.id === 'evolucao' && (
                <div className={`flex rounded-lg overflow-hidden border text-xs ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                  {(['total', 'mes', 'ano'] as ChartCompare[]).map(c => (
                    <button key={c} onClick={() => setChartCompare(c)}
                      className={`px-3 py-1.5 font-medium transition ${chartCompare === c ? (hc ? 'bg-yellow-300 text-black' : 'bg-blue-600 text-white') : (hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')}`}>
                      {c === 'total' ? 'Total' : c === 'mes' ? 'Por Mês' : 'Por Ano'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Área do gráfico */}
            <div className="p-5">

              {/* 1 — Combinado */}
              {currentChart.id === 'combinado' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={comboData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={hc ? '#444' : '#e5e7eb'} />
                    <XAxis dataKey="_label" tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 9 }} angle={-40} textAnchor="end" interval={0} height={90} />
                    <YAxis tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), config.columns.find(c => c.key === String(name))?.label ?? String(name)]}
                      contentStyle={{ background: hc ? '#111' : '#fff', border: '1px solid #ccc', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: hc ? '#fde047' : '#374151', fontWeight: 600 }} />
                    <Legend formatter={v => config.columns.find(c => c.key === v)?.label ?? v} wrapperStyle={{ fontSize: 11 }} />
                    {chartBarCols.map((col, i) => <Bar key={col.key} dataKey={col.key} fill={CHART_COLORS[i]} radius={[4, 4, 0, 0]} />)}
                    {chartLineCols.map((col, i) => <Line key={col.key} type="monotone" dataKey={col.key} stroke={CHART_COLORS[chartBarCols.length + i]} strokeWidth={2} dot={{ r: 3 }} />)}
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* 2 — Pizza/Donut */}
              {currentChart.id === 'pizza' && (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={pizzaData} cx="50%" cy="50%" innerRadius={80} outerRadius={130}
                        dataKey="value" nameKey="name" paddingAngle={3}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {pizzaData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="min-w-[220px] space-y-2">
                    {pizzaData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className={`truncate flex-1 ${hc ? 'text-yellow-200' : 'text-gray-600'}`} title={d.name}>{d.name}</span>
                        <span className={`font-mono font-semibold ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{fmtShort(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 — Barras Horizontais (Ranking) */}
              {currentChart.id === 'barrasH' && (
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={comboData} layout="vertical" margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={hc ? '#444' : '#e5e7eb'} />
                    <XAxis type="number" tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                    <YAxis type="category" dataKey="_label" width={160} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 9 }} />
                    <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), config.columns.find(c => c.key === String(name))?.label ?? String(name)]}
                    contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chartBarCols.map((col, i) => (
                      <Bar key={col.key} dataKey={col.key} fill={CHART_COLORS[i]} radius={[0, 4, 4, 0]}>
                        {comboData.map((_, j) => <Cell key={j} fill={CHART_COLORS[i]} fillOpacity={0.65 + (j % 4) * 0.1} />)}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* 4 — Evolução Mensal */}
              {currentChart.id === 'evolucao' && (
                <ResponsiveContainer width="100%" height={360}>
                  <ComposedChart data={evolucaoData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={hc ? '#444' : '#e5e7eb'} />
                    <XAxis dataKey="_label" tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 11 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), String(name)]}
                      contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chartCompare === 'ano'
                      ? selectedYears.map(y => (
                        <Line key={y} type="monotone" dataKey={`ano_${y}`} name={String(y)}
                          stroke={ANO_COLORS[y]} strokeWidth={2.5} dot={{ r: 4, fill: ANO_COLORS[y] }} />
                      ))
                      : <>
                        <Bar dataKey="Previsto" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                        <Line type="monotone" dataKey="Realizado" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                      </>
                    }
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* 5 — Gauge */}
              {currentChart.id === 'gauge' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadialBarChart cx="50%" cy="65%" innerRadius="55%" outerRadius="100%"
                      startAngle={180} endAngle={0} data={radialData}>
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: hc ? '#1f2937' : '#f3f4f6' }}>
                        {radialData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </RadialBar>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-10">
                    <p className={`text-5xl font-black ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
                      {gaugeData.pct.toFixed(1)}%
                    </p>
                    <p className={`text-sm mt-1 ${hc ? 'text-yellow-400' : 'text-gray-500'}`}>do previsto foi realizado</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center mt-2">
                    <div>
                      <p className={`text-xs ${hc ? 'text-yellow-400' : 'text-gray-500'}`}>Total Previsto</p>
                      <p className={`font-bold text-base ${hc ? 'text-yellow-300' : 'text-blue-700'}`}>{fmtShort(gaugeData.previsto)}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${hc ? 'text-yellow-400' : 'text-gray-500'}`}>Total Realizado</p>
                      <p className={`font-bold text-base ${hc ? 'text-yellow-300' : 'text-emerald-700'}`}>{fmtShort(gaugeData.realizado)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {config.fonte && (
          <p className={`text-xs ${hc ? 'text-yellow-500' : 'text-gray-400'}`}>Fonte: {config.fonte}</p>
        )}
      </main>

      <VLibrasWrapper />
    </div>
  )
}