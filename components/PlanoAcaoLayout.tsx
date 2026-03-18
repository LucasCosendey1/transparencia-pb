'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import {
  FaHome, FaCog, FaEye, FaEdit, FaSave, FaTimes, FaSearch,
  FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight,
} from 'react-icons/fa'

interface Recomendacao {
  id: number
  pagina_id: string
  codigo: string
  recomendacao: string
  acoes_adotadas: string | null
  prazo: string | null
  responsavel: string | null
  beneficio: string | null
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
  ordem: number
}

interface Grafico {
  id: number
  titulo: string
  tipo: 'barra' | 'pizza' | 'card'
  filtro_area: string | null
  filtro_status: string | null
  filtro_responsavel: string | null
  ordem: number
}

interface Props {
  paginaId: string
  breadcrumb: string
}

const AREAS = [
  { label: 'Governança e Gestão', codigos: ['R.3','R.4','R.6','R.7','R.8','R.9','R.10'] },
  { label: 'Educação Infantil', codigos: ['R.15','R.16','R.17'] },
  { label: 'Saúde Materno-Infantil', codigos: ['R.18','R.19','R.20','R.23'] },
  { label: 'Saneamento Básico', codigos: ['R.26','R.28'] },
  { label: 'Alimentação e Assistência', codigos: ['R.29','R.31','R.32','R.35'] },
]

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

