//app/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import VLibrasWrapper from '@/components/VLibrasWrapper'
import { useHomeData } from '@/contexts/HomeDataContext'
import { usePreferences } from '@/contexts/PreferencesContext'



import { 
  FaDollarSign, FaMoneyBillWave, FaUsers, FaFileContract, FaBuilding,
  FaHandshake,
  FaChartLine, FaUserFriends, FaGavel, FaLandmark, FaBalanceScale,
  FaComments, FaHeartbeat, FaGraduationCap, FaShieldAlt, FaFileAlt,
  FaKeyboard, FaRegistered, FaClipboardCheck, FaCrosshairs, FaSave,
  FaBars, FaCreditCard, FaChartBar, FaFileInvoiceDollar, FaListAlt,
  FaCoins, FaHandHoldingUsd, FaUserTie, FaPalette, FaMapMarkedAlt,
  FaCheckCircle, FaUserCheck, FaUserMinus, FaUserPlus, FaIdCard,
  FaVirus, FaUserGraduate, FaLock, FaCheckDouble, FaEdit, FaFileSignature,
  FaUserSlash, FaTimesCircle, FaStore, FaFileContract as FaContract,
  FaUserCog, FaCalendarAlt, FaPause, FaHardHat, FaFileArchive,
  FaClipboardList, FaFolder, FaUniversity, FaProjectDiagram, FaFileInvoice,
  FaPhoneAlt, FaNewspaper, FaQuestionCircle, FaBriefcaseMedical, FaEnvelope,
  FaClipboard, FaInfoCircle, FaUserCircle, FaPhoneSquareAlt, FaDesktop,
  FaBook, FaHospital, FaMedkit, FaPills, FaSyringe, FaChartLine as FaChart,
  FaClock
} from 'react-icons/fa'
import { IconType } from 'react-icons'

// ── Tipos ─────────────────────────────────────────────────────
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

