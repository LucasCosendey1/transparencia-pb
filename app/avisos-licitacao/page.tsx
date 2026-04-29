// app/avisos-licitacao/page.tsx

'use client'

import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'avisos-licitacao',
  titulo: 'Avisos de Licitação',
  subtitulo: 'Contratos e avisos de licitação do município de Itabaiana/PB',
  breadcrumb: 'Avisos de Licitação',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/avisos-licitacao',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_contrato',       label: 'Nº Contrato',    type: 'text' },
    { key: 'n_licitacao',     label: 'Nº Licitação', type: 'text', hidden: true },
    { key: 'n_licitacao_url', label: 'Licitação',     type: 'link', hidden: false, tooltip: 'Ver detalhamento da licitação' },
    { key: 'assinatura',       label: 'Assinatura',     type: 'date' },
    { key: 'vigencia',         label: 'Vigência',       type: 'date' },
    { key: 'licitacao',        label: 'Modalidade',     type: 'text', chartRole: 'category' },
    { key: 'objeto',           label: 'Objeto',         type: 'text' },
    { key: 'fornecedor',       label: 'Fornecedor',     type: 'text' },
    { key: 'cpfcnpj',          label: 'CPF/CNPJ',       type: 'text', hidden: true },
    { key: 'valor',            label: 'Valor',          type: 'currency', chartRole: 'bar' },
    { key: 'nome_do_fiscal',   label: 'Fiscal',         type: 'text', hidden: true },
    { key: 'funcao_do_fiscal', label: 'Função do Fiscal', type: 'text', hidden: true },
    { key: 'contrato',         label: 'Contrato',       type: 'link', tooltip: 'Acessar contrato em PDF' },
    { key: 'extrato',          label: 'Extrato',        type: 'link', tooltip: 'Acessar extrato em PDF' },
  ],

  cards: [
    {
      label: 'Total de Contratos',
      valueKey: 'n_contrato',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
    },
    {
      label: 'Valor Total',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'purple',
    },
    {
      label: 'Fornecedores Distintos',
      valueKey: 'fornecedor',
      compute: data => new Set(data.map(r => r['fornecedor'])).size,
      format: 'number',
      color: 'green',
    },
  ],

  glossario: [
    { termo: 'Aviso de Licitação', definicao: 'Publicação oficial que informa sobre abertura de processo licitatório.' },
    { termo: 'Contrato',           definicao: 'Instrumento jurídico que formaliza a contratação entre a prefeitura e o fornecedor.' },
    { termo: 'Extrato',            definicao: 'Resumo publicado em diário oficial sobre o contrato celebrado.' },
    { termo: 'Vigência',           definicao: 'Período de validade do contrato.' },
    { termo: 'Fiscal',             definicao: 'Servidor responsável por acompanhar a execução do contrato.' },
  ],
}

export default function AvisosLicitacaoPage() {
  return <ApiPageLayout config={config} />
}
