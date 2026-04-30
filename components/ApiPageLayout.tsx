//ApiPageLayout.tsx
'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import { usePreferences } from '@/contexts/PreferencesContext'

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
  type?: 'currency' | 'text' | 'number' | 'date' | 'link'
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
  // URL da API route local (ex: '/api/receita-prevista')
  // O layout passa ?exercicio=YYYY automaticamente
  apiUrl: string
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
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const ANO_COLORS: Record<number, string> = {}
ANOS_DISPONIVEIS.forEach((a, i) => { ANO_COLORS[a] = CHART_COLORS[i % CHART_COLORS.length] })

type ChartView = 'combinado' | 'pizza' | 'barrasH' | 'evolucao' | 'gauge' | 'comparacao'
type EvolucaoMode = 'total' | 'ano' | 'mes'

// ─── Utilitários ──────────────────────────────────────────────────────────────

function fmt(value: unknown, type?: string): string {
  console.log(type, value)
  if (value === null || value === undefined) return '—'
  
  if (type === 'date') {
    const str = String(value)
    // Tenta parsear vários formatos
    let d: Date | null = null
    
    // ISO: 2024-03-15
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const [datePart] = str.split('T')
      const [ano, mes, dia] = datePart.split('-')
      d = new Date(Number(ano), Number(mes) - 1, Number(dia))
    }
    // BR: 15/03/2024
    else if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
      const [dia, mes, ano] = str.split('/')
      d = new Date(Number(ano), Number(mes) - 1, Number(dia))
    }
    // Timestamp
    else if (!isNaN(Number(str))) {
      d = new Date(Number(str))
    }
    
    if (d && !isNaN(d.getTime())) {
      const dia = String(d.getDate()).padStart(2, '0')
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const ano = d.getFullYear()
      return `${dia}/${mes}/${ano}`
    }
    return String(value)
  }
  
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
  if (isNaN(v)) return '—'
  if (Math.abs(v) >= 1_000_000_000) return `R$ ${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1e3).toFixed(0)}K`
  return `R$ ${v.toFixed(0)}`
}

// ── Função para obter valores únicos de uma coluna ──
function getUniqueValues(data: Record<string, unknown>[], columnKey: string): string[] {
  const unique = new Set<string>()
  data.forEach(row => {
    const val = row[columnKey]
    if (val !== null && val !== undefined && val !== '') {
      unique.add(String(val))
    }
  })
  return Array.from(unique).sort()
}

