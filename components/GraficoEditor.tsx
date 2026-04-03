'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { FaPlus, FaTrash, FaLightbulb, FaTimes, FaGripVertical, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

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
  highContrast?: boolean
}

// ─── Paletas de cores ─────────────────────────────────────────

const PALETAS: { nome: string; cores: string[] }[] = [
  { nome: 'Power BI', cores: ['#118DFF','#12239E','#E66C37','#6B007B','#E044A7','#744EC2','#D9B300','#D64550'] },
  { nome: 'Oceano',   cores: ['#0EA5E9','#06B6D4','#10B981','#3B82F6','#8B5CF6','#6366F1','#14B8A6','#22D3EE'] },
  { nome: 'Pôr do Sol',cores: ['#F97316','#EF4444','#EC4899','#A855F7','#F59E0B','#84CC16','#06B6D4','#3B82F6'] },
  { nome: 'Floresta', cores: ['#16A34A','#15803D','#4ADE80','#86EFAC','#065F46','#6EE7B7','#D97706','#92400E'] },
  { nome: 'Mono',     cores: ['#1E293B','#334155','#475569','#64748B','#94A3B8','#CBD5E1','#E2E8F0','#F8FAFC'] },
]

export const CORES_PADRAO = PALETAS[0].cores

// ─── Ícones SVG para tipos de gráfico ─────────────────────────

const TIPO_ICONS: Record<TipoGrafico, (cor: string) => JSX.Element> = {
  barra_v: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <rect x="2"  y="14" width="7" height="13" fill={cor} opacity="0.9" rx="1"/>
      <rect x="11" y="6"  width="7" height="21" fill={cor} rx="1"/>
      <rect x="20" y="10" width="7" height="17" fill={cor} opacity="0.8" rx="1"/>
      <rect x="29" y="2"  width="7" height="25" fill={cor} opacity="0.7" rx="1"/>
    </svg>
  ),
  barra_h: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <rect x="0" y="2"  width="20" height="5" fill={cor} rx="1"/>
      <rect x="0" y="9"  width="30" height="5" fill={cor} opacity="0.9" rx="1"/>
      <rect x="0" y="16" width="15" height="5" fill={cor} opacity="0.8" rx="1"/>
      <rect x="0" y="23" width="25" height="5" fill={cor} opacity="0.7" rx="1"/>
    </svg>
  ),
  linha: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <polyline points="2,22 10,12 18,16 26,6 34,10" fill="none" stroke={cor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="2"  cy="22" r="2.5" fill={cor}/>
      <circle cx="10" cy="12" r="2.5" fill={cor}/>
      <circle cx="18" cy="16" r="2.5" fill={cor}/>
      <circle cx="26" cy="6"  r="2.5" fill={cor}/>
      <circle cx="34" cy="10" r="2.5" fill={cor}/>
    </svg>
  ),
  area: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={cor} stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      <polygon points="2,26 2,20 10,12 18,15 26,6 34,9 34,26" fill="url(#areaGrad)"/>
      <polyline points="2,20 10,12 18,15 26,6 34,9" fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  donut: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <circle cx="18" cy="14" r="12" fill="none" stroke={cor} strokeWidth="6" strokeDasharray="37.7 75.4" strokeDashoffset="0" transform="rotate(-90 18 14)"/>
      <circle cx="18" cy="14" r="12" fill="none" stroke={cor} strokeWidth="6" strokeDasharray="18.8 75.4" strokeDashoffset="-37.7" opacity="0.55" transform="rotate(-90 18 14)"/>
      <circle cx="18" cy="14" r="12" fill="none" stroke={cor} strokeWidth="6" strokeDasharray="12.6 75.4" strokeDashoffset="-56.5" opacity="0.35" transform="rotate(-90 18 14)"/>
      <circle cx="18" cy="14" r="6" fill="white" opacity="0.08"/>
    </svg>
  ),
  pizza: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <circle cx="18" cy="14" r="12" fill={cor} opacity="0.25"/>
      <path d="M18,14 L18,2 A12,12 0 0,1 29.4,21 Z" fill={cor}/>
      <path d="M18,14 L29.4,21 A12,12 0 0,1 8,23.5 Z" fill={cor} opacity="0.65"/>
      <path d="M18,14 L8,23.5 A12,12 0 0,1 18,2 Z" fill={cor} opacity="0.4"/>
    </svg>
  ),
  gauge: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <path d="M4,24 A14,14 0 0,1 32,24" fill="none" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" opacity="0.2"/>
      <path d="M4,24 A14,14 0 0,1 32,24" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round" strokeDasharray="33 44"/>
      <line x1="18" y1="24" x2="27" y2="10" stroke={cor} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="18" cy="24" r="3" fill={cor}/>
    </svg>
  ),
  card: (cor) => (
    <svg width="36" height="28" viewBox="0 0 36 28">
      <rect x="1" y="1" width="16" height="12" rx="2" fill={cor} opacity="0.9"/>
      <rect x="19" y="1" width="16" height="12" rx="2" fill={cor} opacity="0.6"/>
      <rect x="1" y="15" width="16" height="12" rx="2" fill={cor} opacity="0.4"/>
      <rect x="19" y="15" width="16" height="12" rx="2" fill={cor} opacity="0.7"/>
      <text x="9"  y="10" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">KPI</text>
      <text x="27" y="10" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">KPI</text>
    </svg>
  ),
}

