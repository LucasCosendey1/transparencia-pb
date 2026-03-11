'use client'

import Header from '../components/Header'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import VLibras from 'vlibras-nextjs'
import { 
  FaDollarSign, 
  FaMoneyBillWave, 
  FaUsers,
  FaFileContract,
  FaBuilding,
  FaChartLine,
  FaUserFriends,
  FaGavel,
  FaLandmark,
  FaBalanceScale,
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

interface ButtonData {
  chave: string
  titulo: string
  caminho: string | null
}

export default function HomePage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [buttonsData, setButtonsData] = useState<Record<string, ButtonData>>({})
  const [editingButton, setEditingButton] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ titulo: '', caminho: '' })

  useEffect(() => {
    // Verificar se é admin (via localStorage ou cookie)
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)

    // Buscar dados dos botões do banco
    fetchButtonsData()
  }, [])

  const fetchButtonsData = async () => {
    try {
      const response = await fetch('/api/buttons')
      const data = await response.json()
      
      // Converter array em objeto indexado por chave
      const buttonsMap: Record<string, ButtonData> = {}
      data.forEach((btn: ButtonData) => {
        buttonsMap[btn.chave] = btn
      })
      setButtonsData(buttonsMap)
    } catch (error) {
      console.error('Erro ao carregar botões:', error)
    }
  }

  const handleEditClick = (chave: string) => {
  setEditingButton(chave)
  setEditForm({ 
    titulo: buttonsData[chave]?.titulo || '', 
    caminho: buttonsData[chave]?.caminho || '' 
  })
}

  const handleSaveEdit = async () => {
    if (!editingButton) return

    try {
      await fetch('/api/buttons/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chave: editingButton,
          titulo: editForm.titulo,
          caminho: editForm.caminho || null
        })
      })

      // Atualizar estado local
      setButtonsData(prev => ({
        ...prev,
        [editingButton]: {
          ...prev[editingButton],
          titulo: editForm.titulo,
          caminho: editForm.caminho || null
        }
      }))

      setEditingButton(null)
    } catch (error) {
      console.error('Erro ao atualizar botão:', error)
    }
  }

  const adjustFontSize = (change: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + change)))
  }

  const [showBackToTop, setShowBackToTop] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Função helper para obter dados do botão
  const getButtonData = (chave: string, defaultTitle: string, defaultPath: string = '') => {
    const btnData = buttonsData[chave]
    return {
      titulo: btnData?.titulo || defaultTitle,
      caminho: btnData?.caminho || defaultPath,
      chave
    }
  }

  return (
    <div 
      className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-white'}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <style jsx global>{`
        .card-bg-yellow,
        .card-bg-blue {
          transform-origin: center;
        }

        .card-anim-1:hover .card-bg-blue {
          border-radius: 50%;
          animation: blueCircle 0.6s 0.2s ease-out forwards;
        }
        
        .card-anim-2:hover .card-bg-blue {
          border-radius: 0%;
          animation: blueSquare 0.7s ease-out forwards;
        }
        
        .card-anim-3:hover .card-bg-blue {
          border-radius: 0%;
          animation: blueSlide 0.6s ease-in-out forwards;
        }
        
        .card-anim-4:hover .card-bg-blue {
          border-radius: 50%;
          animation: blueExplode 0.5s ease-out forwards;
        }

        @keyframes blueCircle {
          0% { opacity: 1; transform: scale(0) rotate(0deg); }
          100% { opacity: 1; transform: scale(3) rotate(180deg); }
        }

        @keyframes blueSquare {
          0% { opacity: 1; transform: scale(0) rotate(45deg); }
          100% { opacity: 1; transform: scale(2.5) rotate(0deg); }
        }

        @keyframes blueSlide {
          0% { opacity: 1; transform: translateX(-150%) scaleY(2); }
          100% { opacity: 1; transform: translateX(0%) scaleY(2); }
        }

        @keyframes blueExplode {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(4); }
          100% { opacity: 1; transform: scale(3); }
        }

        .card-animated:hover .card-icon {
          animation: iconFade 1.2s ease-in-out forwards;
        }

        @keyframes iconFade {
          0% { opacity: 1; }
          30% { opacity: 0; }
          70% { opacity: 0; }
          100% { opacity: 1; color: white; }
        }

        .card-animated:hover .card-itabaiana {
          animation: itabaianaShow 1.2s ease-in-out forwards;
        }

        @keyframes itabaianaShow {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; transform: scale(1); }
          70% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }

        .card-animated:hover .card-title {
          animation: titleWhite 0.7s 0.2s ease-out forwards;
        }

        @keyframes titleWhite {
          0% { color: inherit; }
          100% { color: white; }
        }

        .card-animated:hover .card-description {
          animation: descriptionShow 0.3s 0.7s ease-out forwards;
        }

        @keyframes descriptionShow {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .edit-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 1000;
          min-width: 400px;
        }

        .edit-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
      `}</style>

      <Header 
        highContrast={highContrast}
        fontSize={fontSize}
        adjustFontSize={adjustFontSize}
        setHighContrast={setHighContrast}
        setFontSize={setFontSize}
      />

      <section className={`${highContrast ? 'bg-black' : 'bg-gray-100'} py-8 pt-40`}>
        <div className="max-w-7xl mx-auto px-4">
          <Carousel highContrast={highContrast} />
        </div>
      </section>

<main className={`${highContrast ? 'bg-black' : 'bg-gray-50'} py-12 pt-32`}>
        <div className="max-w-7xl mx-auto px-4">
          
          <Section title="LGPD & Governo Digital" color="yellow" highContrast={highContrast}>
            <CategoryCard chave="encarregado-dados" titulo={buttonsData['encarregado-dados']?.titulo || 'Encarregado pelo Tratamento de Dados'} caminho={buttonsData['encarregado-dados']?.caminho || '/encarregado-pelo-tratamento-de-dados'} icon={FaUserCircle} description="Responsável pela proteção de dados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="politica-privacidade" titulo={buttonsData['politica-privacidade']?.titulo || 'Política de Privacidade e Proteção dos Dados'} caminho={buttonsData['politica-privacidade']?.caminho || '/politica-de-privacidade-e-protecao-dos-dados'} icon={FaShieldAlt} description="Veja como protegemos seus dados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="prefeitura-digital" titulo={buttonsData['prefeitura-digital']?.titulo || 'Prefeitura Digital'} caminho={buttonsData['prefeitura-digital']?.caminho || 'https://itabaiana.flowdocs.com.br:2087/public/home'} icon={FaKeyboard} description="Serviços digitais da prefeitura" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="decreto-governo-digital" titulo={buttonsData['decreto-governo-digital']?.titulo || 'Decreto Governo Digital'} caminho={buttonsData['decreto-governo-digital']?.caminho || '/decreto-governo-digital'} icon={FaRegistered} description="Legislação sobre governo digital" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="pesquisa-satisfacao" titulo={buttonsData['pesquisa-satisfacao']?.titulo || 'Pesquisa de Satisfação'} caminho={buttonsData['pesquisa-satisfacao']?.caminho || 'https://serpromais.serpro.gov.br/index.php/apps/forms/s/xnJjiAfeBXHm8F5iPawkSCiN'} icon={FaClipboardCheck} description="Avalie nossos serviços" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="governanca-compliance" titulo={buttonsData['governanca-compliance']?.titulo || 'Governança Pública & Compliance'} caminho={buttonsData['governanca-compliance']?.caminho || 'https://sapl.itabaiana.pb.leg.br/media/sapl/public/normajuridica/2025/751/decreto_0112025_-_dispoe_sobre_a_politica_de_governanca_publica_risco_e_compliance_no_ambito_do_poder_executivo_do_municipio_de_itabaiana__pb.pdf'} icon={FaCrosshairs} description="Práticas de boa governança" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="regulamentacao-lgpd" titulo={buttonsData['regulamentacao-lgpd']?.titulo || 'Regulamentação LGPD'} caminho={buttonsData['regulamentacao-lgpd']?.caminho || 'https://sapl.itabaiana.pb.leg.br/media/sapl/public/normajuridica/2025/752/decreto_012_2025.pdf'} icon={FaSave} description="Normas de proteção de dados" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="regulamentacao-lai" titulo={buttonsData['regulamentacao-lai']?.titulo || 'Regulamentação LAI'} caminho={buttonsData['regulamentacao-lai']?.caminho || 'https://portal.itabaiana.pb.gov.br/wp-content/uploads/2025/01/A-FOLHA-12-23-de-Janeiro.pdf'} icon={FaBars} description="Lei de Acesso à Informação" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre receitas" color="blue" highContrast={highContrast}>
            <CategoryCard chave="receita-prevista" titulo={buttonsData['receita-prevista']?.titulo || 'Receita Prevista'} caminho={buttonsData['receita-prevista']?.caminho || ''} icon={FaCreditCard} description="Previsão de arrecadação" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="receita-realizada" titulo={buttonsData['receita-realizada']?.titulo || 'Receita Realizada'} caminho={buttonsData['receita-realizada']?.caminho || ''} icon={FaChartBar} description="Receitas já arrecadadas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="receita-extra" titulo={buttonsData['receita-extra']?.titulo || 'Receita Extra Orçamentária'} caminho={buttonsData['receita-extra']?.caminho || ''} icon={FaMoneyBillWave} description="Receitas fora do orçamento" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="divida-ativa" titulo={buttonsData['divida-ativa']?.titulo || 'Inscritos em Dívida Ativa'} caminho={buttonsData['divida-ativa']?.caminho || '/inscritos-divida-ativa'} icon={FaFileInvoiceDollar} description="Devedores do município" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="receitas-covid" titulo={buttonsData['receitas-covid']?.titulo || 'Receitas Covid-19'} caminho={buttonsData['receitas-covid']?.caminho || ''} icon={FaVirus} description="Recursos para combate à pandemia" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="desoneracoes" titulo={buttonsData['desoneracoes']?.titulo || 'Desonerações Fiscais Concedidas'} caminho={buttonsData['desoneracoes']?.caminho || '/desoneracoes-fiscais'} icon={FaHandHoldingUsd} description="Isenções e benefícios fiscais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="renuncia-fiscal" titulo={buttonsData['renuncia-fiscal']?.titulo || 'Renúncia Fiscal Prevista e Realizada'} caminho={buttonsData['renuncia-fiscal']?.caminho || '/renuncia-fiscal-prevista-e-realizada'} icon={FaCoins} description="Valores de renúncias fiscais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="beneficiarios" titulo={buttonsData['beneficiarios']?.titulo || 'Beneficiários das Desonerações e Renúncias'} caminho={buttonsData['beneficiarios']?.caminho || ''} icon={FaUserTie} description="Quem recebe benefícios fiscais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="incentivo-cultura" titulo={buttonsData['incentivo-cultura']?.titulo || 'Projetos de Incentivo à Cultura'} caminho={buttonsData['incentivo-cultura']?.caminho || ''} icon={FaPalette} description="Apoio a projetos culturais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="emendas-federais" titulo={buttonsData['emendas-federais']?.titulo || 'Emendas Parlamentares Federais'} caminho={buttonsData['emendas-federais']?.caminho || ''} icon={FaLandmark} description="Emendas de deputados federais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="emendas-estaduais" titulo={buttonsData['emendas-estaduais']?.titulo || 'Emendas Parlamentares Estaduais'} caminho={buttonsData['emendas-estaduais']?.caminho || 'https://portaldatransparencia.gov.br/emendas/consulta-por-favorecido'} icon={FaMapMarkedAlt} description="Emendas de deputados estaduais" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="transferencias-especiais" titulo={buttonsData['transferencias-especiais']?.titulo || 'Transferências Especiais'} caminho={buttonsData['transferencias-especiais']?.caminho || 'https://portal.itabaiana.pb.gov.br/transferenciasespeciais/'} icon={FaDollarSign} description="Transferências diretas de emendas" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="recursos-federais" titulo={buttonsData['recursos-federais']?.titulo || 'Recursos Federais Recebidos'} caminho={buttonsData['recursos-federais']?.caminho || 'https://portaldatransparencia.gov.br/transferencias/consulta'} icon={FaUniversity} description="Transferências da União" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre recursos humanos" color="pink" highContrast={highContrast}>
            <CategoryCard chave="folha-pagamento" titulo={buttonsData['folha-pagamento']?.titulo || 'Folha de Pagamento'} caminho={buttonsData['folha-pagamento']?.caminho || ''} icon={FaListAlt} description="Remuneração dos servidores" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="quadro-funcional" titulo={buttonsData['quadro-funcional']?.titulo || 'Quadro Funcional'} caminho={buttonsData['quadro-funcional']?.caminho || ''} icon={FaUsers} description="Lista completa de servidores" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="temporarios" titulo={buttonsData['temporarios']?.titulo || 'Servidores Temporários'} caminho={buttonsData['temporarios']?.caminho || ''} icon={FaUserCheck} description="Contratos temporários" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="cedidos" titulo={buttonsData['cedidos']?.titulo || 'Servidores Cedidos'} caminho={buttonsData['cedidos']?.caminho || ''} icon={FaUserMinus} description="Servidores emprestados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="requisitados" titulo={buttonsData['requisitados']?.titulo || 'Servidores Requisitados'} caminho={buttonsData['requisitados']?.caminho || ''} icon={FaUserPlus} description="Servidores requisitados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="plano-cargos" titulo={buttonsData['plano-cargos']?.titulo || 'Plano de Cargos e Carreiras'} caminho={buttonsData['plano-cargos']?.caminho || ''} icon={FaIdCard} description="Estrutura de cargos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="folha-covid" titulo={buttonsData['folha-covid']?.titulo || 'Folha Covid-19'} caminho={buttonsData['folha-covid']?.caminho || ''} icon={FaVirus} description="Gastos com pessoal na pandemia" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="estagiarios" titulo={buttonsData['estagiarios']?.titulo || 'Estagiários'} caminho={buttonsData['estagiarios']?.caminho || ''} icon={FaUserGraduate} description="Programa de estágio" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="terceirizados" titulo={buttonsData['terceirizados']?.titulo || 'Terceirizados'} caminho={buttonsData['terceirizados']?.caminho || ''} icon={FaLock} description="Serviços terceirizados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="selecoes" titulo={buttonsData['selecoes']?.titulo || 'Seleções'} caminho={buttonsData['selecoes']?.caminho || ''} icon={FaCheckDouble} description="Processos seletivos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre licitações, contratos e obras" color="orange" highContrast={highContrast}>
            <CategoryCard chave="licitacoes" titulo={buttonsData['licitacoes']?.titulo || 'Licitações'} caminho={buttonsData['licitacoes']?.caminho || ''} icon={FaCheckCircle} description="Processos licitatórios" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="editais" titulo={buttonsData['editais']?.titulo || 'Editais'} caminho={buttonsData['editais']?.caminho || '/editais'} icon={FaFileAlt} description="Editais publicados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="documentos-licitacao" titulo={buttonsData['documentos-licitacao']?.titulo || 'Documentos Fase Interna e Externa'} caminho={buttonsData['documentos-licitacao']?.caminho || ''} icon={FaFileContract} description="Documentação das licitações" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="inexigibilidade" titulo={buttonsData['inexigibilidade']?.titulo || 'Inexigibilidade'} caminho={buttonsData['inexigibilidade']?.caminho || ''} icon={FaUserSlash} description="Contratações inexigíveis" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="dispensas" titulo={buttonsData['dispensas']?.titulo || 'Dispensas de Licitação'} caminho={buttonsData['dispensas']?.caminho || ''} icon={FaTimesCircle} description="Contratações dispensadas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="adesoes-srp" titulo={buttonsData['adesoes-srp']?.titulo || 'Adesões à SRP'} caminho={buttonsData['adesoes-srp']?.caminho || ''} icon={FaStore} description="Sistema de Registro de Preços" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="plano-contratacao" titulo={buttonsData['plano-contratacao']?.titulo || 'Plano de Contratação Anual'} caminho={buttonsData['plano-contratacao']?.caminho || ''} icon={FaClipboardList} description="Planejamento de compras" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="sancionados" titulo={buttonsData['sancionados']?.titulo || 'Licitantes & Contratados Sancionados'} caminho={buttonsData['sancionados']?.caminho || ''} icon={FaBalanceScale} description="Empresas punidas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="contratos" titulo={buttonsData['contratos']?.titulo || 'Contratos Celebrados'} caminho={buttonsData['contratos']?.caminho || 'https://transparencia.elmartecnologia.com.br/Export/Data'} icon={FaContract} description="Contratos firmados" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="aditivos" titulo={buttonsData['aditivos']?.titulo || 'Termos Aditivos'} caminho={buttonsData['aditivos']?.caminho || 'https://transparencia.elmartecnologia.com.br/Export/Data'} icon={FaEdit} description="Aditivos contratuais" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="gestores-contratos" titulo={buttonsData['gestores-contratos']?.titulo || 'Gestores e Fiscais de Contratos'} caminho={buttonsData['gestores-contratos']?.caminho || ''} icon={FaUserCog} description="Responsáveis por contratos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ordem-pagamentos" titulo={buttonsData['ordem-pagamentos']?.titulo || 'Ordem de Pagamentos'} caminho={buttonsData['ordem-pagamentos']?.caminho || ''} icon={FaCalendarAlt} description="Cronograma de pagamentos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="mapa-obras" titulo={buttonsData['mapa-obras']?.titulo || 'Mapa de Obras'} caminho={buttonsData['mapa-obras']?.caminho || ''} icon={FaGavel} description="Obras em andamento" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="obras-paralisadas" titulo={buttonsData['obras-paralisadas']?.titulo || 'Obras Paralisadas'} caminho={buttonsData['obras-paralisadas']?.caminho || ''} icon={FaPause} description="Obras interrompidas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="fiscais-obras" titulo={buttonsData['fiscais-obras']?.titulo || 'Fiscais de Obras'} caminho={buttonsData['fiscais-obras']?.caminho || ''} icon={FaHardHat} description="Responsáveis por obras" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre responsabilidade fiscal" color="indigo" highContrast={highContrast}>
            <CategoryCard chave="prestacoes-contas" titulo={buttonsData['prestacoes-contas']?.titulo || 'Prestações de Contas'} caminho={buttonsData['prestacoes-contas']?.caminho || ''} icon={FaFileArchive} description="Contas públicas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="relatorio-gestao" titulo={buttonsData['relatorio-gestao']?.titulo || 'Relatório de Gestão e Atividades'} caminho={buttonsData['relatorio-gestao']?.caminho || ''} icon={FaClipboardList} description="Gestão administrativa" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="pareceres-tce" titulo={buttonsData['pareceres-tce']?.titulo || 'Pareceres do Tribunal de Contas'} caminho={buttonsData['pareceres-tce']?.caminho || ''} icon={FaFolder} description="Análises do TCE" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="julgamentos-contas" titulo={buttonsData['julgamentos-contas']?.titulo || 'Julgamentos das Contas pelo Poder Legislativo'} caminho={buttonsData['julgamentos-contas']?.caminho || ''} icon={FaUniversity} description="Aprovação das contas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="rgf" titulo={buttonsData['rgf']?.titulo || 'Relatório de Gestão Fiscal - RGF'} caminho={buttonsData['rgf']?.caminho || ''} icon={FaChartLine} description="Relatório LRF" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="rreo" titulo={buttonsData['rreo']?.titulo || 'Relatório Resumido da Execução Orçamentária'} caminho={buttonsData['rreo']?.caminho || ''} icon={FaProjectDiagram} description="RREO bimestral" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ppa" titulo={buttonsData['ppa']?.titulo || 'Plano Plurianual (PPA) - 2022/2025'} caminho={buttonsData['ppa']?.caminho || ''} icon={FaCalendarAlt} description="Planejamento de 4 anos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="loa" titulo={buttonsData['loa']?.titulo || 'Lei Orçamentária Anual 2025'} caminho={buttonsData['loa']?.caminho || ''} icon={FaFileInvoice} description="Orçamento do ano" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ldo-atual" titulo={buttonsData['ldo-atual']?.titulo || 'Lei de Diretrizes Orçamentárias 2025'} caminho={buttonsData['ldo-atual']?.caminho || ''} icon={FaFileSignature} description="LDO do ano" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ldo-projeto" titulo={buttonsData['ldo-projeto']?.titulo || 'Projeto de Lei de Diretrizes Orçamentárias 2026'} caminho={buttonsData['ldo-projeto']?.caminho || ''} icon={FaEdit} description="Proposta de LDO" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre a gestão municipal" color="green" highContrast={highContrast}>
            <CategoryCard chave="plano-estrategico" titulo={buttonsData['plano-estrategico']?.titulo || 'Plano Estratégico Institucional'} caminho={buttonsData['plano-estrategico']?.caminho || ''} icon={FaChartLine} description="Planejamento estratégico" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="estrutura-org" titulo={buttonsData['estrutura-org']?.titulo || 'Estrutura Organizacional'} caminho={buttonsData['estrutura-org']?.caminho || ''} icon={FaBuilding} description="Organograma da prefeitura" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="competencias" titulo={buttonsData['competencias']?.titulo || 'Competências e Atribuições'} caminho={buttonsData['competencias']?.caminho || ''} icon={FaFileAlt} description="Funções de cada setor" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="responsaveis-gestao" titulo={buttonsData['responsaveis-gestao']?.titulo || 'Responsáveis pela Gestão'} caminho={buttonsData['responsaveis-gestao']?.caminho || ''} icon={FaUserTie} description="Gestores públicos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="contatos" titulo={buttonsData['contatos']?.titulo || 'Endereço, Telefone e Horário de Atendimento'} caminho={buttonsData['contatos']?.caminho || ''} icon={FaPhoneAlt} description="Contatos da prefeitura" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="decretos" titulo={buttonsData['decretos']?.titulo || 'Decretos Municipais'} caminho={buttonsData['decretos']?.caminho || ''} icon={FaFileContract} description="Decretos publicados" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="diario-oficial" titulo={buttonsData['diario-oficial']?.titulo || 'Diário Oficial'} caminho={buttonsData['diario-oficial']?.caminho || ''} icon={FaNewspaper} description="Publicações oficiais" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="faq" titulo={buttonsData['faq']?.titulo || 'Perguntas Frequentes'} caminho={buttonsData['faq']?.caminho || ''} icon={FaQuestionCircle} description="Dúvidas comuns" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="conselhos" titulo={buttonsData['conselhos']?.titulo || 'Conselhos Municipais'} caminho={buttonsData['conselhos']?.caminho || ''} icon={FaUserFriends} description="Conselhos participativos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre participação cidadã" color="cyan" highContrast={highContrast}>
            <CategoryCard chave="sic" titulo={buttonsData['sic']?.titulo || 'Serviço de Informação ao Cidadão'} caminho={buttonsData['sic']?.caminho || ''} icon={FaComments} description="SIC presencial" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="esic" titulo={buttonsData['esic']?.titulo || 'Serviço Eletrônico de Informação ao Cidadão'} caminho={buttonsData['esic']?.caminho || 'https://falabr.cgu.gov.br/web/PB/Itabaiana/manifestacao/criar?tipo=8'} icon={FaEnvelope} description="E-SIC online" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="relatorio-sic" titulo={buttonsData['relatorio-sic']?.titulo || 'Relatório Anual do SIC'} caminho={buttonsData['relatorio-sic']?.caminho || '/relatorio-anual-do-sic'} icon={FaClipboard} description="Balanço do SIC" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="docs-classificados" titulo={buttonsData['docs-classificados']?.titulo || 'Documentos Classificados'} caminho={buttonsData['docs-classificados']?.caminho || '/documentos-classificados'} icon={FaFileAlt} description="Docs sigilosos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="docs-desclassificados" titulo={buttonsData['docs-desclassificados']?.titulo || 'Informações Desclassificadas'} caminho={buttonsData['docs-desclassificados']?.caminho || '/informacoes-desclassificadas'} icon={FaInfoCircle} description="Docs tornados públicos" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ouvidoria" titulo={buttonsData['ouvidoria']?.titulo || 'Ouvidoria'} caminho={buttonsData['ouvidoria']?.caminho || ''} icon={FaUserCircle} description="Canal de ouvidoria" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="ouvidoria-falabr" titulo={buttonsData['ouvidoria-falabr']?.titulo || 'Ouvidoria (Fala.BR)'} caminho={buttonsData['ouvidoria-falabr']?.caminho || 'https://falabr.cgu.gov.br/web/PB/Itabaiana?modoOuvidoria=1&ouvidoriaInterna=false'} icon={FaPhoneSquareAlt} description="Ouvidoria federal" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="carta-servicos" titulo={buttonsData['carta-servicos']?.titulo || 'Carta de Serviços ao Usuário'} caminho={buttonsData['carta-servicos']?.caminho || 'https://portal.itabaiana.pb.gov.br/category/carta-de-servicos-ao-usuario/'} icon={FaDesktop} description="Serviços disponíveis" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

          <Section title="Consultas sobre educação & saúde" color="yellow" highContrast={highContrast}>
            <CategoryCard chave="pme" titulo={buttonsData['pme']?.titulo || 'Plano Municipal de Educação'} caminho={buttonsData['pme']?.caminho || '/plano-municipal-de-educacao'} icon={FaGraduationCap} description="PME vigente" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="relatorio-pme" titulo={buttonsData['relatorio-pme']?.titulo || 'Relatório do Plano Municipal de Educação'} caminho={buttonsData['relatorio-pme']?.caminho || '/relatorio-do-plano-municipal-de-educacao'} icon={FaBook} description="Acompanhamento do PME" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="lista-creches" titulo={buttonsData['lista-creches']?.titulo || 'Lista de Espera Creches'} caminho={buttonsData['lista-creches']?.caminho || '/lista-de-espera-creches'} icon={FaBriefcaseMedical} description="Fila de creches" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="primeira-infancia" titulo={buttonsData['primeira-infancia']?.titulo || 'Diagnóstico Primeira Infância'} caminho={buttonsData['primeira-infancia']?.caminho || 'https://fastly.primeirainfanciaprimeiro.fmcsv.org.br/embed/diagnostico/itabaiana-pb'} icon={FaUsers} description="Situação da primeira infância" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="pms" titulo={buttonsData['pms']?.titulo || 'Plano Municipal de Saúde'} caminho={buttonsData['pms']?.caminho || '/programacao-anual-da-saude'} icon={FaHeartbeat} description="PMS vigente" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="programacao-saude" titulo={buttonsData['programacao-saude']?.titulo || 'Programação Anual da Saúde'} caminho={buttonsData['programacao-saude']?.caminho || '/programacao-anual-da-saude'} icon={FaCalendarAlt} description="Planejamento de saúde" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="relatorio-saude" titulo={buttonsData['relatorio-saude']?.titulo || 'Relatório de Gestão da Saúde'} caminho={buttonsData['relatorio-saude']?.caminho || ''} icon={FaChart} description="Prestação de contas saúde" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="servicos-saude" titulo={buttonsData['servicos-saude']?.titulo || 'Serviços de Saúde'} caminho={buttonsData['servicos-saude']?.caminho || 'https://portal.itabaiana.pb.gov.br/2025/02/27/carta-de-servicos-saude/'} icon={FaHospital} description="Unidades de saúde" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="especialidades" titulo={buttonsData['especialidades']?.titulo || 'Especialidades'} caminho={buttonsData['especialidades']?.caminho || '/especialidades'} icon={FaMedkit} description="Especialidades médicas" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="lista-regulacao" titulo={buttonsData['lista-regulacao']?.titulo || 'Lista de Espera para Regulação'} caminho={buttonsData['lista-regulacao']?.caminho || '/lista-de-espera-para-regulacao'} icon={FaListAlt} description="Fila de consultas/exames" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="lista-medicamentos" titulo={buttonsData['lista-medicamentos']?.titulo || 'Lista de Medicamentos'} caminho={buttonsData['lista-medicamentos']?.caminho || '/lista-de-medicamentos'} icon={FaPills} description="Medicamentos disponíveis" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
            <CategoryCard chave="estoque-farmacia" titulo={buttonsData['estoque-farmacia']?.titulo || 'Estoque Farmácia'} caminho={buttonsData['estoque-farmacia']?.caminho || 'https://portal.itabaiana.pb.gov.br/farmacia/'} icon={FaSyringe} description="Estoque atual" target="_blank" highContrast={highContrast} isAdmin={isAdmin} onEdit={handleEditClick} />
          </Section>

        </div>
      </main>

      {/* Modal de edição */}
      {editingButton && (
        <>
          <div className="edit-overlay" onClick={() => setEditingButton(null)} />
          <div className="edit-modal">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Editar Botão</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Botão
              </label>
              <input
                type="text"
                value={editForm.titulo}
                onChange={(e) => setEditForm({...editForm, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caminho (opcional)
              </label>
              <input
                type="text"
                value={editForm.caminho}
                onChange={(e) => setEditForm({...editForm, caminho: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="/caminho ou https://..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingButton(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </>
      )}

      <footer className="bg-gradient-to-r from-[#0d6efd] to-[#0a58ca] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">
                Navegação
              </h3>
              <ul className="space-y-2 text-sm mt-4">
                <li><Link href="/" className="hover:text-[#ffc107] transition">Início</Link></li>
                <li><Link href="/portal" className="hover:text-[#ffc107] transition">O Portal</Link></li>
                <li><Link href="/glossario" className="hover:text-[#ffc107] transition">Glossário</Link></li>
                <li><Link href="/contato" className="hover:text-[#ffc107] transition">Fale Conosco</Link></li>
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
              <Link href="/admin" className="hover:text-[#ffc107] transition opacity-90">
                Seção de Administrador
              </Link>
              <span className="opacity-50">|</span>
              <Link href="/termos-uso" className="hover:text-[#ffc107] transition opacity-90">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        ↑
      </button>

      <VLibras forceOnload />
    </div>
  )
}

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

interface CategoryCardProps {
  icon: IconType
  chave: string
  titulo: string
  caminho: string
  description: string
  target?: string
  highContrast: boolean
  isAdmin: boolean
  onEdit: (chave: string) => void
}

function CategoryCard({ icon: Icon, chave, titulo, caminho, description, target, highContrast, isAdmin, onEdit }: CategoryCardProps) {
  const [randomTerm, setRandomTerm] = useState('')
  const [animationClass, setAnimationClass] = useState('')

  const terms = ['Itabaiana', 'Transparência', 'Informação', 'Cidadão', 'Público', 'Municipal']
  const animations = ['card-anim-1', 'card-anim-2', 'card-anim-3', 'card-anim-4']

  const handleMouseEnter = () => {
    setRandomTerm(terms[Math.floor(Math.random() * terms.length)])
    setAnimationClass(animations[Math.floor(Math.random() * animations.length)])
  }

  const handleEditClick = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  onEdit(chave) 
}

  return (
    <Link 
      href={caminho || '#'}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      <div 
        className={`card-animated ${animationClass} group relative ${highContrast ? 'bg-yellow-300 text-black' : 'bg-white'} rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 p-6 h-full border-2 border-gray-100 overflow-hidden`}
        onMouseEnter={handleMouseEnter}
      >
        {isAdmin && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 z-20 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition shadow-lg"
            title="Editar"
          >
            <FaEdit size={12} />
          </button>
        )}

        <div className="card-bg-yellow absolute inset-0 bg-[#ffc107] opacity-0"></div>
        <div className="card-bg-blue absolute inset-0 bg-[#0d6efd] opacity-0"></div>

        <div className="relative z-10">
          <div className="relative w-12 h-12 mb-3 mx-auto">
            <Icon className={`card-icon absolute inset-0 w-12 h-12 ${highContrast ? 'text-black' : 'text-gray-600'} transition-all duration-300`} />
            <span className="card-itabaiana absolute inset-0 flex items-center justify-center text-[#ffc107] font-black text-lg opacity-0">
              {randomTerm}
            </span>
          </div>

          <h3 className={`card-title font-bold text-sm leading-tight mb-2 text-center ${highContrast ? 'text-black' : 'text-gray-800'} transition-colors`}>
            {titulo}
          </h3>
          
          <p className="card-description text-xs text-white opacity-0 transition-opacity duration-300 font-medium text-center">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

interface CarouselProps {
  highContrast: boolean
}

function Carousel({ highContrast }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: '/banner1.jpg',
      title: 'Novas informações sobre saúde estão disponíveis no Portal de Dados Abertos',
      link: ''
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
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.7)'
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              
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