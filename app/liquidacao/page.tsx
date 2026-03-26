'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'liquidacao',
  titulo: 'Liquidação de Despesas',
  subtitulo: 'Empenhos liquidados pelo município de Itabaiana/PB',
  breadcrumb: 'Liquidação',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/liquidacao',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',          label: 'Empenho',            type: 'text' },
    { key: 'data',             label: 'Data',               type: 'date',     chartRole: 'category' },
    { key: 'competência',      label: 'Competência',        type: 'text' },
    { key: 'und.Orçamentária', label: 'Unid. Orçamentária', type: 'text' },
    { key: 'fornecedor',       label: 'Fornecedor',         type: 'text' },
    { key: 'nº NF',            label: 'Nº Nota Fiscal',     type: 'text' },
    { key: 'modalidade',       label: 'Modalidade',         type: 'text',     hidden: true },
    { key: 'licitação',        label: 'Licitação',          type: 'text',     hidden: true },
    { key: 'responsável',      label: 'Responsável',        type: 'text',     hidden: true },
    { key: 'valor',            label: 'Valor Liquidado',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor reconhecido como devido ao fornecedor' },
    { key: 'docs',             label: 'Documento',          type: 'link',
      tooltip: 'Ver documento original' },
  ],

  cards: [
    {
      label: 'Total Liquidado',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os valores liquidados no período',
    },
    {
      label: 'Qtd. Liquidações',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de liquidações no período',
    },
    {
      label: 'Maior Liquidação',
      valueKey: 'valor',
      compute: data => Math.max(...data.map(r => Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor individual liquidado',
    },
    {
      label: 'Média por Liquidação',
      valueKey: 'valor',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'green',
      tooltip: 'Valor médio por liquidação',
    },
  ],

  glossario: [
    { termo: 'Liquidação',   definicao: 'Fase da execução orçamentária em que se verifica o direito do credor ao recebimento, após confirmação da entrega do bem ou prestação do serviço.' },
    { termo: 'Empenho',      definicao: 'Ato que reserva dotação orçamentária para atender futura obrigação de pagamento.' },
    { termo: 'Nota Fiscal',  definicao: 'Documento fiscal emitido pelo fornecedor que comprova a entrega do bem ou serviço.' },
    { termo: 'Modalidade',   definicao: 'Tipo de licitação utilizada na contratação do fornecedor.' },
    { termo: 'Responsável',  definicao: 'Servidor responsável pela atestação da liquidação da despesa.' },
  ],
}

export default function LiquidacaoPage() {
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