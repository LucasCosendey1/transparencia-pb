// app/contratos-celebrados/page.tsx

'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'termos-aditivos',
  titulo: 'Contratos Celebrados',
  subtitulo: 'Aditivos e contratos celebrados pelo município de Itabaiana/PB',
  breadcrumb: 'Contratos Celebrados',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/termos-aditivos',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_contrato',       label: 'Nº Contrato',     type: 'text' },
    { key: 'objeto',           label: 'Objeto',          type: 'text' },
    { key: 'fornecedor',       label: 'Fornecedor',      type: 'text', chartRole: 'category' },
    { key: 'valor',            label: 'Valor',           type: 'currency', chartRole: 'bar' },
    { key: 'assinatura',       label: 'Assinatura',      type: 'date' },
    { key: 'vigencia',         label: 'Vigência',        type: 'date' },
    { key: 'licitacao',        label: 'Licitação',       type: 'text' },
    { key: 'orgao',            label: 'Órgão',           type: 'text', hidden: true },
    { key: 'nome_do_fiscal',   label: 'Fiscal',          type: 'text', hidden: true },
    { key: 'funcao_do_fiscal', label: 'Função do Fiscal', type: 'text', hidden: true },
    { key: 'observacoes',      label: 'Observações',     type: 'text', hidden: true },
    { key: 'cpfcnpj',          label: 'CPF/CNPJ',        type: 'text', hidden: true },
    
  ],

  cards: [
    {
      label: 'Total de Contratos',
      valueKey: 'n_contrato',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de contratos no período',
    },
    {
      label: 'Valor Total',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma dos valores contratados',
    },
    {
      label: 'Maior Contrato',
      valueKey: 'valor',
      compute: data => Math.max(...data.map(r => Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor contratado no período',
    },
  ],

  glossario: [
    { termo: 'Termo Aditivo',  definicao: 'Instrumento que altera cláusulas de um contrato original, como prazo ou valor.' },
    { termo: 'Vigência',       definicao: 'Período de validade do contrato.' },
    { termo: 'Fiscal',         definicao: 'Servidor responsável por acompanhar a execução do contrato.' },
    { termo: 'Fornecedor',     definicao: 'Pessoa física ou jurídica contratada para prestação de serviços ou fornecimento de bens.' },
  ],
}

export default function TermosAditivosPage() {
  return <ApiPageLayout config={config} />
}