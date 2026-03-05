// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FaDollarSign, 
  FaMoneyBillWave, 
  FaUsers,
  FaBriefcase,
  FaHandshake,
  FaFileContract,
  FaBuilding,
  FaChartLine,
  FaDatabase,
  FaUserFriends,
  FaGavel,
  FaCar,
  FaLandmark,
  FaBalanceScale,
  FaBookOpen,
  FaComments,
  FaHeartbeat,
  FaGraduationCap,
  FaShieldAlt,
  FaFileAlt,
  FaKeyboard,
  FaRegistered,
  FaClipboardCheck,
  FaCrosshairs,
  FaSave,
  FaBars,
  FaCreditCard,
  FaChartBar,
  FaFileInvoiceDollar,
  FaListAlt,
  FaCoins,
  FaHandHoldingUsd,
  FaUserTie,
  FaPalette,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaUserCheck,
  FaUserMinus,
  FaUserPlus,
  FaIdCard,
  FaVirus,
  FaUserGraduate,
  FaLock,
  FaCheckDouble,
  FaEdit,
  FaFileSignature,
  FaUserSlash,
  FaTimesCircle,
  FaStore,
  FaFileContract as FaContract,
  FaUserCog,
  FaCalendarAlt,
  FaHammer,
  FaPause,
  FaHardHat,
  FaFileArchive,
  FaClipboardList,
  FaFolder,
  FaUniversity,
  FaProjectDiagram,
  FaFileInvoice,
  FaPhoneAlt,
  FaNewspaper,
  FaQuestionCircle,
  FaBriefcaseMedical,
  FaEnvelope,
  FaClipboard,
  FaInfoCircle,
  FaUserCircle,
  FaPhoneSquareAlt,
  FaDesktop,
  FaBook,
  FaHospital,
  FaMedkit,
  FaStethoscope,
  FaPills,
  FaSyringe,
  FaChartLine as FaChart
} from 'react-icons/fa'
import { IconType } from 'react-icons'

  

declare global {
  interface Window {
    VLibras: any;
  }
}

