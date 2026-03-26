'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'licitacoes',
  titulo: 'Licitações',
  subtitulo: 'Processos licitatórios realizados pelo município de Itabaiana/PB',
  breadcrumb: 'Licitações',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/licitacoes',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_licitacao',     label: 'Nº Licitação',    type: 'text' },
    { key: 'n_processo',      label: 'Nº Processo',     type: 'text',     hidden: true },
    { key: 'data',            label: 'Data',            type: 'date',     chartRole: 'category' },
    { key: 'modalidade',      label: 'Modalidade',      type: 'text',     chartRole: 'category' },
    { key: 'tipo_objeto',     label: 'Tipo de Objeto',  type: 'text',     hidden: true },
    { key: 'objeto',          label: 'Objeto',          type: 'text' },
    { key: 'situacao',        label: 'Situação',        type: 'text' },
    { key: 'valor_estimado',  label: 'Valor Estimado',  type: 'currency', chartRole: 'bar',
      tooltip: 'Valor estimado para a licitação' },
    { key: 'valor',           label: 'Valor Homologado',type: 'currency',
      tooltip: 'Valor final após homologação' },
    { key: 'homologacao',     label: 'Homologação',     type: 'date',     hidden: true },
    { key: 'acessar_na_integra', label: 'Portal',       type: 'text',     hidden: true },
    { key: 'edital',          label: 'Edital',          type: 'link',
      tooltip: 'Acessar edital em PDF' },
    { key: 'docs',            label: 'Documentos',      type: 'link',
      tooltip: 'Ver documentos da licitação' },
  ],

  cards: [
    {
      label: 'Total de Licitações',
      valueKey: 'n_licitacao',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de processos licitatórios no período',
    },
    {
      label: 'Valor Estimado Total',
      valueKey: 'valor_estimado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor_estimado']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Soma dos valores estimados de todas as licitações',
    },
    {
      label: 'Em Andamento',
      valueKey: 'situacao',
      compute: data => data.filter(r => String(r['situacao']).toUpperCase().includes('ANDAMENTO')).length,
      format: 'number',
      color: 'yellow',
      tooltip: 'Número de licitações ainda em andamento',
    },
    {
      label: 'Homologadas',
      valueKey: 'situacao',
      compute: data => data.filter(r => String(r['situacao']).toUpperCase().includes('HOMOLOG')).length,
      format: 'number',
      color: 'green',
      tooltip: 'Número de licitações já homologadas',
    },
  ],

  glossario: [
    { termo: 'Licitação',          definicao: 'Procedimento administrativo obrigatório para a Administração Pública contratar obras, serviços, compras ou alienações.' },
    { termo: 'Modalidade',         definicao: 'Forma de licitação utilizada, como Pregão, Concorrência, Dispensa, Inexigibilidade etc.' },
    { termo: 'Valor Estimado',     definicao: 'Valor previsto pela Administração antes da abertura das propostas.' },
    { termo: 'Homologação',        definicao: 'Ato que confirma o resultado da licitação, tornando válida a contratação com o vencedor.' },
    { termo: 'Edital',             definicao: 'Documento que define as regras, exigências e condições para participar da licitação.' },
    { termo: 'Dispensa Eletrônica',definicao: 'Modalidade simplificada de contratação realizada de forma digital, para valores abaixo do limite de licitação ordinária.' },
  ],
}

export default function LicitacoesPage() {
  const [fontSize, setFontSize]         = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <ApiPageLayout
      config={config}
      highContrast={highContrast}
      fontSize={fontSize}
      adjustFontSize={n => setFontSize(prev => Math.max(12, Math.min(24, prev + n)))}
      setHighContrast={setHighContrast}
      setFontSize={setFontSize}
    />
  )
}