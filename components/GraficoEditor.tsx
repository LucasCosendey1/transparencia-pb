'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { FaPlus, FaTrash, FaLightbulb, FaArrowRight, FaTimes, FaGripVertical } from 'react-icons/fa'

// ─── Tipos ────────────────────────────────────────────────────

export type TipoGrafico = 'barra_v' | 'barra_h' | 'linha' | 'area' | 'donut' | 'pizza' | 'gauge' | 'card'
export type Operacao    = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'mul' | 'div' | 'pct'

export interface Serie {
  id: string
  label: string
  coluna: number
  operacao: Operacao
  cor: string
  coluna2?: number
  meta?: number
}

export interface GraficoConfig {
  id: string
  tipo: TipoGrafico
  titulo: string
  nome_tabela: string
  coluna_categoria: number
  series: Serie[]
  aparecer_pagina: boolean
  aparecer_pdf: boolean
}

interface Linha { id: number; dados: string[]; created_at: string }

interface Props {
  tabelas: { nome_tabela: string; colunas: string[] }[]
  linhasPorTabela: Record<string, Linha[]>
  grafico: GraficoConfig
  onChange: (g: GraficoConfig) => void
  salvando?: boolean
  onSalvar: () => void
  onCancelar: () => void
}

// ─── Constantes ───────────────────────────────────────────────

export const CORES_PADRAO = [
  '#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16',
]

const TIPOS_INFO: Record<TipoGrafico, { emoji: string; label: string; desc: string }> = {
  barra_v: { emoji: '📊', label: 'Barras',        desc: 'Comparar valores' },
  barra_h: { emoji: '📉', label: 'Barras H.',      desc: 'Rótulos longos' },
  linha:   { emoji: '📈', label: 'Linha',          desc: 'Evolução temporal' },
  area:    { emoji: '🏔️', label: 'Área',           desc: 'Tendência visual' },
  donut:   { emoji: '🍩', label: 'Donut',          desc: 'Proporções' },
  pizza:   { emoji: '🥧', label: 'Pizza',          desc: 'Distribuição' },
  gauge:   { emoji: '⏱️', label: 'Gauge',          desc: 'Meta/progresso' },
  card:    { emoji: '🃏', label: 'Card KPI',       desc: 'Valor destaque' },
}

const OPERACOES: { id: Operacao; label: string; short: string }[] = [
  { id: 'sum',   label: 'Soma',          short: 'Σ' },
  { id: 'avg',   label: 'Média',         short: 'x̄' },
  { id: 'count', label: 'Contagem',      short: '#' },
  { id: 'max',   label: 'Máximo',        short: '↑' },
  { id: 'min',   label: 'Mínimo',        short: '↓' },
  { id: 'mul',   label: 'A × B',         short: '×' },
  { id: 'div',   label: 'A ÷ B',         short: '÷' },
  { id: 'pct',   label: 'A/B × 100%',   short: '%' },
]

const uid = () => Math.random().toString(36).slice(2, 8)

// ─── Detecção de tipos de coluna ──────────────────────────────

type ColType = 'number' | 'date' | 'text'

function detectColType(samples: string[]): ColType {
  const nonEmpty = samples.filter(Boolean)
  if (!nonEmpty.length) return 'text'
  const numCount  = nonEmpty.filter(v => !isNaN(parseFloat(v.replace(',', '.')))).length
  const dateCount = nonEmpty.filter(v => /^\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}/.test(v)).length
  if (dateCount / nonEmpty.length > 0.5) return 'date'
  if (numCount  / nonEmpty.length > 0.5) return 'number'
  return 'text'
}

function analisarColunas(linhas: Linha[], colunas: string[]) {
  return colunas.map((nome, ci) => {
    const samples = linhas.slice(0, 20).map(l => l.dados[ci] ?? '')
    const tipo = detectColType(samples)
    const unicos = new Set(samples.filter(Boolean)).size
    return { ci, nome, tipo, unicos }
  })
}

// ─── Sugestão inteligente de tipo de gráfico ─────────────────

