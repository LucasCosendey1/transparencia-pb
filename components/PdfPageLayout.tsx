'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibras from 'vlibras-nextjs'
import {
  FaHome, FaFilePdf, FaDownload, FaPlus, FaTrash,
  FaSave, FaTimes, FaFileAlt, FaTable, FaList,
  FaEye, FaCog, FaCheck, FaGripVertical, FaHistory,
  FaChevronDown, FaEdit, FaArrowUp, FaArrowDown,
  FaSearch, FaExpand, FaCompress, FaLayerGroup
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
  tipo: 'texto' | 'tabela' | 'pdf'
  nome_tabela?: string
  nome_pdf?: string
  conteudo?: string
  expandido?: boolean
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

type AbaAdmin = 'tabelas' | 'gerar-pdf' | 'exibicao' | 'historico'

const uid = () => Math.random().toString(36).slice(2)

// ── Componente principal ──────────────────────────────────────
export default function PdfPageLayout({ paginaId, titulo, breadcrumb }: Props) {
  const [fontSize, setFontSize]         = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin]           = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [abaAdmin, setAbaAdmin]         = useState<AbaAdmin>('tabelas')
  const [loading, setLoading]           = useState(true)
  const [salvando, setSalvando]         = useState(false)

  // Tabelas
  const [tabelas, setTabelas]           = useState<TabelaMeta[]>([])
  const [tabelaAtiva, setTabelaAtiva]   = useState<string>('')
  const [novoNome, setNovoNome]         = useState('')
  const [criandoNova, setCriandoNova]   = useState(false)

  // Linhas
  const [linhas, setLinhas]               = useState<Linha[]>([])
const [linhasPorTabela, setLinhasPorTabela] = useState<Record<string, Linha[]>>({})
  const [linhasEditando, setLinhasEditando] = useState<Record<number, string[]>>({})
  const [novaLinha, setNovaLinha]       = useState<string[]>([])

  // Filtros
  const [dataInicio, setDataInicio]     = useState('')
  const [dataFim, setDataFim]           = useState('')
  const [filtroAdminInicio, setFiltroAdminInicio] = useState('')
  const [filtroAdminFim, setFiltroAdminFim]       = useState('')
  const [termoBusca, setTermoBusca]     = useState('')

  // PDFs salvos
  const [pdfsSalvos, setPdfsSalvos]     = useState<PdfSalvo[]>([])
  const [nomePdfAtual, setNomePdfAtual] = useState('')

  // Gerar PDF
  const [blocosPdf, setBlocosPdf]       = useState<BlocoPDF[]>([])
  const [pdfPreview, setPdfPreview]     = useState<string | null>(null)
  const [tituloPdf, setTituloPdf]       = useState('')

  // Modo exibição
  const [blocosExibicao, setBlocosExibicao] = useState<BlocoExibicao[]>([])


  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null)

  // Download
  const [formatoDownload, setFormatoDownload]   = useState('pdf')
  const [fonteDownload, setFonteDownload]       = useState('tudo')
  const [dropdownFormato, setDropdownFormato]   = useState(false)
  const [dropdownFonte, setDropdownFonte]       = useState(false)
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState<string[]>([])
  const [pdfsSelecionados, setPdfsSelecionados]       = useState<string[]>([])

  const adjustFontSize = (n: number) => setFontSize(p => Math.max(12, Math.min(24, p + n)))
  const tabelaAtivaMeta = tabelas.find(t => t.nome_tabela === tabelaAtiva)
  const linhasFiltradas = termoBusca.trim()
  ? linhas.filter(l => l.dados.some(d => d?.toLowerCase().includes(termoBusca.toLowerCase())))
  : linhas


  // ── Carregar ──────────────────────────────────────────────
  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregar()
  }, [])

  useEffect(() => {
  if (!tabelaAtiva || tabelas.length === 0) return
  const meta = tabelas.find(t => t.nome_tabela === tabelaAtiva)
  if (meta) {
    setNovaLinha(meta.colunas.map(() => ''))
    const di = meta.filtro_admin_inicio || ''
    const df = meta.filtro_admin_fim    || ''
    setDataInicio(di)
    setDataFim(df)
    setFiltroAdminInicio(di)
    setFiltroAdminFim(df)
    carregarLinhas(tabelaAtiva, di, df)
  }
}, [tabelaAtiva]) 

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
        colunas:          Array.isArray(t.colunas)          ? t.colunas          : [],
        colunas_pdf:      Array.isArray(t.colunas_pdf)      ? t.colunas_pdf      : [],
        blocos_pdf:       Array.isArray(t.blocos_pdf)       ? t.blocos_pdf       : [],
        blocos_exibicao:  Array.isArray(t.blocos_exibicao)  ? t.blocos_exibicao  : [],
        texto_intro:      t.texto_intro || '',
        texto_final:      t.texto_final || '',
        filtro_admin_inicio: t.filtro_admin_inicio || null,
        filtro_admin_fim:    t.filtro_admin_fim    || null,
      })) : []

      setTabelas(lista)
      if (lista.length > 0) {
      setTabelaAtiva(lista[0].nome_tabela)
      if (lista[0].blocos_exibicao?.length) {
        setBlocosExibicao(lista[0].blocos_exibicao)
        // Carrega linhas de todas as tabelas nos blocos de exibição
        const novasLinhas: Record<string, Linha[]> = {}
for (const bloco of lista[0].blocos_exibicao) {
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
      }
    }

      // PDFs salvos
      if (Array.isArray(dPdf)) {
        setPdfsSalvos(dPdf)
      } else if (dPdf?.pdf_base64) {
        setPdfsSalvos([{ nome_pdf: 'principal', pdf_base64: dPdf.pdf_base64, updated_at: dPdf.updated_at }])
      }

      setTituloPdf(titulo)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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

  // ── Tabelas CRUD ──────────────────────────────────────────
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

  const criarTabela = async () => {
    if (!novoNome.trim()) return alert('Informe um nome.')
    if (tabelas.some(t => t.nome_tabela === novoNome.trim())) return alert('Nome já existe.')
    const nova: TabelaMeta = {
      id: Date.now(), nome_tabela: novoNome.trim(), titulo_tabela: novoNome.trim(),
      texto_intro: '', texto_final: '', colunas: ['Coluna 1', 'Coluna 2', 'Coluna 3'],
      modo_exibicao: 'tabela', colunas_pdf: [0, 1, 2],
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

  // ── Linhas CRUD ───────────────────────────────────────────
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

  // ── Colunas ───────────────────────────────────────────────
  const addColuna = () => {
    if (!tabelaAtivaMeta) return
    const novas = [...tabelaAtivaMeta.colunas, `Coluna ${tabelaAtivaMeta.colunas.length + 1}`]
    setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva
      ? { ...t, colunas: novas, colunas_pdf: novas.map((_, i) => i) } : t))
    setNovaLinha(novas.map(() => ''))
  }

  const removeColuna = (ci: number) => {
    if (!tabelaAtivaMeta || tabelaAtivaMeta.colunas.length <= 1) return
    const novas = tabelaAtivaMeta.colunas.filter((_, i) => i !== ci)
    setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? {
      ...t, colunas: novas,
      colunas_pdf: tabelaAtivaMeta.colunas_pdf.filter(i => i !== ci).map(i => i > ci ? i - 1 : i),
    } : t))
    setNovaLinha(novas.map(() => ''))
  }

  const toggleColunaPdf = (nomeTabela: string, ci: number) => {
    setTabelas(p => p.map(t => {
      if (t.nome_tabela !== nomeTabela) return t
      const novas = t.colunas_pdf.includes(ci)
        ? t.colunas_pdf.filter(i => i !== ci)
        : [...t.colunas_pdf, ci].sort((a, b) => a - b)
      return { ...t, colunas_pdf: novas }
    }))
  }

  // ── Blocos PDF ────────────────────────────────────────────
  useEffect(() => {
    if (abaAdmin === 'gerar-pdf' && blocosPdf.length === 0) {
      setBlocosPdf([
        { id: uid(), tipo: 'texto', conteudo: '' },
        ...tabelas.map(t => ({ id: uid(), tipo: 'tabela' as const, nome_tabela: t.nome_tabela })),
      ])
    }
  }, [abaAdmin])

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

  const moverBloco = (arr: any[], setArr: any, idx: number, dir: 'cima' | 'baixo') => {
    setArr((p: any[]) => {
      const a = [...p]
      const ni = dir === 'cima' ? idx - 1 : idx + 1
      if (ni < 0 || ni >= a.length) return a
      ;[a[idx], a[ni]] = [a[ni], a[idx]]
      return a
    })
  }

  // ── Gerar PDF ─────────────────────────────────────────────
  const gerarPDF = async (linhasOverride?: Linha[]): Promise<string> => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const mx = 15
    let y = 20

    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text(tituloPdf || titulo, mx, y); y += 8
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, mx, y)
    doc.setTextColor(0); y += 10

    for (const bloco of blocosPdf) {
      if (bloco.tipo === 'texto' && bloco.conteudo) {
        const limpo = bloco.conteudo.replace(/<[^>]*>/g, '').trim()
        if (limpo) {
          doc.setFontSize(11)
          const linhasT = doc.splitTextToSize(limpo, 180)
          if (y + linhasT.length * 6 > 280) { doc.addPage(); y = 20 }
          doc.text(linhasT, mx, y); y += linhasT.length * 6 + 4
        }
      }
      if (bloco.tipo === 'tabela') {
        const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
        if (!meta) continue
        const linhasBloco = linhasOverride ?? (bloco.nome_tabela ? linhasPorTabela[bloco.nome_tabela] : undefined) ?? (await (await fetch(`/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`)).json())
        const colsSel = meta.colunas_pdf.length > 0 ? meta.colunas_pdf : meta.colunas.map((_, i) => i)
        const head = [colsSel.map(ci => meta.colunas[ci])]
        const body = linhasBloco.map((l: Linha) => colsSel.map(ci => l.dados[ci] ?? ''))

        if (meta.titulo_tabela) {
          doc.setFontSize(12); doc.setFont('helvetica', 'bold')
          if (y + 10 > 280) { doc.addPage(); y = 20 }
          doc.text(meta.titulo_tabela, mx, y); y += 8; doc.setFont('helvetica', 'normal')
        }
        autoTable(doc, {
          startY: y, head, body, theme: 'grid',
          headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: 'bold', lineWidth: 0.3 },
          bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          styles: { fontSize: 9, cellPadding: 3 }, margin: { left: mx, right: mx },
        })
        y = (doc as any).lastAutoTable.finalY + 6

        if (meta.texto_final) {
          const limpo = meta.texto_final.replace(/<[^>]*>/g, '').trim()
          if (limpo) {
            const linhasF = doc.splitTextToSize(limpo, 180)
            if (y + linhasF.length * 6 > 280) { doc.addPage(); y = 20 }
            doc.text(linhasF, mx, y); y += linhasF.length * 6 + 6
          }
        }
      }
    }
    return doc.output('datauristring').split(',')[1]
  }

  const preVisualizarPDF = async () => {
    setSalvando(true)
    try { setPdfPreview(await gerarPDF()) }
    finally { setSalvando(false) }
  }

  const salvarPDF = async () => {
    if (!nomePdfAtual.trim()) return alert('Informe o nome do PDF antes de salvar.')
    setSalvando(true)
    try {
      const b64 = pdfPreview ?? await gerarPDF()
      await fetch(`/api/pdf/${paginaId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64: b64, nome_pdf: nomePdfAtual.trim() }),
      })
      setPdfsSalvos(p => {
        const existe = p.find(x => x.nome_pdf === nomePdfAtual.trim())
        if (existe) return p.map(x => x.nome_pdf === nomePdfAtual.trim() ? { ...x, pdf_base64: b64 } : x)
        return [...p, { nome_pdf: nomePdfAtual.trim(), pdf_base64: b64, updated_at: new Date().toISOString() }]
      })
      // Salva blocos
      if (tabelas.length > 0) {
        await salvarMeta({ ...tabelas[0], blocos_pdf: blocosPdf })
      }
      setPdfPreview(null)
      alert(`✅ PDF "${nomePdfAtual}" salvo!`)
    } catch { alert('❌ Erro ao salvar PDF.') }
    finally { setSalvando(false) }
  }

  const deletarPDF = async (nome: string) => {
    if (!confirm(`Deletar PDF "${nome}"?`)) return
    await fetch(`/api/pdf/${paginaId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_pdf: nome }),
    })
    setPdfsSalvos(p => p.filter(x => x.nome_pdf !== nome))
  }

  // ── Blocos Exibição ───────────────────────────────────────
  const salvarBlocosExibicao = async (blocos: BlocoExibicao[]) => {
  if (tabelas.length === 0) {
    // Cria uma tabela "principal" automaticamente só para guardar os blocos
    await fetch(`/api/tabela/${paginaId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_tabela: 'principal', titulo_tabela: '', texto_intro: '', texto_final: '',
        colunas: [], modo_exibicao: 'tabela', colunas_pdf: [], blocos_pdf: [],
        blocos_exibicao: blocos,
      }),
    })
    setTabelas([{
      id: Date.now(), nome_tabela: 'principal', titulo_tabela: '', texto_intro: '',
      texto_final: '', colunas: [], modo_exibicao: 'tabela', colunas_pdf: [],
      blocos_exibicao: blocos,
    }])
    return
  }
  await fetch(`/api/tabela/${paginaId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...tabelas[0], blocos_exibicao: blocos }),
  })
  setTabelas(p => p.map((t, i) => i === 0 ? { ...t, blocos_exibicao: blocos } : t))
}

  // ── Filtro admin ──────────────────────────────────────────
  const salvarFiltroAdmin = async () => {
    if (!tabelaAtivaMeta) return
    setSalvando(true)
    try {
      await salvarMeta({
        ...tabelaAtivaMeta,
        filtro_admin_inicio: filtroAdminInicio || null,
        filtro_admin_fim:    filtroAdminFim    || null,
      })
      alert('✅ Filtro padrão salvo!')
    } finally { setSalvando(false) }
  }

  // ── Downloads ─────────────────────────────────────────────
    const baixar = async () => {
      const meta = tabelaAtivaMeta
      if (!meta) return

      if (formatoDownload === 'pdf') {
        // PDFs salvos selecionados
        const pdfsParaBaixar = pdfsSelecionados.length > 0
          ? pdfsSalvos.filter(p => pdfsSelecionados.includes(p.nome_pdf))
          : []
        for (const p of pdfsParaBaixar) {
          const a = document.createElement('a')
          a.href = `data:application/pdf;base64,${p.pdf_base64}`
          a.download = `${p.nome_pdf}.pdf`; a.click()
        }
        if (pdfsParaBaixar.length > 0) return

        // Gera PDF com dados filtrados das tabelas selecionadas
        const b64 = await gerarPDF(linhasFiltradas)
        const a = document.createElement('a')
        a.href = `data:application/pdf;base64,${b64}`
        a.download = `${tituloPdf || titulo}.pdf`; a.click()
        return
      }

      // Para outros formatos, usa tabelas selecionadas ou a ativa
      const rows = linhasFiltradas.map(l => l.dados)

    if (formatoDownload === 'json') {
      const obj = { titulo: meta.titulo_tabela, colunas: meta.colunas, linhas: rows }
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = `${tituloPdf || titulo}.json`; a.click(); return
    }
    if (formatoDownload === 'csv') {
      const header = meta.colunas.join(',')
      const body = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = `${tituloPdf || titulo}.csv`; a.click(); return
    }
    if (formatoDownload === 'txt') {
      const lines = [meta.colunas.join('\t'), ...rows.map(r => r.join('\t'))]
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = `${tituloPdf || titulo}.txt`; a.click(); return
    }
    if (formatoDownload === 'xlsx') {
      const { utils, writeFile } = await import('xlsx')
      const ws = utils.aoa_to_sheet([meta.colunas, ...rows])
      const wb = utils.book_new(); utils.book_append_sheet(wb, ws, 'Dados')
      writeFile(wb, `${tituloPdf || titulo}.xlsx`); return
    }
  }

  const hc = highContrast


      // ── Render ────────────────────────────────────────────────
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

                /* ══════════════ PAINEL ADMIN ══════════════ */
                <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
                  {/* Abas */}
                  <div className="flex border-b overflow-x-auto">
                    {([
                      { key: 'tabelas',   label: 'Tabelas',       icon: <FaTable size={12} /> },
                      { key: 'gerar-pdf', label: 'Gerar PDF',     icon: <FaFilePdf size={12} /> },
                      { key: 'exibicao',  label: 'Modo Exibição', icon: <FaLayerGroup size={12} /> },
                      { key: 'historico', label: 'Histórico',     icon: <FaHistory size={12} />,
                        disabled: blocosExibicao.filter(b => b.tipo === 'tabela' || b.tipo === 'pdf').length === 0
                      }
                    ] as { key: AbaAdmin; label: string; icon: React.ReactNode; disabled?: boolean }[]).map(aba => (
                    <button key={aba.key}
                      onClick={() => !aba.disabled && setAbaAdmin(aba.key)}
                      disabled={aba.disabled}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                        abaAdmin === aba.key
                          ? 'border-blue-600 text-blue-600'
                          : aba.disabled
                            ? 'border-transparent text-gray-300 cursor-not-allowed'
                            : 'border-transparent text-black hover:text-gray-700'
                      }`}>
                      {aba.icon} {aba.label}
                    </button>
                  ))}
                  </div>

                  <div className="p-6">

                    {/* ── ABA TABELAS ── */}
                    {abaAdmin === 'tabelas' && (
                      <div className="flex gap-6">
                        {/* Sidebar tabelas */}
                        <div className="w-48 flex-shrink-0">
                          <p className="text-xs font-semibold text-black uppercase mb-2">Tabelas</p>
                          <ul className="space-y-1 mb-3">
                            {tabelas.map(t => (
                              <li key={t.nome_tabela}>
                                <button onClick={() => setTabelaAtiva(t.nome_tabela)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition ${
                                    tabelaAtiva === t.nome_tabela ? 'bg-blue-600 text-white' : 'text-black hover:bg-gray-100'
                                  }`}>
                                  <span className="truncate">{t.nome_tabela}</span>
                                  <button onClick={e => { e.stopPropagation(); deletarTabela(t.nome_tabela) }}
                                    className={`opacity-0 group-hover:opacity-100 ${tabelaAtiva === t.nome_tabela ? 'text-white' : 'text-red-400'}`}>
                                    <FaTrash size={10} />
                                  </button>
                                </button>
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
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-black mb-1">Título</label>
                              <input value={tabelaAtivaMeta.titulo_tabela}
                                onChange={e => setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? { ...t, titulo_tabela: e.target.value } : t))}
                                className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-black mb-1">Texto introdutório</label>
                              <div id="texto-intro-editor" contentEditable suppressContentEditableWarning
                                onInput={e => setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? { ...t, texto_intro: (e.target as HTMLDivElement).innerHTML } : t))}
                                ref={el => { if (el && el.innerHTML === '') el.innerHTML = tabelaAtivaMeta.texto_intro }}
                                className="w-full min-h-[60px] px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
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
                                    <input value={col} onChange={e => setTabelas(p => p.map(t => {
                                      if (t.nome_tabela !== tabelaAtiva) return t
                                      const c = [...t.colunas]; c[ci] = e.target.value; return { ...t, colunas: c }
                                    }))} className="w-24 bg-transparent text-black text-xs focus:outline-none" />
                                    <button onClick={() => removeColuna(ci)} className="text-red-400 hover:text-red-600"><FaTimes size={8} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Linhas */}
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
                                  {linhas.map(l => (
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

                            <div className="mb-4">
                              <label className="block text-xs font-medium text-black mb-1">Texto final</label>
                              <div id="texto-final-editor" contentEditable suppressContentEditableWarning
                                onInput={e => setTabelas(p => p.map(t => t.nome_tabela === tabelaAtiva ? { ...t, texto_final: (e.target as HTMLDivElement).innerHTML } : t))}
                                ref={el => { if (el && el.innerHTML === '') el.innerHTML = tabelaAtivaMeta.texto_final }}
                                className="w-full min-h-[60px] px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                            </div>
                            <button onClick={() => salvarMeta(tabelaAtivaMeta)} disabled={salvando}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60">
                              <FaSave size={11} /> {salvando ? 'Salvando…' : 'Salvar tabela'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── ABA GERAR PDF ── */}
                    {abaAdmin === 'gerar-pdf' && (
                      <>
                        {/* PDFs salvos */}
                        {pdfsSalvos.length > 0 && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <p className="text-xs font-semibold text-black uppercase mb-2">PDFs Salvos</p>
                            <div className="space-y-2">
                              {pdfsSalvos.map(p => (
                                <div key={p.nome_pdf} className="flex items-center justify-between bg-white border rounded px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <FaFilePdf className="text-red-500" size={14} />
                                    <span className="text-sm text-black">{p.nome_pdf}</span>
                                    <span className="text-xs text-gray-400">{new Date(p.updated_at).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => {
                                      const a = document.createElement('a')
                                      a.href = `data:application/pdf;base64,${p.pdf_base64}`
                                      a.download = `${p.nome_pdf}.pdf`; a.click()
                                    }} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200">
                                      <FaDownload size={10} />
                                    </button>
                                    <button onClick={() => deletarPDF(p.nome_pdf)} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200">
                                      <FaTrash size={10} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nome do novo PDF */}
                        <div className="mb-4 flex gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Nome do PDF</label>
                            <input value={nomePdfAtual} onChange={e => setNomePdfAtual(e.target.value)}
                              placeholder="Ex: Relatório Janeiro 2025"
                              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Título no documento</label>
                            <input value={tituloPdf} onChange={e => setTituloPdf(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>

                        {/* Seleção de colunas */}
                        {tabelas.map(t => (
                          <div key={t.nome_tabela} className="mb-4 p-3 bg-gray-50 rounded-lg border">
                            <p className="text-xs font-semibold text-black mb-2">Colunas de "{t.nome_tabela}" no PDF:</p>
                            <div className="flex flex-wrap gap-2">
                              {t.colunas.map((col, ci) => (
                                <button key={ci} onClick={() => toggleColunaPdf(t.nome_tabela, ci)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition ${
                                    t.colunas_pdf.includes(ci) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-black border-gray-300 hover:border-blue-400'
                                  }`}>
                                  {t.colunas_pdf.includes(ci) && <FaCheck size={8} />} {col}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Blocos */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-black">Estrutura do PDF:</p>
                            <div className="flex gap-2">
                              <button onClick={() => setBlocosPdf(p => [...p, { id: uid(), tipo: 'texto', conteudo: '' }])}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs">
                                <FaPlus size={9} /> Texto
                              </button>
                              <button onClick={() => setBlocosPdf(p => [...p, { id: uid(), tipo: 'tabela', nome_tabela: tabelas[0]?.nome_tabela || '' }])}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs">
                                <FaPlus size={9} /> Tabela
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {blocosPdf.map((bloco, idx) => (
                              <div key={bloco.id} className="flex items-start gap-2 p-3 bg-gray-50 border rounded-lg hover:border-blue-300 transition">
                                <div className="flex flex-col gap-1 flex-shrink-0 mt-1">
                                  <button onClick={() => moverBloco(blocosPdf, setBlocosPdf, idx, 'cima')} disabled={idx === 0} className="text-black disabled:opacity-20"><FaArrowUp size={10} /></button>
                                  <FaGripVertical className="text-black mx-auto" size={12} />
                                  <button onClick={() => moverBloco(blocosPdf, setBlocosPdf, idx, 'baixo')} disabled={idx === blocosPdf.length - 1} className="text-black disabled:opacity-20"><FaArrowDown size={10} /></button>
                                </div>
                                <div className="flex-1 min-w-0">
                                  {bloco.tipo === 'texto' ? (
                                    <>
                                      <p className="text-xs text-black mb-1">Bloco de texto</p>
                                      <div contentEditable suppressContentEditableWarning
                                        onInput={e => setBlocosPdf(p => p.map(b => b.id === bloco.id ? { ...b, conteudo: (e.target as HTMLDivElement).innerHTML } : b))}
                                        ref={el => { if (el && el.innerHTML === '') el.innerHTML = bloco.conteudo || '' }}
                                        className="w-full min-h-[60px] px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        style={{ background: 'transparent', color: '#000' }} />
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-xs text-black mb-1">Bloco de tabela</p>
                                      <select value={bloco.nome_tabela}
                                        onChange={e => setBlocosPdf(p => p.map(b => b.id === bloco.id ? { ...b, nome_tabela: e.target.value } : b))}
                                        className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                        {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
                                      </select>
                                    </>
                                  )}
                                </div>
                                <button onClick={() => setBlocosPdf(p => p.filter(b => b.id !== bloco.id))} className="text-red-400 hover:text-red-600 flex-shrink-0 mt-1"><FaTimes size={12} /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {pdfPreview && (
                          <div className="mb-6">
                            <p className="text-sm font-medium text-black mb-2">Pré-visualização:</p>
                            <div style={{ height: 500 }} className="border rounded overflow-hidden">
                              <iframe src={`data:application/pdf;base64,${pdfPreview}`} className="w-full h-full border-0" title="Preview" />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          <button onClick={preVisualizarPDF} disabled={salvando}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition disabled:opacity-60">
                            <FaEye size={11} /> Pré-visualizar
                          </button>
                          <button onClick={salvarPDF} disabled={salvando || !nomePdfAtual.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition disabled:opacity-60">
                            <FaSave size={11} /> {salvando ? 'Salvando…' : 'Salvar PDF'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── ABA MODO EXIBIÇÃO ── */}
                    {abaAdmin === 'exibicao' && (
                      <>
                        <p className="text-sm text-black mb-4">
                          Defina o que aparece na página e em qual ordem. Você pode combinar textos, tabelas e PDFs já criados.
                        </p>

                        <div className="flex gap-2 mb-4 flex-wrap">
                          <button onClick={() => setBlocosExibicao(p => [...p, { id: uid(), tipo: 'texto', conteudo: '', expandido: true }])}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs">
                            <FaPlus size={9} /> Texto
                          </button>
                          <button onClick={() => setBlocosExibicao(p => [...p, { id: uid(), tipo: 'tabela', nome_tabela: tabelas[0]?.nome_tabela || '' }])}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs">
                            <FaPlus size={9} /> Tabela
                          </button>
                          <button onClick={() => setBlocosExibicao(p => [...p, { id: uid(), tipo: 'pdf', nome_pdf: pdfsSalvos[0]?.nome_pdf || '' }])}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs"
                            disabled={pdfsSalvos.length === 0}>
                            <FaPlus size={9} /> PDF
                          </button>
                        </div>

                        <div className="space-y-2 mb-6">
                          {blocosExibicao.map((bloco, idx) => (
                            <div key={bloco.id} className="border rounded-lg overflow-hidden">
                              {/* Header do bloco */}
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                                <div className="flex flex-col gap-0.5">
                                  <button onClick={() => moverBloco(blocosExibicao, setBlocosExibicao, idx, 'cima')} disabled={idx === 0} className="text-black disabled:opacity-20"><FaArrowUp size={9} /></button>
                                  <button onClick={() => moverBloco(blocosExibicao, setBlocosExibicao, idx, 'baixo')} disabled={idx === blocosExibicao.length - 1} className="text-black disabled:opacity-20"><FaArrowDown size={9} /></button>
                                </div>
                                <FaGripVertical className="text-gray-400" size={11} />
                                <span className="text-xs font-medium text-black flex-1">
                                  {bloco.tipo === 'texto' ? '📝 Texto' : bloco.tipo === 'tabela' ? `📊 Tabela: ${bloco.nome_tabela}` : `📄 PDF: ${bloco.nome_pdf}`}
                                </span>
                                {bloco.tipo === 'texto' && (
                                  <button onClick={() => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, expandido: !b.expandido } : b))}
                                    className="text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-xs flex items-center gap-1">
                                    {bloco.expandido ? <><FaCompress size={9} /> Compactar</> : <><FaExpand size={9} /> Expandir</>}
                                  </button>
                                )}
                                <button onClick={() => setBlocosExibicao(p => p.filter(b => b.id !== bloco.id))} className="text-red-400 hover:text-red-600"><FaTimes size={11} /></button>
                              </div>

                              {/* Corpo do bloco */}
                              <div className="p-3">
                                {bloco.tipo === 'texto' ? (
                                  <div contentEditable suppressContentEditableWarning
                                    onInput={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, conteudo: (e.target as HTMLDivElement).innerHTML } : b))}
                                    ref={el => { if (el && el.innerHTML === '') el.innerHTML = bloco.conteudo || '' }}
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                    style={{
                                      minHeight: bloco.expandido ? '200px' : '60px',
                                      color: '#000',
                                    }} />
                                ) : bloco.tipo === 'tabela' ? (
                                  <select value={bloco.nome_tabela}
                                    onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, nome_tabela: e.target.value } : b))}
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
                                  </select>
                                ) : (
                                  <select value={bloco.nome_pdf}
                                    onChange={e => setBlocosExibicao(p => p.map(b => b.id === bloco.id ? { ...b, nome_pdf: e.target.value } : b))}
                                    className="w-full px-3 py-2 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    {pdfsSalvos.map(p => <option key={p.nome_pdf} value={p.nome_pdf}>{p.nome_pdf}</option>)}
                                  </select>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button onClick={() => salvarBlocosExibicao(blocosExibicao)} disabled={salvando}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60">
                          <FaSave size={11} /> {salvando ? 'Salvando…' : 'Aplicar configuração de exibição'}
                        </button>
                      </>
                    )}

                    {/* ── ABA HISTÓRICO ── */}
                    {abaAdmin === 'historico' && (
                      <AbaHistorico
                        blocosExibicao={blocosExibicao}
                        tabelas={tabelas}
                        linhas={linhas}
                        tabelaAtivaMeta={tabelaAtivaMeta}
                        salvando={salvando}
                        setSalvando={setSalvando}
                        salvarMeta={salvarMeta}
                        carregarLinhas={carregarLinhas}
                        tabelaAtiva={tabelaAtiva}
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
                          {/* Seletor de tabela */}
                          {tabelas.length > 1 && (
                            <select value={tabelaAtiva} onChange={e => setTabelaAtiva(e.target.value)}
                              className="px-3 py-1.5 border rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {tabelas.map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
                            </select>
                          )}

                          {/* Filtros de data */}
                          <div>
                            <label className={`block text-xs mb-1 ${hc ? 'text-yellow-200' : 'text-black'}`}>De</label>
                            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                              className="px-3 py-1.5 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ colorScheme: 'light', color: '#000' }} />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${hc ? 'text-yellow-200' : 'text-black'}`}>Até</label>
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
                                const r = await fetch(url)
                                const d = await r.json()
                                novas[bloco.nome_tabela] = Array.isArray(d) ? d : []
                              }
                            }
                            if (Object.keys(novas).length > 0) setLinhasPorTabela(novas)
                            else carregarLinhas(tabelaAtiva, dataInicio, dataFim)
                          }} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Filtrar</button>
                        <button onClick={async () => {
                            setDataInicio(filtroAdminInicio)
                            setDataFim(filtroAdminFim)
                            const novas: Record<string, Linha[]> = {}
                            for (const bloco of blocosExibicao) {
                              if (bloco.tipo === 'tabela' && bloco.nome_tabela) {
                                const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
                                const di = meta?.filtro_admin_inicio || ''
                                const df = meta?.filtro_admin_fim || ''
                                let url = `/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`
                                if (di) url += `&data_inicio=${di}`
                                if (df) url += `&data_fim=${df}`
                                const r = await fetch(url)
                                const d = await r.json()
                                novas[bloco.nome_tabela] = Array.isArray(d) ? d : []
                              }
                            }
                            if (Object.keys(novas).length > 0) setLinhasPorTabela(novas)
                            else carregarLinhas(tabelaAtiva, filtroAdminInicio, filtroAdminFim)
                          }} className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">Limpar</button>

                          {/* Buscador em tempo real */}
                          <div className="relative">
                            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
                            <input
                              type="text"
                              value={termoBusca}
                              onChange={e => setTermoBusca(e.target.value)}
                              placeholder="Buscar..."
                              className="pl-7 pr-3 py-1.5 border rounded text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                            />
                          </div>

                          {/* Download — fonte + formato */}
                          <div className="flex">
                            {/* Fonte (o que baixar) */}
                            <div className="relative dropdown-fonte">
                              <button onClick={() => setDropdownFonte(v => !v)}
                                className={`flex items-center gap-1 px-3 py-1.5 border-y border-l rounded-l text-sm ${hc ? 'border-yellow-300 text-yellow-300' : 'border-gray-300 text-black bg-white'}`}>
                                {tabelasSelecionadas.length === 0 && pdfsSelecionados.length === 0
      ? 'Tudo'
      : `${tabelasSelecionadas.length + pdfsSelecionados.length} selecionado(s)`
    } <FaChevronDown size={8} />
                              </button>
                              {dropdownFonte && (
      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[180px]">
        <div className="px-3 py-2 border-b">
          <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
            <input type="checkbox"
              checked={tabelasSelecionadas.length === 0 && pdfsSelecionados.length === 0}
              onChange={() => { setTabelasSelecionadas([]); setPdfsSelecionados([]) }}
            /> Tudo
          </label>
        </div>
        {tabelas.map(t => (
          <div key={t.nome_tabela} className="px-3 py-2 hover:bg-gray-50">
            <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
              <input type="checkbox"
                checked={tabelasSelecionadas.includes(t.nome_tabela)}
                onChange={e => setTabelasSelecionadas(p =>
                  e.target.checked ? [...p, t.nome_tabela] : p.filter(x => x !== t.nome_tabela)
                )}
              /> 📊 {t.nome_tabela}
            </label>
          </div>
        ))}
        {pdfsSalvos.map(p => (
          <div key={p.nome_pdf} className="px-3 py-2 hover:bg-gray-50">
            <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
              <input type="checkbox"
                checked={pdfsSelecionados.includes(p.nome_pdf)}
                onChange={e => setPdfsSelecionados(p2 =>
                  e.target.checked ? [...p2, p.nome_pdf] : p2.filter(x => x !== p.nome_pdf)
                )}
              /> 📄 {p.nome_pdf}
            </label>
          </div>
        ))}
      </div>
    )}
                            </div>

                            {/* Formato */}
                            <div className="relative dropdown-formato">
                              <button onClick={() => setDropdownFormato(v => !v)}
                                className={`flex items-center gap-1 px-3 py-1.5 border text-sm ${hc ? 'border-yellow-300 text-yellow-300' : 'border-gray-300 text-black bg-white'}`}>
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

                      {/* Conteúdo — blocos de exibição ou fallback */}
                      <div className="p-6">
                        {blocosExibicao.length > 0 ? (
                          blocosExibicao.map(bloco => (
                            <div key={bloco.id} className="mb-6">
                              {bloco.tipo === 'texto' && bloco.conteudo && (
                                <div className={`text-sm ${hc ? 'text-yellow-200' : 'text-black'}`}
                                  dangerouslySetInnerHTML={{ __html: bloco.conteudo }} />
                              )}
                              {bloco.tipo === 'tabela' && (() => {
                                const meta = tabelas.find(t => t.nome_tabela === bloco.nome_tabela)
                                if (!meta) return null
                                const linhasBloco = linhasPorTabela[bloco.nome_tabela!] || []
                                const linhasBlocoFiltradas = termoBusca.trim()
                                  ? linhasBloco.filter(l => l.dados.some(d => d?.toLowerCase().includes(termoBusca.toLowerCase())))
                                  : linhasBloco
                                return (
                                  <div className="overflow-x-auto">
                                    {meta.texto_intro && <div className={`text-sm mb-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_intro }} />}
                                    <p className={`text-xs mb-2 ${hc ? 'text-yellow-200' : 'text-black'}`}>{linhasBlocoFiltradas.length} registro(s)</p>
                                    <table className="min-w-full border-collapse text-sm">
                                      <thead>
                                        <tr className="bg-blue-600 text-white">
                                          {meta.colunas.map((col, i) => <th key={i} className="px-4 py-3 text-left font-semibold border border-blue-500">{col}</th>)}
                                          <th className="px-4 py-3 text-left font-semibold border border-blue-500 text-xs">Adicionado em</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {linhasBlocoFiltradas.map((l, li) => (
                                          <tr key={l.id} className={li % 2 === 0 ? (hc ? 'bg-gray-800' : 'bg-gray-50') : (hc ? 'bg-gray-900' : 'bg-white')}>
                                            {meta.colunas.map((_, ci) => (
                                              <td key={ci} className={`px-4 py-3 border ${hc ? 'border-gray-700 text-yellow-200' : 'border-gray-200 text-black'}`}>
                                                {termoBusca && l.dados[ci]?.toLowerCase().includes(termoBusca.toLowerCase()) ? (
                                                  <span dangerouslySetInnerHTML={{ __html: l.dados[ci].replace(new RegExp(`(${termoBusca})`, 'gi'), '<mark class="bg-yellow-200">$1</mark>') }} />
                                                ) : l.dados[ci]}
                                              </td>
                                            ))}
                                            <td className={`px-4 py-3 border text-xs ${hc ? 'border-gray-700 text-yellow-300' : 'border-gray-200 text-black'}`}>
                                              {new Date(l.created_at).toLocaleString('pt-BR')}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {meta.texto_final && <div className={`text-sm mt-3 ${hc ? 'text-yellow-200' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: meta.texto_final }} />}
                                  </div>
                                )
                              })()}
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
                            </div>
                          ))
                        ) : (
                          // Fallback: exibe tabela diretamente
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
                                        {termoBusca && l.dados[ci]?.toLowerCase().includes(termoBusca.toLowerCase()) ? (
                                          <span dangerouslySetInnerHTML={{ __html: l.dados[ci].replace(new RegExp(`(${termoBusca})`, 'gi'), '<mark class="bg-yellow-200">$1</mark>') }} />
                                        ) : l.dados[ci]}
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

                      {/* Texto final */}
                      {tabelaAtivaMeta?.texto_final && blocosExibicao.length === 0 && (
                        <div className={`px-6 pb-6 text-sm ${hc ? 'text-yellow-200' : 'text-black'}`}
                          dangerouslySetInnerHTML={{ __html: tabelaAtivaMeta.texto_final }} />
                      )}
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
          <VLibras forceOnload />
        </div>
      )
    }

function AbaHistorico({ blocosExibicao, tabelas, linhas, tabelaAtivaMeta, salvando, setSalvando, salvarMeta, carregarLinhas, tabelaAtiva }: any) {
  const blocosComDados = blocosExibicao.filter((b: any) => b.tipo === 'tabela' || b.tipo === 'pdf')
  const [itemSelecionado, setItemSelecionado] = useState('geral')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  if (blocosComDados.length === 0) return (
    <div className="p-8 text-center">
      <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
      <p className="text-gray-400 text-sm">Nenhuma tabela ou PDF no Modo Exibição.</p>
      <p className="text-gray-400 text-xs mt-1">Adicione conteúdo na aba "Modo Exibição" para configurar filtros.</p>
    </div>
  )

  const salvar = async () => {
    setSalvando(true)
    try {
      const alvos = itemSelecionado === 'geral'
        ? blocosComDados.filter((b: any) => b.tipo === 'tabela').map((b: any) => b.nome_tabela)
        : [itemSelecionado]
      for (const nome of alvos) {
        const meta = tabelas.find((t: any) => t.nome_tabela === nome)
        if (meta) await salvarMeta({ ...meta, filtro_admin_inicio: filtroInicio || null, filtro_admin_fim: filtroFim || null })
      }
      alert('✅ Filtro padrão salvo!')
    } finally { setSalvando(false) }
  }

  return (
    <>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-800 mb-1">🔒 Filtro padrão para visitantes</p>
        <p className="text-xs text-blue-600 mb-4">Ao recarregar a página, os filtros do visitante voltam para este padrão.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-black mb-1">Aplicar em</label>
            <select value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)}
              className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="geral">Geral (todos)</option>
              {blocosComDados.map((b: any) => (
                <option key={b.id} value={b.tipo === 'tabela' ? b.nome_tabela : b.nome_pdf}>
                  {b.tipo === 'tabela' ? `📊 ${b.nome_tabela}` : `📄 ${b.nome_pdf}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-black mb-1">De</label>
            <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)}
              className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light', color: '#000' }} />
          </div>
          <div>
            <label className="block text-xs text-black mb-1">Até</label>
            <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)}
              className="px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light', color: '#000' }} />
          </div>
          <button onClick={salvar} disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60">
            {salvando ? 'Salvando…' : 'Salvar filtro padrão'}
          </button>
          <button onClick={() => { setFiltroInicio(''); setFiltroFim('') }}
            className="px-4 py-2 bg-gray-200 text-black text-sm rounded hover:bg-gray-300">
            Limpar
          </button>
        </div>
      </div>

      {tabelaAtivaMeta && (
        <div className="overflow-x-auto">
          <p className="text-xs text-black mb-2">{linhas.length} registro(s)</p>
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                {tabelaAtivaMeta.colunas.map((col: string, i: number) => (
                  <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-black border">{col}</th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-semibold text-black border">Adicionado em</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l: any) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  {tabelaAtivaMeta.colunas.map((_: any, ci: number) => (
                    <td key={ci} className="px-3 py-2 border text-black">{l.dados[ci]}</td>
                  ))}
                  <td className="px-3 py-2 border text-black text-xs">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}