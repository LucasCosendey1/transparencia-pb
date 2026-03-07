'use client'

import Header from '../../components/Header'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome, FaCheckCircle } from 'react-icons/fa'

export default function PortalPage() {
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
            <span className="mx-2 text-gray-400">/</span>
            <span className={highContrast ? 'text-yellow-300' : 'text-gray-600'}>O Portal</span>
          </div>
        </div>
      </div>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Título Principal */}
          <h1 className={`text-4xl font-bold mb-6 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
            Portal da Transparência de Itabaiana-PB: Uma Ferramenta Essencial para o Controle Social
          </h1>

          {/* Conteúdo */}
          <div className={`${highContrast ? 'bg-gray-900 text-yellow-300' : 'bg-white'} rounded-lg shadow-md p-8 space-y-6`}>
            
            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              O Portal da Transparência da Prefeitura Municipal de Itabaiana, no estado da Paraíba, é uma plataforma digital fundamental que permite a qualquer cidadão acompanhar de perto a gestão dos recursos públicos do município. Através do endereço eletrônico <a href="https://transparencia.itabaiana.pb.gov.br" className="text-blue-600 hover:underline font-semibold">transparencia.itabaiana.pb.gov.br</a>, a população tem acesso a uma vasta gama de informações sobre as finanças e a administração da prefeitura, promovendo a accountability e o controle social.
            </p>

            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A plataforma atende aos requisitos da Lei de Acesso à Informação (Lei nº 12.527/2011) e da Lei de Responsabilidade Fiscal (Lei Complementar nº 101/2000), que determinam a ampla divulgação dos dados públicos de forma clara e acessível.
            </p>

            {/* Seção: O que encontrar */}
            <h2 className={`text-2xl font-bold mt-8 mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              O que o cidadão pode encontrar no portal?
            </h2>

            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              O portal é estruturado em diversas seções que facilitam a navegação e a busca por informações específicas. Entre as principais áreas de consulta, destacam-se:
            </p>

            <ul className="space-y-4 ml-6">
              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Receitas:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Detalhamento de toda a arrecadação do município, incluindo a origem dos recursos, como impostos (IPTU, ISS), transferências estaduais e federais (FPM, ICMS, Fundeb), e outras fontes de receita.
                  </span>
                </div>
              </li>

              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Despesas:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Informações completas sobre como o dinheiro público está sendo gasto. É possível consultar as despesas por categoria, órgão da prefeitura, fornecedor e modalidade de licitação. Isso inclui gastos com pessoal, investimentos, custeio da máquina pública e pagamentos a fornecedores.
                  </span>
                </div>
              </li>

              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Licitações e Contratos:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Acompanhamento de todos os processos licitatórios em andamento e já concluídos, bem como a íntegra dos contratos celebrados pela prefeitura com empresas e prestadores de serviços.
                  </span>
                </div>
              </li>

              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Pessoal:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Acesso à lista de todos os servidores públicos municipais, incluindo cargos, salários e lotação. Também são disponibilizadas informações sobre diárias e passagens concedidas a agentes públicos.
                  </span>
                </div>
              </li>

              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Relatórios e Prestações de Contas:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Publicação de relatórios exigidos pela legislação, como o Relatório de Gestão Fiscal (RGF) e o Relatório Resumido da Execução Orçamentária (RREO), que oferecem um panorama consolidado da saúde financeira do município.
                  </span>
                </div>
              </li>

              <li className="flex items-start">
                <FaCheckCircle className={`mt-1 mr-3 flex-shrink-0 ${highContrast ? 'text-yellow-300' : 'text-blue-600'}`} />
                <div>
                  <strong className={highContrast ? 'text-yellow-300' : 'text-gray-800'}>Instrumentos de Planejamento:</strong>
                  <span className={`ml-2 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
                    Leis orçamentárias como o Plano Plurianual (PPA), a Lei de Diretrizes Orçamentárias (LDO) e a Lei Orçamentária Anual (LOA) estão disponíveis para consulta, permitindo que o cidadão conheça as metas e prioridades da gestão.
                  </span>
                </div>
              </li>
            </ul>

            {/* Seção: Exercendo a Cidadania */}
            <h2 className={`text-2xl font-bold mt-8 mb-4 ${highContrast ? 'text-yellow-300' : 'text-gray-800'}`}>
              Exercendo a Cidadania
            </h2>

            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              Com as informações disponíveis no Portal da Transparência, o cidadão de Itabaiana pode exercer seu papel de fiscalizador da administração pública. É possível verificar se os recursos estão sendo aplicados de forma correta, se as licitações estão sendo conduzidas de maneira transparente e se os gastos com pessoal estão em conformidade com a lei.
            </p>

            <p className={`leading-relaxed ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
              A plataforma representa um avanço significativo na relação entre o poder público e a sociedade, fortalecendo a democracia e incentivando a participação popular na gestão municipal. Para utilizar o portal, não é necessário cadastro prévio, e a consulta aos dados é livre e gratuita. Em caso de dúvidas ou dificuldades para encontrar alguma informação, o cidadão pode acionar a Ouvidoria Municipal, geralmente com canais de atendimento indicados no próprio portal.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}