function ColFilterDropdown({ col, allData, columnFilters, setColumnFilters, setPage, hc }: {
  col: ApiColumn
  allData: Record<string, unknown>[]
  columnFilters: Record<string, string>
  setColumnFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setPage: React.Dispatch<React.SetStateAction<number>>
  hc: boolean
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const uniqueVals = getUniqueValues(allData, col.key)
  const selectedValues = columnFilters[col.key]?.split('|||') || []
  const filtered = uniqueVals.filter(v => v.toLowerCase().includes(search.toLowerCase()))

  function toggle(val: string) {
    const next = selectedValues.includes(val)
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val]
    setColumnFilters(prev => {
      const updated = { ...prev }
      if (next.length === 0) delete updated[col.key]
      else updated[col.key] = next.join('|||')
      return updated
    })
    setPage(1)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(d => !d)}
        className={`w-full text-left px-2 py-1.5 text-xs rounded border transition ${
          selectedValues.length > 0
            ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'bg-blue-50 border-blue-400 text-blue-700'
            : hc ? 'bg-gray-900 border-yellow-300 text-yellow-300' : 'bg-white border-gray-300 text-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{col.label}</span>
          {selectedValues.length > 0 && (
            <span className={`ml-1 px-1.5 rounded-full text-xs font-bold ${hc ? 'bg-black text-yellow-300' : 'bg-blue-600 text-white'}`}>
              {selectedValues.length}
            </span>
          )}
        </div>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className={`absolute top-full left-0 mt-1 z-20 w-64 rounded-lg border shadow-lg ${hc ? 'bg-gray-900 border-yellow-300' : 'bg-white border-gray-200'}`}>
            <div className={`p-2 border-b ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className={`w-full px-2 py-1 text-xs rounded border ${hc ? 'bg-gray-800 border-yellow-300 text-yellow-300 placeholder-yellow-600' : 'border-gray-300 text-gray-700'}`}
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {filtered.map(val => (
                <label key={val} className={`flex items-center gap-2 text-xs cursor-pointer px-1 py-0.5 rounded hover:bg-gray-100 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-700'}`}>
                  <input type="checkbox" checked={selectedValues.includes(val)} onChange={() => toggle(val)} className="w-3 h-3 accent-blue-600" />
                  <span className="truncate">{val}</span>
                </label>
              ))}
              {filtered.length === 0 && <p className={`text-xs text-center py-2 ${hc ? 'text-yellow-500' : 'text-gray-400'}`}>Nenhum valor</p>}
            </div>
            {selectedValues.length > 0 && (
              <div className={`border-t p-2 ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setColumnFilters(prev => { const u = { ...prev }; delete u[col.key]; return u }); setPage(1) }}
                  className={`w-full text-xs px-2 py-1 rounded transition ${hc ? 'bg-red-400 text-black hover:bg-red-500' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
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

export default function ApiPageLayout({ config }: Props) {
  const { highContrast, fontSize } = usePreferences()
  const hc = highContrast
  const [showColDropdown, setShowColDropdown] = useState(false)
  const colDropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // ── Estados adicionais ──
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null)
  const [chartAxisX, setChartAxisX] = useState<string>('')
  const [chartAxisY, setChartAxisY] = useState<string>('')

  // ── Estado de dados ──
  const [dataByYear, setDataByYear] = useState<Record<number, Record<string, unknown>[]>>({})
  const [loadingYears, setLoadingYears] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('')

  // ── Estado de filtros ──
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [busca, setBusca] = useState('')
  const [somenteMovimento, setSomenteMovimento] = useState(false)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  // ── Estado de UI ──
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

  // ── Estado de gráficos ──
  const [chartIndex, setChartIndex] = useState(0)
  const [evolucaoMode, setEvolucaoMode] = useState<EvolucaoMode>('total')

  // ── Modo comparação ──
  const [anosComparacao, setAnosComparacao] = useState<number[]>([])
  const [metricaComparacao, setMetricaComparacao] = useState<string>('')

  const chartCategoryCol = config.columns.find(c => c.chartRole === 'category')
  const chartBarCols = config.columns.filter(c => c.chartRole === 'bar')
  const chartLineCols = config.columns.filter(c => c.chartRole === 'line')
  const CHARTS: { id: ChartView; label: string }[] = useMemo(() => {

  const all: { id: ChartView; label: string; available: boolean }[] = [
    { id: 'combinado',  label: 'Barras + Linha',     available: chartBarCols.length > 0 },
    { id: 'pizza',      label: 'Distribuição',        available: chartBarCols.length > 0 && !!chartCategoryCol },
    { id: 'barrasH',    label: 'Ranking',             available: chartBarCols.length > 0 },
    { id: 'evolucao',   label: 'Evolução Mensal',     available: chartBarCols.length > 0 },
    { id: 'gauge',      label: '% Realizado',         available: chartBarCols.length > 0 && chartLineCols.length > 0 },
    { id: 'comparacao', label: 'Comparação de Anos',  available: true },
  ]
  return all.filter(c => c.available)
}, [chartBarCols, chartLineCols, chartCategoryCol])

  // ── Fetch por ano via route.ts local ──
  const fetchYear = useCallback(async (year: number) => {
    if (dataByYear[year]) return
    setLoadingYears(prev => new Set(prev).add(year))
    setError(null)
    try {
      const url = new URL(config.apiUrl, window.location.origin)
      url.searchParams.set('exercicio', String(year))
      if (config.extraParams) {
        Object.entries(config.extraParams).forEach(([k, v]) => url.searchParams.set(k, v))
      }
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const arr: Record<string, unknown>[] = Array.isArray(json) ? json : (json.data ?? [])
      setDataByYear(prev => ({ ...prev, [year]: arr.map(r => ({ ...r, _ano: year })) }))
      if (json.ultimaAtualizacao) setUltimaAtualizacao(json.ultimaAtualizacao)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoadingYears(prev => { const s = new Set(prev); s.delete(year); return s })
    }
  }, [config, dataByYear])

  useEffect(() => {
    selectedYears.forEach(y => { if (!dataByYear[y]) fetchYear(y) })
  }, [selectedYears]) // eslint-disable-line

  useEffect(() => {
  setChartIndex(0)
}, [config.paginaId])

  useEffect(() => {
    anosComparacao.forEach(y => { if (!dataByYear[y]) fetchYear(y) })
  }, [anosComparacao]) // eslint-disable-line

  useEffect(() => {
    if (!metricaComparacao) {
      const primeira = config.columns.find(c => c.chartRole === 'bar' || c.type === 'currency')
      if (primeira) setMetricaComparacao(primeira.key)
    }
  }, [config.columns, metricaComparacao])

  useEffect(() => {
  if (!chartAxisX && chartCategoryCol) {
    setChartAxisX(chartCategoryCol.key)
  }
  if (!chartAxisY && chartBarCols.length > 0) {
    setChartAxisY(chartBarCols[0].key)
  }
}, [chartCategoryCol, chartBarCols, chartAxisX, chartAxisY])

  function toggleYear(year: number) {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.length > 1 ? prev.filter(y => y !== year) : prev
        : [...prev, year].sort((a, b) => b - a)
    )
    setPage(1)
  }

  function toggleAnoComparacao(year: number) {
    setAnosComparacao(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort((a, b) => b - a)
    )
  }

  function toggleMonth(m: string) {
    setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
    setPage(1)
  }

  const allData = useMemo(() =>
    selectedYears.flatMap(y => dataByYear[y] ?? []),
    [selectedYears, dataByYear]
  )

  const filtered = useMemo(() => {
  let d = [...allData]
  
  // Filtro de movimento
  if (somenteMovimento) d = d.filter(r => r['movimento'] === 'S')
  
  // Filtro de meses
  if (selectedMonths.length > 0) {
    d = d.filter(r => {
      const m = String(r['competência'] ?? '').split('/')[0]
      return selectedMonths.includes(m)
    })
    d = d.map(row => {
      const porMes = row['_realizadoPorMes'] as Record<string, number> ?? {}
      const acumulado = selectedMonths.reduce((acc, m) => acc + (porMes[m] ?? 0), 0)
      return { ...row, 'realizada Até o Mês': acumulado }
    })
  }
  
   Object.entries(columnFilters).forEach(([colKey, filterValue]) => {
    if (filterValue.trim()) {
      const selectedValues = filterValue.split('|||')
      d = d.filter(r => {
        const val = String(r[colKey] ?? '')
        return selectedValues.includes(val)
      })
    }
  })
  
  // Filtro de busca geral
  if (busca.trim()) {
    const q = busca.toLowerCase()
    d = d.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
  }
  
  // Ordenação
  if (sortKey) {
    d.sort((a, b) => {
      const an = Number(a[sortKey])
      const bn = Number(b[sortKey])
      if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an
      return sortDir === 'asc'
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey]))
    })
  }
  
  return d
}, [allData, somenteMovimento, selectedMonths, columnFilters, busca, sortKey, sortDir])

  const visibleCols = config.columns.filter(c => !hiddenCols.has(c.key))

  // ── Dados agrupados ──
  const groupedData = useMemo(() => {
    if (!groupByColumn) return null
    
    const groups: Record<string, Record<string, unknown>[]> = {}
    
    filtered.forEach(row => {
      const groupKey = String(row[groupByColumn] ?? 'Sem grupo')
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(row)
    })
    
    return Object.entries(groups).map(([groupKey, rows]) => ({
      groupKey,
      rows,
      totals: visibleCols.reduce((acc, col) => {
        if (col.type === 'currency' || col.type === 'number') {
          acc[col.key] = rows.reduce((sum, r) => sum + (Number(r[col.key]) || 0), 0)
        }
        return acc
      }, {} as Record<string, number>)
    }))
  }, [filtered, groupByColumn, visibleCols])

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)
  const loading = loadingYears.size > 0

  function computeCard(card: ApiCard): string {
    const base = config.showMovimentoFilter !== false
      ? filtered.filter(r => r['movimento'] === 'S')
      : filtered
    if (card.compute) {
      const val = card.compute(base)
      if (card.format === 'currency') return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      return String(val)
    }
    const sum = base.reduce((acc, r) => acc + (Number(r[card.valueKey]) || 0), 0)
    if (card.format === 'currency') return sum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return sum.toLocaleString('pt-BR')
  }

  const baseRows = useMemo(() =>
    config.showMovimentoFilter !== false
      ? filtered.filter(r => r['movimento'] === 'S')
      : filtered,
    [filtered, config.showMovimentoFilter]
  )

  const comboData = useMemo(() => {
    const xKey = chartAxisX || chartCategoryCol?.key || config.columns[0]?.key
    const yKey = chartAxisY || chartBarCols[0]?.key
    
    return baseRows.slice(0, 12).map(row => {
      const entry: Record<string, unknown> = {}
      const raw = String(row[xKey] ?? '')
      entry['_label'] = raw.length > 22 ? raw.slice(0, 22) + '…' : raw
      entry['_ano'] = row['_ano']
      
      // Adiciona o valor do eixo Y
      if (yKey) {
        entry[yKey] = Number(row[yKey]) || 0
      }
      
      // Adiciona outras métricas
      [...chartBarCols, ...chartLineCols].forEach(c => { 
        entry[c.key] = Number(row[c.key]) || 0 
      })
      
      return entry
    })
  }, [baseRows, chartAxisX, chartAxisY, chartCategoryCol, chartBarCols, chartLineCols, config.columns])

  const pizzaData = useMemo(() => {
    const xKey = chartAxisX || chartCategoryCol?.key
    const yKey = chartAxisY || chartBarCols[0]?.key
    if (!yKey || !xKey) return []
    const map: Record<string, number> = {}
    baseRows.forEach(r => {
      const label = String(r[xKey] ?? '').slice(0, 30)
      map[label] = (map[label] || 0) + (Number(r[yKey]) || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }))
  }, [baseRows, chartAxisX, chartAxisY, chartBarCols, chartCategoryCol])

  const evolucaoData = useMemo(() => {
    const barKey = chartBarCols[0]?.key
    const lineKey = chartLineCols[0]?.key
    if (!barKey) return []
    if (evolucaoMode === 'ano') {
      const map: Record<string, Record<number, number>> = {}
      MESES.forEach(m => { map[m.value] = {} })
      baseRows.forEach(r => {
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
    baseRows.forEach(r => {
      const [m] = String(r['competência'] ?? '').split('/')
      if (map2[m]) {
        map2[m].previsto += Number(r[barKey]) || 0
        if (lineKey) map2[m].realizado += Number(r[lineKey]) || 0
      }
    })
    const barLabel = chartBarCols[0]?.label ?? 'Valor'
    const lineLabel = chartLineCols[0]?.label ?? 'Linha'
    return MESES.map(m => ({
      _label: m.label,
      [barLabel]: map2[m.value].previsto,
      [lineLabel]: map2[m.value].realizado,
    }))
  }, [baseRows, chartBarCols, chartLineCols, evolucaoMode, selectedYears])

  const gaugeData = useMemo(() => {
    const barKey = chartBarCols[0]?.key
    const lineKey = chartLineCols[0]?.key
    if (!barKey || !lineKey) return { pct: 0, previsto: 0, realizado: 0 }
    const previsto = baseRows.reduce((a, r) => a + (Number(r[barKey]) || 0), 0)
    const realizado = baseRows.reduce((a, r) => a + (Number(r[lineKey]) || 0), 0)
    return { pct: previsto > 0 ? Math.min(100, (realizado / previsto) * 100) : 0, previsto, realizado }
  }, [baseRows, chartBarCols, chartLineCols])

  const radialData = [
    { name: 'Realizado', value: gaugeData.pct, fill: '#10b981' },
    { name: 'Restante', value: 100 - gaugeData.pct, fill: hc ? '#333' : '#e5e7eb' },
  ]

  const anosParaComparar = useMemo(() =>
    anosComparacao.length >= 2
      ? anosComparacao
      : [...new Set([...selectedYears, ...anosComparacao])].sort((a, b) => b - a),
    [anosComparacao, selectedYears]
  )

  const comparacaoData = useMemo(() => {
    if (!metricaComparacao || anosParaComparar.length < 2) return []
    return MESES.map(m => {
      const entry: Record<string, unknown> = { _label: m.label }
      anosParaComparar.forEach(y => {
        const rows = (dataByYear[y] ?? []).filter(r =>
          config.showMovimentoFilter !== false ? r['movimento'] === 'S' : true
        )
        entry[`ano_${y}`] = rows
          .filter(r => String(r['competência'] ?? '').split('/')[0] === m.value)
          .reduce((acc, r) => acc + (Number(r[metricaComparacao]) || 0), 0)
      })
      return entry
    })
  }, [anosParaComparar, dataByYear, metricaComparacao, config.showMovimentoFilter])

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }
  function toggleCol(key: string) {
    setHiddenCols(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s })
  }

  const currentChart = CHARTS[chartIndex]

  const CARD_BG   = hc ? 'bg-gray-900 border border-yellow-300' : 'bg-white shadow-md'
  const INPUT     = hc ? 'bg-gray-900 border border-yellow-300 text-yellow-300 placeholder-yellow-600' : 'bg-white border border-gray-300 text-gray-700'
  const TH        = hc ? 'bg-gray-800 text-yellow-300 border-b border-yellow-300' : 'bg-blue-700 text-white'
  const TR_EVEN   = hc ? 'bg-gray-900' : 'bg-gray-50'
  const TR_ODD    = hc ? 'bg-black'    : 'bg-white'
  const TD_BORDER = hc ? 'border-b border-gray-700' : 'border-b border-gray-100'

  return (
    <div className={`min-h-screen ${hc ? 'bg-black text-yellow-300' : 'bg-gray-50 text-gray-800'}`} style={{ fontSize: `${fontSize}px` }}>
      <Header />

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

        {/* ── Título ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{config.titulo}</h1>
            {config.subtitulo && <p className={`mt-1 text-sm ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>{config.subtitulo}</p>}
            {ultimaAtualizacao && (
              <p className={`mt-1 text-xs flex items-center gap-1 ${hc ? 'text-yellow-400' : 'text-gray-400'}`}>
                <FaSync size={10} /> Atualizado em: {ultimaAtualizacao}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {config.glossario?.length && (
              <button onClick={() => setShowGlossario(g => !g)}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}>
                <FaQuestionCircle /> Glossário
              </button>
            )}
          </div>
        </div>

        {/* ── Glossário ── */}
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

        {/* ── Cards ── */}
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

        {/* ── Filtros ── */}
        <div className={`${CARD_BG} rounded-xl`}>
          <button onClick={() => setShowFilters(f => !f)}
            className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
            <span className="flex items-center gap-2"><FaFilter /> Filtros</span>
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showFilters && (
            
            <div className="px-5 pb-6 space-y-5">

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
                            : isSelected && <span className="text-xs">✓</span>}
                          {year}
                        </button>
                      )
                    })}
                  </div>
                  {selectedYears.length > 1 && (
                    <p className={`text-xs mt-2 italic ${hc ? 'text-yellow-400' : 'text-blue-500'}`}>
                      {selectedYears.length} anos selecionados — dados combinados na tabela
                    </p>
                  )}
                </div>
              )}

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

              {/* Filtros por coluna visível */}
              {visibleCols.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold mb-3 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>
                    Filtros por coluna
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {visibleCols.map(col => (
                    <ColFilterDropdown
                      key={col.key}
                      col={col}
                      allData={allData}
                      columnFilters={columnFilters}
                      setColumnFilters={setColumnFilters}
                      setPage={setPage}
                      hc={hc}
                    />
                  ))}
                  </div>
                  {Object.keys(columnFilters).length > 0 && (
                    <button
                      onClick={() => setColumnFilters({})}
                      className={`mt-3 text-xs px-3 py-1.5 rounded-lg border transition ${hc ? 'border-red-400 text-red-400 hover:bg-red-400 hover:text-black' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                    >
                      Limpar todos os filtros ({Object.keys(columnFilters).length})
                    </button>
                  )}
                </div>
              
              )}
            </div>
          )}
        </div>

        {/* ── Abas + Ações ── */}
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
        <div
          className="relative"
          onMouseEnter={() => {
            if (colDropdownTimer.current) clearTimeout(colDropdownTimer.current)
            setShowColDropdown(true)
          }}
          onMouseLeave={() => {
            colDropdownTimer.current = setTimeout(() => setShowColDropdown(false), 1000)
          }}
        >
          <button className={`flex items-center gap-1 text-xs px-3 py-2 rounded-lg border transition ${hc ? 'border-yellow-300 text-yellow-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <FaEye size={11} /> Colunas
          </button>
          <div
            className={`absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg border p-3 min-w-[200px] ${hc ? 'bg-gray-900 border-yellow-300' : 'bg-white border-gray-200'} ${showColDropdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ transition: showColDropdown ? 'opacity 200ms ease' : 'opacity 1000ms ease 500ms' }}
          >
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


        {/* ── Loading / Erro ── */}
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
              <button onClick={() => { setDataByYear({}); selectedYears.forEach(fetchYear) }}
                className={`mt-3 text-xs px-3 py-1.5 rounded ${hc ? 'bg-yellow-300 text-black hover:bg-yellow-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* ── Tabela ── */}
        {!loading && !error && activeTab === 'tabela' && (
          <>
            {/* Área de agrupamento */}
            <div className={`${CARD_BG} rounded-xl p-4 mb-4`}>
              <p className={`text-xs font-semibold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>
                Agrupar por coluna:
              </p>
              <div className="flex flex-wrap gap-2">
                {groupByColumn ? (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${hc ? 'border-yellow-300 bg-yellow-300 text-black' : 'border-blue-600 bg-blue-600 text-white'}`}>
                    <span className="text-sm font-semibold">
                      {config.columns.find(c => c.key === groupByColumn)?.label}
                    </span>
                    <button
                      onClick={() => setGroupByColumn(null)}
                      className={`hover:opacity-75`}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={`px-4 py-3 border-2 border-dashed rounded-lg ${hc ? 'border-yellow-300 text-yellow-400' : 'border-gray-300 text-gray-400'}`}>
                    <p className="text-xs">Selecione uma coluna abaixo para agrupar</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {visibleCols.map(col => (
                  <button
                    key={col.key}
                    onClick={() => setGroupByColumn(col.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      groupByColumn === col.key
                        ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'bg-blue-600 text-white border-blue-600'
                        : hc ? 'border-yellow-300 text-yellow-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${CARD_BG} rounded-xl overflow-hidden`}>
              <div className={`px-5 py-3 flex items-center justify-between border-b ${hc ? 'border-yellow-300' : 'border-gray-100'}`}>
                <p className={`text-sm ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>
                  {filtered.length.toLocaleString('pt-BR')} registros
                  {selectedYears.length > 1 && ` — anos: ${selectedYears.join(', ')}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                {groupedData ? (
                  // Tabela agrupada
                  <div className="space-y-4 p-4">
                    {groupedData.map(group => (
                      <div key={group.groupKey} className={`border rounded-lg overflow-hidden ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                        <div className={`px-4 py-2 font-semibold text-sm ${hc ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}>
                          {group.groupKey} ({group.rows.length} registro{group.rows.length !== 1 ? 's' : ''})
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              {selectedYears.length > 1 && <th className={`px-3 py-3 text-left font-semibold whitespace-nowrap ${TH}`}>Ano</th>}
                              {visibleCols.map(col => (
                                <th key={col.key} className={`px-3 py-3 text-left font-semibold whitespace-nowrap ${TH}`}>
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row, i) => (
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
                                      : col.type === 'link'
                                      ? (() => {
                                          const val = row[col.key]
                                          const url = row[col.key + '_url'] ?? (val && String(val).startsWith('http') ? val : null)
                                          const display = val && !String(val).startsWith('http') ? String(val) : null
                                          return url
                                            ? <span className="flex items-center gap-1">
                                                {display && <span>{display}</span>}
                                                <a href={String(url)} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${hc ? 'text-yellow-300' : 'text-blue-600'} hover:opacity-75`}>ver</a>
                                              </span>
                                            : display ? <span>{display}</span> : null
                                        })()
                                      : fmt(row[col.key], col.type)}
                                  </td> 
                                ))}
                              </tr>
                            ))}
                            {/* Linha de totais */}
                            <tr className={`font-bold ${hc ? 'bg-gray-800 text-yellow-300' : 'bg-blue-50 text-gray-800'}`}>
                              {selectedYears.length > 1 && <td className="px-3 py-2.5"></td>}
                              {visibleCols.map(col => (
                                <td key={col.key} className={`px-3 py-2.5 ${col.type === 'currency' ? 'text-right font-mono' : ''}`}>
                                  {(col.type === 'currency' || col.type === 'number') && group.totals[col.key]
                                    ? fmt(group.totals[col.key], col.type)
                                    : col.key === groupByColumn ? 'TOTAL' : ''}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Tabela normal
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
                                : col.type === 'link'
                                ? (() => {
                                    const val = row[col.key]
                                    const url = row[col.key + '_url'] ?? (val && String(val).startsWith('http') ? val : null)
                                    const display = val && !String(val).startsWith('http') ? String(val) : null
                                    return url
                                      ? <span className="flex items-center gap-1">
                                          {display && <span>{display}</span>}
                                          <a href={String(url)} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${hc ? 'text-yellow-300' : 'text-blue-600'} hover:opacity-75`}>ver</a>
                                        </span>
                                      : display ? <span>{display}</span> : null
                                  })()
                                : fmt(row[col.key], col.type)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
          </>
        )}

        {/* ── Gráficos (Carrossel) ── */}
        {!loading && !error && activeTab === 'grafico' && (
          <div className={`${CARD_BG} rounded-xl overflow-hidden`}>
            <div className={`px-5 py-4 border-b ${hc ? 'border-yellow-300' : 'border-gray-100'} space-y-4`}>
              {/* Navegação do carrossel */}
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-center gap-1.5">
                {CHARTS.map((c, i) => (
                  <button key={c.id} onClick={() => setChartIndex(i)} title={c.label}
                    className={`rounded-full transition-all duration-300 ${i === chartIndex
                      ? hc ? 'w-6 h-2.5 bg-yellow-300' : 'w-6 h-2.5 bg-blue-600'
                      : hc ? 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} />
                ))}
              </div>

              {/* Seletores de eixo X e Y */}
              {(currentChart.id === 'combinado' || currentChart.id === 'barrasH' || currentChart.id === 'pizza') && (
                <div className="flex gap-4">
                  <div>
                    <p className={`text-xs mb-1 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>Eixo X:</p>
                    <select
                      value={chartAxisX}
                      onChange={e => setChartAxisX(e.target.value)}
                      className={`px-2 py-1 rounded text-xs border ${hc ? 'bg-gray-900 border-yellow-300 text-yellow-300' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      {config.columns.filter(c => c.type !== 'link').map(col => (
                        <option key={col.key} value={col.key}>{col.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>Eixo Y:</p>
                    <select
                      value={chartAxisY}
                      onChange={e => setChartAxisY(e.target.value)}
                      className={`px-2 py-1 rounded text-xs border ${hc ? 'bg-gray-900 border-yellow-300 text-yellow-300' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      {config.columns.filter(c => c.type === 'currency' || c.type === 'number').map(col => (
                        <option key={col.key} value={col.key}>{col.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentChart.id === 'evolucao' && (
                <div className={`flex rounded-lg overflow-hidden border text-xs ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                  {(['total', 'mes', 'ano'] as EvolucaoMode[]).map(m => (
                    <button key={m} onClick={() => setEvolucaoMode(m)}
                      className={`px-3 py-1.5 font-medium transition ${evolucaoMode === m ? (hc ? 'bg-yellow-300 text-black' : 'bg-blue-600 text-white') : (hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')}`}>
                      {m === 'total' ? 'Total' : m === 'mes' ? 'Por Mês' : 'Por Ano'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5">

              {/* 1 — Combinado */}
              {currentChart.id === 'combinado' && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={comboData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={hc ? '#444' : '#e5e7eb'} />
                    <XAxis dataKey="_label" tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 9 }} angle={-40} textAnchor="end" interval={0} height={90} />
                    <YAxis tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), config.columns.find(c => c.key === String(name))?.label ?? String(name)]}
                      contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: hc ? '#fde047' : '#374151', fontWeight: 600 }} />
                    <Legend formatter={v => config.columns.find(c => c.key === v)?.label ?? v} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={chartAxisY || chartBarCols[0]?.key} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    {chartLineCols.length > 0 && <Line type="monotone" dataKey={chartLineCols[0].key} stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />}
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* 2 — Pizza */}
              {currentChart.id === 'pizza' && (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={pizzaData} cx="50%" cy="50%" innerRadius={80} outerRadius={130}
                        dataKey="value" nameKey="name" paddingAngle={3}
                        label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
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

              {/* 3 — Ranking */}
              {currentChart.id === 'barrasH' && (
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={comboData} layout="vertical" margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={hc ? '#444' : '#e5e7eb'} />
                    <XAxis type="number" tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                    <YAxis type="category" dataKey="_label" width={160} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 9 }} />
                    <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), config.columns.find(c => c.key === String(name))?.label ?? String(name)]}
                      contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={chartAxisY || chartBarCols[0]?.key} fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]}>
                      {comboData.map((_, j) => <Cell key={j} fill={CHART_COLORS[0]} fillOpacity={0.65 + (j % 4) * 0.1} />)}
                    </Bar>
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
                    {evolucaoMode === 'ano'
                      ? selectedYears.map(y => (
                        <Line key={y} type="monotone" dataKey={`ano_${y}`} name={String(y)}
                          stroke={ANO_COLORS[y]} strokeWidth={2.5} dot={{ r: 4, fill: ANO_COLORS[y] }} />
                      ))
                      : <>
                        <Bar dataKey={chartBarCols[0]?.label ?? 'Valor'} fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                        {chartLineCols[0] && (
                          <Line type="monotone" dataKey={chartLineCols[0]?.label ?? 'Linha'} stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                        )}
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
                    <p className={`text-5xl font-black ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{gaugeData.pct.toFixed(1)}%</p>
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

              {/* 6 — Comparação de Anos */}
              {currentChart.id === 'comparacao' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className={`text-xs font-semibold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>Anos a comparar:</p>
                      <div className="flex flex-wrap gap-2">
                        {ANOS_DISPONIVEIS.map(year => {
                          const isSelected = anosComparacao.includes(year)
                          const isLoading = loadingYears.has(year)
                          return (
                            <button key={year} onClick={() => toggleAnoComparacao(year)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                                isSelected
                                  ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'text-white border-transparent shadow-md'
                                  : hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 bg-white'
                              }`}
                              style={isSelected && !hc ? { backgroundColor: ANO_COLORS[year], borderColor: ANO_COLORS[year] } : {}}>
                              {isLoading ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isSelected && <span className="text-xs">✓</span>}
                              {year}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-600'}`}>Indicador:</p>
                      <div className="flex flex-wrap gap-2">
                        {config.columns.filter(c => c.type === 'currency' || c.type === 'number').map(col => (
                          <button key={col.key} onClick={() => setMetricaComparacao(col.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                              metricaComparacao === col.key
                                ? hc ? 'bg-yellow-300 text-black border-yellow-300' : 'bg-blue-600 text-white border-blue-600'
                                : hc ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black' : 'border-gray-200 text-gray-500 bg-white hover:border-blue-300 hover:text-blue-500'
                            }`}>
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {anosParaComparar.length >= 2 && metricaComparacao ? (
                    <>
                      <ResponsiveContainer width="100%" height={360}>
                        <ComposedChart data={comparacaoData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={hc ? '#444' : '#e5e7eb'} />
                          <XAxis dataKey="_label" tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 11 }} />
                          <YAxis tickFormatter={fmtShort} tick={{ fill: hc ? '#fde047' : '#6b7280', fontSize: 10 }} />
                          <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), String(name).replace('ano_', '')]}
                            contentStyle={{ background: hc ? '#111' : '#fff', borderRadius: 8, fontSize: 11 }} />
                          <Legend formatter={v => String(v).replace('ano_', '')} wrapperStyle={{ fontSize: 11 }} />
                          {anosParaComparar.map(y => (
                            <Line key={y} type="monotone" dataKey={`ano_${y}`} name={`ano_${y}`}
                              stroke={ANO_COLORS[y]} strokeWidth={2.5} dot={{ r: 4, fill: ANO_COLORS[y] }} />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {anosParaComparar.map(y => {
                          const rows = (dataByYear[y] ?? []).filter(r => config.showMovimentoFilter !== false ? r['movimento'] === 'S' : true)
                          const total = rows.reduce((acc, r) => acc + (Number(r[metricaComparacao]) || 0), 0)
                          return (
                            <div key={y} className={`rounded-lg p-3 text-center ${hc ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: ANO_COLORS[y] }} />
                              <p className={`text-xs font-bold ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>{y}</p>
                              <p className={`text-sm font-semibold mt-1 ${hc ? 'text-yellow-200' : 'text-gray-800'}`}>{fmtShort(total)}</p>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <p className={`text-sm text-center py-8 ${hc ? 'text-yellow-400' : 'text-gray-400'}`}>
                      Selecione pelo menos 2 anos e um indicador acima para visualizar a comparação.
                    </p>
                  )}
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