'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'restos-pagar',
  titulo: 'Restos a Pagar',
  subtitulo: 'Empenhos de exercícios anteriores ainda pendentes de pagamento em Itabaiana/PB',
  breadcrumb: 'Restos a Pagar',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/restos-pagar',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',                  label: 'Empenho',            type: 'text' },
    { key: 'ano do Resto',             label: 'Ano do Resto',       type: 'text',     chartRole: 'category' },
    { key: 'data',                     label: 'Data',               type: 'date' },
    { key: 'unid. Orçamentária',       label: 'Unid. Orçamentária', type: 'text' },
    { key: 'fornecedor',               label: 'Fornecedor',         type: 'text' },
    { key: 'cpF/CNPJ',                label: 'CPF/CNPJ',           type: 'text',     hidden: true },
    { key: 'classificação da Despesa', label: 'Classificação',      type: 'text',     hidden: true },
    { key: 'função Programática',      label: 'Função Programática',type: 'text',     hidden: true },
    { key: 'valor Empenho',            label: 'Valor Empenho',      type: 'currency', hidden: true },
    { key: 'valor Resto',              label: 'Valor Resto',        type: 'currency', chartRole: 'bar',
      tooltip: 'Valor ainda pendente de pagamento' },
    { key: 'valor Processado',         label: 'Processado',         type: 'currency',
      tooltip: 'Valor já liquidado/processado' },
    { key: 'valor Não Processado',     label: 'Não Processado',     type: 'currency',
      tooltip: 'Valor ainda não liquidado' },
    { key: 'valor Pago Exerc. Anterior', label: 'Pago Exerc. Anterior', type: 'currency', hidden: true },
    { key: 'detalhes',                 label: 'Detalhes',           type: 'link',
      tooltip: 'Ver detalhes do empenho' },
  ],

  cards: [
    {
      label: 'Total Restos a Pagar',
      valueKey: 'valor Resto',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Resto']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os restos a pagar',
    },
    {
      label: 'Total Processado',
      valueKey: 'valor Processado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Processado']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Valor liquidado pronto para pagamento',
    },
    {
      label: 'Não Processado',
      valueKey: 'valor Não Processado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Não Processado']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Valor ainda pendente de liquidação',
    },
    {
      label: 'Qtd. Empenhos',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de empenhos com restos a pagar',
    },
  ],

  glossario: [
    { termo: 'Restos a Pagar',       definicao: 'Despesas empenhadas em exercícios anteriores que não foram pagas até o encerramento do exercício financeiro.' },
    { termo: 'Restos Processados',   definicao: 'Restos a pagar que já passaram pela fase de liquidação — o serviço foi prestado ou o bem entregue.' },
    { termo: 'Restos Não Processados', definicao: 'Restos a pagar ainda sem liquidação — o serviço ainda não foi totalmente entregue ou verificado.' },
    { termo: 'Ano do Resto',         definicao: 'Exercício financeiro em que o empenho original foi realizado.' },
    { termo: 'Classificação da Despesa', definicao: 'Código que identifica a natureza econômica e o tipo de gasto realizado.' },
  ],
}

export default function RestosPagarPage() {
  return <ApiPageLayout config={config} />
}

