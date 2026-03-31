//components/AbaArquivos.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FaPlus, FaTrash, FaDownload, FaFilePdf, FaFileImage,
  FaFileWord, FaFileExcel, FaFile, FaUpload, FaSpinner,
  FaSearch, FaEye,
} from 'react-icons/fa'

interface ArquivoInfo {
  nome: string
  tipo: string
  tamanho: number
  categoria: string
  url: string
  criado_em: string
}

interface AbaArquivosProps {
  paginaId: string
}

const CATEGORIAS = [
  { value: 'geral', label: 'Geral' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'imagem', label: 'Imagens' },
  { value: 'doc', label: 'Documentos' },
  { value: 'planilha', label: 'Planilhas' },
]

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function iconeArquivo(tipo: string) {
  if (tipo.includes('pdf')) return <FaFilePdf className="text-red-500" size={16} />
  if (tipo.includes('image')) return <FaFileImage className="text-blue-500" size={16} />
  if (tipo.includes('word') || tipo.includes('document')) return <FaFileWord className="text-blue-700" size={16} />
  if (tipo.includes('sheet') || tipo.includes('excel') || tipo.includes('csv')) return <FaFileExcel className="text-green-600" size={16} />
  return <FaFile className="text-gray-500" size={16} />
}

export default function AbaArquivos({ paginaId }: AbaArquivosProps) {
  const [arquivos, setArquivos] = useState<ArquivoInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [categoriaUpload, setCategoriaUpload] = useState('geral')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarArquivos()
  }, [categoriaFiltro])

  const carregarArquivos = async () => {
    setLoading(true)
    try {
      let url = `/api/arquivos-tabela/${paginaId}`
      if (categoriaFiltro) url += `?categoria=${categoriaFiltro}`
      const r = await fetch(url)
      const d = await r.json()
      setArquivos(Array.isArray(d) ? d : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const uploadArquivos = async (files: FileList) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('arquivo', file)
        formData.append('pagina_id', paginaId)
        formData.append('categoria', categoriaUpload)

        const r = await fetch('/api/upload-arquivo', { method: 'POST', body: formData })
        const d = await r.json()
        if (!r.ok) {
          alert(`❌ Erro ao enviar "${file.name}": ${d.error}`)
        }
      }
      await carregarArquivos()
      alert('✅ Upload concluído!')
    } catch (e) {
      alert('❌ Erro no upload.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const deletarArquivo = async (arq: ArquivoInfo) => {
    if (!confirm(`Deletar "${arq.nome}"?`)) return
    try {
      await fetch(`/api/arquivos-tabela/${paginaId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: arq.nome, categoria: arq.categoria }),
      })
      await carregarArquivos()
    } catch (e) {
      alert('❌ Erro ao deletar.')
    }
  }

  const arquivosFiltrados = busca.trim()
    ? arquivos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : arquivos

  return (
    <div>
      {/* Upload */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-800 mb-3">📁 Enviar arquivos</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-black mb-1">Categoria</label>
            <select value={categoriaUpload} onChange={e => setCategoriaUpload(e.target.value)}
              className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-black mb-1">Arquivo(s)</label>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={e => e.target.files && e.target.files.length > 0 && uploadArquivos(e.target.files)}
              className="w-full px-3 py-1.5 border rounded text-sm bg-white text-black file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white file:cursor-pointer"
            />
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <FaSpinner className="animate-spin" size={14} /> Enviando...
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs text-black mb-1">Filtrar por categoria</label>
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}
            className="px-3 py-2 border rounded text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas</option>
            {CATEGORIAS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <label className="block text-xs text-black mb-1">Buscar</label>
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Nome do arquivo..."
              className="w-full pl-7 pr-3 py-2 border rounded text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <p className="text-xs text-gray-500 self-end pb-2">{arquivosFiltrados.length} arquivo(s)</p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-blue-600" size={20} />
        </div>
      ) : arquivosFiltrados.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl">
          <FaUpload className="mx-auto text-3xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Nenhum arquivo encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {arquivosFiltrados.map(arq => (
            <div key={`${arq.categoria}-${arq.nome}`}
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 hover:border-blue-300 transition">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {iconeArquivo(arq.tipo)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-black truncate" title={arq.nome}>{arq.nome}</p>
                  <p className="text-xs text-gray-400">
                    {arq.categoria} · {formatarTamanho(arq.tamanho)} · {new Date(arq.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {/* Preview para imagens e PDFs */}
                {(arq.tipo.includes('image') || arq.tipo.includes('pdf')) && (
                  <button onClick={() => setPreview(arq.url)}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200" title="Visualizar">
                    <FaEye size={10} />
                  </button>
                )}
                {/* Copiar URL */}
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + arq.url)
                  alert('URL copiada!')
                }}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200" title="Copiar URL">
                  📋
                </button>
                {/* Download */}
                <a href={arq.url} download={arq.nome}
                  className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200" title="Baixar">
                  <FaDownload size={10} />
                </a>
                {/* Deletar */}
                <button onClick={() => deletarArquivo(arq)}
                  className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200" title="Deletar">
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-medium text-black truncate">{preview.split('/').pop()}</p>
              <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-red-500 text-lg">✕</button>
            </div>
            <div className="p-4" style={{ height: '75vh' }}>
              {preview.endsWith('.pdf') ? (
                <iframe src={preview} className="w-full h-full border-0 rounded" title="Preview" />
              ) : (
                <img src={preview} alt="Preview" className="max-w-full max-h-full mx-auto object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}