// ── Definição estática dos cards ──────────────────────────────
const CARDS: { chave: string; icon: IconType; defaultTitulo: string }[] = [
  { chave: 'encarregado-dados',     icon: FaUserCircle,       defaultTitulo: 'Encarregado pelo Tratamento de Dados' },
  { chave: 'politica-privacidade',  icon: FaShieldAlt,        defaultTitulo: 'Política de Privacidade e Proteção dos Dados' },
  { chave: 'prefeitura-digital',    icon: FaKeyboard,         defaultTitulo: 'Prefeitura Digital' },
  { chave: 'decreto-governo-digital',icon: FaRegistered,      defaultTitulo: 'Decreto Governo Digital' },
  { chave: 'pesquisa-satisfacao',   icon: FaClipboardCheck,   defaultTitulo: 'Pesquisa de Satisfação' },
  { chave: 'governanca-compliance', icon: FaCrosshairs,       defaultTitulo: 'Governança Pública & Compliance' },
  { chave: 'regulamentacao-lgpd',   icon: FaSave,             defaultTitulo: 'Regulamentação LGPD' },
  { chave: 'regulamentacao-lai',    icon: FaBars,             defaultTitulo: 'Regulamentação LAI' },
  { chave: 'despesa-fixada',        icon: FaMoneyBillWave,    defaultTitulo: 'Despesa Fixada' },
  { chave: 'empenhos',              icon: FaFileContract,     defaultTitulo: 'Empenhos' },
  { chave: 'subempenhos',           icon: FaFileContract,     defaultTitulo: 'SubEmpenhos' },
  { chave: 'pagamentos',            icon: FaDollarSign,       defaultTitulo: 'Pagamentos' },
  { chave: 'liquidacao',            icon: FaCheckCircle,      defaultTitulo: 'Liquidação' },
  { chave: 'despesa-extra',         icon: FaMoneyBillWave,    defaultTitulo: 'Despesa Extra Orçamentária' },
  { chave: 'restos-pagar',          icon: FaFileInvoiceDollar,defaultTitulo: 'Restos à Pagar' },
  { chave: 'cronograma-pagamentos', icon: FaCalendarAlt,      defaultTitulo: 'Cronograma de Pagamentos' },
  { chave: 'diarias-viagens',       icon: FaMapMarkedAlt,     defaultTitulo: 'Diárias e Viagens' },
  { chave: 'convenios-estaduais',   icon: FaHandHoldingUsd,   defaultTitulo: 'Convênios Estaduais' },
  { chave: 'convenios-federais',    icon: FaHandHoldingUsd,   defaultTitulo: 'Convênios Federais' },
  { chave: 'transferencia-realizada',icon: FaDollarSign,      defaultTitulo: 'Transferência Realizada' },
  { chave: 'tabela-diarias',        icon: FaListAlt,          defaultTitulo: 'Tabela de Diárias' },
  { chave: 'despesas-covid',        icon: FaVirus,            defaultTitulo: 'Despesas Covid-19' },
  { chave: 'receita-prevista',      icon: FaCreditCard,       defaultTitulo: 'Receita Prevista' },
  { chave: 'receita-realizada',     icon: FaChartBar,         defaultTitulo: 'Receita Realizada' },
  { chave: 'receita-extra',         icon: FaMoneyBillWave,    defaultTitulo: 'Receita Extra Orçamentária' },
  { chave: 'divida-ativa',          icon: FaFileInvoiceDollar,defaultTitulo: 'Inscritos em Dívida Ativa' },
  { chave: 'receitas-covid',        icon: FaVirus,            defaultTitulo: 'Receitas Covid-19' },
  { chave: 'desoneracoes',          icon: FaHandHoldingUsd,   defaultTitulo: 'Desonerações Fiscais Concedidas' },
  { chave: 'renuncia-fiscal',       icon: FaCoins,            defaultTitulo: 'Renúncia Fiscal Prevista e Realizada' },
  { chave: 'beneficiarios',         icon: FaUserTie,          defaultTitulo: 'Beneficiários das Desonerações e Renúncias' },
  { chave: 'incentivo-cultura',     icon: FaPalette,          defaultTitulo: 'Projetos de Incentivo à Cultura' },
  { chave: 'emendas-federais',      icon: FaLandmark,         defaultTitulo: 'Emendas Parlamentares Federais' },
  { chave: 'emendas-estaduais',     icon: FaMapMarkedAlt,     defaultTitulo: 'Emendas Parlamentares Estaduais' },
  { chave: 'transferencias-especiais',icon: FaDollarSign,     defaultTitulo: 'Transferências Especiais' },
  { chave: 'recursos-federais',     icon: FaUniversity,       defaultTitulo: 'Recursos Federais Recebidos' },
  { chave: 'folha-pagamento',       icon: FaListAlt,          defaultTitulo: 'Folha de Pagamento' },
  { chave: 'quadro-funcional',      icon: FaUsers,            defaultTitulo: 'Quadro Funcional' },
  { chave: 'temporarios',           icon: FaUserCheck,        defaultTitulo: 'Servidores Temporários' },
  { chave: 'cedidos',               icon: FaUserMinus,        defaultTitulo: 'Servidores Cedidos' },
  { chave: 'requisitados',          icon: FaUserPlus,         defaultTitulo: 'Servidores Requisitados' },
  { chave: 'plano-cargos',          icon: FaIdCard,           defaultTitulo: 'Plano de Cargos e Carreiras' },
  { chave: 'folha-covid',           icon: FaVirus,            defaultTitulo: 'Folha Covid-19' },
  { chave: 'estagiarios',           icon: FaUserGraduate,     defaultTitulo: 'Estagiários' },
  { chave: 'terceirizados',         icon: FaLock,             defaultTitulo: 'Terceirizados' },
  { chave: 'selecoes',              icon: FaCheckDouble,      defaultTitulo: 'Seleções' },
  { chave: 'licitacoes',            icon: FaCheckCircle,      defaultTitulo: 'Licitações' },
  { chave: 'editais',               icon: FaFileAlt,          defaultTitulo: 'Editais' },
  { chave: 'documentos-licitacao',  icon: FaFileContract,     defaultTitulo: 'Documentos Fase Interna e Externa' },
  { chave: 'inexigibilidade',       icon: FaUserSlash,        defaultTitulo: 'Inexigibilidade' },
  { chave: 'dispensas',             icon: FaTimesCircle,      defaultTitulo: 'Dispensas de Licitação' },
  { chave: 'adesoes-srp',           icon: FaStore,            defaultTitulo: 'Adesões à SRP' },
  { chave: 'plano-contratacao',     icon: FaClipboardList,    defaultTitulo: 'Plano de Contratação Anual' },
  { chave: 'sancionados',           icon: FaBalanceScale,     defaultTitulo: 'Licitantes & Contratados Sancionados' },
  { chave: 'contratos',             icon: FaContract,         defaultTitulo: 'Contratos Celebrados' },
  { chave: 'aditivos',              icon: FaEdit,             defaultTitulo: 'Termos Aditivos' },
  { chave: 'gestores-contratos',    icon: FaUserCog,          defaultTitulo: 'Gestores e Fiscais de Contratos' },
  { chave: 'ordem-pagamentos',      icon: FaCalendarAlt,      defaultTitulo: 'Ordem de Pagamentos' },
  { chave: 'mapa-obras',            icon: FaGavel,            defaultTitulo: 'Mapa de Obras' },
  { chave: 'obras-paralisadas',     icon: FaPause,            defaultTitulo: 'Obras Paralisadas' },
  { chave: 'fiscais-obras',         icon: FaHardHat,          defaultTitulo: 'Fiscais de Obras' },
  { chave: 'convenios-celebrados',  icon: FaHandshake,        defaultTitulo: 'Convênios Celebrados' },
  { chave: 'prestacoes-contas',     icon: FaFileArchive,      defaultTitulo: 'Prestações de Contas' },
  { chave: 'relatorio-gestao',      icon: FaClipboardList,    defaultTitulo: 'Relatório de Gestão e Atividades' },
  { chave: 'pareceres-tce',         icon: FaFolder,           defaultTitulo: 'Pareceres do Tribunal de Contas' },
  { chave: 'julgamentos-contas',    icon: FaUniversity,       defaultTitulo: 'Julgamentos das Contas pelo Poder Legislativo' },
  { chave: 'rgf',                   icon: FaChartLine,        defaultTitulo: 'Relatório de Gestão Fiscal - RGF' },
  { chave: 'rreo',                  icon: FaProjectDiagram,   defaultTitulo: 'Relatório Resumido da Execução Orçamentária' },
  { chave: 'ppa',                   icon: FaCalendarAlt,      defaultTitulo: 'Plano Plurianual (PPA) - 2022/2025' },
  { chave: 'loa',                   icon: FaFileInvoice,      defaultTitulo: 'Lei Orçamentária Anual 2025' },
  { chave: 'ldo-atual',             icon: FaFileSignature,    defaultTitulo: 'Lei de Diretrizes Orçamentárias 2025' },
  { chave: 'ldo-projeto',           icon: FaEdit,             defaultTitulo: 'Projeto de Lei de Diretrizes Orçamentárias 2026' },
  { chave: 'plano-estrategico',     icon: FaChartLine,        defaultTitulo: 'Plano Estratégico Institucional' },
  { chave: 'estrutura-org',         icon: FaBuilding,         defaultTitulo: 'Estrutura Organizacional' },
  { chave: 'competencias',          icon: FaFileAlt,          defaultTitulo: 'Competências e Atribuições' },
  { chave: 'responsaveis-gestao',   icon: FaUserTie,          defaultTitulo: 'Responsáveis pela Gestão' },
  { chave: 'contatos',              icon: FaPhoneAlt,         defaultTitulo: 'Endereço, Telefone e Horário de Atendimento' },
  { chave: 'decretos',              icon: FaFileContract,     defaultTitulo: 'Decretos Municipais' },
  { chave: 'diario-oficial',        icon: FaNewspaper,        defaultTitulo: 'Diário Oficial' },
  { chave: 'faq',                   icon: FaQuestionCircle,   defaultTitulo: 'Perguntas Frequentes' },
  { chave: 'conselhos',             icon: FaUserFriends,      defaultTitulo: 'Conselhos Municipais' },
  { chave: 'sic',                   icon: FaComments,         defaultTitulo: 'Serviço de Informação ao Cidadão' },
  { chave: 'esic',                  icon: FaEnvelope,         defaultTitulo: 'Serviço Eletrônico de Informação ao Cidadão' },
  { chave: 'relatorio-sic',         icon: FaClipboard,        defaultTitulo: 'Relatório Anual do SIC' },
  { chave: 'docs-classificados',    icon: FaFileAlt,          defaultTitulo: 'Documentos Classificados' },
  { chave: 'docs-desclassificados', icon: FaInfoCircle,       defaultTitulo: 'Informações Desclassificadas' },
  { chave: 'ouvidoria',             icon: FaUserCircle,       defaultTitulo: 'Ouvidoria' },
  { chave: 'ouvidoria-falabr',      icon: FaPhoneSquareAlt,   defaultTitulo: 'Ouvidoria (Fala.BR)' },
  { chave: 'carta-servicos',        icon: FaDesktop,          defaultTitulo: 'Carta de Serviços ao Usuário' },
  { chave: 'plano-de-governo',      icon: FaChartLine,        defaultTitulo: 'Execução do Plano de Governo' },
  { chave: 'plano-de-acao',         icon: FaClipboardCheck,   defaultTitulo: 'Plano de Ação TCE/PB' },
  { chave: 'pme',                   icon: FaGraduationCap,    defaultTitulo: 'Plano Municipal de Educação' },
  { chave: 'relatorio-pme',         icon: FaBook,             defaultTitulo: 'Relatório do Plano Municipal de Educação' },
  { chave: 'lista-creches',         icon: FaBriefcaseMedical, defaultTitulo: 'Lista de Espera Creches' },
  { chave: 'primeira-infancia',     icon: FaUsers,            defaultTitulo: 'Diagnóstico Primeira Infância' },
  { chave: 'pms',                   icon: FaHeartbeat,        defaultTitulo: 'Plano Municipal de Saúde' },
  { chave: 'programacao-saude',     icon: FaCalendarAlt,      defaultTitulo: 'Programação Anual da Saúde' },
  { chave: 'relatorio-saude',       icon: FaChart,            defaultTitulo: 'Relatório de Gestão da Saúde' },
  { chave: 'servicos-saude',        icon: FaHospital,         defaultTitulo: 'Serviços de Saúde' },
  { chave: 'especialidades',        icon: FaMedkit,           defaultTitulo: 'Especialidades' },
  { chave: 'lista-regulacao',       icon: FaListAlt,          defaultTitulo: 'Lista de Espera para Regulação' },
  { chave: 'lista-medicamentos',    icon: FaPills,            defaultTitulo: 'Lista de Medicamentos' },
  { chave: 'estoque-farmacia',      icon: FaSyringe,          defaultTitulo: 'Estoque Farmácia' },
]

