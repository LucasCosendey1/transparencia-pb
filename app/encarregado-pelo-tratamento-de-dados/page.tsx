'use client'

import Header from '../../components/Header'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHome, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function EncarregadoDadosPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const PAGE_ID = 'encarregado-dados'

  // Conteúdo padrão original mantendo a formatação
  const DEFAULT_CONTENT = `<p class="leading-relaxed text-gray-700">Nos termos da Lei nº 13.709/2018 (LGPD), informamos que o Encarregado pelo Tratamento de Dados Pessoais do Município é o <strong>Procurador-Geral, Jhon Kennedy de Oliveira</strong>, estando disponível para contato através do e-mail institucional: <a href="mailto:pgm@itabaiana.pb.gov.br" class="text-blue-600 hover:underline font-semibold">pgm@itabaiana.pb.gov.br</a>.</p>`

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/pages/${PAGE_ID}`)
      const data = await response.json()
      
      if (data.conteudo) {
        setContent(data.conteudo)
      } else {
        setContent(DEFAULT_CONTENT)
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
      setContent(DEFAULT_CONTENT)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const editableDiv = document.getElementById('editable-content')
    if (!editableDiv) return

    const updatedContent = editableDiv.innerHTML

    try {
      const response = await fetch('/api/pages/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina_id: PAGE_ID,
          conteudo: updatedContent
        })
      })

      const result = await response.json()

      if (response.ok) {
        setContent(updatedContent)
        setIsEditing(false)
        alert('✅ Conteúdo salvo com sucesso!')
      } else {
        console.error('Erro na resposta:', result)
        alert('❌ Erro ao salvar: ' + (result.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('❌ Erro ao salvar o conteúdo. Verifique o console.')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    const editableDiv = document.getElementById('editable-content')
    if (editableDiv) {
      editableDiv.innerHTML = content
    }
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
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Encarregado pelo Tratamento de Dados</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-4xl font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Encarregado pelo Tratamento de Dados
            </h1>

            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit /> Editar Conteúdo
              </button>
            )}

            {isAdmin && isEditing && (
              <div className="flex gap-2">
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

          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <div
              id="editable-content"
              contentEditable={isEditing}
              suppressContentEditableWarning
              className={`leading-relaxed min-h-[100px] ${
                isEditing ? 'outline outline-2 outline-blue-500 outline-dashed p-4 rounded bg-blue-50' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {isEditing && (
              <p className="text-sm text-blue-600 mt-4 font-medium">
                💡 Use o editor de texto avançado na lateral esquerda para formatar
              </p>
            )}
          </div>
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}