// ─── Constantes ───────────────────────────────────────────────

const TIPOS_INFO: Record<TipoGrafico, { label: string; desc: string }> = {
  barra_v: { label: 'Barras',    desc: 'Comparar valores' },
  barra_h: { label: 'Barras H.', desc: 'Rótulos longos' },
  linha:   { label: 'Linha',     desc: 'Evolução temporal' },
  area:    { label: 'Área',      desc: 'Tendência visual' },
  donut:   { label: 'Donut',     desc: 'Proporções' },
  pizza:   { label: 'Pizza',     desc: 'Distribuição' },
  gauge:   { label: 'Gauge',     desc: 'Meta/progresso' },
  card:    { label: 'Card KPI',  desc: 'Valor destaque' },
}

const OPERACOES: { id: Operacao; label: string; short: string }[] = [
  { id: 'sum',   label: 'Soma',        short: 'Σ' },
  { id: 'avg',   label: 'Média',       short: 'x̄' },
  { id: 'count', label: 'Contagem',    short: '#' },
  { id: 'max',   label: 'Máximo',      short: '↑' },
  { id: 'min',   label: 'Mínimo',      short: '↓' },
  { id: 'mul',   label: 'A × B',       short: '×' },
  { id: 'div',   label: 'A ÷ B',       short: '÷' },
  { id: 'pct',   label: 'A/B × 100%', short: '%' },
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

// ─── Tooltip Customizado ──────────────────────────────────────

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, marginBottom: 6, fontFamily: 'monospace' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }}>{p.name}</span>
          <span style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 12, fontWeight: 700, marginLeft: 'auto', paddingLeft: 12 }}>
            {fmtNum(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── RenderGrafico ────────────────────────────────────────────

export function RenderGrafico({ grafico, linhasPorTabela, tabelas, highContrast }: {
  grafico: GraficoConfig
  linhasPorTabela: Record<string, Linha[]>
  tabelas: { nome_tabela: string; colunas: string[] }[]
  highContrast?: boolean
}) {
  const isDark = !!highContrast
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: isDark ? '#475569' : '#94a3b8' }}>
      <div style={{ fontSize: 40, opacity: 0.3 }}>📊</div>
      <p style={{ fontSize: 13 }}>Configure os eixos para visualizar o gráfico</p>
    </div>
  )

  const gridColor  = isDark ? '#1e293b' : '#f1f5f9'
  const axisColor  = isDark ? '#64748b' : '#94a3b8'
  const axisStyle  = { fontSize: 10, fill: axisColor, fontFamily: 'monospace' }
  const gridStyle  = { strokeDasharray: '3 3', stroke: gridColor }
  const tt = (props: any) => <CustomTooltip {...props} isDark={isDark} />

  if (tipo === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: 8 }}>
        {series.map(s => {
          const val = calcularValor(linhas, s.coluna, s.operacao, s.coluna2)
          const pct = s.meta ? Math.min(100, (val / s.meta) * 100) : null
          return (
            <div key={s.id} style={{
              borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
              background: isDark ? `linear-gradient(135deg, ${s.cor}22, ${s.cor}11)` : `linear-gradient(135deg, ${s.cor}18, ${s.cor}08)`,
              border: `1px solid ${s.cor}${isDark ? '44' : '33'}`,
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: s.cor, opacity: 0.08 }} />
              <p style={{ color: s.cor, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{s.label}</p>
              <p style={{ color: isDark ? '#f1f5f9' : '#0f172a', fontSize: 28, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>{fmtNum(val)}</p>
              {pct !== null && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                    <span>Meta {fmtNum(s.meta!)}</span><span style={{ color: s.cor }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 2 }}>
                    <div style={{ height: 4, background: s.cor, borderRadius: 2, width: `${pct}%`, transition: 'width 0.8s ease' }} />
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
    const rd = [{ value: pct, fill: s.cor }, { value: 100 - pct, fill: isDark ? '#1e293b' : '#f1f5f9' }]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart cx="50%" cy="75%" innerRadius="55%" outerRadius="100%" startAngle={180} endAngle={0} data={rd}>
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: isDark ? '#0f172a' : '#f8fafc' }}>
              {rd.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ textAlign: 'center', marginTop: -40 }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: s.cor, fontFamily: 'monospace', lineHeight: 1 }}>{pct.toFixed(1)}%</p>
          <p style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginTop: 4 }}>{fmtNum(val)} / {fmtNum(s.meta ?? 100)}</p>
        </div>
      </div>
    )
  }

  if (tipo === 'donut' || tipo === 'pizza') {
    const s = series[0]
    const pd = dados.map(d => ({ name: String(d['_label']), value: Number(d[s.label]) || 0 }))
    const colors = [s.cor, ...CORES_PADRAO.filter(c => c !== s.cor)]
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={pd} cx="50%" cy="48%" innerRadius={tipo==='donut'?65:0} outerRadius={100}
            dataKey="value" nameKey="name" paddingAngle={tipo==='donut'?4:0}
            label={({ percent }) => `${((percent??0)*100).toFixed(0)}%`}
            labelLine={{ stroke: axisColor, strokeWidth: 1 }}>
            {pd.map((_,i) => <Cell key={i} fill={colors[i%colors.length]} stroke="transparent" />)}
          </Pie>
          <Tooltip content={tt} />
          <Legend wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (tipo === 'barra_h') return (
    <ResponsiveContainer width="100%" height={Math.max(240, dados.length * 36)}>
      <BarChart data={dados} layout="vertical" margin={{ top:5, right:60, left:10, bottom:5 }}>
        <CartesianGrid {...gridStyle} horizontal={false} />
        <XAxis type="number" tickFormatter={fmtNum} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="_label" width={120} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={tt} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
        {series.map(s => <Bar key={s.id} dataKey={s.label} fill={s.cor} radius={[0,6,6,0]} maxBarSize={28} />)}
      </BarChart>
    </ResponsiveContainer>
  )

  if (tipo === 'area') return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={dados} margin={{ top:10, right:20, left:0, bottom:40 }}>
        <defs>{series.map(s => (
          <linearGradient key={s.id} id={`g_${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={s.cor} stopOpacity={isDark ? 0.35 : 0.25}/>
            <stop offset="95%" stopColor={s.cor} stopOpacity={0.02}/>
          </linearGradient>
        ))}</defs>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="_label" tick={axisStyle} angle={-30} textAnchor="end" height={55} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtNum} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={tt} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
        {series.map(s => <Area key={s.id} type="monotone" dataKey={s.label} stroke={s.cor} strokeWidth={2.5} fill={`url(#g_${s.id})`} dot={{ r:3, fill:s.cor, strokeWidth:0 }} activeDot={{ r:5 }} />)}
      </AreaChart>
    </ResponsiveContainer>
  )

  if (tipo === 'linha') return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dados} margin={{ top:10, right:20, left:0, bottom:40 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="_label" tick={axisStyle} angle={-30} textAnchor="end" height={55} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtNum} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={tt} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
        {series.map(s => <Line key={s.id} type="monotone" dataKey={s.label} stroke={s.cor} strokeWidth={2.5} dot={{ r:3, fill:s.cor, strokeWidth:0 }} activeDot={{ r:5 }} />)}
      </LineChart>
    </ResponsiveContainer>
  )

  // barra_v default
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} margin={{ top:10, right:20, left:0, bottom:40 }} barGap={4}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey="_label" tick={axisStyle} angle={-30} textAnchor="end" height={55} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtNum} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip content={tt} />
        <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
        {series.map(s => <Bar key={s.id} dataKey={s.label} fill={s.cor} radius={[5,5,0,0]} maxBarSize={40} />)}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Editor Principal ─────────────────────────────────────────

export default function GraficoEditor({ tabelas, linhasPorTabela, grafico, onChange, salvando, onSalvar, onCancelar, highContrast }: Props) {
  const isDark = !!highContrast

  const meta    = tabelas.find(t => t.nome_tabela === grafico.nome_tabela)
  const colunas = meta?.colunas ?? []
  const linhas  = linhasPorTabela[grafico.nome_tabela] ?? []
  const analise = useMemo(() => analisarColunas(linhas, colunas), [linhas, colunas])

  const [paletaSelecionada, setPaletaSelecionada] = useState(0)
  const [dropTarget, setDropTarget] = useState<'x' | 'y' | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<'tipo' | 'dados' | 'series' | 'visual'>('tipo')
  const [erros, setErros] = useState<string[]>([])

  // Refs para scroll
  const tituloRef  = useRef<HTMLInputElement>(null)
  const seriesRef  = useRef<HTMLDivElement>(null)
  const dadosRef   = useRef<HTMLDivElement>(null)

  // Sugestão automática ao montar
  useEffect(() => {
    if (analise.length === 0 || grafico.series.length > 0) return
    const sugestao = sugerirTipo(analise)
    const colX = analise.find(c => c.tipo === 'date') ?? analise.find(c => c.tipo === 'text') ?? analise[0]
    const colY = analise.find(c => c.tipo === 'number' && c.ci !== colX?.ci) ?? analise.find(c => c.ci !== colX?.ci)
    if (!colX || !colY) return
    onChange({
      ...grafico, tipo: sugestao, coluna_categoria: colX.ci,
      series: [{ id: uid(), label: colY.nome, coluna: colY.ci, operacao: 'sum', cor: PALETAS[paletaSelecionada].cores[0] }],
    })
  }, [analise])

  const update = (p: Partial<GraficoConfig>) => onChange({ ...grafico, ...p })

  const onDragStart = (ci: number) => setDragging(ci)
  const onDragOver  = (e: React.DragEvent, zone: 'x' | 'y') => { e.preventDefault(); setDropTarget(zone) }
  const onDragLeave = () => setDropTarget(null)
  const onDrop = (e: React.DragEvent, zone: 'x' | 'y') => {
    e.preventDefault(); setDropTarget(null)
    if (dragging === null) return
    if (zone === 'x') {
      update({ coluna_categoria: dragging })
    } else {
      if (!grafico.series.find(s => s.coluna === dragging)) {
        const paleta = PALETAS[paletaSelecionada].cores
        update({ series: [...grafico.series, { id: uid(), label: colunas[dragging] ?? `Col ${dragging}`, coluna: dragging, operacao: 'sum', cor: paleta[grafico.series.length % paleta.length] }] })
      }
    }
    setDragging(null)
  }

  const updateSerie = (id: string, p: Partial<Serie>) => update({ series: grafico.series.map(s => s.id === id ? { ...s, ...p } : s) })
  const removeSerie = (id: string) => update({ series: grafico.series.filter(s => s.id !== id) })

  const usaCategoria = !['card', 'gauge'].includes(grafico.tipo)
  const usaMeta      = ['card', 'gauge'].includes(grafico.tipo)

  // Validação com scroll para o erro
  const handleSalvar = () => {
    const novosErros: string[] = []
    if (!grafico.titulo.trim()) novosErros.push('titulo')
    if (grafico.series.length === 0) novosErros.push('series')
    setErros(novosErros)

    if (novosErros.length > 0) {
      if (novosErros.includes('titulo')) {
        setActiveSection('tipo')
        setTimeout(() => tituloRef.current?.focus(), 100)
      } else if (novosErros.includes('series')) {
        setActiveSection('dados')
        setTimeout(() => dadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      }
      return
    }
    onSalvar()
  }

  // Limpa erro ao corrigir
  useEffect(() => {
    if (grafico.titulo.trim() && erros.includes('titulo')) setErros(e => e.filter(x => x !== 'titulo'))
    if (grafico.series.length > 0 && erros.includes('series')) setErros(e => e.filter(x => x !== 'series'))
  }, [grafico.titulo, grafico.series.length])

  // Tema
  const panelBg  = isDark ? '#0f172a' : '#ffffff'
  const panelBg2 = isDark ? '#1e293b' : '#f8fafc'
  const panelBg3 = isDark ? '#0a1628' : '#f1f5f9'
  const border   = isDark ? '#334155' : '#e2e8f0'
  const text1    = isDark ? '#f1f5f9' : '#0f172a'
  const text2    = isDark ? '#94a3b8' : '#64748b'
  const accent   = '#3b82f6'
  const previewBg = isDark ? '#0d1626' : '#f8fafc'

  const typeBadge = (t: ColType) => {
    const styles: Record<ColType, { bg: string; color: string; label: string }> = {
      number: { bg: isDark ? '#052e16' : '#dcfce7', color: isDark ? '#4ade80' : '#16a34a', label: '123' },
      date:   { bg: isDark ? '#1e1b4b' : '#ede9fe', color: isDark ? '#818cf8' : '#7c3aed', label: '📅' },
      text:   { bg: isDark ? '#1c1917' : '#f5f5f4', color: isDark ? '#a8a29e' : '#78716c', label: 'Abc' },
    }
    const s = styles[t]
    return <span style={{ background: s.bg, color: s.color, fontSize: 9, padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700 }}>{s.label}</span>
  }

  const sectionBtn = (key: typeof activeSection, label: string) => (
    <button onClick={() => setActiveSection(key)}
      style={{
        flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 600,
        background: activeSection === key ? accent : 'transparent',
        color: activeSection === key ? '#fff' : text2,
        border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
      }}>{label}</button>
  )

  const hasError = (campo: string) => erros.includes(campo)

  return (
    <div style={{ display: 'flex', minHeight: 640, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', background: panelBg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ Painel esquerdo ══ */}
      <div style={{ width: 400, flexShrink: 0, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', background: panelBg3, borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
            <span style={{ color: text2, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Editor de Gráfico</span>
          </div>
          <input
            ref={tituloRef}
            value={grafico.titulo}
            onChange={e => update({ titulo: e.target.value })}
            placeholder="Nome do gráfico..."
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${hasError('titulo') ? '#ef4444' : grafico.titulo ? accent : border}`,
              color: text1, fontSize: 16, fontWeight: 700, padding: '4px 0 6px',
              outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
          />
          {hasError('titulo') && (
            <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaExclamationTriangle size={10} /> Informe um nome para o gráfico
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <select value={grafico.nome_tabela}
              onChange={e => update({ nome_tabela: e.target.value, coluna_categoria: 0, series: [] })}
              style={{ background: panelBg2, border: `1px solid ${border}`, color: text1, fontSize: 11, padding: '4px 8px', borderRadius: 6, outline: 'none', flex: 1 }}>
              {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
            </select>
            <span style={{ color: text2, fontSize: 10, background: panelBg2, padding: '4px 8px', borderRadius: 6, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
              {linhas.length} reg.
            </span>
          </div>
        </div>

        {/* Nav sections */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: panelBg3, borderBottom: `1px solid ${border}` }}>
          {sectionBtn('tipo', 'Tipo')}
          {sectionBtn('dados', 'Dados')}
          {sectionBtn('series', 'Séries')}
          {sectionBtn('visual', 'Visual')}
        </div>

        {/* ── Seção: Tipo ── */}
        {activeSection === 'tipo' && (
          <div style={{ padding: 16 }}>
            <p style={{ color: text2, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Tipo de gráfico</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {(Object.entries(TIPOS_INFO) as [TipoGrafico, typeof TIPOS_INFO[TipoGrafico]][]).map(([id, info]) => {
                const isSelected = grafico.tipo === id
                const iconColor = isSelected ? accent : (isDark ? '#64748b' : '#94a3b8')
                return (
                  <button key={id} onClick={() => update({ tipo: id })} title={info.desc}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 4px 10px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                      background: isSelected ? (isDark ? `${accent}22` : `${accent}12`) : panelBg2,
                      border: `2px solid ${isSelected ? accent : border}`,
                      color: isSelected ? accent : text2,
                    }}>
                    {TIPO_ICONS[id](iconColor)}
                    <span style={{ fontSize: 10, fontWeight: 600 }}>{info.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Sugestão */}
            {analise.length > 0 && (
              <div style={{ marginTop: 16, background: isDark ? '#1a1a2e' : '#eef2ff', border: `1px solid ${isDark ? '#3730a3' : '#c7d2fe'}`, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <FaLightbulb style={{ color: isDark ? '#818cf8' : '#6366f1', flexShrink: 0, marginTop: 2 }} size={12} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: isDark ? '#818cf8' : '#4f46e5', fontSize: 10, fontWeight: 700 }}>Sugestão IA: </span>
                  <span style={{ color: isDark ? '#a5b4fc' : '#6366f1', fontSize: 10 }}>
                    {(() => {
                      const s = sugerirTipo(analise)
                      const temData = analise.some(c => c.tipo === 'date')
                      const numCols = analise.filter(c => c.tipo === 'number').length
                      if (temData) return `Coluna de data detectada — ${TIPOS_INFO[s].label} ideal para evolução.`
                      if (numCols >= 2) return `${numCols} colunas numéricas — ${TIPOS_INFO[s].label} permite comparação.`
                      return `${TIPOS_INFO[s].label} recomendado para este conjunto.`
                    })()}
                  </span>
                  <button onClick={() => update({ tipo: sugerirTipo(analise) })}
                    style={{ display: 'block', marginTop: 5, color: isDark ? '#818cf8' : '#4f46e5', fontSize: 10, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    Aplicar sugestão →
                  </button>
                </div>
              </div>
            )}

            {/* Visibilidade */}
            <div style={{ marginTop: 16, display: 'flex', gap: 14 }}>
              {[{ key: 'aparecer_pagina' as const, label: 'Exibir na página' }, { key: 'aparecer_pdf' as const, label: 'Incluir no PDF' }].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: text2 }}>
                  <div onClick={() => update({ [key]: !grafico[key] })}
                    style={{
                      width: 16, height: 16, borderRadius: 4, border: `2px solid ${grafico[key] ? accent : border}`,
                      background: grafico[key] ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                    }}>
                    {grafico[key] && <FaCheck size={8} color="#fff" />}
                  </div>
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Seção: Dados ── */}
        {activeSection === 'dados' && (
          <div style={{ padding: 16 }}>
            <p style={{ color: text2, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Colunas disponíveis</p>
            <p style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 10, marginBottom: 10 }}>Arraste para os eixos abaixo</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {analise.map(col => (
                <div key={col.ci} draggable onDragStart={() => onDragStart(col.ci)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                    background: panelBg2, border: `1px solid ${border}`, borderRadius: 20,
                    fontSize: 11, cursor: 'grab', color: text1, userSelect: 'none',
                  }}>
                  <FaGripVertical size={8} style={{ color: text2 }} />
                  <span style={{ fontWeight: 500 }}>{col.nome}</span>
                  {typeBadge(col.tipo)}
                </div>
              ))}
            </div>

            {/* Eixo X */}
            {usaCategoria && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: '#1d4ed8', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</span>
                  <span style={{ color: text2, fontSize: 11, fontWeight: 600 }}>Eixo X — Categoria</span>
                </div>
                <div onDragOver={e => onDragOver(e, 'x')} onDragLeave={onDragLeave} onDrop={e => onDrop(e, 'x')}
                  style={{
                    minHeight: 44, borderRadius: 8, border: `2px dashed ${dropTarget === 'x' ? accent : border}`,
                    background: dropTarget === 'x' ? `${accent}11` : panelBg2,
                    display: 'flex', alignItems: 'center', padding: '0 12px', transition: 'all 0.15s',
                  }}>
                  {grafico.coluna_categoria !== undefined && colunas[grafico.coluna_categoria] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: accent, color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{colunas[grafico.coluna_categoria]}</span>
                      {typeBadge(analise[grafico.coluna_categoria]?.tipo ?? 'text')}
                      <span style={{ color: text2, fontSize: 10 }}>{analise[grafico.coluna_categoria]?.unicos} únicos</span>
                    </div>
                  ) : (
                    <span style={{ color: text2, fontSize: 11 }}>Arraste uma coluna aqui</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {analise.map(col => (
                    <button key={col.ci} onClick={() => update({ coluna_categoria: col.ci })}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                        background: grafico.coluna_categoria === col.ci ? accent : 'transparent',
                        color: grafico.coluna_categoria === col.ci ? '#fff' : text2,
                        border: `1px solid ${grafico.coluna_categoria === col.ci ? accent : border}`,
                      }}>{col.nome}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Eixo Y */}
            <div ref={dadosRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: '#166534', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Y</span>
                  <span style={{ color: text2, fontSize: 11, fontWeight: 600 }}>Eixo Y — Valores</span>
                </div>
                <button onClick={() => {
                  const prox = analise.find(c => c.tipo === 'number' && !grafico.series.some(s => s.coluna === c.ci) && c.ci !== grafico.coluna_categoria)
                  const paleta = PALETAS[paletaSelecionada].cores
                  const novaCor = paleta[grafico.series.length % paleta.length]
                  if (prox) update({ series: [...grafico.series, { id: uid(), label: prox.nome, coluna: prox.ci, operacao: 'sum', cor: novaCor }] })
                  else update({ series: [...grafico.series, { id: uid(), label: `Série ${grafico.series.length+1}`, coluna: 0, operacao: 'count', cor: novaCor }] })
                }} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0 }}>
                  <FaPlus size={9} /> Adicionar série
                </button>
              </div>
              <div onDragOver={e => onDragOver(e, 'y')} onDragLeave={onDragLeave} onDrop={e => onDrop(e, 'y')}
                style={{
                  minHeight: 50, borderRadius: 8,
                  border: `2px dashed ${hasError('series') ? '#ef4444' : (dropTarget === 'y' ? '#16a34a' : border)}`,
                  background: dropTarget === 'y' ? '#05471122' : (hasError('series') ? '#7f1d1d11' : panelBg2),
                  display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: '6px 12px', transition: 'all 0.15s',
                }}>
                {grafico.series.length === 0 ? (
                  <span style={{ color: hasError('series') ? '#ef4444' : text2, fontSize: 11 }}>
                    {hasError('series') ? '⚠️ Arraste pelo menos uma coluna numérica aqui' : 'Arraste colunas numéricas aqui'}
                  </span>
                ) : grafico.series.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 12, fontSize: 11, color: '#fff', fontWeight: 600, background: s.cor }}>
                    {s.label}
                    <button onClick={() => removeSerie(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, display: 'flex' }}>
                      <FaTimes size={8} />
                    </button>
                  </div>
                ))}
              </div>
              {hasError('series') && (
                <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaExclamationTriangle size={10} /> Adicione pelo menos uma série no eixo Y
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Seção: Séries ── */}
        {activeSection === 'series' && (
          <div style={{ padding: 16 }} ref={seriesRef}>
            {grafico.series.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: text2 }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>📊</div>
                <p style={{ fontSize: 12 }}>Nenhuma série configurada.</p>
                <p style={{ fontSize: 11, marginTop: 4, color: isDark ? '#475569' : '#94a3b8' }}>Vá para "Dados" e arraste colunas para o eixo Y.</p>
              </div>
            ) : grafico.series.map((s) => (
              <div key={s.id} style={{ marginBottom: 12, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: isDark ? `${s.cor}18` : `${s.cor}10`, borderBottom: `1px solid ${border}` }}>
                  <input type="color" value={s.cor} onChange={e => updateSerie(s.id, { cor: e.target.value })}
                    style={{ width: 24, height: 24, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0 }} />
                  <input value={s.label} onChange={e => updateSerie(s.id, { label: e.target.value })}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: text1, fontSize: 12, fontWeight: 700, outline: 'none' }} />
                  <button onClick={() => removeSerie(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                    <FaTrash size={11} />
                  </button>
                </div>
                <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: panelBg }}>
                  <div>
                    <label style={{ display: 'block', color: text2, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>Coluna</label>
                    <select value={s.coluna} onChange={e => updateSerie(s.id, { coluna: Number(e.target.value), label: colunas[Number(e.target.value)] ?? s.label })}
                      style={{ width: '100%', background: panelBg2, border: `1px solid ${border}`, color: text1, fontSize: 11, padding: '6px 8px', borderRadius: 6, outline: 'none' }}>
                      {colunas.map((col, ci) => <option key={ci} value={ci}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: text2, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>Operação</label>
                    <select value={s.operacao} onChange={e => updateSerie(s.id, { operacao: e.target.value as Operacao })}
                      style={{ width: '100%', background: panelBg2, border: `1px solid ${border}`, color: text1, fontSize: 11, padding: '6px 8px', borderRadius: 6, outline: 'none' }}>
                      {OPERACOES.map(op => <option key={op.id} value={op.id}>{op.short} {op.label}</option>)}
                    </select>
                  </div>
                  {['mul','div','pct'].includes(s.operacao) && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ display: 'block', color: text2, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>Coluna B</label>
                      <select value={s.coluna2 ?? 0} onChange={e => updateSerie(s.id, { coluna2: Number(e.target.value) })}
                        style={{ width: '100%', background: panelBg2, border: `1px solid ${border}`, color: text1, fontSize: 11, padding: '6px 8px', borderRadius: 6, outline: 'none' }}>
                        {colunas.map((col, ci) => <option key={ci} value={ci}>{col}</option>)}
                      </select>
                    </div>
                  )}
                  {usaMeta && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ display: 'block', color: text2, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>Meta (opcional)</label>
                      <input type="number" value={s.meta ?? ''} placeholder="Ex: 100000"
                        onChange={e => updateSerie(s.id, { meta: e.target.value ? Number(e.target.value) : undefined })}
                        style={{ width: '100%', background: panelBg2, border: `1px solid ${border}`, color: text1, fontSize: 11, padding: '6px 8px', borderRadius: 6, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', background: isDark ? '#052e16' : '#f0fdf4', borderRadius: 6, padding: '6px 10px', border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}` }}>
                    <span style={{ color: '#16a34a', fontSize: 10, fontWeight: 600 }}>Resultado atual</span>
                    <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800, fontFamily: 'monospace' }}>{fmtNum(calcularValor(linhas, s.coluna, s.operacao, s.coluna2))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Seção: Visual ── */}
        {activeSection === 'visual' && (
          <div style={{ padding: 16 }}>
            <p style={{ color: text2, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Paleta de cores</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PALETAS.map((paleta, pi) => (
                <button key={pi} onClick={() => {
                  setPaletaSelecionada(pi)
                  update({ series: grafico.series.map((s, si) => ({ ...s, cor: paleta.cores[si % paleta.cores.length] })) })
                }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: paletaSelecionada === pi ? (isDark ? `${accent}22` : `${accent}10`) : panelBg2,
                    border: `2px solid ${paletaSelecionada === pi ? accent : border}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {paleta.cores.slice(0, 6).map((cor, ci) => (
                      <div key={ci} style={{ width: 14, height: 14, borderRadius: 3, background: cor }} />
                    ))}
                  </div>
                  <span style={{ color: paletaSelecionada === pi ? accent : text2, fontSize: 12, fontWeight: 600 }}>{paleta.nome}</span>
                  {paletaSelecionada === pi && <FaCheck size={10} style={{ color: accent, marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>

            <p style={{ color: text2, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '16px 0 10px' }}>Cores individuais</p>
            {grafico.series.length === 0 ? (
              <p style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 11 }}>Configure séries primeiro.</p>
            ) : grafico.series.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <input type="color" value={s.cor} onChange={e => updateSerie(s.id, { cor: e.target.value })}
                  style={{ width: 36, height: 36, border: `2px solid ${border}`, borderRadius: 8, cursor: 'pointer', padding: 2, background: panelBg2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: text1, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.label}</p>
                  <p style={{ color: text2, fontSize: 10, fontFamily: 'monospace' }}>{s.cor}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: 16, borderTop: `1px solid ${border}`, background: panelBg3 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onCancelar}
              style={{ flex: 1, padding: '10px', background: 'transparent', color: text2, border: `1px solid ${border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={!!salvando}
              style={{
                flex: 2, padding: '10px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, border: 'none', transition: 'all 0.15s',
                background: `linear-gradient(135deg, ${accent}, #1d4ed8)`,
                color: '#fff',
                boxShadow: `0 4px 16px ${accent}44`,
                opacity: salvando ? 0.7 : 1,
              }}>
              {salvando ? 'Salvando...' : '✓ Salvar gráfico'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ Painel direito: Preview ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: previewBg }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? '#0a1628' : '#ffffff' }}>
          <div>
            <p style={{ color: text1, fontSize: 14, fontWeight: 700 }}>{grafico.titulo || 'Preview ao vivo'}</p>
            <p style={{ color: text2, fontSize: 11, marginTop: 3 }}>
              {TIPOS_INFO[grafico.tipo].label}
              {usaCategoria && grafico.coluna_categoria !== undefined && colunas[grafico.coluna_categoria] && (
                <> · X: <strong style={{ color: accent }}>{colunas[grafico.coluna_categoria]}</strong></>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {analise.filter(c => c.tipo === 'number').length > 0 && (
              <span style={{ fontSize: 10, padding: '3px 8px', background: isDark ? '#052e16' : '#f0fdf4', color: '#16a34a', borderRadius: 20, border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}` }}>
                {analise.filter(c => c.tipo === 'number').length} numéricas
              </span>
            )}
            <span style={{ fontSize: 10, padding: '3px 8px', background: panelBg2, color: text2, borderRadius: 20, border: `1px solid ${border}` }}>
              {linhas.length} reg.
            </span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
          <div style={{ width: '100%' }}>
            <RenderGrafico grafico={grafico} linhasPorTabela={linhasPorTabela} tabelas={tabelas} highContrast={highContrast} />
          </div>
        </div>

        {grafico.series.length === 0 && (
          <div style={{ padding: '0 24px 20px', textAlign: 'center', color: text2, fontSize: 12 }}>
            👈 Arraste colunas nos eixos X e Y para começar
          </div>
        )}
      </div>
    </div>
  )
}