const PER_PAGE = 10

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
      <span className="text-xs text-gray-500">Registro(s) {total === 0 ? 0 : from} ao {to} de um total de {total}</span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => onChange(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleLeft size={11} /></button>
          <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleLeft size={11} /></button>
          {pages.map(p => (
            <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded text-xs font-medium transition ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{p}</button>
          ))}
          <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleRight size={11} /></button>
          <button onClick={() => onChange(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600"><FaAngleDoubleRight size={11} /></button>
        </div>
      )}
    </div>
  )
}

    function PizzaSVG({ conc, and, nao, tot }: { conc: number; and: number; nao: number; tot: number }) {
    if (tot === 0) return <p className="text-xs text-gray-400 text-center py-8">Sem dados ainda</p>
    const data = [
        { key: 'concluido', value: conc, color: '#22c55e' },
        { key: 'em_andamento', value: and, color: '#3b82f6' },
        { key: 'nao_iniciado', value: nao, color: '#9ca3af' },
    ].filter(d => d.value > 0)

    // se só tem uma fatia, desenha círculo completo
    if (data.length === 1) {
        return (
        <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
            <circle cx="80" cy="80" r="70" fill={data[0].color} />
            <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="white">{data[0].value}</text>
        </svg>
        )
    }

    const cx = 80, cy = 80, r = 70
    let angle = -Math.PI / 2
    return (
        <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
        {data.map(d => {
            const pct = d.value / tot
            const start = angle
            angle += pct * 2 * Math.PI
            const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
            const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle)
            const mid = (start + angle) / 2
            return (
            <g key={d.key}>
                <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`}
                fill={d.color} stroke="white" strokeWidth="2" />
                {pct > 0.08 && (
                <text x={cx + r * 0.6 * Math.cos(mid)} y={cy + r * 0.6 * Math.sin(mid)}
                    textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="white">{d.value}</text>
                )}
            </g>
            )
        })}
        </svg>
    )
    }

export default function PlanoAcaoLayout({ paginaId, breadcrumb }: Props) {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [abaAdmin, setAbaAdmin] = useState<'recomendacoes' | 'graficos'>('recomendacoes')

  const [itens, setItens] = useState<Recomendacao[]>([])
  const [graficos, setGraficos] = useState<Grafico[]>([])
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Recomendacao>>({})
  const [graficoForm, setGraficoForm] = useState<Partial<Grafico>>({})
  const [editandoGrafico, setEditandoGrafico] = useState<number | null>(null)
  const [criandoGrafico, setCriandoGrafico] = useState(false)

  const [busca, setBusca] = useState('')
  const [buscaTemp, setBuscaTemp] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [page, setPage] = useState(1)

  const hc = highContrast
  const adjustFontSize = (n: number) => setFontSize(p => Math.max(12, Math.min(24, p + n)))

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregar()
  }, [])

  const carregar = async () => {
    setLoading(true)
    try {
      const [rI, rG] = await Promise.all([
        fetch(`/api/plano-acao/${paginaId}`),
        fetch(`/api/plano-acao-graficos/${paginaId}`),
      ])
      const [dI, dG] = await Promise.all([rI.json(), rG.json()])
      setItens(Array.isArray(dI) ? dI : [])
      setGraficos(Array.isArray(dG) ? dG : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const salvar = async () => {
    if (!form.id) return
    setSalvando(true)
    try {
      await fetch(`/api/plano-acao/${paginaId}`, {
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
      await fetch(`/api/plano-acao-graficos/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graficoForm),
      })
      await carregar(); setGraficoForm({}); setEditandoGrafico(null); setCriandoGrafico(false)
    } catch { alert('❌ Erro.') } finally { setSalvando(false) }
  }

  const deletarGrafico = async (id: number) => {
    if (!confirm('Deletar este gráfico?')) return
    await fetch(`/api/plano-acao-graficos/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar()
  }

  const total = itens.length
  const concluidas = itens.filter(i => i.status === 'concluido').length
  const emAndamento = itens.filter(i => i.status === 'em_andamento').length
  const naoIniciadas = itens.filter(i => i.status === 'nao_iniciado').length
  const pctGeral = total > 0 ? Math.round((concluidas / total) * 100) : 0

  const filtrados = itens.filter(i => {
    if (statusFiltro && i.status !== statusFiltro) return false
    if (busca.trim()) {
      const t = busca.toLowerCase()
      return i.recomendacao.toLowerCase().includes(t) ||
        i.codigo.toLowerCase().includes(t) ||
        (i.acoes_adotadas || '').toLowerCase().includes(t) ||
        (i.responsavel || '').toLowerCase().includes(t) ||
        STATUS_LABEL[i.status].toLowerCase().includes(t)
    }
    return true
  })
  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pesquisar = () => { setBusca(buscaTemp); setPage(1) }

  const responsaveisMap = itens.filter(i => i.responsavel).reduce((acc, i) => {
    const r = i.responsavel!
    if (!acc[r]) acc[r] = { total: 0, concluido: 0, em_andamento: 0 }
    acc[r].total++
    if (i.status === 'concluido') acc[r].concluido++
    if (i.status === 'em_andamento') acc[r].em_andamento++
    return acc
  }, {} as Record<string, { total: number; concluido: number; em_andamento: number }>)

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
          ) : (
            <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>

              <div className={`w-full px-8 py-10 ${hc ? 'bg-blue-950' : 'bg-blue-700'}`}>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
                  Prefeitura Municipal de Itabaiana · TCE/PB
                </p>
                <h1 className="text-white text-3xl font-bold mb-4 leading-tight">Plano de Ação</h1>
                <p className="text-blue-100 text-base leading-relaxed max-w-3xl mb-3">
                  Esta página apresenta as recomendações do Tribunal de Contas do Estado da Paraíba (TCE/PB)
                  e as ações adotadas pelo município de Itabaiana em resposta a cada determinação.
                </p>
                <p className="text-blue-200 text-base leading-relaxed max-w-3xl">
                  Acompanhe o andamento de cada compromisso com total transparência e acesso público à população.
                </p>
              </div>

              <div className="p-6 space-y-8">

                {/* KPIs */}
                <section>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Total', value: total, cls: 'border-gray-200 bg-gray-50', text: 'text-gray-800' },
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
                  <div className={`${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>Progresso geral</span>
                      <span className="text-sm font-bold text-green-600">{pctGeral}% concluído</span>
                    </div>
                    <div className={`w-full rounded-full h-4 overflow-hidden ${hc ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className="h-4 rounded-full bg-green-500 transition-all duration-700" style={{ width: `${pctGeral}%` }} />
                    </div>
                  </div>
                </section>

                {/* Análises fixas — só na view pública */}
                {!painelAberto && (
                  <section>
                    <h2 className={`text-2xl font-bold mb-6 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Análises</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <div className={`rounded-xl p-5 border ${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-sm font-semibold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>Distribuição por Status</p>
                        <PizzaSVG conc={concluidas} and={emAndamento} nao={naoIniciadas} tot={total} />
                        <div className="mt-3 space-y-1">
                          {[
                            { label: 'Concluído', value: concluidas, color: 'bg-green-500' },
                            { label: 'Em andamento', value: emAndamento, color: 'bg-blue-500' },
                            { label: 'Não iniciado', value: naoIniciadas, color: 'bg-gray-400' },
                          ].map(l => (
                            <div key={l.label} className="flex items-center gap-2 text-xs">
                              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${l.color}`} />
                              <span className={hc ? 'text-yellow-200' : 'text-gray-600'}>{l.label}</span>
                              <span className={`ml-auto font-bold ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{l.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`rounded-xl p-5 border ${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-sm font-semibold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>Progresso por Área Temática</p>
                        <div className="space-y-3">
                          {AREAS.map(area => {
                            const ms = itens.filter(i => area.codigos.includes(i.codigo))
                            const conc = ms.filter(i => i.status === 'concluido').length
                            const and = ms.filter(i => i.status === 'em_andamento').length
                            const nao = ms.filter(i => i.status === 'nao_iniciado').length
                            const tot = ms.length
                            return (
                              <div key={area.label}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-xs font-medium truncate max-w-[70%] ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>{area.label}</span>
                                  <span className={`text-xs ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>{tot} rec.</span>
                                </div>
                                <div className="flex h-5 rounded-lg overflow-hidden gap-0.5">
                                  {conc > 0 && <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(conc/tot)*100}%` }}>{conc}</div>}
                                  {and > 0 && <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(and/tot)*100}%` }}>{and}</div>}
                                  {nao > 0 && <div className="bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold" style={{ width: `${(nao/tot)*100}%` }}>{nao}</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex gap-3 mt-4 text-xs flex-wrap">
                          {[{cls:'bg-green-500',label:'Concluído'},{cls:'bg-blue-500',label:'Em andamento'},{cls:'bg-gray-300',label:'Não iniciado'}].map(l => (
                            <span key={l.label} className="flex items-center gap-1.5">
                              <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
                              <span className={hc ? 'text-yellow-200' : 'text-gray-600'}>{l.label}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`rounded-xl p-5 border ${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-sm font-semibold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>Por Responsável</p>
                        <div className="space-y-2">
                          {Object.entries(responsaveisMap).sort((a,b) => b[1].total - a[1].total).slice(0, 6).map(([resp, data]) => (
                            <div key={resp}>
                              <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-xs truncate max-w-[70%] ${hc ? 'text-yellow-200' : 'text-gray-700'}`} title={resp}>{resp}</span>
                                <div className="flex gap-1 text-xs">
                                  {data.concluido > 0 && <span className="text-green-600 font-bold">✓{data.concluido}</span>}
                                  {data.em_andamento > 0 && <span className="text-blue-600 font-bold">▶{data.em_andamento}</span>}
                                </div>
                              </div>
                              <div className={`w-full rounded-full h-2 ${hc ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${(data.total / total) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                          {itens.filter(i => !i.responsavel).length > 0 && (
                            <p className={`text-xs mt-2 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>
                              {itens.filter(i => !i.responsavel).length} sem responsável definido
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Gráficos customizados */}
                {graficos.length > 0 && !painelAberto && (
                  <section>
                    <h2 className={`text-2xl font-bold mb-6 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Análises Customizadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {graficos.map(g => {
                        let ms = itens
                        if (g.filtro_area) ms = ms.filter(i => AREAS.find(a => a.label === g.filtro_area)?.codigos.includes(i.codigo) ?? false)
                        if (g.filtro_status) ms = ms.filter(i => i.status === g.filtro_status)
                        if (g.filtro_responsavel) ms = ms.filter(i => i.responsavel === g.filtro_responsavel)
                        const conc = ms.filter(i => i.status === 'concluido').length
                        const and = ms.filter(i => i.status === 'em_andamento').length
                        const nao = ms.filter(i => i.status === 'nao_iniciado').length
                        const tot = ms.length
                        return (
                          <div key={g.id} className={`rounded-xl p-5 border ${hc ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-sm font-semibold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>{g.titulo}</p>
                            {g.tipo === 'pizza' && <PizzaSVG conc={conc} and={and} nao={nao} tot={tot} />}
                            {g.tipo === 'barra' && (
                              <div className="space-y-2">
                                {AREAS.filter(a => !g.filtro_area || a.label === g.filtro_area).map(area => {
                                  const ams = itens.filter(i => area.codigos.includes(i.codigo) && (!g.filtro_status || i.status === g.filtro_status))
                                  const ac = ams.filter(i => i.status === 'concluido').length
                                  const aa = ams.filter(i => i.status === 'em_andamento').length
                                  const an = ams.filter(i => i.status === 'nao_iniciado').length
                                  const at = ams.length
                                  if (at === 0) return null
                                  return (
                                    <div key={area.label}>
                                      <div className="flex justify-between text-xs mb-0.5">
                                        <span className={hc ? 'text-yellow-200' : 'text-gray-700'}>{area.label}</span>
                                        <span className={hc ? 'text-yellow-300' : 'text-gray-500'}>{at}</span>
                                      </div>
                                      <div className="flex h-4 rounded overflow-hidden gap-0.5">
                                        {ac > 0 && <div className="bg-green-500" style={{ width: `${(ac/at)*100}%` }} />}
                                        {aa > 0 && <div className="bg-blue-500" style={{ width: `${(aa/at)*100}%` }} />}
                                        {an > 0 && <div className="bg-gray-300" style={{ width: `${(an/at)*100}%` }} />}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            {g.tipo === 'card' && (
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { label: 'Concluído', value: conc, cls: 'bg-green-50 border-green-200', text: 'text-green-700' },
                                  { label: 'Em andamento', value: and, cls: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                                  { label: 'Não iniciado', value: nao, cls: 'bg-gray-50 border-gray-200', text: 'text-gray-500' },
                                ].map(c => (
                                  <div key={c.label} className={`rounded-xl p-3 text-center border ${c.cls}`}>
                                    <div className={`text-2xl font-bold ${c.text}`}>{c.value}</div>
                                    <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className={`text-xs mt-3 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>{tot} recomendação(ões)</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                <hr className={hc ? 'border-gray-700' : 'border-gray-100'} />

                {/* Seção Recomendações */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-gray-900'}`}>Recomendações</h2>

                  <div className="flex flex-wrap gap-3 mb-4 items-end">
                    <div className="flex flex-1 min-w-[200px]">
                      <input type="text" value={buscaTemp}
                        onChange={e => setBuscaTemp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && pesquisar()}
                        placeholder="Pesquisar por recomendação, código ou status..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={pesquisar}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap">
                        <FaSearch size={11} /> Pesquisar
                      </button>
                    </div>
                    <select value={statusFiltro} onChange={e => { setStatusFiltro(e.target.value); setPage(1) }}
                      className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Todos os status</option>
                      <option value="nao_iniciado">Não Iniciado</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                    {(statusFiltro || busca) && (
                      <button onClick={() => { setStatusFiltro(''); setBusca(''); setBuscaTemp(''); setPage(1) }}
                        className="px-3 py-2 bg-gray-100 text-black text-sm rounded hover:bg-gray-200 flex items-center gap-1">
                        <FaTimes size={10} /> Limpar filtros
                      </button>
                    )}
                  </div>

                  {painelAberto && (
                    <div className="flex border-b mb-4 -mx-6 px-6">
                      {([
                        { key: 'recomendacoes', label: 'Recomendações' },
                        { key: 'graficos', label: 'Gráficos' },
                      ] as const).map(a => (
                        <button key={a.key} onClick={() => setAbaAdmin(a.key)}
                          className={`px-5 py-2 text-sm font-medium border-b-2 transition ${
                            abaAdmin === a.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-black hover:text-gray-700'
                          }`}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {painelAberto && abaAdmin === 'graficos' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-black">Gráficos Customizados</h3>
                        <button onClick={() => { setCriandoGrafico(true); setEditandoGrafico(null); setGraficoForm({ tipo: 'pizza', ordem: graficos.length + 1 }) }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                          + Novo Gráfico
                        </button>
                      </div>
                      {(criandoGrafico || editandoGrafico !== null) && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-black mb-3">{criandoGrafico ? 'Novo Gráfico' : 'Editar Gráfico'}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="text-xs text-black mb-1 block">Título *</label>
                              <input value={graficoForm.titulo || ''} onChange={e => setGraficoForm(p => ({ ...p, titulo: e.target.value }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="text-xs text-black mb-1 block">Tipo *</label>
                              <select value={graficoForm.tipo || ''} onChange={e => setGraficoForm(p => ({ ...p, tipo: e.target.value as Grafico['tipo'] }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Selecione...</option>
                                <option value="pizza">Pizza (distribuição por status)</option>
                                <option value="barra">Barra (progresso por área)</option>
                                <option value="card">Card numérico</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-black mb-1 block">Filtrar por Área</label>
                              <select value={graficoForm.filtro_area || ''} onChange={e => setGraficoForm(p => ({ ...p, filtro_area: e.target.value || null }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas as áreas</option>
                                {AREAS.map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-black mb-1 block">Filtrar por Status</label>
                              <select value={graficoForm.filtro_status || ''} onChange={e => setGraficoForm(p => ({ ...p, filtro_status: e.target.value || null }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos</option>
                                <option value="nao_iniciado">Não Iniciado</option>
                                <option value="em_andamento">Em andamento</option>
                                <option value="concluido">Concluído</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-black mb-1 block">Filtrar por Responsável</label>
                              <select value={graficoForm.filtro_responsavel || ''} onChange={e => setGraficoForm(p => ({ ...p, filtro_responsavel: e.target.value || null }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos</option>
                                {Array.from(new Set(itens.map(i => i.responsavel).filter(Boolean))).map(r => (
                                  <option key={r!} value={r!}>{r}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-black mb-1 block">Ordem</label>
                              <input type="number" value={graficoForm.ordem ?? ''} onChange={e => setGraficoForm(p => ({ ...p, ordem: Number(e.target.value) }))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button onClick={salvarGrafico} disabled={salvando}
                              className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-60">
                              <FaSave size={10} className="inline mr-1" />{salvando ? 'Salvando…' : 'Salvar'}
                            </button>
                            <button onClick={() => { setCriandoGrafico(false); setEditandoGrafico(null); setGraficoForm({}) }}
                              className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300">
                              <FaTimes size={10} className="inline mr-1" />Cancelar
                            </button>
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
                                {g.filtro_area && ` · Área: ${g.filtro_area}`}
                                {g.filtro_status && ` · Status: ${STATUS_LABEL[g.filtro_status]}`}
                                {g.filtro_responsavel && ` · Resp: ${g.filtro_responsavel}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditandoGrafico(g.id); setCriandoGrafico(false); setGraficoForm({ ...g }) }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FaEdit size={12} /></button>
                              <button onClick={() => deletarGrafico(g.id)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded"><FaTimes size={12} /></button>
                            </div>
                          </div>
                        ))}
                        {graficos.length === 0 && !criandoGrafico && (
                          <p className="text-sm text-gray-400 text-center py-8">Nenhum gráfico criado ainda.</p>
                        )}
                      </div>
                    </div>

                  ) : painelAberto ? (
                    <div className="space-y-4">
                      {itens.map(item => (
                        <div key={item.id} className={`border rounded-xl p-5 ${hc ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                          {editando === item.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.codigo}</span>
                                <p className={`text-sm font-medium ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>{item.recomendacao}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="text-xs text-black mb-1 block font-medium">Ações adotadas</label>
                                  <textarea value={form.acoes_adotadas || ''} onChange={e => setForm(p => ({ ...p, acoes_adotadas: e.target.value }))}
                                    rows={3} placeholder="Descreva as ações adotadas pelo município..."
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                </div>
                                <div>
                                  <label className="text-xs text-black mb-1 block font-medium">Prazo</label>
                                  <input value={form.prazo || ''} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))}
                                    placeholder="Ex: Dezembro/2025"
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                  <label className="text-xs text-black mb-1 block font-medium">Responsável</label>
                                  <input value={form.responsavel || ''} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                                    placeholder="Ex: Secretaria de Educação"
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                  <label className="text-xs text-black mb-1 block font-medium">Status</label>
                                  <select value={form.status || 'nao_iniciado'} onChange={e => setForm(p => ({ ...p, status: e.target.value as Recomendacao['status'] }))}
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="nao_iniciado">Não Iniciado</option>
                                    <option value="em_andamento">Em andamento</option>
                                    <option value="concluido">Concluído</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button onClick={salvar} disabled={salvando}
                                  className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1">
                                  <FaSave size={10} />{salvando ? 'Salvando…' : 'Salvar'}
                                </button>
                                <button onClick={() => { setEditando(null); setForm({}) }}
                                  className="px-4 py-2 bg-gray-200 text-black text-xs rounded hover:bg-gray-300 flex items-center gap-1">
                                  <FaTimes size={10} />Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.codigo}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                                </div>
                                <p className={`text-sm leading-relaxed mb-3 ${hc ? 'text-yellow-200' : 'text-gray-700'}`}>
                                  <strong>Recomendação:</strong> {item.recomendacao}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  {[
                                    { label: 'Ações adotadas', value: item.acoes_adotadas },
                                    { label: 'Prazo', value: item.prazo },
                                    { label: 'Responsável', value: item.responsavel },
                                  ].map(f => (
                                    <div key={f.label} className={`rounded-lg p-2 ${hc ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                                      <p className="font-semibold text-gray-500 mb-0.5">{f.label}</p>
                                      <p className={hc ? 'text-yellow-200' : 'text-gray-700'}>{f.value ? f.value : <span className="italic text-gray-400">Não preenchido</span>}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button onClick={() => { setEditando(item.id); setForm({ ...item }) }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded flex-shrink-0">
                                <FaEdit size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-sm">
                        <thead>
                          <tr className={`border-b-2 ${hc ? 'border-yellow-300' : 'border-gray-200'}`}>
                            <th className={`px-3 py-3 text-left font-semibold w-16 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Cód.</th>
                            <th className={`px-4 py-3 text-left font-semibold ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Recomendação TCE/PB</th>
                            <th className={`px-4 py-3 text-left font-semibold hidden md:table-cell ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Ações adotadas</th>
                            <th className={`px-3 py-3 text-left font-semibold w-28 hidden lg:table-cell ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Prazo</th>
                            <th className={`px-3 py-3 text-left font-semibold w-32 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginados.length === 0 ? (
                            <tr>
                              <td colSpan={5} className={`text-center py-12 ${hc ? 'text-yellow-200' : 'text-gray-400'}`}>
                                Nenhuma recomendação encontrada.
                              </td>
                            </tr>
                          ) : paginados.map((item, i) => (
                            <tr key={item.id} className={`border-b transition ${
                              hc ? 'border-gray-700 hover:bg-gray-800'
                                : i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                              <td className="px-3 py-3">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.codigo}</span>
                              </td>
                              <td className={`px-4 py-3 text-sm ${hc ? 'text-yellow-200' : 'text-gray-800'}`}>
                                <p className="leading-relaxed">{item.recomendacao}</p>
                                {item.beneficio && (
                                  <p className={`text-xs mt-1 ${hc ? 'text-yellow-300' : 'text-gray-400'}`}>
                                    <strong>Benefício esperado:</strong> {item.beneficio}
                                  </p>
                                )}
                              </td>
                              <td className={`px-4 py-3 hidden md:table-cell text-sm ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>
                                {item.acoes_adotadas || <span className="italic text-gray-400 text-xs">—</span>}
                              </td>
                              <td className={`px-3 py-3 hidden lg:table-cell text-xs ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>
                                {item.prazo || <span className="italic text-gray-400">—</span>}
                              </td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_PILL[item.status]}`}>
                                  {STATUS_LABEL[item.status]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Paginacao total={filtrados.length} page={page} perPage={PER_PAGE} onChange={setPage} />
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      <VLibrasWrapper />
    </div>
  )
}