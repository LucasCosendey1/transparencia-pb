'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function InscritosDividaAtivaPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  // Link do Google Drive em modo visualização completa
  const driveLink = 'https://drive.google.com/file/d/1NftVQsg-SPq409SIboGY_FSGdYurlPQ5/view'
  // Extrai o ID e usa o visualizador do Google Docs
  const fileId = '1NftVQsg-SPq409SIboGY_FSGdYurlPQ5'
  const embedLink = `https://drive.google.com/file/d/${fileId}/preview`

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
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Inscritos em Dívida Ativa</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-4">
          
          <h1 className={`text-4xl font-bold mb-8 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Inscritos em Dívida Ativa
          </h1>

          {/* Botão para Acessar Google Drive */}
          <div className="mb-8">
            <a 
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
            >
              <FaExternalLinkAlt /> Acessar no Google Drive
            </a>
          </div>

          {/* Visualizador de PDF do Google Drive */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-4`}>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <FaFilePdf className="text-red-600 text-2xl" />
              <h2 className={`text-xl font-semibold ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
                Visualizar Documento
              </h2>
            </div>
            
            <div className="w-full relative" style={{ height: '1000px' }}>
              <iframe
                src={embedLink}
                className="w-full h-full border-0 rounded"
                title="Inscritos em Dívida Ativa"
                allow="autoplay"
                style={{ overflow: 'auto' }}
              />
            </div>
          </div>
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}