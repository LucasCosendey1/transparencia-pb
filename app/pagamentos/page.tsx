'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'pagamentos',
  titulo: 'Pagamentos',
  subtitulo: 'Pagamentos de despesas realizados pelo município de Itabaiana/PB',
  breadcrumb: 'Pagamentos',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/pagamentos',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',           label: 'Empenho',            type: 'text' },
    { key: 'data',              label: 'Data',               type: 'date',     chartRole: 'category' },
    { key: 'competência',       label: 'Competência',        type: 'text' },
    { key: 'und.Orçamentária',  label: 'Unid. Orçamentária', type: 'text' },
    { key: 'fornecedor',        label: 'Fornecedor',         type: 'text' },
    { key: 'tipo Transação',    label: 'Tipo de Transação',  type: 'text' },
    { key: 'número da Transação', label: 'Nº Transação',     type: 'text',     hidden: true },
    { key: 'conta',             label: 'Conta',              type: 'text',     hidden: true },
    { key: 'modalidade',        label: 'Modalidade',         type: 'text',     hidden: true },
    { key: 'fonte Recurso',     label: 'Fonte de Recurso',   type: 'text',     hidden: true },
    { key: 'elemento Despesa',  label: 'Elemento de Despesa',type: 'text',     hidden: true },
    { key: 'valor',             label: 'Valor Bruto',        type: 'currency', chartRole: 'bar',
      tooltip: 'Valor bruto pago antes de retenções' },
    { key: 'retenção',          label: 'Retenção',           type: 'currency', chartRole: 'line',
      tooltip: 'Valor retido (impostos, etc.)' },
    { key: 'valor Líquido',     label: 'Valor Líquido',      type: 'currency',
      tooltip: 'Valor efetivamente transferido ao fornecedor' },
    { key: 'histórico',         label: 'Histórico',          type: 'text',     hidden: true },
    { key: 'docs',              label: 'Documento',          type: 'link',
      tooltip: 'Ver documento original' },
  ],

  cards: [
    {
      label: 'Total Pago (Bruto)',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os pagamentos brutos no período',
    },
    {
      label: 'Total Retido',
      valueKey: 'retenção',
      compute: data => data.reduce((acc, r) => acc + (Number(r['retenção']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Soma de todas as retenções realizadas',
    },
    {
      label: 'Total Líquido',
      valueKey: 'valor Líquido',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Líquido']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Valor líquido efetivamente transferido',
    },
    {
      label: 'Qtd. Pagamentos',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de pagamentos realizados no período',
    },
  ],

  glossario: [
    { termo: 'Pagamento',        definicao: 'Transferência efetiva de recursos ao credor após liquidação do empenho.' },
    { termo: 'Retenção',         definicao: 'Valor descontado do pagamento bruto a título de impostos ou outras obrigações legais.' },
    { termo: 'Valor Líquido',    definicao: 'Valor efetivamente transferido ao fornecedor após as retenções.' },
    { termo: 'Tipo de Transação',definicao: 'Forma utilizada para realizar o pagamento (débito automático, TED, etc.).' },
    { termo: 'Elemento de Despesa', definicao: 'Código que classifica a natureza do gasto realizado.' },
    { termo: 'Fonte de Recurso', definicao: 'Origem dos recursos utilizados para o pagamento.' },
  ],
}

export default function PagamentosPage() {
  return <ApiPageLayout config={config} />
}