export default function HomePage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [vlibrasReady, setVlibrasReady] = useState(false)

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  // VLibras - Versão que FUNCIONA
  useEffect(() => {
    // Adiciona o script
    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.async = false // Importante: sync!
    
    script.onload = () => {
      setTimeout(() => {
        if (window.VLibras) {
          new window.VLibras.Widget('https://vlibras.gov.br/app')
          setVlibrasReady(true)
          console.log('✅ VLibras FUNCIONANDO!')
        }
      }, 500)
    }
    
    document.body.appendChild(script)

    return () => {
      const s = document.querySelector('script[src*="vlibras"]')
      if (s) s.remove()
    }
  }, [])

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-white'}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Barra de Acessibilidade */}
      <div className={`${highContrast ? 'bg-yellow-300 text-black' : 'bg-white'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end items-center text-xs">
          <span className={`${highContrast ? 'text-black' : 'text-gray-600'} mr-3`}>Acessibilidade</span>
          <span className="text-gray-400 mx-2">|</span>
          <button 
            onClick={() => adjustFontSize(1)}
            className={`mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            title="Aumentar fonte"
          >
            A+
          </button>
          <button 
            onClick={() => adjustFontSize(-1)}
            className={`mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            title="Diminuir fonte"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSize(16)}
            className={`mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} font-bold hover:underline px-2 py-1 rounded`}
            title="Tamanho normal"
          >
            A
          </button>
          <span className="text-gray-400 mx-2">|</span>
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`mx-2 ${highContrast ? 'text-black bg-yellow-400' : 'text-[#0d6efd]'} hover:underline px-2 py-1 rounded`}
            title={highContrast ? "Desativar contraste" : "Ativar alto contraste"}
          >
            ◐
          </button>
        </div>
      </div>

      {/* Header Principal */}
    <header className={`${highContrast ? 'bg-black border-b-4 border-yellow-300' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Linha 1: Logo + Menu */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/ItabaianaCidadeDoTrabalho.png" 
              alt="Itabaiana - Cidade do Trabalho" 
              width={250}
              height={80}
              className="object-contain"
              priority
            />
          </Link>

          {/* Menu Superior */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-6 text-sm">
              <li><Link href="/" className={`${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107] font-medium`}>Início</Link></li>
              <li><Link href="/sobre" className={`${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Sobre</Link></li>
              <li><Link href="/legislacao" className={`${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Legislação</Link></li>
              <li><Link href="/faq" className={`${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>FAQ</Link></li>
              <li><Link href="/contato" className={`${highContrast ? 'text-yellow-300' : 'text-gray-700'} hover:text-[#ffc107]`}>Contato</Link></li>
            </ul>
          </nav>
        </div>

        {/* Linha 2: Barra de Busca pequena */}
        <div className="flex justify-end">
          <form className="flex w-full max-w-md">
            <input
              type="search"
              placeholder="Estou procurando por..."
              className={`flex-1 px-3 py-2 text-sm border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'text-black border-gray-300'} rounded-l focus:outline-none focus:ring-2 focus:ring-[#0d6efd]`}
            />
            <button 
              type="submit"
              className="bg-[#ffffff] text-white px-6 py-2 rounded-r hover:bg-[#0a58ca] transition text-sm"
            >
              🔍
            </button>
          </form>
        </div>
      </div>
    </header>

      {/* Linha Decorativa */}
      <div className="h-1 bg-gradient-to-r from-[#ffc107] via-[#0d6efd] to-[#ffc107]"></div>

      {/* Carrossel de Banners */}
      <section className={`${highContrast ? 'bg-black' : 'bg-gray-100'} py-8`}>
        <div className="max-w-7xl mx-auto px-4">
          <Carousel highContrast={highContrast} />
        </div>
      </section>

      <main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Seção: LGPD & Governo Digital */}
          <Section 
            title="LGPD & Governo Digital" 
            color="yellow"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaUserCircle} title="Encarregado pelo Tratamento de Dados" description="Responsável pela proteção de dados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaShieldAlt} title="Política de Privacidade e Proteção dos Dados" description="Veja como protegemos seus dados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaKeyboard} title="Prefeitura Digital" description="Serviços digitais da prefeitura" link="" highContrast={highContrast} />
            <CategoryCard icon={FaRegistered} title="Decreto Governo Digital" description="Legislação sobre governo digital" link="" highContrast={highContrast} />
            <CategoryCard icon={FaClipboardCheck} title="Pesquisa de Satisfação" description="Avalie nossos serviços" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCrosshairs} title="Governança Pública & Compliance" description="Práticas de boa governança" link="" highContrast={highContrast} />
            <CategoryCard icon={FaSave} title="Regulamentação LGPD" description="Normas de proteção de dados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaBars} title="Regulamentação LAI" description="Lei de Acesso à Informação" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre receitas */}
          <Section 
            title="Consultas sobre receitas" 
            color="blue"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaCreditCard} title="Receita Prevista" description="Previsão de arrecadação" link="" highContrast={highContrast} />
            <CategoryCard icon={FaChartBar} title="Receita Realizada" description="Receitas já arrecadadas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaMoneyBillWave} title="Receita Extra Orçamentária" description="Receitas fora do orçamento" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileInvoiceDollar} title="Inscritos em Dívida Ativa" description="Devedores do município" link="" highContrast={highContrast} />
            <CategoryCard icon={FaVirus} title="Receitas Covid-19" description="Recursos para combate à pandemia" link="" highContrast={highContrast} />
            <CategoryCard icon={FaHandHoldingUsd} title="Desonerações Fiscais Concedidas" description="Isenções e benefícios fiscais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCoins} title="Renúncia Fiscal Prevista e Realizada" description="Valores de renúncias fiscais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserTie} title="Beneficiários das Desonerações e Renúncias" description="Quem recebe benefícios fiscais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaPalette} title="Projetos de Incentivo à Cultura" description="Apoio a projetos culturais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaLandmark} title="Emendas Parlamentares Federais" description="Emendas de deputados federais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaMapMarkedAlt} title="Emendas Parlamentares Estaduais" description="Emendas de deputados estaduais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaDollarSign} title="Execução de Emendas PIX" description="Transferências diretas de emendas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUniversity} title="Recursos Federais Recebidos" description="Transferências da União" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre recursos humanos */}
          <Section 
            title="Consultas sobre recursos humanos" 
            color="pink"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaListAlt} title="Folha de Pagamento" description="Remuneração dos servidores" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUsers} title="Quadro Funcional" description="Lista completa de servidores" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserCheck} title="Servidores Temporários" description="Contratos temporários" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserMinus} title="Servidores Cedidos" description="Servidores emprestados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserPlus} title="Servidores Requisitados" description="Servidores requisitados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaIdCard} title="Plano de Cargos e Carreiras" description="Estrutura de cargos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaVirus} title="Folha Covid-19" description="Gastos com pessoal na pandemia" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserGraduate} title="Estagiários" description="Programa de estágio" link="" highContrast={highContrast} />
            <CategoryCard icon={FaLock} title="Terceirizados" description="Serviços terceirizados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCheckDouble} title="Seleções" description="Processos seletivos" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre licitações, contratos e obras */}
          <Section 
            title="Consultas sobre licitações, contratos e obras" 
            color="orange"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaCheckCircle} title="Licitações" description="Processos licitatórios" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileAlt} title="Editais" description="Editais publicados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileContract} title="Documentos Fase Interna e Externa" description="Documentação das licitações" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserSlash} title="Inexigibilidade" description="Contratações inexigíveis" link="" highContrast={highContrast} />
            <CategoryCard icon={FaTimesCircle} title="Dispensas de Licitação" description="Contratações dispensadas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaStore} title="Adesões à SRP" description="Sistema de Registro de Preços" link="" highContrast={highContrast} />
            <CategoryCard icon={FaClipboardList} title="Plano de Contratação Anual" description="Planejamento de compras" link="" highContrast={highContrast} />
            <CategoryCard icon={FaBalanceScale} title="Licitantes & Contratados Sancionados" description="Empresas punidas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaContract} title="Contratos Celebrados" description="Contratos firmados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaEdit} title="Termos Aditivos" description="Aditivos contratuais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserCog} title="Gestores e Fiscais de Contratos" description="Responsáveis por contratos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCalendarAlt} title="Ordem de Pagamentos" description="Cronograma de pagamentos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaGavel} title="Mapa de Obras" description="Obras em andamento" link="" highContrast={highContrast} />
            <CategoryCard icon={FaPause} title="Obras Paralisadas" description="Obras interrompidas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaHardHat} title="Fiscais de Obras" description="Responsáveis por obras" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre responsabilidade fiscal */}
          <Section 
            title="Consultas sobre responsabilidade fiscal" 
            color="indigo"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaFileArchive} title="Prestações de Contas" description="Contas públicas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaClipboardList} title="Relatório de Gestão e Atividades" description="Gestão administrativa" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFolder} title="Pareceres do Tribunal de Contas" description="Análises do TCE" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUniversity} title="Julgamentos das Contas pelo Poder Legislativo" description="Aprovação das contas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaChartLine} title="Relatório de Gestão Fiscal - RGF" description="Relatório LRF" link="" highContrast={highContrast} />
            <CategoryCard icon={FaProjectDiagram} title="Relatório Resumido da Execução Orçamentária" description="RREO bimestral" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCalendarAlt} title="Plano Plurianual (PPA) - 2022/2025" description="Planejamento de 4 anos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileInvoice} title="Lei Orçamentária Anual 2025" description="Orçamento do ano" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileSignature} title="Lei de Diretrizes Orçamentárias 2025" description="LDO do ano" link="" highContrast={highContrast} />
            <CategoryCard icon={FaEdit} title="Projeto de Lei de Diretrizes Orçamentárias 2026" description="Proposta de LDO" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre a gestão municipal */}
          <Section 
            title="Consultas sobre a gestão municipal" 
            color="green"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaChartLine} title="Plano Estratégico Institucional" description="Planejamento estratégico" link="" highContrast={highContrast} />
            <CategoryCard icon={FaBuilding} title="Estrutura Organizacional" description="Organograma da prefeitura" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileAlt} title="Competências e Atribuições" description="Funções de cada setor" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserTie} title="Responsáveis pela Gestão" description="Gestores públicos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaPhoneAlt} title="Endereço, Telefone e Horário de Atendimento" description="Contatos da prefeitura" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileContract} title="Decretos Municipais" description="Decretos publicados" link="" highContrast={highContrast} />
            <CategoryCard icon={FaNewspaper} title="Diário Oficial" description="Publicações oficiais" link="" highContrast={highContrast} />
            <CategoryCard icon={FaQuestionCircle} title="Perguntas Frequentes" description="Dúvidas comuns" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserFriends} title="Conselhos Municipais" description="Conselhos participativos" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre participação cidadã */}
          <Section 
            title="Consultas sobre participação cidadã" 
            color="cyan"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaComments} title="Serviço de Informação ao Cidadão" description="SIC presencial" link="" highContrast={highContrast} />
            <CategoryCard icon={FaEnvelope} title="Serviço Eletrônico de Informação ao Cidadão" description="E-SIC online" link="" highContrast={highContrast} />
            <CategoryCard icon={FaClipboard} title="Relatório Anual do SIC" description="Balanço do SIC" link="" highContrast={highContrast} />
            <CategoryCard icon={FaFileAlt} title="Documentos Classificados" description="Docs sigilosos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaInfoCircle} title="Informações Desclassificadas" description="Docs tornados públicos" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUserCircle} title="Ouvidoria" description="Canal de ouvidoria" link="" highContrast={highContrast} />
            <CategoryCard icon={FaPhoneSquareAlt} title="Ouvidoria (Fala.BR)" description="Ouvidoria federal" link="" highContrast={highContrast} />
            <CategoryCard icon={FaDesktop} title="Carta de Serviços ao Usuário" description="Serviços disponíveis" link="" highContrast={highContrast} />
          </Section>

          {/* Seção: Consultas sobre educação & saúde */}
          <Section 
            title="Consultas sobre educação & saúde" 
            color="yellow"
            highContrast={highContrast}
          >
            <CategoryCard icon={FaGraduationCap} title="Plano Municipal de Educação" description="PME vigente" link="" highContrast={highContrast} />
            <CategoryCard icon={FaBook} title="Relatório do Plano Municipal de Educação" description="Acompanhamento do PME" link="" highContrast={highContrast} />
            <CategoryCard icon={FaBriefcaseMedical} title="Lista de Espera Creches" description="Fila de creches" link="" highContrast={highContrast} />
            <CategoryCard icon={FaUsers} title="Diagnóstico Primeira Infância" description="Situação da primeira infância" link="" highContrast={highContrast} />
            <CategoryCard icon={FaHeartbeat} title="Plano Municipal de Saúde" description="PMS vigente" link="" highContrast={highContrast} />
            <CategoryCard icon={FaCalendarAlt} title="Programação Anual da Saúde" description="Planejamento de saúde" link="" highContrast={highContrast} />
            <CategoryCard icon={FaChart} title="Relatório de Gestão da Saúde" description="Prestação de contas saúde" link="" highContrast={highContrast} />
            <CategoryCard icon={FaHospital} title="Serviços de Saúde" description="Unidades de saúde" link="" highContrast={highContrast} />
            <CategoryCard icon={FaMedkit} title="Especialidades" description="Especialidades médicas" link="" highContrast={highContrast} />
            <CategoryCard icon={FaListAlt} title="Lista de Espera para Regulação" description="Fila de consultas/exames" link="" highContrast={highContrast} />
            <CategoryCard icon={FaPills} title="Lista de Medicamentos" description="Medicamentos disponíveis" link="" highContrast={highContrast} />
            <CategoryCard icon={FaSyringe} title="Estoque Farmácia" description="Estoque atual" link="" highContrast={highContrast} />
          </Section>


        </div>
      </main>

      {/* Footer Profissional */}
      <footer className="bg-gradient-to-r from-[#0d6efd] to-[#0a58ca] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">
                Navegação
              </h3>
              <ul className="space-y-2 text-sm mt-4">
                <li><Link href="/" className="hover:text-[#ffc107] transition">Início</Link></li>
                <li><Link href="/sobre" className="hover:text-[#ffc107] transition">Sobre o Portal</Link></li>
                <li><Link href="/legislacao" className="hover:text-[#ffc107] transition">Legislação</Link></li>
                <li><Link href="/faq" className="hover:text-[#ffc107] transition">Perguntas Frequentes</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">
                Serviços
              </h3>
              <ul className="space-y-2 text-sm mt-4">
                <li><Link href="#receitas" className="hover:text-[#ffc107] transition">Receitas</Link></li>
                <li><Link href="#pessoal" className="hover:text-[#ffc107] transition">Recursos Humanos</Link></li>
                <li><Link href="#licitacoes" className="hover:text-[#ffc107] transition">Licitações e Contratos</Link></li>
                <li><Link href="#fiscal" className="hover:text-[#ffc107] transition">Responsabilidade Fiscal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">
                Acesso Rápido
              </h3>
              <ul className="space-y-2 text-sm mt-4">
                <li><Link href="#lgpd" className="hover:text-[#ffc107] transition">LGPD</Link></li>
                <li><Link href="#participacao" className="hover:text-[#ffc107] transition">Participação Cidadã</Link></li>
                <li><Link href="#educacao" className="hover:text-[#ffc107] transition">Educação e Saúde</Link></li>
                <li><Link href="/analise" className="hover:text-[#ffc107] transition flex items-center">
                 
                </Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">
                Contato
              </h3>
              <div className="text-sm space-y-3 mt-4">
                <div>
                  <p className="font-semibold mb-1">PREFEITURA MUNICIPAL DE ITABAIANA</p>
                  <p className="text-xs opacity-90">Itabaiana - PB</p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-[#ffc107]">📍</span>
                  <p className="text-xs opacity-90">
                    Endereço da prefeitura<br/>
                    CEP: 00000-000
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[#ffc107]">📞</span>
                  <p className="text-xs opacity-90">(83) 0000-0000</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[#ffc107]">✉️</span>
                  <p className="text-xs opacity-90">contato@itabaiana.pb.gov.br</p>
                </div>

                <div className="pt-3">
                  <p className="text-xs font-semibold mb-2">Redes Sociais:</p>
                  <div className="flex space-x-3">
                    <a href="#" className="hover:text-[#ffc107] transition text-xl">📘</a>
                    <a href="#" className="hover:text-[#ffc107] transition text-xl">📷</a>
                    <a href="#" className="hover:text-[#ffc107] transition text-xl">▶️</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
            <p className="opacity-90">
              © 2025 Prefeitura Municipal de Itabaiana - Todos os direitos reservados
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/politica-privacidade" className="hover:text-[#ffc107] transition opacity-90">
                Política de Privacidade
              </Link>
              <span className="opacity-50">|</span>
              <Link href="/termos-uso" className="hover:text-[#ffc107] transition opacity-90">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* VLibras */}
{vlibrasReady && (
        <div>
          <div vw-access-button="true" className="enabled"></div>
          <div vw-plugin-wrapper="true"></div>
        </div>
      )}
    </div>
  )
}

// Componente Section
interface SectionProps {
  title: string
  color: 'yellow' | 'blue' | 'pink' | 'orange' | 'indigo' | 'green' | 'cyan'
  children: React.ReactNode
  highContrast: boolean
}

function Section({ title, color, children, highContrast }: SectionProps) {
  const underlineColors = {
    yellow: 'bg-gradient-to-r from-transparent via-[#ffc107] to-transparent',
    blue: 'bg-gradient-to-r from-transparent via-[#0d6efd] to-transparent',
    pink: 'bg-gradient-to-r from-transparent via-[#e91e63] to-transparent',
    orange: 'bg-gradient-to-r from-transparent via-[#ff9800] to-transparent',
    indigo: 'bg-gradient-to-r from-transparent via-[#5c6bc0] to-transparent',
    green: 'bg-gradient-to-r from-transparent via-[#8bc34a] to-transparent',
    cyan: 'bg-gradient-to-r from-transparent via-[#00bcd4] to-transparent',
  }

  return (
    <section className="mb-16" id={title.toLowerCase().replace(/\s+/g, '-')}>
      <h2 className={`text-3xl font-bold text-center mb-3 ${highContrast ? 'text-yellow-300' : 'text-gray-700'}`}>
        {title}
      </h2>
      <div className={`h-1 w-64 mx-auto mb-8 ${underlineColors[color]}`}></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  )
}

// Componente CategoryCard
interface CategoryCardProps {
  icon: IconType
  title: string
  description: string
  link: string
  highContrast: boolean
}

function CategoryCard({ icon: Icon, title, description, link, highContrast }: CategoryCardProps) {
  return (
    <Link href={link || '#'}>
      <div className={`group relative ${highContrast ? 'bg-yellow-300 text-black' : 'bg-white'} rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 p-6 h-full border-2 border-gray-100 overflow-hidden`}>
        {/* Fundo colorido que aparece no hover */}
        <div className="absolute inset-0 bg-[#0d6efd] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        
        {/* Conteúdo */}
        <div className="relative z-10">
            <Icon className={`w-12 h-12 mb-3 mx-auto ${highContrast ? 'text-black' : 'text-gray-600'} group-hover:text-white transition-all duration-300 group-hover:scale-110`} />

          <h3 className={`font-bold text-sm leading-tight mb-2 text-center ${highContrast ? 'text-black' : 'text-gray-800'} group-hover:text-white transition-colors`}>
            {title}
          </h3>
          {/* Descrição que aparece no hover */}
          <p className="text-xs text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium text-center">

            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}


// Componente Carousel
interface CarouselProps {
  highContrast: boolean
}

function Carousel({ highContrast }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: '/banner1.jpg', // Coloque suas imagens na pasta public
      title: 'Novas informações sobre saúde estão disponíveis no Portal de Dados Abertos',
      link: '' // Deixe vazio por enquanto
    },
    {
      image: '/banner2.jpg',
      title: 'Transparência: Acompanhe as obras da sua cidade',
      link: ''
    },
    {
      image: '/banner3.jpg',
      title: 'Consulte o orçamento municipal de forma fácil e rápida',
      link: ''
    },
  ]

  // Auto-play: muda de slide a cada 30 segundos
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, 30000)

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative rounded-lg overflow-hidden shadow-xl">
      {/* Slides */}
      <div className="relative h-[150px] md:h-[200px]">
        {slides.map((slide, index) => (
          <Link 
            key={index}
            href={slide.link || '#'}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              {/* Imagem de fundo */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.7)'
                }}
              />
              
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              
              {/* Conteúdo do slide */}
              <div className="relative h-full flex items-center px-8 md:px-16">
                <div className="max-w-2xl">
                  <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Setas de navegação */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition backdrop-blur-sm"
        aria-label="Slide anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition backdrop-blur-sm"
        aria-label="Próximo slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicadores (bolinhas) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}