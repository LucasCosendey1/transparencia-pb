'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from './Header'
import VLibras from 'vlibras-nextjs'
import {
  FaHome, FaFilePdf, FaDownload, FaPlus, FaTrash,
  FaEdit, FaSave, FaTimes, FaFileAlt, FaTable,
  FaArrowLeft, FaArrowRight, FaEye
} from 'react-icons/fa'

interface TabelaConteudo {
  titulo_tabela: string
  texto_intro: string
  colunas: string[]
  linhas: string[][]
}

interface Props {
  paginaId: string
  titulo: string
  breadcrumb: string
}

type Modo = 'visualizar' | 'editar-tabela' | 'gerar-pdf'

export default function PdfPageLayout({ paginaId, titulo, breadcrumb }: Props) {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [modo, setModo] = useState<Modo>('visualizar')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  // Dados da tabela
  const [tabela, setTabela] = useState<TabelaConteudo>({
    titulo_tabela: '',
    texto_intro: '',
    colunas: ['Coluna 1', 'Coluna 2', 'Coluna 3'],
    linhas: [['', '', '']],
    })

  // PDF publicado
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pdfAtualizado, setPdfAtualizado] = useState<string | null>(null)

  // Estado do gerador de PDF
  const [textoPdf, setTextoPdf] = useState('')
  const [tituloPdf, setTituloPdf] = useState('')

  const adjustFontSize = (change: number) =>
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))

  // ── Carregar dados ──────────────────────────────────────────
  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [resTab, resPdf] = await Promise.all([
        fetch(`/api/tabela/${paginaId}`),
        fetch(`/api/pdf/${paginaId}`),
      ])
      const dadosTab = await resTab.json()
      const dadosPdf = await resPdf.json()

      if (dadosTab) {
  setTabela({
    titulo_tabela: dadosTab.titulo_tabela || '',
    texto_intro:   dadosTab.texto_intro   || '',
    colunas: Array.isArray(dadosTab.colunas) && dadosTab.colunas.length > 0
      ? dadosTab.colunas
      : ['Coluna 1', 'Coluna 2', 'Coluna 3'],
    linhas: Array.isArray(dadosTab.linhas) && dadosTab.linhas.length > 0
      ? dadosTab.linhas
      : [['', '', '']],
  })
}
      if (dadosPdf?.pdf_base64) setPdfBase64(dadosPdf.pdf_base64)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Salvar tabela ───────────────────────────────────────────
  const salvarTabela = async () => {
    setSalvando(true)
    try {
      await fetch(`/api/tabela/${paginaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabela),
      })
      alert('✅ Tabela salva com sucesso!')
    } catch {
      alert('❌ Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Manipular tabela ────────────────────────────────────────
  const addColuna = () => {
    setTabela(prev => ({
      ...prev,
      colunas: [...prev.colunas, `Coluna ${prev.colunas.length + 1}`],
      linhas: prev.linhas.map(l => [...l, '']),
    }))
  }

  const removeColuna = (ci: number) => {
    if (tabela.colunas.length <= 1) return
    setTabela(prev => ({
      ...prev,
      colunas: prev.colunas.filter((_, i) => i !== ci),
      linhas: prev.linhas.map(l => l.filter((_, i) => i !== ci)),
    }))
  }

  const addLinha = () => {
    setTabela(prev => ({
      ...prev,
      linhas: [...prev.linhas, prev.colunas.map(() => '')],
    }))
  }

  const removeLinha = (li: number) => {
    setTabela(prev => ({
      ...prev,
      linhas: prev.linhas.filter((_, i) => i !== li),
    }))
  }

  const setCelula = (li: number, ci: number, val: string) => {
    setTabela(prev => {
      const novas = prev.linhas.map(l => [...l])
      novas[li][ci] = val
      return { ...prev, linhas: novas }
    })
  }

  const setColuna = (ci: number, val: string) => {
    setTabela(prev => {
      const novas = [...prev.colunas]
      novas[ci] = val
      return { ...prev, colunas: novas }
    })
  }

  // ── Gerar PDF com jsPDF ─────────────────────────────────────
  const gerarPDF = async () => {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const marginX = 15

  // Monta HTML temporário para renderizar com doc.html()
  const htmlContent = `
    <div style="font-family: helvetica; padding: 15mm; width: 180mm;">
      <h1 style="font-size: 16pt; margin-bottom: 4mm;">${tituloPdf || titulo}</h1>
      <p style="font-size: 9pt; color: #666; margin-bottom: 6mm;">
        Gerado em: ${new Date().toLocaleDateString('pt-BR')}
      </p>
      ${textoPdf ? `<div style="font-size: 11pt; margin-bottom: 6mm;">${textoPdf}</div>` : ''}
    </div>
  `

  await new Promise<void>(resolve => {
    doc.html(htmlContent, {
      callback: (doc) => {
        // Adiciona tabela após o HTML
        if (tabela.colunas.length > 0 && tabela.linhas.length > 0) {
          const finalY = (doc as any).lastAutoTable?.finalY ?? doc.internal.pageSize.height * 0.3
          autoTable(doc, {
            startY: finalY + 5,
            head: [tabela.colunas],
            body: tabela.linhas,
            theme: 'striped',
            headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: marginX, right: marginX },
          })
        }
        resolve()
      },
      x: 0,
      y: 0,
      width: 180,
      windowWidth: 680,
    })
  })

  const base64 = doc.output('datauristring').split(',')[1]
  setPdfAtualizado(base64)
  return base64
}

  // ── Publicar PDF ────────────────────────────────────────────
  const publicarPDF = async () => {
    setSalvando(true)
    try {
      const base64 = pdfAtualizado ?? await gerarPDF()
      await fetch(`/api/pdf/${paginaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64: base64 }),
      })
      setPdfBase64(base64)
      setPdfAtualizado(null)
      setModo('visualizar')
      alert('✅ PDF publicado com sucesso!')
    } catch {
      alert('❌ Erro ao publicar PDF.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Download do PDF publicado ───────────────────────────────
  const downloadPdf = () => {
    if (!pdfBase64) return
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${pdfBase64}`
    link.download = `${paginaId}.pdf`
    link.click()
  }

  const hc = highContrast

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${hc ? 'bg-black' : 'bg-gray-50'}`} style={{ fontSize }}>
      <Header
        highContrast={hc}
        fontSize={fontSize}
        adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast}
        setFontSize={setFontSize}
      />

      {/* Breadcrumb */}
      <div className={`${hc ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${hc ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className={hc ? 'text-yellow-300' : 'text-gray-600'}>{breadcrumb}</span>
          </div>

          {/* Botões de modo (admin) */}
          {isAdmin && (
            <div className="flex gap-2">
              {modo !== 'visualizar' && (
                <button
                  onClick={() => setModo('visualizar')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  <FaEye size={11} /> Visualizar
                </button>
              )}
              {modo !== 'editar-tabela' && (
                <button
                  onClick={() => setModo('editar-tabela')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <FaTable size={11} /> Editar Tabela
                </button>
              )}
              {modo !== 'gerar-pdf' && (
                <button
                  onClick={() => { setTituloPdf(tabela.titulo_tabela || titulo); setTextoPdf(tabela.texto_intro || ''); setModo('gerar-pdf') }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  <FaFilePdf size={11} /> Gerar PDF
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className={`${hc ? 'bg-black' : 'bg-gray-50'} py-10`}>
        <div className="max-w-7xl mx-auto px-4">

          <h1 className={`text-4xl font-bold mb-8 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
            {titulo}
          </h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (

            <>
              {/* ── MODO VISUALIZAR ── */}
              {modo === 'visualizar' && (
                <>
                  {pdfBase64 ? (
                    <>
                      <div className="mb-6">
                        <button
                          onClick={downloadPdf}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
                        >
                          <FaDownload /> Baixar PDF
                        </button>
                      </div>
                      <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-4`}>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                          <FaFilePdf className="text-red-600 text-2xl" />
                          <h2 className={`text-xl font-semibold ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
                            Visualizar documento
                          </h2>
                        </div>
                        <div className="w-full" style={{ height: 800 }}>
                          <iframe
                            src={`data:application/pdf;base64,${pdfBase64}`}
                            className="w-full h-full border-0 rounded"
                            title={titulo}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Sem PDF ainda — mostra tabela como preview */
                    tabela.linhas.length > 0 && tabela.colunas.length > 0 ? (
                      <TabelaPreview tabela={tabela} hc={hc} />
                    ) : (
                      <div className={`${hc ? 'bg-gray-900 text-yellow-300' : 'bg-white text-gray-500'} rounded-lg shadow-md p-12 text-center`}>
                        <FaFileAlt className="mx-auto text-5xl mb-4 opacity-30" />
                        <p className="text-lg">Conteúdo em breve.</p>
                        {isAdmin && (
                          <p className="text-sm mt-2 opacity-70">Use "Editar Tabela" para adicionar conteúdo.</p>
                        )}
                      </div>
                    )
                  )}
                </>
              )}

              {/* ── MODO EDITAR TABELA ── */}
              {modo === 'editar-tabela' && (
                <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md p-6`}>
                  <h2 className={`text-xl font-bold mb-6 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
                    Editar Tabela
                  </h2>

                  {/* Título da tabela */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                      Título da tabela
                    </label>
                    <input
                      type="text"
                      value={tabela.titulo_tabela}
                      onChange={e => setTabela(p => ({ ...p, titulo_tabela: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Texto introdutório */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-1 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                        Texto introdutório
                    </label>
                    <div
                        id="texto-intro-editor"
                        onInput={e => setTabela(p => ({ ...p, texto_intro: (e.target as HTMLDivElement).innerHTML }))}
                        dangerouslySetInnerHTML={{ __html: tabela.texto_intro }}
                        className="w-full min-h-[100px] px-3 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    </div>

                  {/* Tabela editável */}
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="w-8 p-1" />
                          {tabela.colunas.map((col, ci) => (
                            <th key={ci} className="p-1">
                              <div className="flex items-center gap-1">
                                <input
                                  value={col}
                                  onChange={e => setColuna(ci, e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-gray-800 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                                <button
                                  onClick={() => removeColuna(ci)}
                                  className="text-red-400 hover:text-red-600 flex-shrink-0"
                                  title="Remover coluna"
                                >
                                  <FaTimes size={10} />
                                </button>
                              </div>
                            </th>
                          ))}
                          <th className="p-1">
                            <button
                              onClick={addColuna}
                              className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-300 text-xs"
                              title="Adicionar coluna"
                            >
                              <FaPlus size={10} />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabela.linhas.map((linha, li) => (
                          <tr key={li} className={li % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="p-1 text-center">
                              <button
                                onClick={() => removeLinha(li)}
                                className="text-red-400 hover:text-red-600"
                                title="Remover linha"
                              >
                                <FaTrash size={10} />
                              </button>
                            </td>
                            {linha.map((cel, ci) => (
                              <td key={ci} className="p-1">
                                <input
                                  value={cel}
                                  onChange={e => setCelula(li, ci, e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                              </td>
                            ))}
                            <td />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={addLinha}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
                    >
                      <FaPlus size={11} /> Adicionar linha
                    </button>
                    <button
                      onClick={salvarTabela}
                      disabled={salvando}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60"
                    >
                      <FaSave size={11} /> {salvando ? 'Salvando…' : 'Salvar tabela'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODO GERAR PDF ── */}
              {modo === 'gerar-pdf' && (
                <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md p-6`}>
                  <h2 className={`text-xl font-bold mb-6 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
                    Gerar PDF
                  </h2>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                      Título do documento
                    </label>
                    <input
                      type="text"
                      value={tituloPdf}
                      onChange={e => setTituloPdf(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-1 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                      Texto introdutório
                    </label>
                    <textarea
                      rows={4}
                      value={textoPdf}
                      onChange={e => setTextoPdf(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Texto que aparece antes da tabela no PDF…"
                    />
                  </div>

                  {/* Preview da tabela */}
                  {tabela.colunas.length > 0 && (
                    <div className="mb-6">
                      <p className={`text-sm font-medium mb-2 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                        Tabela que será incluída:
                      </p>
                      <TabelaPreview tabela={{ ...tabela, titulo_tabela: tituloPdf, texto_intro: textoPdf }} hc={hc} />
                    </div>
                  )}

                  {/* Preview do PDF gerado */}
                  {pdfAtualizado && (
                    <div className="mb-6">
                      <p className={`text-sm font-medium mb-2 ${hc ? 'text-yellow-300' : 'text-gray-700'}`}>
                        Pré-visualização do PDF:
                      </p>
                      <div style={{ height: 500 }} className="border rounded overflow-hidden">
                        <iframe
                          src={`data:application/pdf;base64,${pdfAtualizado}`}
                          className="w-full h-full border-0"
                          title="Preview PDF"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={async () => { await gerarPDF(); }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition"
                    >
                      <FaEye size={11} /> Pré-visualizar PDF
                    </button>
                    <button
                      onClick={publicarPDF}
                      disabled={salvando}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition disabled:opacity-60"
                    >
                      <FaFilePdf size={11} /> {salvando ? 'Publicando…' : 'Publicar PDF na página'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}

// ── Componente auxiliar: preview da tabela ──────────────────
function TabelaPreview({ tabela, hc }: { tabela: TabelaConteudo; hc: boolean }) {
  return (
    <div className={`${hc ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-4 overflow-x-auto`}>
      {tabela.titulo_tabela && (
        <h3 className={`text-lg font-bold mb-2 ${hc ? 'text-yellow-300' : 'text-gray-800'}`}>
          {tabela.titulo_tabela}
        </h3>
      )}
      {tabela.texto_intro && (
        <div
            className={`text-sm mb-4 ${hc ? 'text-yellow-200' : 'text-gray-600'}`}
            dangerouslySetInnerHTML={{ __html: tabela.texto_intro }}
        />
        )}
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            {tabela.colunas.map((col, i) => (
              <th key={i} className="px-4 py-2 text-left font-semibold border border-blue-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabela.linhas.map((linha, li) => (
            <tr key={li} className={li % 2 === 0 ? (hc ? 'bg-gray-800' : 'bg-gray-50') : (hc ? 'bg-gray-900' : 'bg-white')}>
              {linha.map((cel, ci) => (
                <td key={ci} className={`px-4 py-2 border ${hc ? 'border-gray-700 text-yellow-200' : 'border-gray-200 text-gray-700'}`}>
                  {cel}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}