'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'plano-cargos',
  titulo: 'Plano de Cargos e Carreira',
  subtitulo: 'Estrutura de cargos e carreiras dos servidores do município de Itabaiana/PB',
  breadcrumb: 'Plano de Cargos e Carreira',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/plano-cargos',

  showYearFilter: false,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'cargo',          label: 'Cargo',           type: 'text' },
    { key: 'carreira',       label: 'Carreira',        type: 'text' },
    { key: 'nível',          label: 'Nível',           type: 'text' },
    { key: 'classe',         label: 'Classe',          type: 'text' },
    { key: 'carga Horária',  label: 'Carga Horária',   type: 'text' },
    { key: 'vencimento',     label: 'Vencimento Base', type: 'currency' },
    { key: 'escolaridade',   label: 'Escolaridade',    type: 'text', hidden: true },
    { key: 'vagas',          label: 'Vagas',           type: 'text', hidden: true },
  ],

  cards: [
    {
      label: 'Total de Cargos',
      valueKey: 'cargo',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de cargos no plano de carreira',
    },
  ],

  glossario: [
    { termo: 'Plano de Cargos', definicao: 'Documento que estrutura os cargos públicos do município, definindo requisitos, atribuições, vencimentos e progressão na carreira.' },
    { termo: 'Carreira',        definicao: 'Conjunto de cargos organizados em classes e níveis, com critérios de progressão funcional.' },
    { termo: 'Classe',          definicao: 'Agrupamento de cargos com atribuições semelhantes dentro de uma carreira.' },
    { termo: 'Nível',           definicao: 'Posição do servidor na carreira, determinando o vencimento e os requisitos exigidos.' },
    { termo: 'Vencimento Base', definicao: 'Remuneração básica correspondente ao cargo e nível do servidor, sem adicionais ou gratificações.' },
  ],
}

export default function PlanoCargosPage() {
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