'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  highContrast: boolean
  fontSize: number
  adjustFontSize: (change: number) => void
  setHighContrast: (value: boolean) => void
  setFontSize: (size: number) => void
}

export default function Header({ highContrast, fontSize, adjustFontSize, setHighContrast, setFontSize }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerColor, setHeaderColor] = useState('#ffc107')

  useEffect(() => {
  let ticking = false

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        
        const scrolled = window.scrollY > 50
        setIsScrolled(scrolled)


        // Detectar seção atual e mudar cor
        const sections = [
          { id: 'lgpd-&-governo-digital', color: '#ffc107' },
          { id: 'consultas-sobre-receitas', color: '#0d6efd' },
          { id: 'consultas-sobre-recursos-humanos', color: '#e91e63' },
          { id: 'consultas-sobre-licitações,-contratos-e-obras', color: '#ff9800' },
          { id: 'consultas-sobre-responsabilidade-fiscal', color: '#5c6bc0' },
          { id: 'consultas-sobre-a-gestão-municipal', color: '#8bc34a' },
          { id: 'consultas-sobre-participação-cidadã', color: '#00bcd4' },
          { id: 'consultas-sobre-educação-&-saúde', color: '#ffc107' },
        ]

        for (const section of sections) {
          const element = document.getElementById(section.id)
          if (element) {
            const rect = element.getBoundingClientRect()
            if (rect.top <= 150 && rect.bottom >= 150) {
              setHeaderColor(section.color)
              break
            }
          }
        }
        
        ticking = false
      })
      ticking = true
    }
  }

  handleScroll()
  window.addEventListener('scroll', handleScroll)
  
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

  return (
    <>


      {/* Barra de Acessibilidade */}
      <div className={`${highContrast ? 'bg-yellow-300 text-black' : 'bg-white'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end items-center text-xs">
          <span className={`${highContrast ? 'text-black' : 'text-gray-600'} mr-3`}>Acessibilidade</span>
          <span className="text-gray-400 mx-2">|</span>
          <button 
            onClick={() => adjustFontSize(1)}
            className={`tooltip mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            data-tooltip="Aumentar fonte"
          >
            A+
          </button>
          <button 
            onClick={() => adjustFontSize(-1)}
            className={`tooltip mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            data-tooltip="Diminuir fonte"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSize(16)}
            className={`tooltip mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            data-tooltip="Tamanho normal"
          >
            A
          </button>
          <span className="text-gray-400 mx-2">|</span>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`tooltip mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} hover:underline px-2 py-1 rounded`}
            data-tooltip={highContrast ? "Desativar contraste" : "Ativar alto contraste"}
          >
            ◐
          </button>
        </div>
      </div>

      {/* Header Principal */}
      <header className={`sticky-header ${isScrolled ? 'scrolled' : ''} ${highContrast ? 'bg-black border-b-4 border-yellow-300' : 'bg-white shadow-sm'} relative`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/ItabaianaCidadeDoTrabalho.png" 
                alt="Itabaiana - Cidade do Trabalho" 
                width={250}
                height={80}
                className="logo-image object-contain"
                priority
              />
            </Link>

            {/* Menu Superior */}
            <nav className="hidden lg:flex flex-1 justify-center">
              <ul className="flex space-x-6 text-sm">
                <li><Link href="/portal" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107] font-medium`}>O Portal</Link></li>
                <li><Link href="https://portal.itabaiana.pb.gov.br/mrosc/" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Parcerias</Link></li>
                <li><Link href="/contato" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Fale Conosco</Link></li>
                <li><Link href="https://portal.itabaiana.pb.gov.br/perguntas-frequentes/" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>FAQ</Link></li>
                <li><Link href="/glossario" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Glossário</Link></li>
                <li><Link href="https://transparencia.elmartecnologia.com.br/DadosAbertos?e=201089&ctx=201089" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Dados Abertos</Link></li>
                <li><Link href="https://transparencia.itabaiana.pb.gov.br/page-sitemap.xml" className={`menu-link ${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Mapa do Site</Link></li>
              </ul>
            </nav>

            {/* Barra de Busca */}
            <form className="search-container flex-shrink-0 w-full max-w-xs">
              <input
                type="search"
                placeholder="Pesquisar..."
                className={`w-full px-4 py-2 text-sm border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'text-black border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-[#0d6efd]`}
              />
            </form>
          </div>
        </div>
        
        {/* Linha colorida dinâmica */}
        <div className="header-color-line" style={{ background: headerColor }}></div>
      </header>

      {/* Linha Decorativa */}
      <div className="h-1 bg-gradient-to-r from-[#ffc107] via-[#0d6efd] to-[#ffc107]"></div>
    </>
  )
}