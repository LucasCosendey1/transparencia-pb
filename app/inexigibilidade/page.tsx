// app/inexigibilidade/page.tsx


'use client'

import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'inexigibilidade',
  titulo: 'Inexigibilidade',
  subtitulo: 'Contratações por inexigibilidade de licitação — Itabaiana/PB',
  breadcrumb: 'Inexigibilidade',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/inexigibilidade',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_licitacao',    label: 'Nº Licitação',    type: 'text' },
    { key: 'n_processo',     label: 'Nº Processo',     type: 'text', hidden: true },
    { key: 'data',           label: 'Data',            type: 'date' },
    { key: 'objeto',         label: 'Objeto',          type: 'text' },
    { key: 'situacao',       label: 'Situação',        type: 'text' },
    { key: 'valor_estimado', label: 'Valor Estimado',  type: 'currency', chartRole: 'bar' },
    { key: 'valor',          label: 'Valor Homologado',type: 'currency' },
    { key: 'edital',         label: 'Edital',          type: 'link' },
    { key: 'docs',           label: 'Documentos',      type: 'link' },
  ],

  cards: [
    {
      label: 'Total de Inexigibilidades',
      valueKey: 'n_licitacao',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
    },
    {
      label: 'Valor Estimado Total',
      valueKey: 'valor_estimado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor_estimado']) || 0), 0),
      format: 'currency',
      color: 'purple',
    },
  ],
}

export default function InexigibilidadePage() {
  return <ApiPageLayout config={config} />
}