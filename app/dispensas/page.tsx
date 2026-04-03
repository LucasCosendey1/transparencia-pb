// app/dispensas/page.tsx

'use client'

import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'dispensas',
  titulo: 'Dispensas de Licitação',
  subtitulo: 'Contratações dispensadas de licitação — Itabaiana/PB',
  breadcrumb: 'Dispensas',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/dispensas',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_licitacao',    label: 'Nº Licitação',    type: 'text' },
    { key: 'n_processo',     label: 'Nº Processo',     type: 'text', hidden: true },
    { key: 'data',           label: 'Data',            type: 'date' },
    { key: 'modalidade',     label: 'Modalidade',      type: 'text', chartRole: 'category' },
    { key: 'objeto',         label: 'Objeto',          type: 'text' },
    { key: 'situacao',       label: 'Situação',        type: 'text' },
    { key: 'valor_estimado', label: 'Valor Estimado',  type: 'currency', chartRole: 'bar' },
    { key: 'valor',          label: 'Valor Homologado',type: 'currency' },
    { key: 'edital',         label: 'Edital',          type: 'link' },
    { key: 'docs',           label: 'Documentos',      type: 'link' },
  ],

  cards: [
    {
      label: 'Total de Dispensas',
      valueKey: 'n_licitacao',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
    },
    {
      label: 'Dispensa por Valor',
      valueKey: 'modalidade',
      compute: data => data.filter(r => String(r['modalidade']).toUpperCase() === 'DISPENSA POR VALOR').length,
      format: 'number',
      color: 'yellow',
    },
    {
      label: 'Dispensa por Outros Motivos',
      valueKey: 'modalidade',
      compute: data => data.filter(r => String(r['modalidade']).toUpperCase() === 'DISPENSA POR OUTROS MOTIVOS').length,
      format: 'number',
      color: 'red',
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

export default function DispensasPage() {
  return <ApiPageLayout config={config} />
}