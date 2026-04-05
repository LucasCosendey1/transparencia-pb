//app/layout.tsx

'use client'

import AdvancedTextEditor from '@/components/AdvancedTextEditor'
import { useEffect } from 'react'
import Header from '@/components/Header'
import './globals.css'
import { HomeDataProvider } from '@/contexts/HomeDataContext'
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext'

// Componente interno que usa as preferências
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { fontSize, highContrast } = usePreferences()

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
    <>
      <Header />
      <AdvancedTextEditor />
      <HomeDataProvider>
        {children}
      </HomeDataProvider>
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PreferencesProvider>
          <LayoutContent>{children}</LayoutContent>
        </PreferencesProvider>
      </body>
    </html>
  )
}