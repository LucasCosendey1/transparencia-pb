'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePreferences } from '@/contexts/PreferencesContext'



interface HeaderProps {
  highContrast?: boolean
  fontSize?: number
  adjustFontSize?: (change: number) => void
  setHighContrast?: (value: boolean) => void
  setFontSize?: (size: number) => void
}

const SECTIONS = [
  { id: 'lgpd-&-governo-digital',                        color: '#ffc107' },
  { id: 'consultas-sobre-despesas',                      color: '#7cb342' },
  { id: 'consultas-sobre-receitas',                      color: '#0d6efd' },
  { id: 'consultas-sobre-recursos-humanos',              color: '#e91e63' },
  { id: 'consultas-sobre-licitações,-contratos-e-obras', color: '#ff9800' },
  { id: 'consultas-sobre-responsabilidade-fiscal',       color: '#5c6bc0' },
  { id: 'consultas-sobre-a-gestão-municipal',            color: '#8bc34a' },
  { id: 'consultas-sobre-participação-cidadã',           color: '#00bcd4' },
  { id: 'consultas-sobre-educação-&-saúde',              color: '#ffc107' },
]

const GRADIENT = 'linear-gradient(to right, #0d6efd, #ffc107, #0d6efd)'

export default function Header(props?: HeaderProps) {
  const { highContrast, fontSize, setHighContrast, setFontSize, adjustFontSize } = usePreferences()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark' | 'contrast'>('light')
  const [internalFontSize, setInternalFontSize] = useState(16)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentColor, setCurrentColor] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const router = useRouter()
  const tickingRef = useRef(false)
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const scrolled = scrollY > 50
        setIsScrolled(scrolled)

        let detected: string | null = null
        for (const section of SECTIONS) {
          const el = document.getElementById(section.id)
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= 150 && rect.bottom >= 150) {
              detected = section.color
              break
            }
          }
        }

        if (scrolled && detected && detected !== currentColor) {
          setCurrentColor(detected)
          setIsAnimating(true)
          if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
          animTimeoutRef.current = setTimeout(() => setIsAnimating(false), 600)
        } else if (!scrolled && currentColor !== null) {
          setCurrentColor(null)
          setIsAnimating(false)
          if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
        }

        tickingRef.current = false
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [currentColor])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('#mobile-menu') && !t.closest('#hamburger-btn')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (query.length < 2) {
      setShowResults(false)
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const results = await response.json()
        setSearchResults(results)
        setShowResults(results.length > 0)
      } catch (error) {
        console.error('Erro ao buscar:', error)
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)
  }

  const handleResultClick = (result: any) => {
    if (result.caminho) {
      router.push(result.caminho)
    }
    setSearchQuery('')
    setShowResults(false)
    setMobileOpen(false)
  }

  const toggleVLibras = () => {
  const btn = document.querySelector('.vp-btn, [class*="vp-btn"], .vp-access-button') as HTMLElement
  if (btn) {
    btn.style.display = 'block'
    btn.click()
    setTimeout(() => { btn.style.display = 'none' }, 100)
  }
}

  const navLinks = [
    { href: '/portal',                                                                        label: 'O Portal'      },
    { href: 'https://portal.itabaiana.pb.gov.br/mrosc/',                                     label: 'Parcerias'     },
    { href: '/contato',                                                                       label: 'Fale Conosco'  },
    { href: 'https://portal.itabaiana.pb.gov.br/perguntas-frequentes/',                      label: 'FAQ'           },
    { href: '/glossario',                                                                     label: 'Glossário'     },
    { href: 'https://transparencia.elmartecnologia.com.br/DadosAbertos?e=201089&ctx=201089', label: 'Dados Abertos' },
    { href: 'https://transparencia.itabaiana.pb.gov.br/page-sitemap.xml',                    label: 'Mapa do Site'  },
  ]

  const getThemeClasses = () => {
    if (highContrast) {
      return {
        header: 'bg-black border-b-4 border-yellow-300',
        text: 'text-yellow-300',
        textHover: 'hover:text-yellow-400',
        input: 'bg-black text-yellow-300 border-yellow-300 placeholder-yellow-600',
        button: 'bg-yellow-400 text-black hover:bg-yellow-500',
        drawer: 'bg-black border-r-4 border-yellow-300',
        searchResult: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300',
        searchResultBorder: 'border-yellow-300',
        hamburger: 'bg-yellow-300',
      }
    }
    return {
      header: 'bg-white shadow-sm',
      text: 'text-gray-700',
      textHover: 'hover:text-[#ffc107]',
      input: 'bg-white text-black border-gray-300 placeholder-gray-400',
      button: 'bg-gray-100 text-[#0d6efd] hover:bg-gray-200',
      drawer: 'bg-white',
      searchResult: 'bg-white hover:bg-blue-50 text-gray-800',
      searchResultBorder: 'border-gray-200',
      hamburger: 'bg-gray-700',
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <>
      <style>{`
        @keyframes spreadCenter {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .color-bar-base {
          position: absolute; inset: 0; height: 100%;
        }
        .color-bar-anim {
          position: absolute; inset: 0; height: 100%;
          transform-origin: center;
          animation: spreadCenter 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .vlibras-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px 2px 4px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #1351b4;
          color: #fff;
          transition: background 0.15s;
          height: 32px;
        }
        .vlibras-btn:hover { background: #0d3e8a; }
        .vlibras-btn img { width: 22px; height: 22px; object-fit: contain; }
      `}</style>

      {/* Header Principal */}
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] ${themeClasses.header} transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}
        style={{ fontSize: `${fontSize}px` }}
      >

        {/* Linha 1: Botões de Acessibilidade */}
        <div className={`border-b ${themeClasses.searchResultBorder}`}>
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end items-center gap-2">

            {/* Botão VLibras com visual padrão gov.br */}
            <button onClick={toggleVLibras} className="vlibras-btn" title="VLibras - Acessibilidade em Libras">
            <img src="/vlibras.png" alt="VLibras" />
            <span>VLibras</span>
          </button>

            <button
              onClick={() => adjustFontSize(1)}
              className={`${themeClasses.button} font-bold px-2.5 py-1 text-xs rounded transition-colors`}
              title="Aumentar fonte"
            >A+</button>

            <button
              onClick={() => setFontSize(16)}
              className={`${themeClasses.button} font-bold px-2.5 py-1 text-xs rounded transition-colors`}
              title="Fonte padrão"
            >A</button>

            <button
              onClick={() => adjustFontSize(-1)}
              className={`${themeClasses.button} font-bold px-2.5 py-1 text-xs rounded transition-colors`}
              title="Diminuir fonte"
            >A-</button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`${themeClasses.button} px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1`}
              title={`Contraste: ${highContrast ? 'Alto' : 'Normal'}`}
            >
              <span>◐</span>
              <span className="hidden lg:inline">{highContrast ? 'Contraste' : 'Normal'}</span>
            </button>

          </div>
        </div>

        {/* Linha 2: Logo, Menu e Busca */}
        <div className={`max-w-7xl mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/ItabaianaCidadeDoTrabalho.png"
                alt="Itabaiana - Cidade do Trabalho"
                width={200}
                height={65}
                className="logo-image object-contain w-32 sm:w-44 lg:w-52"
                priority
              />
            </Link>

            {/* Menu Desktop */}
            <nav className="hidden lg:flex flex-1 justify-center">
              <ul className="flex space-x-5 text-sm">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={`menu-link ${themeClasses.text} ${themeClasses.textHover} font-medium transition-colors`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Busca Desktop */}
            <div className="hidden lg:block flex-shrink-0 w-56 xl:w-64 relative">
              <input
                type="search"
                placeholder="Pesquisar páginas..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className={`w-full px-4 py-2 text-sm border ${themeClasses.input} rounded focus:outline-none focus:ring-2 focus:ring-[#0d6efd] transition-colors`}
              />
              {showResults && searchResults.length > 0 && (
                <div className={`absolute top-full mt-1 w-full ${themeClasses.searchResult} border ${themeClasses.searchResultBorder} rounded shadow-lg z-50 max-h-64 overflow-y-auto`}>
                  {searchResults.map((result: any, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left px-4 py-2 border-b ${themeClasses.searchResultBorder} ${themeClasses.searchResult} transition-colors`}
                    >
                      <div className="font-semibold">{result.titulo}</div>
                      {result.description && (
                        <div className="text-xs opacity-70">{result.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger Mobile */}
            <button
              id="hamburger-btn"
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <span className={`block h-0.5 w-6 transition-all duration-300 ${themeClasses.hamburger} ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 transition-all duration-300 ${themeClasses.hamburger} ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 transition-all duration-300 ${themeClasses.hamburger} ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Linha colorida */}
        <div className="relative h-1 w-full overflow-hidden">
          {!isScrolled || currentColor === null ? (
            <div className="color-bar-base" style={{ background: GRADIENT }} />
          ) : isAnimating ? (
            <div key={currentColor} className="color-bar-anim" style={{ background: currentColor }} />
          ) : (
            <div className="color-bar-base" style={{ background: currentColor }} />
          )}
        </div>
      </header>

      {/* Overlay Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer Mobile */}
      <div
        id="mobile-menu"
        className={`fixed top-0 left-0 h-full w-72 z-50 lg:hidden flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${themeClasses.drawer} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center justify-between px-4 py-4 border-b ${themeClasses.searchResultBorder}`}>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image src="/ItabaianaCidadeDoTrabalho.png" alt="Itabaiana" width={140} height={45} className="object-contain" />
          </Link>
          <button onClick={() => setMobileOpen(false)} className={`p-2 rounded ${themeClasses.text}`} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <div className="px-4 py-3 relative">
          <input
            type="search"
            placeholder="Pesquisar páginas..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className={`w-full px-4 py-2 text-sm border ${themeClasses.input} rounded focus:outline-none focus:ring-2 focus:ring-[#0d6efd] transition-colors`}
          />
          {showResults && searchResults.length > 0 && (
            <div className={`absolute top-full left-4 right-4 mt-1 ${themeClasses.searchResult} border ${themeClasses.searchResultBorder} rounded shadow-lg z-50 max-h-48 overflow-y-auto`}>
              {searchResults.map((result: any, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left px-4 py-2 border-b text-sm ${themeClasses.searchResultBorder} ${themeClasses.searchResult} transition-colors`}
                >
                  <div className="font-semibold">{result.titulo}</div>
                  {result.description && (
                    <div className="text-xs opacity-70">{result.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <ul className="space-y-1">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${themeClasses.text} ${themeClasses.searchResult} transition-colors`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`px-4 py-3 border-t ${themeClasses.searchResultBorder}`}>
          <p className={`text-xs font-semibold mb-2 ${themeClasses.text}`}>ACESSIBILIDADE</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={toggleVLibras} className="vlibras-btn" title="VLibras - Acessibilidade em Libras">
              <img src="/vlibras.png" alt="VLibras" />
              <span>VLibras</span>
            </button>
            <button onClick={() => adjustFontSize(1)} className={`px-3 py-1.5 rounded text-xs font-bold ${themeClasses.button} transition-colors`}>A+</button>
            <button onClick={() => setFontSize(16)} className={`px-3 py-1.5 rounded text-xs font-bold ${themeClasses.button} transition-colors`}>A</button>
            <button onClick={() => adjustFontSize(-1)} className={`px-3 py-1.5 rounded text-xs font-bold ${themeClasses.button} transition-colors`}>A-</button>
            <button onClick={() => setHighContrast(!highContrast)} className={`px-3 py-1.5 rounded text-xs ${themeClasses.button} transition-colors`}>
              ◐ {highContrast ? 'Contraste' : 'Normal'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}