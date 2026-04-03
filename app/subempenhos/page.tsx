'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'subempenhos',
  titulo: 'Subempenhos',
  subtitulo: 'Subempenhos de despesas do município de Itabaiana/PB',
  breadcrumb: 'Subempenhos',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/subempenhos',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',               label: 'Empenho',          type: 'text' },
    { key: 'número do SubEmpenho',  label: 'Nº SubEmpenho',    type: 'text' },
    { key: 'data',                  label: 'Data',             type: 'date', chartRole: 'category' },
    { key: 'competência',           label: 'Competência',      type: 'text' },
    { key: 'fornecedor',            label: 'Fornecedor',       type: 'text' },
    { key: 'código',                label: 'CPF/CNPJ',         type: 'text',     hidden: true },
    { key: 'modalidade',            label: 'Modalidade',       type: 'text',     hidden: true },
    { key: 'f.Recurso',             label: 'Fonte de Recurso', type: 'text',     hidden: true },
    { key: 'valor',                 label: 'Valor',            type: 'currency', chartRole: 'bar',
      tooltip: 'Valor do subempenho' },
    { key: 'especificação',         label: 'Especificação',    type: 'text',     hidden: true },
    { key: 'docs',                  label: 'Documento',        type: 'link',
      tooltip: 'Ver documento original' },
  ],

  cards: [
    {
      label: 'Total Subempenhado',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os subempenhos no período',
    },
    {
      label: 'Qtd. Subempenhos',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de subempenhos no período',
    },
    {
      label: 'Média por Subempenho',
      valueKey: 'valor',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'yellow',
      tooltip: 'Valor médio por subempenho',
    },
    {
      label: 'Maior Subempenho',
      valueKey: 'valor',
      compute: data => Math.max(...data.map(r => Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Maior valor individual de subempenho',
    },
  ],

  glossario: [
    { termo: 'Subempenho',     definicao: 'Desdobramento de um empenho global em parcelas menores para pagamentos específicos.' },
    { termo: 'Empenho',        definicao: 'Ato pelo qual a autoridade reserva dotação orçamentária para atender obrigação de pagamento.' },
    { termo: 'Fonte de Recurso', definicao: 'Origem dos recursos utilizados para cobrir a despesa.' },
    { termo: 'Modalidade',     definicao: 'Tipo de licitação utilizada na contratação.' },
    { termo: 'Especificação',  definicao: 'Descrição detalhada do objeto da despesa.' },
  ],
}

export default function SubempenhosPage() {
  return <ApiPageLayout config={config} />
}

