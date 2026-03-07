'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

export default function ContatoPage() {
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
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Fale Conosco</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Título */}
          <h1 className={`text-4xl font-bold mb-8 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Fale Conosco
          </h1>

          {/* Conteúdo vazio */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <p className={`text-center ${highContrast ? 'text-yellow-300' : 'text-gray-500'} italic`}>
              Conteúdo em desenvolvimento
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}