const SECOES = [
  { titulo: 'LGPD & Governo Digital',                              color: 'yellow' as const, chaves: ['encarregado-dados','politica-privacidade','prefeitura-digital','decreto-governo-digital','pesquisa-satisfacao','governanca-compliance','regulamentacao-lgpd','regulamentacao-lai'] },
  { titulo: 'Consultas sobre despesas',                            color: 'green'  as const, chaves: ['despesa-fixada','empenhos','subempenhos','pagamentos','liquidacao','despesa-extra','restos-pagar','cronograma-pagamentos','diarias-viagens','convenios-estaduais','convenios-federais','transferencia-realizada','tabela-diarias','despesas-covid'] },
  { titulo: 'Consultas sobre receitas',                            color: 'blue'   as const, chaves: ['receita-prevista','receita-realizada','receita-extra','divida-ativa','receitas-covid','desoneracoes','renuncia-fiscal','beneficiarios','incentivo-cultura','emendas-federais','emendas-estaduais','transferencias-especiais','recursos-federais'] },
  { titulo: 'Consultas sobre recursos humanos',                    color: 'pink'   as const, chaves: ['folha-pagamento','quadro-funcional','temporarios','cedidos','requisitados','plano-cargos','folha-covid','estagiarios','terceirizados','selecoes'] },
  { titulo: 'Consultas sobre licitações, contratos e obras',       color: 'orange' as const, chaves: ['licitacoes','editais','documentos-licitacao','inexigibilidade','dispensas','adesoes-srp','plano-contratacao','sancionados','contratos','aditivos','gestores-contratos','ordem-pagamentos','mapa-obras','obras-paralisadas','fiscais-obras','convenios-celebrados'] },
  { titulo: 'Consultas sobre responsabilidade fiscal',             color: 'indigo' as const, chaves: ['prestacoes-contas','relatorio-gestao','pareceres-tce','julgamentos-contas','rgf','rreo','ppa','loa','ldo-atual','ldo-projeto'] },
  { titulo: 'Consultas sobre a gestão municipal',                  color: 'green'  as const, chaves: ['plano-estrategico','estrutura-org','competencias','responsaveis-gestao','contatos','decretos','diario-oficial','faq','conselhos'] },
  { titulo: 'Consultas sobre participação cidadã',                 color: 'cyan'   as const, chaves: ['sic','esic','relatorio-sic','docs-classificados','docs-desclassificados','ouvidoria','ouvidoria-falabr','carta-servicos','plano-de-governo','plano-de-acao'] },
  { titulo: 'Consultas sobre assistência social, educação, saúde & primeira infância', color: 'yellow' as const, chaves: ['pme','relatorio-pme','lista-creches','primeira-infancia','pms','programacao-saude','relatorio-saude','servicos-saude','especialidades','lista-regulacao','lista-medicamentos','estoque-farmacia'] },
]

