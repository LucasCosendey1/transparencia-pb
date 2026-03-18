'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  highContrast: boolean
  fontSize: number
  adjustFontSize: (change: number) => void
  setHighContrast: (value: boolean) => void
  setFontSize: (size: number) => void
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

export default function Header({ highContrast, fontSize, adjustFontSize, setHighContrast, setFontSize }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [, forceRender] = useState(0)

  const isScrolledRef   = useRef(false)
  const currentColorRef = useRef<string | null>(null)
  const prevColorRef    = useRef<string | null>(null)
  const isAnimatingRef  = useRef(false)
  const animTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickingRef      = useRef(false)

  const triggerAnimation = useCallback((from: string, to: string) => {
    prevColorRef.current    = from
    currentColorRef.current = to
    isAnimatingRef.current  = true
    forceRender(n => n + 1)

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    animTimeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false
      forceRender(n => n + 1)
    }, 600)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const scrollY   = window.scrollY
        const scrolled  = scrollY > 50
        const wasScrolled = isScrolledRef.current
        isScrolledRef.current = scrolled

        // Detectar seção atual
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

        if (scrolled && detected) {
          const prev = currentColorRef.current
          if (prev === null) {
            // Primeira detecção: sem animação, sem flash
            currentColorRef.current = detected
            prevColorRef.current    = detected
            forceRender(n => n + 1)
          } else if (prev !== detected) {
            triggerAnimation(prev, detected)
          }
        } else if (!scrolled && wasScrolled) {
          // Voltou ao topo
          currentColorRef.current = null
          prevColorRef.current    = null
          isAnimatingRef.current  = false
          if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
          forceRender(n => n + 1)
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
  }, [triggerAnimation])

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

  const navLinks = [
    { href: '/portal',                                                                        label: 'O Portal'      },
    { href: 'https://portal.itabaiana.pb.gov.br/mrosc/',                                     label: 'Parcerias'     },
    { href: '/contato',                                                                       label: 'Fale Conosco'  },
    { href: 'https://portal.itabaiana.pb.gov.br/perguntas-frequentes/',                      label: 'FAQ'           },
    { href: '/glossario',                                                                     label: 'Glossário'     },
    { href: 'https://transparencia.elmartecnologia.com.br/DadosAbertos?e=201089&ctx=201089', label: 'Dados Abertos' },
    { href: 'https://transparencia.itabaiana.pb.gov.br/page-sitemap.xml',                    label: 'Mapa do Site'  },
  ]

  // Leitura síncrona das refs para o render
  const isScrolled  = isScrolledRef.current
  const curColor    = currentColorRef.current
  const prevColor   = prevColorRef.current
  const isAnimating = isAnimatingRef.current

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
      `}</style>

      {/* Barra de Acessibilidade */}
      <div className={`${highContrast ? 'bg-yellow-300 text-black' : 'bg-white'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end items-center text-xs flex-wrap gap-1">
          <span className={`${highContrast ? 'text-black' : 'text-gray-600'} mr-2`}>Acessibilidade</span>
          <span className="text-gray-400 mx-1">|</span>
          <button onClick={() => adjustFontSize(1)}              className={`mx-1 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}>A+</button>
          <button onClick={() => adjustFontSize(-1)}             className={`mx-1 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}>A-</button>
          <button onClick={() => setFontSize(16)}                className={`mx-1 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}>A</button>
          <span className="text-gray-400 mx-1">|</span>
          <button onClick={() => setHighContrast(!highContrast)} className={`mx-1 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} hover:underline px-2 py-1 rounded`}>◐</button>
        </div>
      </div>

      {/* Header Principal */}
      <header className={`sticky-header ${isScrolled ? 'scrolled' : ''} ${highContrast ? 'bg-black border-b-4 border-yellow-300' : 'bg-white shadow-sm'} relative z-30`}>
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
                    <Link href={link.href} className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107] font-medium transition-colors`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Busca Desktop */}
            <form className="hidden lg:block flex-shrink-0 w-56 xl:w-72">
              <input
                type="search"
                placeholder="Pesquisar..."
                className={`w-full px-4 py-2 text-sm border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'text-black border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-[#0d6efd]`}
              />
            </form>

            {/* Hamburger Mobile */}
            <button
              id="hamburger-btn"
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <span className={`block h-0.5 w-6 transition-all duration-300 ${highContrast ? 'bg-yellow-300' : 'bg-gray-700'} ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 transition-all duration-300 ${highContrast ? 'bg-yellow-300' : 'bg-gray-700'} ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 transition-all duration-300 ${highContrast ? 'bg-yellow-300' : 'bg-gray-700'} ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Linha colorida ── */}
        <div className="relative h-1 w-full overflow-hidden">
          {!isScrolled || curColor === null ? (
            <div className="color-bar-base" style={{ background: GRADIENT }} />
          ) : isAnimating ? (
            <>
              <div className="color-bar-base" style={{ background: prevColor ?? curColor }} />
              <div key={`${prevColor}->${curColor}`} className="color-bar-anim" style={{ background: curColor }} />
            </>
          ) : (
            <div className="color-bar-base" style={{ background: curColor }} />
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
        className={`fixed top-0 left-0 h-full w-72 z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          highContrast ? 'bg-black border-r-4 border-yellow-300' : 'bg-white'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center justify-between px-4 py-4 border-b ${highContrast ? 'border-yellow-300' : 'border-gray-200'}`}>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image src="/ItabaianaCidadeDoTrabalho.png" alt="Itabaiana" width={140} height={45} className="object-contain" />
          </Link>
          <button onClick={() => setMobileOpen(false)} className={`p-2 rounded ${highContrast ? 'text-yellow-300' : 'text-gray-500'}`} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          <input
            type="search"
            placeholder="Pesquisar..."
            className={`w-full px-4 py-2 text-sm border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'text-black border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-[#0d6efd]`}
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <ul className="space-y-1">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    highContrast
                      ? 'text-yellow-300 hover:bg-yellow-300 hover:text-black'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-[#0d6efd]'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`px-4 py-3 border-t ${highContrast ? 'border-yellow-300' : 'border-gray-200'}`}>
          <p className={`text-xs font-semibold mb-2 ${highContrast ? 'text-yellow-300' : 'text-gray-500'}`}>ACESSIBILIDADE</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => adjustFontSize(1)}              className={`px-3 py-1.5 rounded text-xs font-bold ${highContrast ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#0d6efd]'}`}>A+</button>
            <button onClick={() => adjustFontSize(-1)}             className={`px-3 py-1.5 rounded text-xs font-bold ${highContrast ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#0d6efd]'}`}>A-</button>
            <button onClick={() => setFontSize(16)}                className={`px-3 py-1.5 rounded text-xs font-bold ${highContrast ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#0d6efd]'}`}>A</button>
            <button onClick={() => setHighContrast(!highContrast)} className={`px-3 py-1.5 rounded text-xs ${highContrast ? 'bg-yellow-300 text-black' : 'bg-gray-100 text-[#0d6efd]'}`}>◐ Contraste</button>
          </div>
        </div>
      </div>
    </>
  )
}