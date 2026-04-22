// components/PdfPageLayout.tsx

'use client'

import GraficoEditor, { GraficoConfig, RenderGrafico } from '@/components/GraficoEditor'
import AbaTabelas from './AbaTabelas'
import AbaGerarPdf from './AbaGerarPdf'
import AbaHistorico from './AbaHistorico'
import AbaArquivos from './AbaArquivos'
import { FaFolderOpen } from 'react-icons/fa'
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import { usePreferences } from '@/contexts/PreferencesContext'
import {
  FaHome, FaFilePdf, FaDownload, FaPlus, FaTrash,
  FaSave, FaTimes, FaFileAlt, FaTable, FaLayerGroup,
  FaEye, FaCog, FaCheck, FaGripVertical, FaHistory,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaEdit,
  FaArrowUp, FaArrowDown, FaSearch, FaExpand, FaCompress, FaChartBar, FaFilter,
} from 'react-icons/fa'

// ── Tipos ─────────────────────────────────────────────────────

interface TabelaMeta {
  id: number
  nome_tabela: string
  titulo_tabela: string
  texto_intro: string
  texto_final: string
  colunas: string[]
  modo_exibicao: 'tabela' | 'lista' | 'pdf'
  colunas_pdf: number[]
  blocos_pdf?: BlocoPDF[]
  blocos_exibicao?: BlocoExibicao[]
  graficos?: GraficoConfig[]
  filtro_admin_inicio?: string | null
  filtro_admin_fim?: string | null
}

interface Linha {
  id: number
  dados: string[]
  created_at: string
}

interface BlocoPDF {
  id: string
  tipo: 'texto' | 'tabela'
  nome_tabela?: string
  conteudo?: string
}

interface BlocoExibicao {
  id: string
  tipo: 'texto' | 'tabela' | 'pdf' | 'grafico' | 'arquivo_ftp'
  nome_tabela?: string
  mostrar_data?: boolean
  coluna?: 1 | 2  
  linhaId?: string 
  nome_pdf?: string
  arquivo_ftp_url?: string
  arquivo_ftp_nome?: string
  grafico_id?: string
  conteudo?: string
  expandido?: boolean
  colunas_visiveis?: number[] 
  modo_cards?: boolean
}

interface PdfSalvo {
  nome_pdf: string
  pdf_base64: string
  updated_at: string
}

interface Props {
  paginaId: string
  titulo: string
  breadcrumb: string
}

type AbaAdmin = 'tabelas' | 'graficos' | 'gerar-pdf' | 'exibicao' | 'historico' | 'arquivos'

const uid = () => Math.random().toString(36).slice(2)
const PER_PAGE_VISITANTE = 50

const converterUrlArquivo = (texto: string) => {
  if (!texto) return texto
  if (texto.includes('transparencia.itabaiana.pb.gov.br/uploads/')) {
    const match = texto.match(/\/uploads\/(.+)$/)
    if (match) return `/api/ftp-file?path=${match[1]}`
  }
  if (texto.startsWith('/uploads/')) return `/api/ftp-file?path=${texto.substring(9)}`
  return texto
}



// ── Componente principal ──────────────────────────────────────