const CARD_MAP = Object.fromEntries(CARDS.map(c => [c.chave, c]))

// ── Palavras e cores aleatórias para animação dos cards ───────
const TERMS = ['Itabaiana', 'Transparência', 'Informação', 'Cidadão', 'Público', 'Municipal', 'Governo', 'Acesso', 'Digital', 'Dados']
const ANIM_COLORS = ['#0d6efd']
const ANIMS = ['card-anim-circle', 'card-anim-square', 'card-anim-slide', 'card-anim-explode', 'card-anim-diagonal', 'card-anim-spiral', 'card-anim-wipe', 'card-anim-zoom']
const SPEEDS = ['0.8s', '1s', '1.2s', '1.5s', '1.8s']

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// ── Componente principal ──────────────────────────────────────
export default function HomePage() {
  const { highContrast, fontSize, setHighContrast, setFontSize, adjustFontSize } = usePreferences()
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingFooter, setEditingFooter] = useState<string | null>(null)
  const [editingButton, setEditingButton] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ titulo: '', caminho: '', description: '' })
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  const { buttonsData, footerData, ultimasAt, refetch } = useHomeData()

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [])

  // Intersection Observer — animação por scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              setVisibleSections(prev => new Set(prev).add(e.target.id))
              observer.unobserve(e.target)
            }
          })
        },
        { threshold: 0.05, rootMargin: '80px' }
      )
      document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
      return () => observer.disconnect()
    }, 150)
    return () => clearTimeout(timer)
  }, [buttonsData])

  useEffect(() => {
    const fn = () => setShowBackToTop(window.scrollY > 300)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleEditClick = (chave: string) => {
    setEditingButton(chave)
    setEditForm({
      titulo: buttonsData[chave]?.titulo || '',
      caminho: buttonsData[chave]?.caminho || '',
      description: buttonsData[chave]?.description || '',
    })
  }

  const handleEditFooter = (chave: string) => {
    setEditingFooter(chave)
    setEditForm({ titulo: footerData[chave]?.titulo || '', caminho: footerData[chave]?.caminho || '', description: '' })
  }

  const handleSaveEdit = async () => {
    try {
      if (editingButton) {
        const res = await fetch('/api/buttons/update', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chave: editingButton, titulo: editForm.titulo, caminho: editForm.caminho || null, description: editForm.description || null }),
        })
        if (!res.ok) return alert('Erro ao salvar.')
        localStorage.removeItem('home-data-cache')
        await refetch()
        setEditingButton(null)
      }
      if (editingFooter) {
        await fetch('/api/footer/update', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chave: editingFooter, titulo: editForm.titulo, caminho: editForm.caminho || null }),
        })
        localStorage.removeItem('home-data-cache')
        await refetch()
        setEditingFooter(null)
      }
    } catch {}
  }

  return (
  <div className="min-h-screen bg-white" style={{ fontSize: `${fontSize}px` }}>
    <Header />
      <style jsx global>{`
        .card-bg-yellow, .card-bg-blue { transform-origin: center; }
        .card-triggered.card-anim-circle .card-bg-blue   { border-radius:50%; animation:blueCircle var(--anim-speed) .15s ease-out forwards }
        .card-triggered.card-anim-square .card-bg-blue   { border-radius:0;   animation:blueSquare var(--anim-speed) ease-out forwards }
        .card-triggered.card-anim-slide .card-bg-blue    { border-radius:0;   animation:blueSlide var(--anim-speed) ease-in-out forwards }
        .card-triggered.card-anim-explode .card-bg-blue  { border-radius:50%; animation:blueExplode var(--anim-speed) ease-out forwards }
        .card-triggered.card-anim-diagonal .card-bg-blue { border-radius:0;   animation:blueDiagonal var(--anim-speed) ease-in-out forwards }
        .card-triggered.card-anim-spiral .card-bg-blue   { border-radius:50%; animation:blueSpiral var(--anim-speed) ease-out forwards }
        .card-triggered.card-anim-wipe .card-bg-blue     { border-radius:0;   animation:blueWipe var(--anim-speed) ease-in-out forwards }
        .card-triggered.card-anim-zoom .card-bg-blue     { border-radius:20%; animation:blueZoom var(--anim-speed) ease-out forwards }
        @keyframes blueCircle   {0%{opacity:1;transform:scale(0) rotate(0)}100%{opacity:1;transform:scale(3) rotate(180deg)}}
        @keyframes blueSquare   {0%{opacity:1;transform:scale(0) rotate(45deg)}100%{opacity:1;transform:scale(2.5) rotate(0)}}
        @keyframes blueSlide    {0%{opacity:1;transform:translateX(-150%) scaleY(2)}100%{opacity:1;transform:translateX(0) scaleY(2)}}
        @keyframes blueExplode  {0%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(4)}100%{opacity:1;transform:scale(3)}}
        @keyframes blueDiagonal {0%{opacity:1;transform:translate(-100%,-100%) rotate(45deg) scale(2)}100%{opacity:1;transform:translate(0,0) rotate(0) scale(2)}}
        @keyframes blueSpiral   {0%{opacity:1;transform:scale(0) rotate(0)}100%{opacity:1;transform:scale(3) rotate(540deg)}}
        @keyframes blueWipe     {0%{opacity:1;transform:translateY(100%) scaleX(2)}100%{opacity:1;transform:translateY(0) scaleX(2)}}
        @keyframes blueZoom     {0%{opacity:0;transform:scale(5)}100%{opacity:1;transform:scale(2.5)}}
        .card-triggered .card-icon      { animation:iconFade var(--anim-speed) ease-in-out forwards }
        .card-triggered .card-itabaiana { animation:itabaianaShow var(--anim-speed) ease-in-out forwards }
        .card-triggered .card-title     { animation:titleWhite .6s .15s ease-out forwards }
        .card-triggered .card-description { animation:descriptionShow .3s .6s ease-out forwards }
        @keyframes iconFade       {0%{opacity:1}30%{opacity:0}70%{opacity:0}100%{opacity:1;color:#fff}}
        @keyframes itabaianaShow  {0%{opacity:0;transform:scale(.5)}25%{opacity:1;transform:scale(1)}65%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.5)}}
        @keyframes titleWhite     {0%{color:inherit}100%{color:#fff}}
        @keyframes descriptionShow{0%{opacity:0}100%{opacity:1}}
        .card-animated .card-bg-blue    { opacity:0 }
        .card-animated .card-itabaiana  { opacity:0 }
        .card-animated .card-description{ opacity:0 }
        .card-animated .card-icon       { color:#4b5563 }
        .card-animated .card-title      { color:#1f2937 }
        [data-section]{will-change:opacity,transform}
        .edit-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:24px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.3);z-index:1000;min-width:400px}
        .edit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999}
        .back-to-top{position:fixed;bottom:2rem;right:2rem;background:#0d6efd;color:#fff;border:none;border-radius:50%;width:48px;height:48px;font-size:20px;cursor:pointer;opacity:0;transition:opacity .3s;z-index:50}
        .back-to-top.visible{opacity:1}
      `}</style>

      <section className={`py-8 pt-40 ${highContrast ? 'bg-black' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4"><Carousel /></div>
      </section>

      <main className={`py-12 pt-32 ${highContrast ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          {SECOES.map(secao => {
            const sectionId = secao.titulo.toLowerCase().replace(/\s+/g, '-')
            const isVisible = visibleSections.has(sectionId)
            return (
              <Section key={secao.titulo} title={secao.titulo} color={secao.color} visible={isVisible}>
                {secao.chaves.map((chave, cardIndex) => {
                  const def = CARD_MAP[chave]
                  if (!def) return null
                  const btn = buttonsData[chave]
                  const caminho = btn?.caminho || ''
                  const paginaId = caminho.startsWith('/') ? caminho.slice(1) : null
                  const ultimaAt = paginaId ? ultimasAt[paginaId] : null
                  return (
                    <CategoryCard
                      key={chave}
                      chave={chave}
                      icon={def.icon}
                      titulo={btn?.titulo || def.defaultTitulo}
                      caminho={caminho}
                      description={btn?.description || ''}
                      ultimaAtualizacao={ultimaAt}
                      isAdmin={isAdmin}
                      onEdit={handleEditClick}
                      cardIndex={cardIndex}
                      sectionVisible={isVisible}
                    />
                  )
                })}
              </Section>
            )
          })}
        </div>
      </main>

      {(editingButton || editingFooter) && (
        <>
          <div className="edit-overlay" onClick={() => { setEditingButton(null); setEditingFooter(null) }} />
          <div className="edit-modal">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editingButton ? 'Editar Botão' : 'Editar Link do Rodapé'}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{editingButton ? 'Nome do Botão' : 'Texto do Link'} <span className="text-red-500">*</span></label>
              <input type="text" value={editForm.titulo} onChange={e => setEditForm({ ...editForm, titulo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
              <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="Breve descrição do botão" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Caminho (opcional)</label>
              <input type="text" value={editForm.caminho} onChange={e => setEditForm({ ...editForm, caminho: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="/caminho ou https://..." />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setEditingButton(null); setEditingFooter(null) }} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">Cancelar</button>
              <button onClick={() => { if (!editForm.titulo.trim()) return alert('O nome é obrigatório.'); handleSaveEdit() }} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">Salvar</button>
            </div>
          </div>
        </>
      )}

      <footer className="bg-gradient-to-r from-[#0d6efd] to-[#0a58ca] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="relative">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">Navegação</h3>
              <ul className="space-y-2 text-sm mt-4">
                <FooterLink chave="inicio" defaultTitulo="Início" defaultCaminho="/" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="portal" defaultTitulo="O Portal" defaultCaminho="/portal" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="glossario" defaultTitulo="Glossário" defaultCaminho="/glossario" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="contato" defaultTitulo="Fale Conosco" defaultCaminho="/contato" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
              </ul>
            </div>
            <div className="relative">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">Serviços</h3>
              <ul className="space-y-2 text-sm mt-4">
                <FooterLink chave="receitas" defaultTitulo="Receitas" defaultCaminho="#receitas" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="recursos-humanos" defaultTitulo="Recursos Humanos" defaultCaminho="#pessoal" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="licitacoes" defaultTitulo="Licitações e Contratos" defaultCaminho="#licitacoes" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="responsabilidade-fiscal" defaultTitulo="Responsabilidade Fiscal" defaultCaminho="#fiscal" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
              </ul>
            </div>
            <div className="relative">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">Acesso Rápido</h3>
              <ul className="space-y-2 text-sm mt-4">
                <FooterLink chave="lgpd" defaultTitulo="LGPD" defaultCaminho="#lgpd" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="participacao" defaultTitulo="Participação Cidadã" defaultCaminho="#participacao" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
                <FooterLink chave="educacao" defaultTitulo="Educação e Saúde" defaultCaminho="#educacao" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} />
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide border-b-2 border-[#ffc107] pb-2 inline-block">Contato</h3>
              <div className="text-sm space-y-3 mt-4">
                <div><p className="font-semibold mb-1">PREFEITURA MUNICIPAL DE ITABAIANA</p><p className="text-xs opacity-90">Itabaiana - PB</p></div>
                <div className="flex items-start space-x-2"><span className="text-[#ffc107]">📍</span><p className="text-xs opacity-90">Endereço da prefeitura<br/>CEP: 00000-000</p></div>
                <div className="flex items-center space-x-2"><span className="text-[#ffc107]">📞</span><p className="text-xs opacity-90">(83) 0000-0000</p></div>
                <div className="flex items-center space-x-2"><span className="text-[#ffc107]">✉️</span><p className="text-xs opacity-90">contato@itabaiana.pb.gov.br</p></div>
                <div className="pt-3"><p className="text-xs font-semibold mb-2">Redes Sociais:</p><div className="flex space-x-3"><a href="#" className="hover:text-[#ffc107] transition text-xl">📘</a><a href="#" className="hover:text-[#ffc107] transition text-xl">📷</a><a href="#" className="hover:text-[#ffc107] transition text-xl">▶️</a></div></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
            <p className="opacity-90">© 2025 Prefeitura Municipal de Itabaiana - Todos os direitos reservados</p>
            <div className="flex space-x-4 mt-4 md:mt-0 relative">
              <FooterLink chave="politica-privacidade" defaultTitulo="Política de Privacidade" defaultCaminho="/politica-privacidade" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} inline />
              <span className="opacity-50">|</span>
              <Link href="/admin" className="hover:text-[#ffc107] transition opacity-90">Seção de Administrador</Link>
              <span className="opacity-50">|</span>
              <FooterLink chave="termos-uso" defaultTitulo="Termos de Uso" defaultCaminho="/termos-uso" isAdmin={isAdmin} footerData={footerData} onEdit={handleEditFooter} inline />
            </div>
          </div>
        </div>
      </footer>

      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao topo">↑</button>
      <VLibrasWrapper />
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────
type SectionColor = 'yellow' | 'blue' | 'pink' | 'orange' | 'indigo' | 'green' | 'cyan'

function Section({ title, color, children, visible }: {
  title: string; color: SectionColor; children: React.ReactNode; visible?: boolean
}) {
  const underline = {
    yellow: 'bg-gradient-to-r from-transparent via-[#ffc107] to-transparent',
    blue:   'bg-gradient-to-r from-transparent via-[#0d6efd] to-transparent',
    pink:   'bg-gradient-to-r from-transparent via-[#e91e63] to-transparent',
    orange: 'bg-gradient-to-r from-transparent via-[#ff9800] to-transparent',
    indigo: 'bg-gradient-to-r from-transparent via-[#5c6bc0] to-transparent',
    green:  'bg-gradient-to-r from-transparent via-[#8bc34a] to-transparent',
    cyan:   'bg-gradient-to-r from-transparent via-[#00bcd4] to-transparent',
  }
  return (
    <section
      className={`mb-16 transition-all ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDuration: '1.2s', transitionDelay: visible ? '0.1s' : '0s' }}
      id={title.toLowerCase().replace(/\s+/g, '-')}
      data-section
    >
      <h2 className="text-3xl font-bold text-center mb-3 text-gray-700">{title}</h2>
      <div className={`h-1 w-64 mx-auto mb-8 ${underline[color]}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </section>
  )
}

// ── CategoryCard ──────────────────────────────────────────────
function CategoryCard({ icon: Icon, chave, titulo, caminho, description, ultimaAtualizacao, isAdmin, onEdit, cardIndex, sectionVisible }: {
  icon: IconType; chave: string; titulo: string; caminho: string; description: string
  ultimaAtualizacao?: string | null; isAdmin: boolean; onEdit: (c: string) => void
  cardIndex: number; sectionVisible: boolean
}) {
  const [randomTerm, setRandomTerm] = useState('')
  const [animClass, setAnimClass]   = useState('')
  const [animColor, setAnimColor]   = useState('#0d6efd')
  const [animSpeed, setAnimSpeed]   = useState('1.2s')
  const [triggered, setTriggered]   = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isExternal = caminho.startsWith('http')

  useEffect(() => {
    if (sectionVisible) {
      const delay = cardIndex * 80 + 100
      const t = setTimeout(() => setCardVisible(true), delay)
      return () => clearTimeout(t)
    }
  }, [sectionVisible, cardIndex])

  const handleMouseEnter = () => {
    if (triggered) return
    if (timerRef.current) clearTimeout(timerRef.current)

    setRandomTerm(pickRandom(TERMS))
    setAnimClass(pickRandom(ANIMS))
    setAnimColor(pickRandom(ANIM_COLORS))
    const speed = pickRandom(SPEEDS)
    setAnimSpeed(speed)
    setTriggered(true)

    const durationMs = parseFloat(speed) * 1000 + 200
    timerRef.current = setTimeout(() => setTriggered(false), durationMs)
  }

  return (
    <div
      className={`flex flex-col transition-all ease-out ${cardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}
      style={{ transitionDuration: '0.7s' }}
    >
      <Link href={caminho || '#'} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
        <div
          className={`card-animated ${animClass} ${triggered ? 'card-triggered' : ''} group relative bg-white rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300 p-6 border-2 border-gray-100 overflow-hidden`}
          style={{ '--anim-speed': animSpeed } as React.CSSProperties}
          onMouseEnter={handleMouseEnter}
        >
          {isAdmin && (
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(chave) }}
              className="absolute top-2 right-2 z-20 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition shadow-lg" title="Editar">
              <FaEdit size={12} />
            </button>
          )}
          <div className="card-bg-yellow absolute inset-0 bg-[#ffc107] opacity-0" />
          <div className="card-bg-blue absolute inset-0 opacity-0" style={{ backgroundColor: animColor }} />
          <div className="relative z-10">
            <div className="relative w-12 h-12 mb-3 mx-auto">
              <Icon className="card-icon absolute inset-0 w-12 h-12 text-gray-600 transition-all duration-300" />
              <span className="card-itabaiana absolute inset-0 flex items-center justify-center text-[#ffc107] font-black text-lg opacity-0">{randomTerm}</span>
            </div>
            <h3 className="card-title font-bold text-sm leading-tight mb-2 text-center text-gray-800 transition-colors">{titulo}</h3>
            <p className="card-description text-xs text-white opacity-0 transition-opacity duration-300 font-medium text-center">{description}</p>
          </div>
        </div>
      </Link>
      
      <p className="flex items-center justify-center gap-1 text-xs mt-1.5 text-gray-400">
        <FaClock size={9} /> 
        {ultimaAtualizacao 
          ? `Atualizado em ${new Date(ultimaAtualizacao).toLocaleDateString('pt-BR')}`
          : 'Sem atualizações'
        }
      </p>
    </div>
  )
}

// ── Carousel ──────────────────────────────────────────────────
function Carousel() {
  const [current, setCurrent] = useState(0)
  const slides = [
    { image: '/banner1.jpg', title: 'Novas informações sobre saúde estão disponíveis no Portal de Dados Abertos', link: '' },
    { image: '/banner2.jpg', title: 'Transparência: Acompanhe as obras da sua cidade', link: '' },
    { image: '/banner3.jpg', title: 'Consulte o orçamento municipal de forma fácil e rápida', link: '' },
  ]
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 30000)
    return () => clearInterval(t)
  }, [slides.length])

  return (
    <div className="relative rounded-lg overflow-hidden shadow-xl">
      <div className="relative h-[150px] md:h-[200px]">
        {slides.map((s, i) => (
          <Link key={i} href={s.link || '#'} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.image})`, filter: 'brightness(0.7)' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="relative h-full flex items-center px-8 md:px-16">
                <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg max-w-2xl">{s.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <button onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition backdrop-blur-sm" aria-label="Slide anterior">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={() => setCurrent(p => (p + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition backdrop-blur-sm" aria-label="Próximo slide">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-3 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/50 w-3 hover:bg-white/75'}`} aria-label={`Ir para slide ${i + 1}`} />
        ))}
      </div>
    </div>
  )
}

// ── FooterLink ────────────────────────────────────────────────
function FooterLink({ chave, defaultTitulo, defaultCaminho, isAdmin, footerData, onEdit, inline }: {
  chave: string; defaultTitulo: string; defaultCaminho: string
  isAdmin: boolean; footerData: Record<string, FooterData>; onEdit: (c: string) => void; inline?: boolean
}) {
  const titulo  = footerData[chave]?.titulo  || defaultTitulo
  const caminho = footerData[chave]?.caminho || defaultCaminho
  return (
    <li className="relative group">
      <Link href={caminho} className={inline ? 'hover:text-[#ffc107] transition opacity-90' : 'hover:text-[#ffc107] transition block'}>{titulo}</Link>
      {isAdmin && (
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(chave) }}
          className="absolute -right-5 top-0.5 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition shadow-md" title="Editar">
          <FaEdit size={14} />
        </button>
      )}
    </li>
  )
}