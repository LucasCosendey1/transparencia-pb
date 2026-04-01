'use client'

import { useState, useEffect } from 'react'

import {
  FaPlus, FaTrash, FaSave, FaTimes, FaEye, FaFilePdf,
  FaDownload, FaGripVertical, FaArrowUp, FaArrowDown, FaCheck,
} from 'react-icons/fa'

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
  blocos_exibicao?: any[]
  graficos?: any[]
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

interface PdfSalvo {
  nome_pdf: string
  pdf_base64: string
  updated_at: string
}

const uid = () => Math.random().toString(36).slice(2)

interface AbaGerarPdfProps {
  paginaId: string
  titulo: string
  tabelas: TabelaMeta[]
  setTabelas: React.Dispatch<React.SetStateAction<TabelaMeta[]>>
  linhasPorTabela: Record<string, Linha[]>
  pdfsSalvos: PdfSalvo[]
  setPdfsSalvos: React.Dispatch<React.SetStateAction<PdfSalvo[]>>
  salvando: boolean
  setSalvando: (v: boolean) => void
  salvarMeta: (meta: Partial<TabelaMeta> & { nome_tabela: string }) => Promise<void>
}

export default function AbaGerarPdf({
  paginaId, titulo, tabelas, setTabelas, linhasPorTabela,
  pdfsSalvos, setPdfsSalvos, salvando, setSalvando, salvarMeta,
}: AbaGerarPdfProps) {
  const [nomePdfAtual, setNomePdfAtual] = useState('')
  const [tituloPdf, setTituloPdf] = useState(titulo)
  const [blocosPdf, setBlocosPdf] = useState<BlocoPDF[]>([])
    const [pdfPreview, setPdfPreview] = useState<string | null>(null)

  useEffect(() => {
    if (blocosPdf.length === 0 && tabelas && tabelas.length > 0) {
      setBlocosPdf([
        { id: uid(), tipo: 'texto', conteudo: '' },
        ...tabelas.map(t => ({ id: uid(), tipo: 'tabela' as const, nome_tabela: t.nome_tabela })),
      ])
    }
  }, [tabelas])

  const toggleColunaPdf = (nomeTabela: string, ci: number) => {
    setTabelas(p => p.map(t => {
      if (t.nome_tabela !== nomeTabela) return t
      const novas = t.colunas_pdf.includes(ci)
        ? t.colunas_pdf.filter(i => i !== ci)
        : [...t.colunas_pdf, ci].sort((a, b) => a - b)
      return { ...t, colunas_pdf: novas }
    }))
  }

  const moverBloco = (idx: number, dir: 'cima' | 'baixo') => {
    setBlocosPdf(p => {
      const a = [...p]
      const ni = dir === 'cima' ? idx - 1 : idx + 1
      if (ni < 0 || ni >= a.length) return a
      ;[a[idx], a[ni]] = [a[ni], a[idx]]
      return a
    })
  }

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
        const linhasBloco = linhasOverride ?? (bloco.nome_tabela ? linhasPorTabela[bloco.nome_tabela] : undefined)
          ?? (await (await fetch(`/api/linhas/${paginaId}?nome_tabela=${bloco.nome_tabela}`)).json())
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
      if (tabelas.length > 0) await salvarMeta({ ...tabelas[0], blocos_pdf: blocosPdf })
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

  return (
    <>
      {(pdfsSalvos ?? []).length > 0 && (
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

        {(tabelas ?? []).map(t => (
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
                <button onClick={() => moverBloco(idx, 'cima')} disabled={idx === 0} className="text-black disabled:opacity-20"><FaArrowUp size={10} /></button>
                <FaGripVertical className="text-black mx-auto" size={12} />
                <button onClick={() => moverBloco(idx, 'baixo')} disabled={idx === blocosPdf.length - 1} className="text-black disabled:opacity-20"><FaArrowDown size={10} /></button>
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
                        {(tabelas ?? []).map(t => <option key={t.nome_tabela} value={t.nome_tabela}>{t.nome_tabela}</option>)}
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
  )
}