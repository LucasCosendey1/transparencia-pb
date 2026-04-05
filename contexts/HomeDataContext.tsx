// contexts/HomeDataContext.tsx

'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface ButtonData {
  chave: string
  titulo: string
  caminho: string | null
  description?: string
}

interface FooterData {
  chave: string
  titulo: string
  caminho: string | null
}

interface HomeData {
  buttonsData: Record<string, ButtonData>
  footerData: Record<string, FooterData>
  ultimasAt: Record<string, string>
  loading: boolean
  refetch: () => Promise<void>
}

const CACHE_KEY = 'home-data-cache'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutos

const HomeDataContext = createContext<HomeData>({
  buttonsData: {},
  footerData: {},
  ultimasAt: {},
  loading: true,
  refetch: async () => {},
})

export function useHomeData() {
  return useContext(HomeDataContext)
}

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCache(data: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export function HomeDataProvider({ children }: { children: ReactNode }) {
  const [buttonsData, setButtonsData] = useState<Record<string, ButtonData>>({})
  const [footerData, setFooterData] = useState<Record<string, FooterData>>({})
  const [ultimasAt, setUltimasAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const processData = useCallback((data: any) => {
    const bMap: Record<string, ButtonData> = {}
    data.buttons.forEach((b: ButtonData) => { bMap[b.chave] = b })
    setButtonsData(bMap)

    if (Array.isArray(data.footer)) {
      const fMap: Record<string, FooterData> = {}
      data.footer.forEach((f: FooterData) => { fMap[f.chave] = f })
      setFooterData(fMap)
    }
    setUltimasAt(data.ultimaAtualizacao || {})
    setLoading(false)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/home-data')
      const data = await res.json()
      setCache(data)
      processData(data)
    } catch {
      setLoading(false)
    }
  }, [processData])

  // Carrega: primeiro do cache, depois do servidor se expirado
  useEffect(() => {
    const cached = getCache()
    if (cached) {
      processData(cached)
    } else {
      fetchData()
    }
  }, [fetchData, processData])

  // refetch força busca no servidor e atualiza cache
  const refetch = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  return (
    <HomeDataContext.Provider value={{ buttonsData, footerData, ultimasAt, loading, refetch }}>
      {children}
    </HomeDataContext.Provider>
  )
}