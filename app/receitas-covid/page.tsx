'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'receitas-covid',
  titulo: 'Receitas COVID-19',
  subtitulo: 'Receitas previstas e realizadas relacionadas ao enfrentamento da COVID-19 — Itabaiana/PB',
  breadcrumb: 'Receitas COVID-19',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/receitas-covid',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: true,

  columns: [
    { key: 'cód.Receita',          label: 'Cód. Receita',        type: 'text' },
    { key: 'descrição',            label: 'Descrição',           type: 'text',     chartRole: 'category' },
    { key: 'receita Prevista',     label: 'Receita Prevista',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor total planejado para arrecadação relacionada à COVID-19' },
    { key: 'realizada no Mês',     label: 'Realizada no Mês',    type: 'currency', chartRole: 'line',
      tooltip: 'Valor efetivamente arrecadado no mês atual' },
    { key: 'realizada Até o Mês',  label: 'Realizada Até o Mês', type: 'currency',
      tooltip: 'Soma acumulada desde janeiro até o mês selecionado' },
    { key: 'diferença para Mais',  label: 'Diferença (+)',        type: 'currency',
      tooltip: 'Quanto foi arrecadado a mais do que o previsto' },
    { key: 'diferença para Menos', label: 'Diferença (-)',        type: 'currency',
      tooltip: 'Quanto faltou arrecadar em relação ao previsto' },
    { key: 'competência',          label: 'Competência',         type: 'text',     hidden: true },
    { key: 'cod_orgao',            label: 'Cod. Org.',           type: 'number',   hidden: true },
    { key: 'movimento',            label: 'Mov.',                type: 'text',     hidden: true,
      tooltip: 'S = possui movimento real; N = apenas categoria agrupadora' },
  ],

  cards: [
    {
      label: 'Total Previsto',
      valueKey: 'receita Prevista',
      compute: (data) => data
        .filter(r => r['movimento'] === 'S')
        .reduce((acc, r) => acc + (Number(r['receita Prevista']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todas as receitas COVID previstas com movimento real',
    },
    {
      label: 'Realizado no Mês',
      valueKey: 'realizada no Mês',
      compute: (data) => data
        .filter(r => r['movimento'] === 'S')
        .reduce((acc, r) => acc + (Number(r['realizada no Mês']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Total efetivamente arrecadado no mês atual',
    },
    {
      label: 'Realizado Acumulado',
      valueKey: 'realizada Até o Mês',
      compute: (data) => data
        .filter(r => r['movimento'] === 'S')
        .reduce((acc, r) => acc + (Number(r['realizada Até o Mês']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Total acumulado arrecadado até o mês selecionado',
    },
    {
      label: 'Diferença (a menor)',
      valueKey: 'diferença para Menos',
      compute: (data) => data
        .filter(r => r['movimento'] === 'S')
        .reduce((acc, r) => acc + (Number(r['diferença para Menos']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Quanto ainda falta arrecadar para atingir o previsto',
    },
  ],

  glossario: [
    { termo: 'Receita COVID-19',     definicao: 'Recursos arrecadados especificamente para o enfrentamento da pandemia de COVID-19.' },
    { termo: 'Receita Prevista',     definicao: 'Valor estimado para arrecadação no orçamento anual relacionado à COVID-19.' },
    { termo: 'Realizada no Mês',     definicao: 'Quanto de fato entrou nos cofres públicos no mês consultado.' },
    { termo: 'Realizada Até o Mês',  definicao: 'Total acumulado arrecadado desde janeiro até o mês consultado.' },
    { termo: 'Diferença para Mais',  definicao: 'Arrecadou mais do que o previsto.' },
    { termo: 'Diferença para Menos', definicao: 'Arrecadou menos do que o previsto.' },
    { termo: 'Movimento (S/N)',       definicao: '"S" indica receita com valor real lançado. "N" é apenas uma categoria agrupadora.' },
  ],
}

export default function ReceitasCovidPage() {
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <ApiPageLayout
      config={config}
      highContrast={highContrast}
      fontSize={fontSize}
      adjustFontSize={(n) => setFontSize(prev => Math.max(12, Math.min(24, prev + n)))}
      setHighContrast={setHighContrast}
      setFontSize={setFontSize}
    />
  )
}