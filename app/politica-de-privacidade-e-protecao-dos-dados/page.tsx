'use client'

import Header from '../../components/Header'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHome, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function PoliticaProtecaoDadosPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const PAGE_ID = 'politica-privacidade'

  const DEFAULT_TITLE = 'Política de Privacidade e Proteção de Dados'
  const DEFAULT_CONTENT = `[Conteúdo HTML completo aqui]`

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/pages/${PAGE_ID}`)
      const data = await response.json()
      
      if (data.titulo) {
        setTitle(data.titulo)
      } else {
        setTitle(DEFAULT_TITLE)
      }

      if (data.conteudo) {
        setContent(data.conteudo)
      } else {
        setContent(DEFAULT_CONTENT)
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
      setTitle(DEFAULT_TITLE)
      setContent(DEFAULT_CONTENT)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const titleDiv = document.getElementById('editable-title')
    const contentDiv = document.getElementById('editable-content')
    if (!titleDiv || !contentDiv) return

    const updatedTitle = titleDiv.innerText
    const updatedContent = contentDiv.innerHTML

    try {
      const response = await fetch('/api/pages/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina_id: PAGE_ID,
          titulo: updatedTitle,
          conteudo: updatedContent
        })
      })

      if (response.ok) {
        setTitle(updatedTitle)
        setContent(updatedContent)
        setIsEditing(false)
        alert('✅ Conteúdo salvo com sucesso!')
      } else {
        alert('❌ Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('❌ Erro ao salvar o conteúdo')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    const titleDiv = document.getElementById('editable-title')
    const contentDiv = document.getElementById('editable-content')
    if (titleDiv) titleDiv.innerText = title
    if (contentDiv) contentDiv.innerHTML = content
  }

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-gray-50'}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <Header 
        highContrast={highContrast}
        fontSize={fontSize}
        adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast}
        setFontSize={setFontSize}
      />

      <div className={`${highContrast ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Política de Privacidade e Proteção de Dados</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="flex items-center justify-between mb-6">
            <h1
              id="editable-title"
              contentEditable={isEditing}
              suppressContentEditableWarning
              className={`text-4xl font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-800'} ${
                isEditing ? 'outline outline-2 outline-green-500 outline-dashed px-3 py-2 rounded bg-green-50' : ''
              }`}
            >
              {title}
            </h1>

            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
              >
                <FaEdit /> Editar Página
              </button>
            )}

            {isAdmin && isEditing && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <FaSave /> Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
            )}
          </div>

          <div
            id="editable-content"
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`min-h-[200px] ${
              isEditing ? 'outline outline-2 outline-blue-500 outline-dashed p-4 rounded bg-blue-50' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {isEditing && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-green-600 font-medium">
                🟢 Título: Clique no título acima para editar
              </p>
              <p className="text-sm text-blue-600 font-medium">
                🔵 Conteúdo: Use o editor avançado na lateral esquerda para formatar
              </p>
            </div>
          )}
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}