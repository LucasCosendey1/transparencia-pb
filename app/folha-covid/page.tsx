'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'folha-covid',
  titulo: 'Folha de Pagamento COVID-19',
  subtitulo: 'Remuneração de servidores contratados para ações de enfrentamento à COVID-19 em Itabaiana/PB',
  breadcrumb: 'Folha COVID-19',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/folha-covid',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'competência',           label: 'Competência',       type: 'text' },
    { key: 'matrícula',             label: 'Matrícula',         type: 'text' },
    { key: 'nome',                  label: 'Nome',              type: 'text' },
    { key: 'cpf',                   label: 'CPF',               type: 'text',     hidden: true },
    { key: 'cargo',                 label: 'Cargo',             type: 'text' },
    { key: 'secretaria',            label: 'Secretaria',        type: 'text',     chartRole: 'category' },
    { key: 'regime',                label: 'Regime',            type: 'text',     hidden: true },
    { key: 'carga Horária Semanal', label: 'Carga Horária',     type: 'text',     hidden: true },
    { key: 'dt. Admissão',          label: 'Admissão',          type: 'date',     hidden: true },
    { key: 'vantagens',             label: 'Vantagens (Bruto)', type: 'currency', chartRole: 'bar' },
    { key: 'descontos',             label: 'Descontos',         type: 'currency', hidden: true },
    { key: 'líquido',               label: 'Líquido',           type: 'currency' },
  ],

  cards: [
    {
      label: 'Total de Servidores',
      valueKey: 'matrícula',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de servidores na folha COVID-19',
    },
    {
      label: 'Total Bruto',
      valueKey: 'vantagens',
      compute: data => data.reduce((acc, r) => acc + (Number(r['vantagens']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Soma de todas as vantagens e proventos',
    },
    {
      label: 'Total Líquido',
      valueKey: 'líquido',
      compute: data => data.reduce((acc, r) => acc + (Number(r['líquido']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma dos valores líquidos pagos',
    },
    {
      label: 'Total Descontos',
      valueKey: 'descontos',
      compute: data => data.reduce((acc, r) => acc + (Number(r['descontos']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Soma de todos os descontos realizados',
    },
  ],

  glossario: [
    { termo: 'Folha COVID-19',   definicao: 'Registro de pagamentos realizados a servidores contratados especificamente para ações de combate e enfrentamento à pandemia de COVID-19.' },
    { termo: 'Contrato COVID',   definicao: 'Contratação temporária autorizada por legislação de emergência para suprir necessidades de saúde pública durante a pandemia.' },
    { termo: 'Vantagens',        definicao: 'Soma de todos os proventos e benefícios que compõem a remuneração bruta.' },
    { termo: 'Líquido',          definicao: 'Valor efetivamente recebido após dedução de todos os descontos.' },
  ],
}

export default function FolhaCovidPage() {
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