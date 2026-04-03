'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'receita-realizada',
  titulo: 'Receita Realizada',
  subtitulo: 'Valores efetivamente arrecadados pelo município de Itabaiana/PB',
  breadcrumb: 'Receita Realizada',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/receita-realizada',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'código',       label: 'Código',        type: 'text' },
    { key: 'descrição',    label: 'Descrição',      type: 'text',     chartRole: 'category' },
    { key: 'competência',  label: 'Competência',    type: 'text' },
    { key: 'data',         label: 'Data',           type: 'date' },
    { key: 'valor',        label: 'Valor',          type: 'currency', chartRole: 'bar' },
    { key: 'origem',       label: 'Origem',         type: 'text',     hidden: true },
    { key: 'cnpj Origem',  label: 'CNPJ Origem',    type: 'text',     hidden: true },
    { key: 'cod. Órgão',   label: 'Cod. Órgão',     type: 'text',     hidden: true },
    { key: 'cod. Unidade', label: 'Cod. Unidade',   type: 'text',     hidden: true },
    { key: 'cod_orgao',    label: 'Cod. Org.',      type: 'number',   hidden: true },
  ],

  cards: [
    {
      label: 'Total Arrecadado',
      valueKey: 'valor',
      compute: (data) => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma de todos os valores arrecadados no período selecionado',
    },
    {
      label: 'Lançamentos',
      valueKey: 'valor',
      compute: (data) => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Quantidade de lançamentos de receita no período',
    },
    {
      label: 'Média por Lançamento',
      valueKey: 'valor',
      compute: (data) => data.length > 0
        ? data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
        : 0,
      format: 'currency',
      color: 'purple',
      tooltip: 'Valor médio por lançamento no período',
    },
    {
      label: 'Maior Arrecadação',
      valueKey: 'valor',
      compute: (data) => data.length > 0
        ? Math.max(...data.map(r => Number(r['valor']) || 0))
        : 0,
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor arrecadado em um único lançamento',
    },
  ],

  glossario: [
    { termo: 'Receita Realizada',  definicao: 'Valor efetivamente arrecadado e registrado nos cofres públicos.' },
    { termo: 'Competência',        definicao: 'Mês e ano a que o lançamento se refere (ex: 01/2026 = janeiro de 2026).' },
    { termo: 'Código',             definicao: 'Código classificador da receita conforme plano de contas público.' },
    { termo: 'Origem',             definicao: 'Entidade ou órgão responsável pelo repasse ou arrecadação.' },
    { termo: 'FPM',                definicao: 'Fundo de Participação dos Municípios — principal repasse federal.' },
    { termo: 'FUNDEB',             definicao: 'Fundo de Manutenção da Educação Básica — recursos vinculados à educação.' },
    { termo: 'ISSQN',              definicao: 'Imposto Sobre Serviços de Qualquer Natureza — tributo municipal.' },
    { termo: 'IPTU',               definicao: 'Imposto Predial e Territorial Urbano — tributo sobre imóveis urbanos.' },
  ],
}

export default function ReceitaRealizadaPage() {
  return <ApiPageLayout config={config} />
}