function sugerirTipo(analise: ReturnType<typeof analisarColunas>): TipoGrafico {
  const temData   = analise.some(c => c.tipo === 'date')
  const numCols   = analise.filter(c => c.tipo === 'number').length
  const textCols  = analise.filter(c => c.tipo === 'text')
  const poucosCat = textCols.some(c => c.unicos <= 8)
  if (temData)                    return 'linha'
  if (numCols >= 2)               return 'barra_v'
  if (poucosCat && numCols >= 1)  return 'donut'
  return 'barra_v'
}

// ─── Cálculos ─────────────────────────────────────────────────

export function calcularValor(linhas: Linha[], coluna: number, op: Operacao, coluna2?: number): number {
  const vals  = linhas.map(l => parseFloat((l.dados[coluna]  ?? '').replace(',', '.')) || 0)
  const vals2 = coluna2 !== undefined ? linhas.map(l => parseFloat((l.dados[coluna2] ?? '').replace(',', '.')) || 0) : []
  switch (op) {
    case 'sum':   return vals.reduce((a, b) => a + b, 0)
    case 'avg':   return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    case 'count': return linhas.length
    case 'max':   return vals.length ? Math.max(...vals) : 0
    case 'min':   return vals.length ? Math.min(...vals) : 0
    case 'mul':   return vals.reduce((acc, v, i) => acc + v * (vals2[i] ?? 0), 0)
    case 'div':   { const b = vals2.reduce((a,x)=>a+x,0); return b ? vals.reduce((a,x)=>a+x,0)/b : 0 }
    case 'pct':   { const a=vals.reduce((s,x)=>s+x,0); const b=vals2.reduce((s,x)=>s+x,0); return b ? (a/b)*100 : 0 }
    default: return 0
  }
}

export function agruparPorCategoria(linhas: Linha[], colCat: number, series: Serie[]) {
  const grupos: Record<string, Linha[]> = {}
  linhas.forEach(l => {
    const cat = l.dados[colCat] ?? '(vazio)'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(l)
  })
  return Object.entries(grupos).map(([cat, rows]) => {
    const e: Record<string, unknown> = { _label: cat }
    series.forEach(s => { e[s.label] = calcularValor(rows, s.coluna, s.operacao, s.coluna2) })
    return e
  })
}

