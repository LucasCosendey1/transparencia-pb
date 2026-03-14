'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaExternalLinkAlt, FaDownload, FaInfoCircle, FaCalendarAlt, FaSearch } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

const BASE_URL = 'https://transparencia.elmartecnologia.com.br/Contab/Receitas/ReceitaPrevista'
const PARAMS = 'Tab=1&isModal=false&hTab=3&Filter=EMENDAS&e=201089&ctx=201089'

export default function DespesaFixadaPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  const urlConsulta = `${BASE_URL}?${PARAMS}&exercicio=${anoSelecionado}`
  const urlExportar = `https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=ContabModule&returnType=grid&exercicio=${anoSelecionado}`

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
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Receita Prevista</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-4">

          {/* Título */}
          <h1 className={`text-4xl font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Receita Prevista
          </h1>
          <p className={`mb-8 ${highContrast ? 'text-yellow-200' : 'text-gray-500'}`}>
            Previsão de arrecadação do município de Itabaiana/PB
          </p>

          {/* Card de filtro */}
          <div className={`${highContrast ? 'bg-gray-900 border border-yellow-300' : 'bg-white'} rounded-xl shadow-md p-6 mb-6`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className={highContrast ? 'text-yellow-300' : 'text-blue-600'} />
                <span className={`font-semibold ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Selecione o exercício:
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ANOS.map(ano => (
                  <button
                    key={ano}
                    onClick={() => setAnoSelecionado(ano)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      anoSelecionado === ano
                        ? highContrast
                          ? 'bg-yellow-300 text-black'
                          : 'bg-blue-600 text-white shadow'
                        : highContrast
                        ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {ano}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex gap-2">
                <a
                  href={urlConsulta}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    highContrast
                      ? 'bg-yellow-300 text-black hover:bg-yellow-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FaSearch size={12} /> Consultar no sistema
                </a>
                <a
                  href={urlExportar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    highContrast
                      ? 'border-yellow-300 text-yellow-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaDownload size={12} /> Exportar dados
                </a>
              </div>
            </div>
          </div>

          {/* Aviso informativo */}
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${
            highContrast ? 'bg-gray-800 border border-yellow-300' : 'bg-blue-50 border border-blue-200'
          }`}>
            <FaInfoCircle className={`mt-0.5 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-500'}`} />
            <div>
              <p className={`text-sm font-medium ${highContrast ? 'text-yellow-300' : 'text-blue-700'}`}>
                Os dados são fornecidos pelo sistema Elmar Tecnologia
              </p>
              <p className={`text-sm mt-1 ${highContrast ? 'text-yellow-200' : 'text-blue-600'}`}>
                Os totais referem-se à soma das receitas que possuem movimento. Para consultar termos mais específicos, utilize a consulta interna do sistema.
              </p>
            </div>
          </div>

          {/* Viewer do sistema */}
          <div className={`${highContrast ? 'bg-gray-900 border border-yellow-300' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              highContrast ? 'border-yellow-300' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`font-semibold text-lg ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                  Receita Prevista — Exercício {anoSelecionado}
                </h2>
                <p className={`text-xs mt-0.5 ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
                  Fonte: Sistema de Contabilidade Pública — Itabaiana/PB
                </p>
              </div>
              <a
                href={urlConsulta}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-xs ${highContrast ? 'text-yellow-300 hover:underline' : 'text-blue-500 hover:underline'}`}
              >
                Abrir em nova aba <FaExternalLinkAlt size={10} />
              </a>
            </div>

            <iframe
              key={anoSelecionado}
              src={urlConsulta}
              width="100%"
              height="900"
              className="border-0 w-full"
              title={`Receita Prevista ${anoSelecionado}`}
              loading="lazy"
            />
          </div>

        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}