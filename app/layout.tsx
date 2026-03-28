'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  const adjustFontSize = (n: number) => setFontSize(p => Math.max(12, Math.min(24, p + n)))

  // Aplica fontSize globalmente NO BODY e HTML
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
    document.body.style.fontSize = `${fontSize}px`
  }, [fontSize])

  // Aplica tema globalmente
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('bg-black', 'text-yellow-300')
      document.body.classList.remove('bg-white', 'text-gray-800')
      document.documentElement.classList.add('bg-black')
      document.documentElement.classList.remove('bg-white')
    } else {
      document.body.classList.add('bg-white', 'text-gray-800')
      document.body.classList.remove('bg-black', 'text-yellow-300')
      document.documentElement.classList.add('bg-white')
      document.documentElement.classList.remove('bg-black')
    }
  }, [highContrast])

  return (
    <html lang="pt-BR" style={{ fontSize: `${fontSize}px` }}>
      <body style={{ fontSize: `${fontSize}px` }}>
        <Header
          fontSize={fontSize}
          setFontSize={setFontSize}
          adjustFontSize={adjustFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
        {children}
      </body>
    </html>
  )
}