'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'transferencia-realizada',
  titulo: 'Transferências Realizadas',
  subtitulo: 'Transferências de recursos realizadas pelo município de Itabaiana/PB',
  breadcrumb: 'Transferências Realizadas',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/transferencia-realizada',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'data',         label: 'Data',         type: 'date',     chartRole: 'category' },
    { key: 'competência',  label: 'Competência',  type: 'text' },
    { key: 'origem',       label: 'Origem',       type: 'text' },
    { key: 'destino',      label: 'Destino',      type: 'text',     chartRole: 'bar' },
    { key: 'valor',        label: 'Valor',        type: 'currency', chartRole: 'bar',
      tooltip: 'Valor transferido' },
  ],

  cards: [
    {
      label: 'Total Transferido',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todas as transferências no período',
    },
    {
      label: 'Qtd. Transferências',
      valueKey: 'destino',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de transferências no período',
    },
    {
      label: 'Maior Transferência',
      valueKey: 'valor',
      compute: data => Math.max(...data.map(r => Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor transferido em um único ato',
    },
    {
      label: 'Média por Transferência',
      valueKey: 'valor',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'green',
      tooltip: 'Valor médio por transferência',
    },
  ],

  glossario: [
    { termo: 'Transferência',  definicao: 'Repasse de recursos financeiros do Executivo Municipal a outros órgãos ou entidades, como a Câmara Municipal, fundos ou consórcios.' },
    { termo: 'Origem',         definicao: 'Órgão que transfere os recursos (normalmente a Prefeitura Municipal).' },
    { termo: 'Destino',        definicao: 'Órgão ou entidade beneficiária que recebe os recursos transferidos.' },
    { termo: 'Duodécimo',      definicao: 'Repasse mensal obrigatório à Câmara Municipal, correspondente a 1/12 do orçamento legislativo aprovado.' },
  ],
}

export default function TransferenciaRealizadaPage() {
  return <ApiPageLayout config={config} />
}

