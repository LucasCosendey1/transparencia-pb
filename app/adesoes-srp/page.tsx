// app/adesoes-srp/page.tsx

'use client'

import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'adesoes-srp',
  titulo: 'Adesões a Registro de Preço',
  subtitulo: 'Adesões a Ata de Registro de Preços realizadas pelo município de Itabaiana/PB',
  breadcrumb: 'Adesões SRP',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/adesoes-srp',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'n_licitacao',        label: 'Nº Licitação',    type: 'text' },
    { key: 'n_processo',         label: 'Nº Processo',     type: 'text',     hidden: true },
    { key: 'data',               label: 'Data',            type: 'date',     chartRole: 'category' },
    { key: 'modalidade',         label: 'Modalidade',      type: 'text',     chartRole: 'category' },
    { key: 'tipo_objeto',        label: 'Tipo de Objeto',  type: 'text',     hidden: true },
    { key: 'objeto',             label: 'Objeto',          type: 'text' },
    { key: 'situacao',           label: 'Situação',        type: 'text' },
    { key: 'valor_estimado',     label: 'Valor Estimado',  type: 'currency', chartRole: 'bar',
      tooltip: 'Valor estimado para a adesão' },
    { key: 'valor',              label: 'Valor Homologado',type: 'currency',
      tooltip: 'Valor final após homologação' },
    { key: 'homologacao',        label: 'Homologação',     type: 'date',     hidden: true },
    { key: 'acessar_na_integra', label: 'Portal',          type: 'text',     hidden: true },
    { key: 'edital',             label: 'Edital',          type: 'link',
      tooltip: 'Acessar edital em PDF' },
    { key: 'docs',               label: 'Documentos',      type: 'link',
      tooltip: 'Ver documentos da adesão' },
  ],

  cards: [
    {
      label: 'Total de Adesões',
      valueKey: 'n_licitacao',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de adesões a registro de preço no período',
    },
    {
      label: 'Valor Estimado Total',
      valueKey: 'valor_estimado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor_estimado']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Soma dos valores estimados de todas as adesões',
    },
    {
      label: 'Em Andamento',
      valueKey: 'situacao',
      compute: data => data.filter(r => String(r['situacao']).toUpperCase().includes('ANDAMENTO')).length,
      format: 'number',
      color: 'yellow',
      tooltip: 'Número de adesões ainda em andamento',
    },
    {
      label: 'Homologadas',
      valueKey: 'situacao',
      compute: data => data.filter(r => String(r['situacao']).toUpperCase().includes('HOMOLOG')).length,
      format: 'number',
      color: 'green',
      tooltip: 'Número de adesões já homologadas',
    },
  ],

  glossario: [
    { termo: 'Adesão a Registro de Preço', definicao: 'Utilização, por outro órgão, de ata de registro de preços gerenciada por órgão diverso, também chamada de "carona".' },
    { termo: 'Ata de Registro de Preços',  definicao: 'Documento que formaliza os preços registrados após licitação na modalidade de Registro de Preços.' },
    { termo: 'Valor Estimado',             definicao: 'Valor previsto pela Administração antes da formalização da adesão.' },
    { termo: 'Homologação',                definicao: 'Ato que confirma o resultado, tornando válida a contratação com o fornecedor.' },
    { termo: 'Edital',                     definicao: 'Documento que define as regras e condições do processo original ao qual se adere.' },
    { termo: 'Órgão Gerenciador',          definicao: 'Órgão responsável pela licitação que originou a Ata de Registro de Preços.' },
  ],
}

export default function AdesoesSrpPage() {
  return <ApiPageLayout config={config} />
}