export function fmtNum(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v/1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `${(v/1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1e3) return `${(v/1e3).toFixed(1)}K`
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

// ─── Componente de Preview ────────────────────────────────────

export function RenderGrafico({ grafico, linhasPorTabela, tabelas }: {
  grafico: GraficoConfig
  linhasPorTabela: Record<string, Linha[]>
  tabelas: { nome_tabela: string; colunas: string[] }[]
}) {
  const linhas = linhasPorTabela[grafico.nome_tabela] ?? []
  const { tipo, series } = grafico

  const dados = useMemo(() => {
    if (!series.length) return []
    if (tipo === 'card' || tipo === 'gauge') {
      const e: Record<string, unknown> = { _label: 'total' }
      series.forEach(s => { e[s.label] = calcularValor(linhas, s.coluna, s.operacao, s.coluna2) })
      return [e]
    }
    return agruparPorCategoria(linhas, grafico.coluna_categoria, series)
  }, [linhas, grafico])

  if (!series.length || !linhas.length) return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
      <span className="text-4xl">📊</span>
      <p className="text-sm">Configure X e Y para ver o gráfico</p>
    </div>
  )

  if (tipo === 'card') {
    return (
      <div className="grid grid-cols-2 gap-3 p-2">
        {series.map(s => {
          const val = calcularValor(linhas, s.coluna, s.operacao, s.coluna2)
          const pct = s.meta ? Math.min(100, (val / s.meta) * 100) : null
          return (
            <div key={s.id} className="rounded-xl p-4 text-white shadow" style={{ backgroundColor: s.cor }}>
              <p className="text-xs font-semibold opacity-80 uppercase">{s.label}</p>
              <p className="text-2xl font-black mt-1">{fmtNum(val)}</p>
              {pct !== null && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs opacity-70 mb-1">
                    <span>Meta {fmtNum(s.meta!)}</span><span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white bg-opacity-30 rounded-full">
                    <div className="h-2 bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (tipo === 'gauge') {
    const s = series[0]; const val = calcularValor(linhas, s.coluna, s.operacao, s.coluna2)
    const pct = Math.min(100, (val / (s.meta ?? 100)) * 100)
    const rd = [{ value: pct, fill: s.cor }, { value: 100 - pct, fill: '#e5e7eb' }]
    return (
      <div className="flex flex-col items-center py-2">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart cx="50%" cy="70%" innerRadius="55%" outerRadius="100%" startAngle={180} endAngle={0} data={rd}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }}>
              {rd.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="text-center -mt-6">
          <p className="text-3xl font-black text-gray-800">{pct.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">{fmtNum(val)} / {fmtNum(s.meta ?? 100)}</p>
        </div>
      </div>
    )
  }

  if (tipo === 'donut' || tipo === 'pizza') {
    const s = series[0]
    const pd = dados.map(d => ({ name: String(d['_label']), value: Number(d[s.label]) || 0 }))
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={pd} cx="50%" cy="50%" innerRadius={tipo==='donut'?55:0} outerRadius={95}
            dataKey="value" nameKey="name" paddingAngle={tipo==='donut'?3:0}
            label={({ percent }) => `${((percent??0)*100).toFixed(0)}%`}>
            {pd.map((_,i) => <Cell key={i} fill={CORES_PADRAO[i%CORES_PADRAO.length]} />)}
          </Pie>
          <Tooltip formatter={(v: unknown) => fmtNum(Number(v))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (tipo === 'barra_h') return (
    <ResponsiveContainer width="100%" height={Math.max(220, dados.length * 32)}>
      <BarChart data={dados} layout="vertical" margin={{ top:5, right:50, left:10, bottom:5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtNum} tick={{ fontSize:10 }} />
        <YAxis type="category" dataKey="_label" width={120} tick={{ fontSize:10 }} />
        <Tooltip formatter={(v: unknown) => fmtNum(Number(v))} />
        <Legend />
        {series.map(s => <Bar key={s.id} dataKey={s.label} fill={s.cor} radius={[0,4,4,0]} />)}
      </BarChart>
    </ResponsiveContainer>
  )

  if (tipo === 'area') return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={dados} margin={{ top:5, right:20, left:0, bottom:35 }}>
        <defs>{series.map(s => (
          <linearGradient key={s.id} id={`g_${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={s.cor} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={s.cor} stopOpacity={0.05}/>
          </linearGradient>
        ))}</defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_label" tick={{ fontSize:10 }} angle={-30} textAnchor="end" height={55} />
        <YAxis tickFormatter={fmtNum} tick={{ fontSize:10 }} />
        <Tooltip formatter={(v: unknown) => fmtNum(Number(v))} />
        <Legend />
        {series.map(s => <Area key={s.id} type="monotone" dataKey={s.label} stroke={s.cor} strokeWidth={2} fill={`url(#g_${s.id})`} />)}
      </AreaChart>
    </ResponsiveContainer>
  )

  if (tipo === 'linha') return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top:5, right:20, left:0, bottom:35 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_label" tick={{ fontSize:10 }} angle={-30} textAnchor="end" height={55} />
        <YAxis tickFormatter={fmtNum} tick={{ fontSize:10 }} />
        <Tooltip formatter={(v: unknown) => fmtNum(Number(v))} />
        <Legend />
        {series.map(s => <Line key={s.id} type="monotone" dataKey={s.label} stroke={s.cor} strokeWidth={2.5} dot={{ r:3, fill:s.cor }} />)}
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top:5, right:20, left:0, bottom:35 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_label" tick={{ fontSize:10 }} angle={-30} textAnchor="end" height={55} />
        <YAxis tickFormatter={fmtNum} tick={{ fontSize:10 }} />
        <Tooltip formatter={(v: unknown) => fmtNum(Number(v))} />
        <Legend />
        {series.map(s => <Bar key={s.id} dataKey={s.label} fill={s.cor} radius={[4,4,0,0]} />)}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Editor Principal ─────────────────────────────────────────

