// componentes/PreferencesContext.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PreferencesContextType {
  highContrast: boolean
  fontSize: number
  setHighContrast: (value: boolean) => void
  setFontSize: (size: number) => void
  adjustFontSize: (change: number) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrastState] = useState(false)
  const [fontSize, setFontSizeState] = useState(16)
  const [loaded, setLoaded] = useState(false)

  // Carrega do localStorage apenas uma vez
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedContrast = localStorage.getItem('highContrast')
    const savedFontSize = localStorage.getItem('fontSize')

    if (savedContrast !== null) {
      setHighContrastState(savedContrast === 'true')
    }

    if (savedFontSize !== null) {
      const size = parseInt(savedFontSize, 10)
      if (!isNaN(size)) {
        setFontSizeState(size)
      }
    }

    setLoaded(true)
  }, [])

  // Salva no localStorage quando mudar
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('highContrast', String(highContrast))
  }, [highContrast, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('fontSize', String(fontSize))
  }, [fontSize, loaded])

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value)
  }

  const setFontSize = (size: number) => {
    setFontSizeState(Math.max(12, Math.min(24, size)))
  }

  const adjustFontSize = (change: number) => {
    setFontSize(fontSize + change)
  }

  return (
    <PreferencesContext.Provider value={{ highContrast, fontSize, setHighContrast, setFontSize, adjustFontSize }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}