export default function PdfPageLayout({ paginaId, titulo, breadcrumb }: Props) {
  
  const { highContrast, fontSize } = usePreferences()
  const [isAdmin, setIsAdmin]           = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [abaAdmin, setAbaAdmin]         = useState<AbaAdmin>('tabelas')
  const [loading, setLoading]           = useState(true)
  const [salvando, setSalvando]         = useState(false)

  const [tabelas, setTabelas]           = useState<TabelaMeta[]>([])
  const [tabelaAtiva, setTabelaAtiva]   = useState<string>('')

  const [linhas, setLinhas]               = useState<Linha[]>([])
  const [linhasPorTabela, setLinhasPorTabela] = useState<Record<string, Linha[]>>({})

  const [dataInicio, setDataInicio]     = useState('')
  const [dataFim, setDataFim]           = useState('')
  const [filtroAdminInicio, setFiltroAdminInicio] = useState('')
  const [filtroAdminFim, setFiltroAdminFim]       = useState('')
  const [termoBusca, setTermoBusca]     = useState('')

  // Filtros por coluna na visualização visitante
  const [filtrosColunas, setFiltrosColunas] = useState<Record<string, string>>({})

  // Paginação por bloco de tabela
  const [paginasPorBloco, setPaginasPorBloco] = useState<Record<string, number>>({})
  const [sortPorBloco, setSortPorBloco] = useState<Record<string, { col: number; dir: 'asc' | 'desc' }>>({})

  const [pdfsSalvos, setPdfsSalvos] = useState<PdfSalvo[]>([])
  const [arquivosFTP, setArquivosFTP] = useState<Array<{nome: string, url: string}>>([])

  const [blocosExibicao, setBlocosExibicao] = useState<BlocoExibicao[]>([])
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null)

  const [graficos, setGraficos]         = useState<GraficoConfig[]>([])
  const [graficoEditando, setGraficoEditando] = useState<GraficoConfig | null>(null)

  const [formatoDownload, setFormatoDownload]   = useState('pdf')
  const [dropdownFormato, setDropdownFormato]   = useState(false)
  const [dropdownFonte, setDropdownFonte]       = useState(false)
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState<string[]>([])
  const [pdfsSelecionados, setPdfsSelecionados]       = useState<string[]>([])
  const arquivosFTPCarregado = useRef(false)
  
  const tabelaAtivaMeta = tabelas.find(t => t.nome_tabela === tabelaAtiva)
  const linhasFiltradas = termoBusca.trim()
    ? linhas.filter(l => l.dados.some(d => d?.toLowerCase().includes(termoBusca.toLowerCase())))
    : linhas

  const hc = highContrast

  // ── Fechar dropdowns ao clicar fora ──
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.dropdown-fonte') && !t.closest('.dropdown-formato')) {
        setDropdownFonte(false)
        setDropdownFormato(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregar()
  }, [])

  useEffect(() => {
    if (!tabelaAtiva || tabelas.length === 0) return
    const meta = tabelas.find(t => t.nome_tabela === tabelaAtiva)
    if (meta) {
      const di = meta.filtro_admin_inicio || ''
      const df = meta.filtro_admin_fim    || ''
      setDataInicio(di)
      setDataFim(df)
      setFiltroAdminInicio(di)
      setFiltroAdminFim(df)
      carregarLinhas(tabelaAtiva, di, df)
    }
  }, [tabelaAtiva])

  // Carrega arquivos FTP apenas se painel aberto OU se há blocos arquivo_ftp na página
  useEffect(() => {
  if (!painelAberto || !isAdmin || arquivosFTPCarregado.current) return
  carregarArquivosFTP()
  arquivosFTPCarregado.current = true
}, [painelAberto, isAdmin])

  const carregar = async () => {
    setLoading(true)
    try {
      const [rTab, rPdf, rTs] = await Promise.all([
        fetch(`/api/tabela/${paginaId}`),
        fetch(`/api/pdf/${paginaId}`),
        fetch(`/api/ultima-atualizacao`),
      ])
      const dTab = await rTab.json()
      const dPdf = await rPdf.json()
      const dTs  = await rTs.json()
      setUltimaAtualizacao(dTs[paginaId] ?? null)

      const lista: TabelaMeta[] = Array.isArray(dTab) ? dTab.map((t: any) => ({
        ...t,
        colunas:         Array.isArray(t.colunas)         ? t.colunas         : [],
        colunas_pdf:     Array.isArray(t.colunas_pdf)     ? t.colunas_pdf     : [],
        blocos_pdf:      Array.isArray(t.blocos_pdf)      ? t.blocos_pdf      : [],
        blocos_exibicao: Array.isArray(t.blocos_exibicao) ? t.blocos_exibicao : [],
        graficos:        Array.isArray(t.graficos)        ? t.graficos        : [],
        texto_intro:     t.texto_intro || '',
        texto_final:     t.texto_final || '',
        filtro_admin_inicio: t.filtro_admin_inicio || null,
        filtro_admin_fim:    t.filtro_admin_fim    || null,
      })) : []

      setTabelas(lista)
      const todosGraficos = lista.flatMap(t => t.graficos || [])
      setGraficos(todosGraficos)

      if (lista.length > 0) {
        setTabelaAtiva(lista[0].nome_tabela)
        const blocos: BlocoExibicao[] = lista[0].blocos_exibicao || []
        if (blocos.length) {
          setBlocosExibicao(blocos)
          const novasLinhas: Record<string, Linha[]> = {}
          for (const bloco of blocos) {
            if (bloco.tipo === 'tabela' && bloco.nome_tabela) {
              const metaBloco = lista.find(t => t.nome_tabela === bloco.nome_tabela)
              const di = metaBloco?.filtro_admin_inicio || ''
              const df = metaBloco?.filtro_admin_fim    || ''
              let url = `/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`
              if (di) url += `&data_inicio=${di}`
              if (df) url += `&data_fim=${df}`
              const r = await fetch(url)
              const d = await r.json()
              novasLinhas[bloco.nome_tabela] = Array.isArray(d) ? d : []
            }
          }
          setLinhasPorTabela(novasLinhas)

          // Só carrega arquivos FTP se houver blocos do tipo arquivo_ftp
          const temArquivoFTP = blocos.some(b => b.tipo === 'arquivo_ftp')
          if (temArquivoFTP) {
            const rArquivos = await fetch(`/api/arquivos-tabela/${paginaId}`)
            const dArquivos = await rArquivos.json()
            const pdfsFTP = Array.isArray(dArquivos)
              ? dArquivos.filter(a => a.tipo === 'application/pdf').map(a => ({ nome: a.nome, url: a.url }))
              : []
            setArquivosFTP(pdfsFTP)
              arquivosFTPCarregado.current = true
          }
        }
      }

      if (Array.isArray(dPdf)) {
        setPdfsSalvos(dPdf)
      } else if (dPdf?.pdf_base64) {
        setPdfsSalvos([{ nome_pdf: 'principal', pdf_base64: dPdf.pdf_base64, updated_at: dPdf.updated_at }])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const carregarArquivosFTP = async () => {
    try {
      const rArquivos = await fetch(`/api/arquivos-tabela/${paginaId}`)
      const dArquivos = await rArquivos.json()
      const pdfsFTP = Array.isArray(dArquivos)
        ? dArquivos.filter(a => a.tipo === 'application/pdf').map(a => ({ nome: a.nome, url: a.url }))
        : []
      setArquivosFTP(pdfsFTP)
    } catch (e) {
      console.error('❌ Erro ao carregar arquivos FTP:', e)
    }
  }

  const carregarLinhas = async (nome = tabelaAtiva, di = dataInicio, df = dataFim) => {
    try {
      let url = `/api/linhas/${paginaId}?nome_tabela=${nome}`
      if (di) url += `&data_inicio=${di}`
      if (df) url += `&data_fim=${df}`
      const r = await fetch(url)
      const d = await r.json()
      const dados = Array.isArray(d) ? d : []
      setLinhas(dados)
      setLinhasPorTabela(p => ({ ...p, [nome]: dados }))
    } catch (e) { console.error(e) }
  }

  const salvarMeta = async (meta: Partial<TabelaMeta> & { nome_tabela: string }) => {
    setSalvando(true)
    try {
      await fetch(`/api/tabela/${paginaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta),
      })
      setTabelas(p => p.map(t => t.nome_tabela === meta.nome_tabela ? { ...t, ...meta } : t))
    } catch { alert('❌ Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  const graficoVazio = (): GraficoConfig => ({
    id: uid(), tipo: 'barra_v' as const, titulo: '',
    nome_tabela: tabelas[0]?.nome_tabela || '',
    coluna_categoria: 0, series: [], aparecer_pagina: true, aparecer_pdf: false,
  })

  const salvarGrafico = async () => {
    if (!graficoEditando) return
    const novosGraficos = graficos.find(g => g.id === graficoEditando.id)
      ? graficos.map(g => g.id === graficoEditando.id ? graficoEditando : g)
      : [...graficos, graficoEditando]
    setGraficos(novosGraficos)
    setGraficoEditando(null)
    const metaAlvo = tabelas.find(t => t.nome_tabela === graficoEditando.nome_tabela) || tabelas[0]
    if (metaAlvo) {
      const graficosTabela = novosGraficos.filter(g => g.nome_tabela === metaAlvo.nome_tabela)
      await salvarMeta({ ...metaAlvo, graficos: graficosTabela })
    }
  }

  const deletarGrafico = async (id: string) => {
    if (!confirm('Deletar este gráfico?')) return
    const g = graficos.find(x => x.id === id)
    const novos = graficos.filter(x => x.id !== id)
    setGraficos(novos)
    if (g) {
      const meta = tabelas.find(t => t.nome_tabela === g.nome_tabela)
      if (meta) await salvarMeta({ ...meta, graficos: novos.filter(x => x.nome_tabela === g.nome_tabela) })
    }
  }

  const moverBloco = (arr: any[], setArr: any, idx: number, dir: 'cima' | 'baixo') => {
    setArr((p: any[]) => {
      const a = [...p]
      const ni = dir === 'cima' ? idx - 1 : idx + 1
      if (ni < 0 || ni >= a.length) return a
      ;[a[idx], a[ni]] = [a[ni], a[idx]]
      return a
    })
  }

  const salvarBlocosExibicao = async (blocos: BlocoExibicao[]) => {
    const metaAlvo = tabelas[0]
    if (!metaAlvo) {
      await fetch(`/api/tabela/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_tabela: 'principal', titulo_tabela: '', texto_intro: '', texto_final: '',
          colunas: [], modo_exibicao: 'tabela', colunas_pdf: [], blocos_pdf: [],
          graficos: [], blocos_exibicao: blocos,
        }),
      })
      setTabelas([{
        id: Date.now(), nome_tabela: 'principal', titulo_tabela: '', texto_intro: '',
        texto_final: '', colunas: [], modo_exibicao: 'tabela', colunas_pdf: [],
        graficos: [], blocos_exibicao: blocos,
      }])
      return
    }
    const metaAtualizada = { ...metaAlvo, blocos_exibicao: blocos }
    await fetch(`/api/tabela/${paginaId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaAtualizada),
    })
    setTabelas(p => p.map((t, i) => i === 0 ? metaAtualizada : t))
    setBlocosExibicao(blocos)
    alert('✅ Configuração de exibição salva!')
  }

  const gerarPDFDownload = async (linhasOverride?: Linha[]): Promise<string> => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const mx = 15; let y = 20
    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text(titulo, mx, y); y += 8
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, mx, y)
    doc.setTextColor(0); y += 10
    if (tabelaAtivaMeta) {
      const colsSel = tabelaAtivaMeta.colunas_pdf.length > 0 ? tabelaAtivaMeta.colunas_pdf : tabelaAtivaMeta.colunas.map((_, i) => i)
      const head = [colsSel.map(ci => tabelaAtivaMeta.colunas[ci])]
      const rows = (linhasOverride ?? linhasFiltradas)
      const body = rows.map(l => colsSel.map(ci => l.dados[ci] ?? ''))
      autoTable(doc, {
        startY: y, head, body, theme: 'grid',
        headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: 'bold', lineWidth: 0.3 },
        bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9, cellPadding: 3 }, margin: { left: mx, right: mx },
      })
    }
    return doc.output('datauristring').split(',')[1]
  }

  const baixar = async () => {
  const meta = tabelaAtivaMeta
  
  // Verifica se há blocos de tabela no modo exibição
  const temTabelaNaExibicao = blocosExibicao.some(b => b.tipo === 'tabela')
  
  if (formatoDownload === 'pdf') {
    const pdfsParaBaixar = pdfsSelecionados.length > 0
      ? pdfsSalvos.filter(p => pdfsSelecionados.includes(p.nome_pdf))
      : pdfsSalvos

    if (pdfsParaBaixar.length > 0) {
      for (const p of pdfsParaBaixar) {
        const a = document.createElement('a')
        a.href = `data:application/pdf;base64,${p.pdf_base64}`
        a.download = `${p.nome_pdf}.pdf`
        a.click()
      }
      return
    }

    if (!temTabelaNaExibicao) {
      alert('Nenhum PDF disponível para download.')
      return
    }

    const b64 = await gerarPDFDownload(linhasFiltradas)
    const a = document.createElement('a')
    a.href = `data:application/pdf;base64,${b64}`
    a.download = `${titulo}.pdf`
    a.click()
    return
  }

  if (!meta || !temTabelaNaExibicao) {
    alert('Nenhum dado disponível para exportar.')
    return
  }

  const rows = linhasFiltradas.map(l => l.dados)
  if (formatoDownload === 'json') {
    const blob = new Blob([JSON.stringify({ titulo: meta.titulo_tabela, colunas: meta.colunas, linhas: rows }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${titulo}.json`; a.click(); return
  }
  if (formatoDownload === 'csv') {
    const blob = new Blob([[meta.colunas.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${titulo}.csv`; a.click(); return
  }
  if (formatoDownload === 'txt') {
    const blob = new Blob([[meta.colunas.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${titulo}.txt`; a.click(); return
  }
  if (formatoDownload === 'xlsx') {
    const { utils, writeFile } = await import('xlsx')
    const ws = utils.aoa_to_sheet([meta.colunas, ...rows])
    const wb = utils.book_new(); utils.book_append_sheet(wb, ws, 'Dados')
    writeFile(wb, `${titulo}.xlsx`); return
  }
}

  // ── Helpers de paginação por bloco ──
  const getPaginaBloco = (blocoId: string) => paginasPorBloco[blocoId] ?? 1
  const setPaginaBloco = (blocoId: string, p: number) => setPaginasPorBloco(prev => ({ ...prev, [blocoId]: p }))

 const linhasAgrupadas = useMemo(() => {
  const grupos: BlocoExibicao[][] = []
  const visto = new Set<string>()
  for (const bloco of blocosExibicao) {
    if (visto.has(bloco.id)) continue
    visto.add(bloco.id)
    const filho = blocosExibicao.find(b => b.linhaId === bloco.id && !visto.has(b.id))
    if (filho) {
      visto.add(filho.id)
      grupos.push([bloco, filho])
    } else {
      grupos.push([bloco])
    }
  }
  return grupos
}, [blocosExibicao])

  // ── Render tabela visitante com paginação e filtros ──
  const renderTabelaVisitante = (bloco: BlocoExibicao) => {
    const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
    if (!meta) return null

    const colsVisiveis = bloco.colunas_visiveis && bloco.colunas_visiveis.length > 0
      ? bloco.colunas_visiveis
      : meta.colunas.map((_, i) => i)

    let linhasBloco = linhasPorTabela[bloco.nome_tabela!] || []

    if (termoBusca.trim()) {
      linhasBloco = linhasBloco.filter(l => l.dados.some(d => d?.toLowerCase().includes(termoBusca.toLowerCase())))
    }

    const chaveFiltro = `${bloco.id}`
    Object.entries(filtrosColunas).forEach(([chave, valor]) => {
      if (chave.startsWith(chaveFiltro + '_') && valor.trim()) {
        const ci = parseInt(chave.split('_').pop() || '0')
        linhasBloco = linhasBloco.filter(l => String(l.dados[ci] ?? '').toLowerCase().includes(valor.toLowerCase()))
      }
    })

    const sortInfo = sortPorBloco[bloco.id]
    if (sortInfo) {
      linhasBloco = [...linhasBloco].sort((a, b) => {
        const va = String(a.dados[sortInfo.col] ?? '')
        const vb = String(b.dados[sortInfo.col] ?? '')
        const na = parseFloat(va.replace(/[^\d,.\-]/g, '').replace(',', '.'))
        const nb = parseFloat(vb.replace(/[^\d,.\-]/g, '').replace(',', '.'))
        const ambosNumericos = va.trim() !== '' && vb.trim() !== '' && !isNaN(na) && !isNaN(nb)
        const cmp = ambosNumericos ? na - nb : va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' })
        return sortInfo.dir === 'asc' ? cmp : -cmp
      })
    }

    const totalPaginas = Math.ceil(linhasBloco.length / PER_PAGE_VISITANTE)
    const paginaAtual = getPaginaBloco(bloco.id)
    const linhasPagina = linhasBloco.slice((paginaAtual - 1) * PER_PAGE_VISITANTE, paginaAtual * PER_PAGE_VISITANTE)

    return (
      <div className="overflow-x-auto">
        {meta.texto_intro && <div className={`text-sm mb-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_intro }} />}
        {colsVisiveis.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {colsVisiveis.map(ci => (
              <div key={ci} className="flex flex-col">
                <label className={`text-xs mb-0.5 ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>{meta.colunas[ci]}</label>
                <input type="text" placeholder="Filtrar..."
                  value={filtrosColunas[`${chaveFiltro}_${ci}`] ?? ''}
                  onChange={e => setFiltrosColunas(prev => ({ ...prev, [`${chaveFiltro}_${ci}`]: e.target.value }))}
                  className={`px-2 py-1 text-xs border rounded w-32 ${hc ? 'bg-gray-800 border-yellow-300 text-yellow-300' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
            ))}
            {Object.keys(filtrosColunas).some(k => k.startsWith(chaveFiltro) && filtrosColunas[k]) && (
              <button onClick={() => setFiltrosColunas(prev => {
                const next = { ...prev }
                Object.keys(next).forEach(k => { if (k.startsWith(chaveFiltro)) delete next[k] })
                return next
              })} className="self-end px-2 py-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100">
                Limpar filtros
              </button>
            )}
          </div>
        )}
        <p className={`text-xs mb-2 ${hc ? 'text-yellow-200' : 'text-gray-500'}`}>
          {linhasBloco.length} registro(s){totalPaginas > 1 && ` — página ${paginaAtual} de ${totalPaginas}`}
        </p>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              {colsVisiveis.map((ci) => {
                const sorted = sortPorBloco[bloco.id]
                const isActive = sorted?.col === ci
                return (
                  <th key={ci}
                    onClick={() => setSortPorBloco(prev => ({ ...prev, [bloco.id]: { col: ci, dir: isActive && sorted.dir === 'asc' ? 'desc' : 'asc' } }))}
                    className="px-4 py-3 text-left font-semibold border border-blue-500 cursor-pointer select-none hover:bg-blue-700 transition">
                    <span className="flex items-center gap-1">
                      {meta.colunas[ci]}
                      {isActive ? (sorted.dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </span>
                  </th>
                )
              })}
              {(bloco.mostrar_data ?? false) && (
                <th className="px-4 py-3 text-left font-semibold border border-blue-500 text-xs">Adicionado em</th>
              )}
            </tr>
          </thead>
          <tbody>
            {linhasPagina.length === 0 ? (
              <tr><td colSpan={colsVisiveis.length + 1} className="text-center py-8 text-gray-400 text-sm">Nenhum registro encontrado.</td></tr>
            ) : linhasPagina.map((l, li) => (
              <tr key={l.id} className={li % 2 === 0 ? (hc ? 'bg-gray-800' : 'bg-gray-50') : (hc ? 'bg-gray-900' : 'bg-white')}>
                {colsVisiveis.map(ci => (
                  <td key={ci} className={`px-4 py-3 border ${hc ? 'border-gray-700 text-yellow-200' : 'border-gray-200 text-black'}`}>
                    {termoBusca && l.dados[ci]?.toLowerCase().includes(termoBusca.toLowerCase()) ? (
                      <span dangerouslySetInnerHTML={{ __html: converterUrlArquivo(l.dados[ci] || '').replace(new RegExp(`(${termoBusca})`, 'gi'), '<mark class="bg-yellow-200">$1</mark>') }} />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: converterUrlArquivo(l.dados[ci] || '') }} />
                    )}
                  </td>
                ))}
                {(bloco.mostrar_data ?? false) && (
                  <td className={`px-4 py-3 border text-xs ${hc ? 'border-gray-700 text-yellow-300' : 'border-gray-200 text-black'}`}>
                    {new Date(l.created_at).toLocaleString('pt-BR')}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <p className={`text-xs ${hc ? 'text-yellow-300' : 'text-gray-500'}`}>
              Mostrando {(paginaAtual - 1) * PER_PAGE_VISITANTE + 1}–{Math.min(paginaAtual * PER_PAGE_VISITANTE, linhasBloco.length)} de {linhasBloco.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPaginaBloco(bloco.id, 1)} disabled={paginaAtual === 1} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>«</button>
              <button onClick={() => setPaginaBloco(bloco.id, paginaAtual - 1)} disabled={paginaAtual === 1} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}><FaChevronLeft size={10} /></button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPaginas - 4, paginaAtual - 2)) + i
                return (
                  <button key={p} onClick={() => setPaginaBloco(bloco.id, p)}
                    className={`w-7 h-7 rounded text-xs font-medium ${p === paginaAtual ? (hc ? 'bg-yellow-300 text-black' : 'bg-blue-600 text-white') : (hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')}`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPaginaBloco(bloco.id, paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}><FaChevronRight size={10} /></button>
              <button onClick={() => setPaginaBloco(bloco.id, totalPaginas)} disabled={paginaAtual === totalPaginas} className={`px-2 py-1 rounded text-xs disabled:opacity-30 ${hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>»</button>
            </div>
          </div>
        )}
        {meta.texto_final && <div className={`text-sm mt-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_final }} />}
      </div>
    )
  }


  const COR_MES_CARDS = [
    'bg-blue-600','bg-purple-600','bg-green-700','bg-teal-600',
    'bg-cyan-600','bg-indigo-600','bg-orange-600','bg-yellow-600',
    'bg-amber-600','bg-lime-700','bg-emerald-600','bg-sky-700',
  ]

  const [cardsExpandidos, setCardsExpandidos] = useState<Set<string>>(new Set())

const renderCardsVisitante = (bloco: BlocoExibicao) => {
  const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
  if (!meta) return null

  const colsVisiveis = bloco.colunas_visiveis && bloco.colunas_visiveis.length > 0
    ? bloco.colunas_visiveis
    : meta.colunas.map((_, i) => i)

  const linhasBloco = linhasPorTabela[bloco.nome_tabela!] || []

  const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  // Agrupa por mês/ano usando created_at
  const grupos: Record<string, { mesNum: number; ano: number; label: string; linhas: Linha[] }> = {}
  for (const linha of linhasBloco) {
    const d = new Date(linha.created_at)
    const chave = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
    if (!grupos[chave]) grupos[chave] = {
      mesNum: d.getMonth(), ano: d.getFullYear(),
      label: `${MESES_NOME[d.getMonth()]} ${d.getFullYear()}`,
      linhas: [],
    }
    grupos[chave].linhas.push(linha)
  }

  const gruposOrdenados = Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]))
  const CARDS_PER_PAGE = 50
  const paginaCards = getPaginaBloco(`${bloco.id}_cards`)
  const totalPaginasCards = Math.ceil(gruposOrdenados.length / CARDS_PER_PAGE)
  const gruposPagina = gruposOrdenados.slice((paginaCards - 1) * CARDS_PER_PAGE, paginaCards * CARDS_PER_PAGE)

  return (
  <div>
    {meta.texto_intro && <div className={`text-sm mb-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_intro }} />}
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {gruposPagina.map(([chave, grupo]) => {
        const cardKey = `${bloco.id}_${chave}`
        const expandido = cardsExpandidos.has(cardKey)
        const cor = COR_MES_CARDS[grupo.mesNum]
        return (
          <div key={chave} className={`rounded-xl border-2 bg-white transition-all hover:shadow-md ${expandido ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400'}`}>
            <button onClick={() => setCardsExpandidos(prev => {
              const next = new Set(prev)
              next.has(cardKey) ? next.delete(cardKey) : next.add(cardKey)
              return next
            })} className="w-full text-left">
              <div className={`${cor} px-4 py-3 flex items-center gap-3 rounded-t-xl`}>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-center flex-shrink-0">
                  <div className="text-white text-2xl font-bold leading-none">{String(grupo.mesNum + 1).padStart(2,'0')}</div>
                  <div className="text-white/80 text-xs font-medium">{MESES_NOME[grupo.mesNum].slice(0,3).toUpperCase()}</div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{grupo.label}</div>
                  <div className="text-white/70 text-xs">{grupo.linhas.length} registro(s)</div>
                </div>
                <div className={`text-white/80 transition-transform ${expandido ? 'rotate-180' : ''}`}>
                  <FaChevronDown size={12} />
                </div>
              </div>
            </button>
          </div>
        )
      })}
    </div>

    {/* Tabela expandida — fora do grid, ocupa largura total */}
    {gruposPagina.map(([chave, grupo]) => {
      const cardKey = `${bloco.id}_${chave}`
      if (!cardsExpandidos.has(cardKey)) return null
      return (
        <div key={`tabela_${chave}`} className="mt-2 mb-6 overflow-x-auto border border-blue-200 rounded-xl">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                {colsVisiveis.map(ci => (
                  <th key={ci} className="px-4 py-3 text-left font-semibold border border-blue-500 whitespace-nowrap">
                    {meta.colunas[ci]}
                  </th>
                ))}
                {(bloco.mostrar_data ?? false) && (
                  <th className="px-4 py-3 text-left font-semibold border border-blue-500 text-xs whitespace-nowrap">Adicionado em</th>
                )}
              </tr>
            </thead>
            <tbody>
              {grupo.linhas.map((linha, li) => (
                <tr key={linha.id} className={li % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {colsVisiveis.map(ci => (
                    <td key={ci} className="px-4 py-3 border border-gray-200 text-black">
                      <span dangerouslySetInnerHTML={{ __html: converterUrlArquivo(linha.dados[ci] || '') }} />
                    </td>
                  ))}
                  {(bloco.mostrar_data ?? false) && (
                    <td className="px-4 py-3 border border-gray-200 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(linha.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    })}

    {totalPaginasCards > 1 && (
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <p className="text-xs text-gray-500">
          Mostrando {(paginaCards - 1) * CARDS_PER_PAGE + 1}–{Math.min(paginaCards * CARDS_PER_PAGE, gruposOrdenados.length)} de {gruposOrdenados.length} meses
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPaginaBloco(`${bloco.id}_cards`, 1)} disabled={paginaCards === 1} className="px-2 py-1 rounded text-xs disabled:opacity-30 text-gray-600 hover:bg-gray-100">«</button>
          <button onClick={() => setPaginaBloco(`${bloco.id}_cards`, paginaCards - 1)} disabled={paginaCards === 1} className="px-2 py-1 rounded text-xs disabled:opacity-30 text-gray-600 hover:bg-gray-100"><FaChevronLeft size={10} /></button>
          {Array.from({ length: Math.min(5, totalPaginasCards) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPaginasCards - 4, paginaCards - 2)) + i
            return (
              <button key={p} onClick={() => setPaginaBloco(`${bloco.id}_cards`, p)}
                className={`w-7 h-7 rounded text-xs font-medium ${p === paginaCards ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {p}
              </button>
            )
          })}
          <button onClick={() => setPaginaBloco(`${bloco.id}_cards`, paginaCards + 1)} disabled={paginaCards === totalPaginasCards} className="px-2 py-1 rounded text-xs disabled:opacity-30 text-gray-600 hover:bg-gray-100"><FaChevronRight size={10} /></button>
          <button onClick={() => setPaginaBloco(`${bloco.id}_cards`, totalPaginasCards)} disabled={paginaCards === totalPaginasCards} className="px-2 py-1 rounded text-xs disabled:opacity-30 text-gray-600 hover:bg-gray-100">»</button>
        </div>
      </div>
    )}

    {meta.texto_final && (
      <div className={`text-sm mt-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_final }} />
    )}
  </div>
)
}

  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header />

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

            /* ══════════════ PAINEL ADMIN ══════════════ */
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {([
                  { key: 'tabelas',   label: 'Tabelas',       icon: <FaTable size={12} /> },
                  { key: 'graficos',  label: 'Gráficos',      icon: <FaChartBar size={12} /> },
                  { key: 'gerar-pdf', label: 'Gerar PDF',     icon: <FaFilePdf size={12} /> },
                  { key: 'exibicao',  label: 'Modo Exibição', icon: <FaLayerGroup size={12} /> },
                  { key: 'arquivos',  label: 'Arquivos',      icon: <FaFolderOpen size={12} /> },
                  { key: 'historico', label: 'Histórico',     icon: <FaHistory size={12} /> },
                ] as { key: AbaAdmin; label: string; icon: React.ReactNode }[]).map(aba => (
                  <button key={aba.key} onClick={() => setAbaAdmin(aba.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                      abaAdmin === aba.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-black hover:text-gray-700'
                    }`}>
                    {aba.icon} {aba.label}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* ── ABA TABELAS ── */}
                {abaAdmin === 'tabelas' && (
                  <AbaTabelas
                    paginaId={paginaId} tabelas={tabelas} setTabelas={setTabelas}
                    tabelaAtiva={tabelaAtiva} setTabelaAtiva={setTabelaAtiva}
                    linhas={linhas} setLinhas={setLinhas}
                    linhasPorTabela={linhasPorTabela} setLinhasPorTabela={setLinhasPorTabela}
                    salvando={salvando} setSalvando={setSalvando}
                    salvarMeta={salvarMeta} carregarLinhas={carregarLinhas}
                  />
                )}

                {/* ── ABA GRÁFICOS ── */}
                {abaAdmin === 'graficos' && (
                  <div>
                    {!graficoEditando ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-semibold text-black">Gráficos configurados</p>
                          <button onClick={() => setGraficoEditando(graficoVazio())}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            <FaPlus size={9} /> Novo gráfico
                          </button>
                        </div>
                        {graficos.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed rounded-xl">Nenhum gráfico criado ainda.</p>
                        )}
                        <div className="space-y-2">
                          {graficos.map(g => (
                            <div key={g.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 transition">
                              <div>
                                <p className="text-sm font-medium text-black">{g.titulo}</p>
                                <p className="text-xs text-gray-500">{g.tipo} — {g.nome_tabela} — {g.series.length} série(s){g.aparecer_pagina && ' · Página'}{g.aparecer_pdf && ' · PDF'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setGraficoEditando({ ...g })} className="px-2 py-1 bg-gray-100 text-black text-xs rounded hover:bg-gray-200"><FaEdit size={9} /></button>
                                <button onClick={() => deletarGrafico(g.id)} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"><FaTrash size={9} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <GraficoEditor
                        tabelas={tabelas.map(t => ({ nome_tabela: t.nome_tabela, colunas: t.colunas }))}
                        linhasPorTabela={linhasPorTabela} grafico={graficoEditando}
                        onChange={setGraficoEditando} salvando={salvando}
                        onSalvar={salvarGrafico} onCancelar={() => setGraficoEditando(null)}
                      />
                    )}
                  </div>
                )}

                {/* ── ABA GERAR PDF ── */}
                {abaAdmin === 'gerar-pdf' && (
                  <AbaGerarPdf
                    paginaId={paginaId} titulo={titulo} tabelas={tabelas} setTabelas={setTabelas}
                    linhasPorTabela={linhasPorTabela} pdfsSalvos={pdfsSalvos} setPdfsSalvos={setPdfsSalvos}
                    salvando={salvando} setSalvando={setSalvando} salvarMeta={salvarMeta}
                  />
                )}

                {/* ── ABA MODO EXIBIÇÃO ── */}
                {abaAdmin === 'exibicao' && (
                  <>
                    <p className="text-sm text-black mb-4">Defina o que aparece na página e em qual ordem. Combine textos, tabelas, PDFs e gráficos.</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {[
                        { label: 'Texto', tipo: 'texto' as const },
                        { label: 'Tabela', tipo: 'tabela' as const },
                        { label: 'PDF', tipo: 'pdf' as const, disabled: pdfsSalvos.length === 0 },
                        { label: 'Arquivo FTP', tipo: 'arquivo_ftp' as const },
                        { label: 'Gráfico', tipo: 'grafico' as const, disabled: graficos.filter(g => g.aparecer_pagina).length === 0 },
                      ].map(({ label, tipo, disabled }) => (
                        <button key={tipo} disabled={disabled}
                          onClick={() => setBlocosExibicao(p => [...p, {
                            id: uid(), tipo,
                            nome_tabela: tipo === 'tabela' ? tabelas[0]?.nome_tabela : undefined,
                            nome_pdf: tipo === 'pdf' ? pdfsSalvos[0]?.nome_pdf : undefined,
                            arquivo_ftp_url: tipo === 'arquivo_ftp' ? arquivosFTP[0]?.url : undefined,
                            arquivo_ftp_nome: tipo === 'arquivo_ftp' ? arquivosFTP[0]?.nome : undefined,
                            grafico_id: tipo === 'grafico' ? graficos.filter(g => g.aparecer_pagina)[0]?.id : undefined,
                            colunas_visiveis: tipo === 'tabela' ? [] : undefined,
                          }])}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                          <FaPlus size={9} /> {label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6">
                      {blocosExibicao.map((bloco, idx) => {
                        const metaBloco = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
                        return (
                          <div key={bloco.id} className="border rounded-lg overflow-hidden">
                            {idx > 0 && (bloco.linhaId === undefined || bloco.linhaId === bloco.id) && (
                              <button onClick={() => {
                                const anterior = blocosExibicao[idx - 1]
                                const chaveAnterior = anterior.linhaId ?? anterior.id
                                setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, linhaId: chaveAnterior } : b))
                              }} className="text-blue-400 hover:text-blue-600 text-xs px-1" title="Colocar ao lado do anterior">⬅ Ao lado</button>
                            )}
                            {bloco.linhaId && bloco.linhaId !== bloco.id && (
                              <button onClick={() => {
                                setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, linhaId: undefined } : b))
                              }} className="text-gray-400 hover:text-gray-600 text-xs px-1" title="Separar em linha própria">↕ Separar</button>
                            )}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                              <div className="flex flex-col gap-0.5">
                                <button onClick={() => moverBloco(blocosExibicao, setBlocosExibicao, idx, 'cima')} disabled={idx === 0} className="text-black disabled:opacity-20"><FaArrowUp size={9} /></button>
                                <button onClick={() => moverBloco(blocosExibicao, setBlocosExibicao, idx, 'baixo')} disabled={idx === blocosExibicao.length - 1} className="text-black disabled:opacity-20"><FaArrowDown size={9} /></button>
                              </div>
                              <FaGripVertical className="text-gray-400" size={11} />
                              <span className="text-xs font-medium text-black flex-1">
                                {bloco.tipo === 'texto' ? '📝 Texto'
                                : bloco.tipo === 'tabela' ? `📊 Tabela: ${bloco.nome_tabela}`
                                : bloco.tipo === 'pdf' ? `📄 PDF: ${bloco.nome_pdf}`
                                : bloco.tipo === 'arquivo_ftp' ? `📎 Arquivo: ${bloco.arquivo_ftp_nome}`
                                : `📈 Gráfico: ${graficos.find(g => g.id === bloco.grafico_id)?.titulo ?? ''}`}
                              </span>
                              {bloco.tipo === 'texto' && (
                                <button onClick={() => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, expandido: !b.expandido } : b))}
                                  className="text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-xs flex items-center gap-1">
                                  {bloco.expandido ? <><FaCompress size={9} /> Compactar</> : <><FaExpand size={9} /> Expandir</>}
                                </button>
                              )}
                              <button onClick={() => setBlocosExibicao(p => p.filter(b => b.id !== bloco.id))} className="text-red-400 hover:text-red-600"><FaTimes size={11} /></button>
                            </div>
                            <div className="p-3 space-y-3">
                              {bloco.tipo === 'texto' ? (
                                <div contentEditable suppressContentEditableWarning
                                  onInput={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, conteudo: (e.target as HTMLDivElement).innerHTML } : b))}
                                  ref={el => { if (el && el.innerHTML === '') el.innerHTML = bloco.conteudo || '' }}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                  style={{ minHeight: bloco.expandido ? '200px' : '60px', color: '#000' }} />
                              ) : bloco.tipo === 'tabela' ? (
                                <>
                                  <select value={bloco.nome_tabela}
                                    onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, nome_tabela: e.target.value, colunas_visiveis: [] } : b))}
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
                                  </select>

                                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mt-2">
                                    <input
                                      type="checkbox"
                                      checked={bloco.modo_cards ?? false}
                                      onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, modo_cards: e.target.checked } : b))}
                                      className="w-3 h-3 accent-blue-600"
                                    />
                                    Exibir como cards
                                  </label>

                                  {/* Seleção de colunas visíveis */}
                                  {metaBloco && metaBloco.colunas.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1"><FaFilter size={9} /> Colunas visíveis na página (deixe todas desmarcadas para exibir todas):</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {metaBloco.colunas.map((col, ci) => {
                                          const selecionadas = bloco.colunas_visiveis ?? []
                                          const ativa = selecionadas.length === 0 || selecionadas.includes(ci)
                                          const marcada = selecionadas.includes(ci)
                                          return (
                                            <button key={ci}
                                              onClick={() => {
                                                const atual = bloco.colunas_visiveis ?? []
                                                const novas = marcada
                                                  ? atual.filter(x => x !== ci)
                                                  : [...atual, ci].sort((a, b) => a - b)
                                                setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, colunas_visiveis: novas } : b))
                                              }}
                                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition ${
                                                marcada ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-black border-gray-300 hover:border-blue-400'
                                              }`}>
                                              {marcada && <FaCheck size={7} />} {col}
                                            </button>
                                          )
                                        })}
                                        {(bloco.colunas_visiveis ?? []).length > 0 && (
                                          <button onClick={() => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, colunas_visiveis: [] } : b))}
                                            className="px-2 py-1 rounded-full text-xs border border-red-300 text-red-500 hover:bg-red-50">
                                            Limpar seleção
                                          </button>
                                        )}
                                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mt-2">
                                      <input
                                        type="checkbox"
                                        checked={bloco.mostrar_data ?? false}
                                        onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, mostrar_data: e.target.checked } : b))}
                                        className="w-3 h-3 accent-blue-600"
                                      />
                                      Exibir coluna "Adicionado em"
                                    </label>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : bloco.tipo === 'pdf' ? (
                                <select value={bloco.nome_pdf}
                                  onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, nome_pdf: e.target.value } : b))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                  {pdfsSalvos.map(p => <option key={p.nome_pdf} value={p.nome_pdf}>{p.nome_pdf}</option>)}
                                </select>
                              ) : bloco.tipo === 'arquivo_ftp' ? (
                                <select value={bloco.arquivo_ftp_url}
                                  onChange={e => {
                                    const arq = arquivosFTP.find(a => a.url === e.target.value)
                                    setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, arquivo_ftp_url: e.target.value, arquivo_ftp_nome: arq?.nome } : b))
                                  }}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                  {arquivosFTP.map(a => <option key={a.url} value={a.url}>{a.nome}</option>)}
                                </select>
                              ) : (
                                <select value={bloco.grafico_id}
                                  onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, grafico_id: e.target.value } : b))}
                                  className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                  {graficos.filter(g => g.aparecer_pagina).map(g => <option key={g.id} value={g.id}>{g.titulo}</option>)}
                                </select>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <button onClick={() => salvarBlocosExibicao(blocosExibicao)} disabled={salvando}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60">
                      <FaSave size={11} /> {salvando ? 'Salvando…' : 'Aplicar configuração de exibição'}
                    </button>
                  </>
                )}

                {abaAdmin === 'arquivos' && <AbaArquivos paginaId={paginaId} />}

                {abaAdmin === 'historico' && (
                  <AbaHistorico
                    linhasPorTabela={linhasPorTabela} blocosExibicao={blocosExibicao}
                    tabelas={tabelas} linhas={linhas} tabelaAtivaMeta={tabelaAtivaMeta}
                    salvando={salvando} setSalvando={setSalvando}
                    salvarMeta={salvarMeta} carregarLinhas={carregarLinhas} tabelaAtiva={tabelaAtiva}
                  />
                )}
              </div>
            </div>

          ) : (

            /* ══════════════ VISUALIZAÇÃO VISITANTE ══════════════ */
            <>
              {tabelas.length === 0 ? (
                <div className={`${hc ? 'bg-gray-900 text-yellow-300' : 'bg-white text-black'} rounded-lg shadow-md p-12 text-center`}>
                  <FaFileAlt className="mx-auto text-5xl mb-4 opacity-30" />
                  <p>Conteúdo em breve.</p>
                </div>
              ) : (
                <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>

                  {/* Cabeçalho filtros + busca + download */}
                  <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${hc ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-wrap items-end gap-3">
                      {tabelas.length > 1 && (
                        <select value={tabelaAtiva} onChange={e => setTabelaAtiva(e.target.value)}
                          className="px-3 py-1.5 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
                        </select>
                      )}

                      {/* Filtro de datas */}
                      <div>
                        <label className={`block text-xs mb-1 ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>De</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                          className="px-3 py-1.5 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ colorScheme: 'light', color: '#000' }} />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${hc ? 'text-yellow-200' : 'text-gray-600'}`}>Até</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                          className="px-3 py-1.5 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ colorScheme: 'light', color: '#000' }} />
                      </div>
                      <button onClick={async () => {
                        const novas: Record<string, Linha[]> = {}
                        for (const bloco of blocosExibicao) {
                          if (bloco.tipo === 'tabela' && bloco.nome_tabela) {
                            let url = `/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`
                            if (dataInicio) url += `&data_inicio=${dataInicio}`
                            if (dataFim) url += `&data_fim=${dataFim}`
                            const r = await fetch(url); const d = await r.json()
                            novas[bloco.nome_tabela] = Array.isArray(d) ? d : []
                          }
                        }
                        if (Object.keys(novas).length > 0) setLinhasPorTabela(novas)
                        else carregarLinhas(tabelaAtiva, dataInicio, dataFim)
                        setPaginasPorBloco({})
                        setSortPorBloco({})
                      }} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Filtrar</button>
                      <button onClick={async () => {
                        setDataInicio(filtroAdminInicio); setDataFim(filtroAdminFim)
                        const novas: Record<string, Linha[]> = {}
                        for (const bloco of blocosExibicao) {
                          if (bloco.tipo === 'tabela' && bloco.nome_tabela) {
                            const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
                            const di = meta?.filtro_admin_inicio || ''
                            const df = meta?.filtro_admin_fim    || ''
                            let url = `/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`
                            if (di) url += `&data_inicio=${di}`
                            if (df) url += `&data_fim=${df}`
                            const r = await fetch(url); const d = await r.json()
                            novas[bloco.nome_tabela] = Array.isArray(d) ? d : []
                          }
                        }
                        if (Object.keys(novas).length > 0) setLinhasPorTabela(novas)
                        else carregarLinhas(tabelaAtiva, filtroAdminInicio, filtroAdminFim)
                        setPaginasPorBloco({})
                        setFiltrosColunas({})
                        setSortPorBloco({})
                      }} className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">Limpar</button>

                      {/* Busca geral */}
                      <div className="relative">
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
                        <input type="text" value={termoBusca} onChange={e => { setTermoBusca(e.target.value); setPaginasPorBloco({}) }}
                          placeholder="Buscar..." className="pl-7 pr-3 py-1.5 border rounded text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
                      </div>

                      {/* Download */}
                      <div className="flex">
                        <div className="relative dropdown-fonte">
                          <button onClick={() => setDropdownFonte(v => !v)}
                            className="flex items-center gap-1 px-3 py-1.5 border-y border-l rounded-l text-sm border-gray-300 text-black bg-white">
                            {tabelasSelecionadas.length === 0 && pdfsSelecionados.length === 0 ? 'Tudo' : `${tabelasSelecionadas.length + pdfsSelecionados.length} selecionado(s)`} <FaChevronDown size={8} />
                          </button>
                          {dropdownFonte && (
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[180px]">
                              <div className="px-3 py-2 border-b">
                                <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                  <input type="checkbox" checked={tabelasSelecionadas.length === 0 && pdfsSelecionados.length === 0}
                                    onChange={() => { setTabelasSelecionadas([]); setPdfsSelecionados([]) }} /> Tudo
                                </label>
                              </div>
                              {tabelas.map(t => (
                                <div key={t.nome_tabela} className="px-3 py-2 hover:bg-gray-50">
                                  <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                    <input type="checkbox" checked={tabelasSelecionadas.includes(t.nome_tabela)}
                                      onChange={e => setTabelasSelecionadas(p => e.target.checked ? [...p, t.nome_tabela] : p.filter(x => x !== t.nome_tabela))} /> 📊 {t.nome_tabela}
                                  </label>
                                </div>
                              ))}
                              {pdfsSalvos.map(p => (
                                <div key={p.nome_pdf} className="px-3 py-2 hover:bg-gray-50">
                                  <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                    <input type="checkbox" checked={pdfsSelecionados.includes(p.nome_pdf)}
                                      onChange={e => setPdfsSelecionados(p2 => e.target.checked ? [...p2, p.nome_pdf] : p2.filter(x => x !== p.nome_pdf))} /> 📄 {p.nome_pdf}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative dropdown-formato">
                          <button onClick={() => setDropdownFormato(v => !v)}
                            className="flex items-center gap-1 px-3 py-1.5 border text-sm border-gray-300 text-black bg-white">
                            {formatoDownload.toUpperCase()} <FaChevronDown size={8} />
                          </button>
                          {dropdownFormato && (
                            <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[90px]">
                              {['pdf', 'xlsx', 'csv', 'json', 'txt'].map(f => (
                                <button key={f} onClick={() => { setFormatoDownload(f); setDropdownFormato(false) }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${formatoDownload === f ? 'text-blue-600 font-medium' : 'text-black'}`}>
                                  {f.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={baixar}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-r border border-blue-600">
                          <FaDownload size={11} /> Baixar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    {blocosExibicao.length > 0 ? (
                      linhasAgrupadas.map((grupo, gi) => (
                      <div key={gi} className={`mb-8 ${grupo.length === 2 ? 'flex gap-4' : ''}`}>
                        {grupo.map(bloco => (
  <div key={bloco.id} className={grupo.length === 2 ? 'flex-1 min-w-0' : ''}>
    {bloco.tipo === 'texto' && bloco.conteudo && (
      <div className={`text-sm ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: bloco.conteudo }} />
    )}
    {bloco.tipo === 'grafico' && (() => {
      const g = graficos.find(x => x.id === bloco.grafico_id)
      if (!g) return null
      return <RenderGrafico grafico={g} linhasPorTabela={linhasPorTabela} tabelas={tabelas} />
    })()}
    {bloco.tipo === 'tabela' && (bloco.modo_cards ? renderCardsVisitante(bloco) : renderTabelaVisitante(bloco))}
    {bloco.tipo === 'pdf' && (() => {
      const pdf = pdfsSalvos.find(p => p.nome_pdf === bloco.nome_pdf)
      if (!pdf) return null
      return (
        <div className={`${hc ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <FaFilePdf className="text-red-600" />
            <span className={`font-medium text-sm ${hc ? 'text-yellow-300' : 'text-black'}`}>{pdf.nome_pdf}</span>
          </div>
          <div style={{ height: 600 }}>
            <iframe src={`data:application/pdf;base64,${pdf.pdf_base64}`} className="w-full h-full border-0 rounded" title={pdf.nome_pdf} />
          </div>
        </div>
      )
    })()}
    {bloco.tipo === 'arquivo_ftp' && bloco.arquivo_ftp_url && (
      <div className={`${hc ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <FaFilePdf className="text-red-600" />
          <span className={`font-medium text-sm ${hc ? 'text-yellow-300' : 'text-black'}`}>{bloco.arquivo_ftp_nome}</span>
        </div>
        <div style={{ height: 600 }}>
          <iframe src={bloco.arquivo_ftp_url} className="w-full h-full border-0 rounded" title={bloco.arquivo_ftp_nome} />
        </div>
      </div>
    )}
  </div>
))}
                      </div>
                    ))
                    ) : (
                      // Fallback sem blocos configurados
                      <div className="overflow-x-auto">
                        <p className={`text-xs mb-3 ${hc ? 'text-yellow-200' : 'text-black'}`}>{linhasFiltradas.length} registro(s)</p>
                        <table className="min-w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-blue-600 text-white">
                              {tabelaAtivaMeta?.colunas.map((col, i) => <th key={i} className="px-4 py-3 text-left font-semibold border border-blue-500">{col}</th>)}
                              <th className="px-4 py-3 text-left font-semibold border border-blue-500 text-xs">Adicionado em</th>
                            </tr>
                          </thead>
                          <tbody>
                            {linhasFiltradas.map((l, li) => (
                              <tr key={l.id} className={li % 2 === 0 ? (hc ? 'bg-gray-800' : 'bg-gray-50') : (hc ? 'bg-gray-900' : 'bg-white')}>
                                {tabelaAtivaMeta?.colunas.map((_, ci) => (
                                  <td key={ci} className={`px-4 py-3 border ${hc ? 'border-gray-700 text-yellow-200' : 'border-gray-200 text-black'}`}>
                                    <span dangerouslySetInnerHTML={{ __html: converterUrlArquivo(l.dados[ci] || '') }} />
                                  </td>
                                ))}
                                <td className={`px-4 py-3 border text-xs ${hc ? 'border-gray-700 text-yellow-300' : 'border-gray-200 text-black'}`}>
                                {new Date(l.created_at).toLocaleString('pt-BR')}
                              </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {ultimaAtualizacao && (
        <div className={`text-center py-3 text-xs ${hc ? 'text-yellow-200' : 'text-gray-900'}`}>
          Última atualização: {new Date(ultimaAtualizacao).toLocaleString('pt-BR')}
        </div>
      )}


      <VLibrasWrapper />
    </div>
  )
}