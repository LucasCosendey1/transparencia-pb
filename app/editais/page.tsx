'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa'
import VLibras from 'vlibras-nextjs'

export default function EditaisPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  const anos = [
    { ano: 2025, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2025%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2025&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2025"%7D' },
    { ano: 2024, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2024%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2024&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2024"%7D' },
    { ano: 2023, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2023%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2023&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2023"%7D' },
    { ano: 2022, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
    { ano: 2021, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
    { ano: 2020, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
    { ano: 2019, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
    { ano: 2018, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
    { ano: 2017, link: 'https://transparencia.elmartecnologia.com.br/Export/Data?ecode=201089&ctx=201089&showResult=True&module=LicitaModule&returnType=grid&competencia%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B++%2F%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&competencia=__%2F____&exercicio%24State=%7B%26quot%3BrawValue%26quot%3B:%26quot%3B2022%26quot%3B%2C%26quot%3BvalidationState%26quot%3B:%26quot%3B%26quot%3B%7D&exercicio=2022&fields=Edital&fields=Nº+Processo&fields=Modalidade&fields=Nº+Licitação&fields=Objeto&DXScript=&showUrl=False&DXCss=&DXMVCEditorsValues=%7B"competencia":"++%2F"%2C"exercicio":"2022"%7D' },
  ]

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

      <div className={`${highContrast ? 'bg-black' : 'bg-white'} border-b mt-32`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className={`${highContrast ? 'text-yellow-300' : 'text-blue-600'} hover:underline flex items-center`}>
              <FaHome className="mr-1" /> Início
            </Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>Editais</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          <h1 className={`text-4xl font-bold mb-6 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Editais
          </h1>

          {/* Introdução */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8 mb-6`}>
            <p className={`leading-relaxed mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Se você está procurando pelos editais de licitação da Prefeitura de Itabaiana-PB, saiba que eles estão organizados de uma maneira bem prática: <strong>agrupados por ano</strong>.
            </p>
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Essa organização facilita muito a sua busca, pois você pode ir diretamente para o ano de interesse e encontrar todos os processos licitatórios que foram abertos naquele período. Seja para consultar licitações passadas ou para acompanhar as mais recentes, essa estrutura anual torna a navegação mais intuitiva e eficiente.
            </p>
          </div>

          {/* Lista de Anos */}
          <div className={`${highContrast ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anos.map((item) => (
                <Link
                  key={item.ano}
                  href={item.link}
                   target="_blank"
                    rel="noopener noreferrer"     
                  className={`group flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    highContrast 
                      ? 'border-yellow-300 hover:bg-yellow-300 hover:text-black' 
                      : 'border-blue-200 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className={`text-2xl ${
                      highContrast 
                        ? 'text-yellow-300 group-hover:text-black' 
                        : 'text-blue-600'
                    }`} />
                    <span className={`text-xl font-bold ${
                      highContrast 
                        ? 'text-yellow-300 group-hover:text-black' 
                        : 'text-gray-800'
                    }`}>
                      {item.ano}
                    </span>
                  </div>
                  <FaExternalLinkAlt className={`text-sm ${
                    highContrast 
                      ? 'text-yellow-300 group-hover:text-black' 
                      : 'text-gray-400 group-hover:text-blue-600'
                  }`} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <VLibras forceOnload />
    </div>
  )
}