export default function GraficoEditor({ tabelas, linhasPorTabela, grafico, onChange, salvando, onSalvar, onCancelar }: Props) {
  const meta    = tabelas.find(t => t.nome_tabela === grafico.nome_tabela)
  const colunas = meta?.colunas ?? []
  const linhas  = linhasPorTabela[grafico.nome_tabela] ?? []

  const analise = useMemo(() => analisarColunas(linhas, colunas), [linhas, colunas])

  // Sugestão automática ao montar
  useEffect(() => {
    if (analise.length === 0 || grafico.series.length > 0) return
    const sugestao = sugerirTipo(analise)
    const colX = analise.find(c => c.tipo === 'date') ?? analise.find(c => c.tipo === 'text') ?? analise[0]
    const colY = analise.find(c => c.tipo === 'number' && c.ci !== colX?.ci) ?? analise.find(c => c.ci !== colX?.ci)
    if (!colX || !colY) return
    onChange({
      ...grafico,
      tipo: sugestao,
      coluna_categoria: colX.ci,
      series: [{
        id: uid(),
        label: colY.nome,
        coluna: colY.ci,
        operacao: 'sum',
        cor: CORES_PADRAO[0],
      }],
    })
  }, [analise])

  const update = (p: Partial<GraficoConfig>) => onChange({ ...grafico, ...p })

  // Drag & Drop de colunas
  const [dragging, setDragging] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<'x' | 'y' | null>(null)

  const onDragStart = (ci: number) => setDragging(ci)
  const onDragOver  = (e: React.DragEvent, zone: 'x' | 'y') => { e.preventDefault(); setDropTarget(zone) }
  const onDragLeave = () => setDropTarget(null)

  const onDrop = (e: React.DragEvent, zone: 'x' | 'y') => {
    e.preventDefault()
    setDropTarget(null)
    if (dragging === null) return
    if (zone === 'x') {
      update({ coluna_categoria: dragging })
    } else {
      const existe = grafico.series.find(s => s.coluna === dragging)
      if (!existe) {
        update({
          series: [...grafico.series, {
            id: uid(),
            label: colunas[dragging] ?? `Col ${dragging}`,
            coluna: dragging,
            operacao: 'sum',
            cor: CORES_PADRAO[grafico.series.length % CORES_PADRAO.length],
          }]
        })
      }
    }
    setDragging(null)
  }

  const updateSerie = (id: string, p: Partial<Serie>) =>
    update({ series: grafico.series.map(s => s.id === id ? { ...s, ...p } : s) })
  const removeSerie = (id: string) =>
    update({ series: grafico.series.filter(s => s.id !== id) })

  const usaCategoria = !['card', 'gauge'].includes(grafico.tipo)
  const usaMeta      = ['card', 'gauge'].includes(grafico.tipo)

  // Badge de tipo de coluna
  const typeBadge = (t: ColType) => {
    if (t === 'number') return <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono">123</span>
    if (t === 'date')   return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">📅</span>
    return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">Abc</span>
  }

  return (
    <div className="flex gap-0 min-h-[600px] border rounded-xl overflow-hidden bg-white">

      {/* ══ Painel esquerdo: Configuração ══ */}
      <div className="w-[420px] flex-shrink-0 border-r flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="px-5 py-4 border-b bg-gray-50">
          <input
            value={grafico.titulo}
            onChange={e => update({ titulo: e.target.value })}
            placeholder="Nome do gráfico..."
            className="w-full text-base font-semibold bg-transparent border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none text-gray-800 pb-1 transition"
          />
          <div className="flex items-center gap-2 mt-2">
            <select value={grafico.nome_tabela}
              onChange={e => update({ nome_tabela: e.target.value, coluna_categoria: 0, series: [] })}
              className="text-xs px-2 py-1 border rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400">
              {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
            </select>
            <span className="text-xs text-gray-400">{linhas.length} registros</span>
          </div>
        </div>

        {/* Tipo de gráfico */}
        <div className="px-5 py-4 border-b">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Tipo de gráfico</p>
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.entries(TIPOS_INFO) as [TipoGrafico, typeof TIPOS_INFO[TipoGrafico]][]).map(([id, info]) => (
              <button key={id} onClick={() => update({ tipo: id })} title={info.desc}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium border-2 transition ${
                  grafico.tipo === id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-transparent bg-gray-50 text-gray-600 hover:bg-blue-50 hover:border-blue-200'
                }`}>
                <span className="text-lg">{info.emoji}</span>
                <span className="text-center leading-tight">{info.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colunas disponíveis — resumo + drag */}
        <div className="px-5 py-4 border-b">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Colunas disponíveis</p>
          <p className="text-xs text-gray-400 mb-3">Arraste para os eixos X ou Y abaixo</p>
          <div className="flex flex-wrap gap-2">
            {analise.map(col => (
              <div
                key={col.ci}
                draggable
                onDragStart={() => onDragStart(col.ci)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm transition select-none"
              >
                <FaGripVertical size={9} className="text-gray-300" />
                <span className="text-gray-700 font-medium">{col.nome}</span>
                {typeBadge(col.tipo)}
              </div>
            ))}
          </div>
        </div>

        {/* Zonas de drop X e Y */}
        <div className="px-5 py-4 border-b space-y-3">

          {/* Eixo X */}
          {usaCategoria && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded bg-blue-600 text-white text-xs font-bold flex items-center justify-center">X</span>
                <span className="text-xs font-semibold text-gray-700">Eixo X — Categoria</span>
              </div>
              <div
                onDragOver={e => onDragOver(e, 'x')}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, 'x')}
                className={`min-h-[42px] rounded-lg border-2 border-dashed flex items-center px-3 transition ${
                  dropTarget === 'x' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}>
                {grafico.coluna_categoria !== undefined && colunas[grafico.coluna_categoria] ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                      {colunas[grafico.coluna_categoria]}
                    </span>
                    {typeBadge(analise[grafico.coluna_categoria]?.tipo ?? 'text')}
                    <span className="text-xs text-gray-400">{analise[grafico.coluna_categoria]?.unicos} valores únicos</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Arraste uma coluna aqui ou clique acima</span>
                )}
              </div>
              {/* Clique rápido */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {analise.map(col => (
                  <button key={col.ci} onClick={() => update({ coluna_categoria: col.ci })}
                    className={`text-xs px-2 py-0.5 rounded-full border transition ${
                      grafico.coluna_categoria === col.ci
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    {col.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eixo Y */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">Y</span>
                <span className="text-xs font-semibold text-gray-700">Eixo Y — Valores</span>
              </div>
              <button onClick={() => {
                const prox = analise.find(c => c.tipo === 'number' && !grafico.series.some(s => s.coluna === c.ci) && c.ci !== grafico.coluna_categoria)
                if (prox) update({ series: [...grafico.series, { id: uid(), label: prox.nome, coluna: prox.ci, operacao: 'sum', cor: CORES_PADRAO[grafico.series.length % CORES_PADRAO.length] }] })
                else update({ series: [...grafico.series, { id: uid(), label: `Série ${grafico.series.length+1}`, coluna: 0, operacao: 'count', cor: CORES_PADRAO[grafico.series.length % CORES_PADRAO.length] }] })
              }} className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800">
                <FaPlus size={9} /> Série
              </button>
            </div>

            {/* Drop zone Y */}
            <div
              onDragOver={e => onDragOver(e, 'y')}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, 'y')}
              className={`min-h-[42px] rounded-lg border-2 border-dashed px-3 py-2 transition ${
                dropTarget === 'y' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'
              }`}>
              {grafico.series.length === 0 ? (
                <span className="text-xs text-gray-400">Arraste colunas numéricas aqui</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {grafico.series.map(s => (
                    <div key={s.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white font-medium"
                      style={{ backgroundColor: s.cor }}>
                      {s.label}
                      <button onClick={() => removeSerie(s.id)} className="opacity-70 hover:opacity-100 ml-0.5">
                        <FaTimes size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuração detalhada das séries */}
        {grafico.series.length > 0 && (
          <div className="px-5 py-4 border-b space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Configurar séries</p>
            {grafico.series.map((s, idx) => (
              <div key={s.id} className="border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: s.cor + '18' }}>
                  <input type="color" value={s.cor} onChange={e => updateSerie(s.id, { cor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 flex-shrink-0" />
                  <input value={s.label} onChange={e => updateSerie(s.id, { label: e.target.value })}
                    className="flex-1 text-xs font-semibold bg-transparent border-0 focus:outline-none text-gray-700" />
                  <button onClick={() => removeSerie(s.id)} className="text-red-400 hover:text-red-600">
                    <FaTrash size={10} />
                  </button>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2 bg-white">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Coluna</label>
                    <select value={s.coluna} onChange={e => updateSerie(s.id, { coluna: Number(e.target.value), label: colunas[Number(e.target.value)] ?? s.label })}
                      className="w-full px-2 py-1.5 border rounded text-xs text-black focus:outline-none focus:ring-1 focus:ring-blue-400">
                      {colunas.map((col, ci) => <option key={ci} value={ci}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Operação</label>
                    <select value={s.operacao} onChange={e => updateSerie(s.id, { operacao: e.target.value as Operacao })}
                      className="w-full px-2 py-1.5 border rounded text-xs text-black focus:outline-none focus:ring-1 focus:ring-blue-400">
                      {OPERACOES.map(op => <option key={op.id} value={op.id}>{op.short} {op.label}</option>)}
                    </select>
                  </div>
                  {['mul','div','pct'].includes(s.operacao) && (
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Coluna B</label>
                      <select value={s.coluna2 ?? 0} onChange={e => updateSerie(s.id, { coluna2: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 border rounded text-xs text-black focus:outline-none focus:ring-1 focus:ring-blue-400">
                        {colunas.map((col, ci) => <option key={ci} value={ci}>{col}</option>)}
                      </select>
                    </div>
                  )}
                  {usaMeta && (
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Meta (opcional)</label>
                      <input type="number" value={s.meta ?? ''} placeholder="Ex: 100000"
                        onChange={e => updateSerie(s.id, { meta: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-2 py-1.5 border rounded text-xs text-black focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                  )}
                  {/* Resultado atual */}
                  <div className="col-span-2 flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-xs">
                    <span className="text-gray-500">Resultado atual</span>
                    <span className="font-bold text-emerald-700">{fmtNum(calcularValor(linhas, s.coluna, s.operacao, s.coluna2))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visibilidade + Sugestão */}
        <div className="px-5 py-4 mt-auto">
          {/* Sugestão inteligente */}
          {analise.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
              <FaLightbulb className="flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-semibold">Sugestão: </span>
                {(() => {
                  const s = sugerirTipo(analise)
                  const temData = analise.some(c => c.tipo === 'date')
                  const numCols = analise.filter(c => c.tipo === 'number').length
                  if (temData) return `Detectamos uma coluna de data — gráfico de ${TIPOS_INFO[s].label} é ideal para mostrar evolução temporal.`
                  if (numCols >= 2) return `${numCols} colunas numéricas encontradas — ${TIPOS_INFO[s].label} permite comparar todas ao mesmo tempo.`
                  return `Use ${TIPOS_INFO[s].label} para este conjunto de dados.`
                })()}
                <button onClick={() => update({ tipo: sugerirTipo(analise) })}
                  className="ml-1 underline font-semibold">Aplicar</button>
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={grafico.aparecer_pagina} onChange={e => update({ aparecer_pagina: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              Na página
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={grafico.aparecer_pdf} onChange={e => update({ aparecer_pdf: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              No PDF
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={onCancelar} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Cancelar
            </button>
            <button onClick={onSalvar}
              disabled={salvando || !grafico.titulo.trim() || grafico.series.length === 0}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition">
              {salvando ? 'Salvando…' : '✅ Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ Painel direito: Preview ao vivo ══ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{grafico.titulo || 'Preview ao vivo'}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {TIPOS_INFO[grafico.tipo].emoji} {TIPOS_INFO[grafico.tipo].label}
              {usaCategoria && grafico.coluna_categoria !== undefined && colunas[grafico.coluna_categoria] && (
                <> · X: <strong>{colunas[grafico.coluna_categoria]}</strong></>
              )}
              {grafico.series.map(s => (
                <span key={s.id}> · <span className="font-medium" style={{ color: s.cor }}>{s.label}</span></span>
              ))}
            </p>
          </div>
          {/* Mini resumo dos dados */}
          <div className="flex gap-2">
            {analise.filter(c => c.tipo === 'number').length > 0 && (
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {analise.filter(c => c.tipo === 'number').length} colunas numéricas
              </span>
            )}
            {analise.some(c => c.tipo === 'date') && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                📅 data detectada
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {linhas.length} registros
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full">
            <RenderGrafico grafico={grafico} linhasPorTabela={linhasPorTabela} tabelas={tabelas} />
          </div>
        </div>

        {/* Dica de drag */}
        {grafico.series.length === 0 && (
          <div className="px-6 pb-6 text-center text-xs text-gray-400">
            👈 Arraste colunas da esquerda para os eixos X e Y para começar
          </div>
        )}
      </div>
    </div>
  )
}