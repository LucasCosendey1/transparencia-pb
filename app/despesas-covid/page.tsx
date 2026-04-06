// app/despesas-covid/page.tsx

'use client'

import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'despesas-covid',
  titulo: 'Licitações COVID-19',
  subtitulo: 'Processos licitatórios realizados pelo município de Itabaiana/PB relacionados ao enfrentamento da COVID-19',
  breadcrumb: 'Licitações COVID-19',
  fonte: 'Sistema de Licitações — Elmar Tecnologia',

  apiUrl: '/api/despesas-covid',

  showYearFilter: false,
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
      tooltip: 'Valor estimado para a licitação' },
    { key: 'valor',              label: 'Valor Homologado', type: 'currency',
      tooltip: 'Valor final após homologação' },
    { key: 'homologacao',        label: 'Homologação',     type: 'date',     hidden: true },
    { key: 'acessar_na_integra', label: 'Portal',          type: 'text',     hidden: true },
    { key: 'edital',             label: 'Edital',          type: 'link',
      tooltip: 'Acessar edital em PDF' },
    { key: 'docs',               label: 'Documentos',      type: 'link',
      tooltip: 'Ver documentos da licitação' },
  ],

  cards: [
    {
      label: 'Total de Licitações',
      valueKey: 'n_licitacao',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de processos licitatórios COVID-19',
    },
    {
      label: 'Valor Estimado Total',
      valueKey: 'valor_estimado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor_estimado']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Soma dos valores estimados de todas as licitações',
    },
    {
      label: 'Valor Homologado Total',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma dos valores homologados de todas as licitações',
    },
    {
      label: 'Finalizadas',
      valueKey: 'situacao',
      compute: data => data.filter(r => String(r['situacao']).toUpperCase().includes('FINALIZADA')).length,
      format: 'number',
      color: 'yellow',
      tooltip: 'Número de licitações finalizadas',
    },
  ],

  glossario: [
    { termo: 'Licitação COVID-19',  definicao: 'Processo licitatório realizado para aquisição de bens e serviços destinados ao enfrentamento da pandemia de COVID-19.' },
    { termo: 'Modalidade',          definicao: 'Forma de licitação utilizada, como Pregão, Concorrência, Dispensa, Inexigibilidade etc.' },
    { termo: 'Valor Estimado',      definicao: 'Valor previsto pela Administração antes da abertura das propostas.' },
    { termo: 'Homologação',         definicao: 'Ato que confirma o resultado da licitação, tornando válida a contratação com o vencedor.' },
    { termo: 'Edital',              definicao: 'Documento que define as regras, exigências e condições para participar da licitação.' },
  ],
}

export default function DespesasCovidPage() {
  return <ApiPageLayout config={config} />
}