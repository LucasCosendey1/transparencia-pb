'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function EncarregadoDadosPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
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

      {/* Breadcrumb */}
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
          
          {/* Título */}
          <h1 className={`text-4xl font-bold mb-8 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Encarregado pelo Tratamento de Dados
          </h1>

          {/* Conteúdo */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Nos termos da Lei nº 13.709/2018 (LGPD), informamos que o Encarregado pelo Tratamento de Dados Pessoais do Município é o <strong>Procurador-Geral, Jhon Kennedy de Oliveira</strong>, estando disponível para contato através do e-mail institucional: <a href="mailto:pgm@itabaiana.pb.gov.br" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline font-semibold`}>pgm@itabaiana.pb.gov.br</a>.
            </p>
          </div>
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}