//app/receita-prevista/page.tsx

'use client'

import { useState, useEffect } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

// ─── Config visual/estrutural da página ───────────────────────────────────────
// Aqui ficam apenas metadados, colunas, cards e glossário.
// O fetch real acontece no route.ts desta pasta.

const config: ApiPageConfig = {
  paginaId: 'receita-prevista',
  titulo: 'Receita Prevista',
  subtitulo: 'Previsão de arrecadação do município de Itabaiana/PB',
  breadcrumb: 'Receita Prevista',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  // Aponta para o route.ts local desta página
  apiUrl: '/api/receita-prevista',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: true,

  columns: [
    { key: 'cód.Receita',          label: 'Cód. Receita',        type: 'text' },
    { key: 'descrição',            label: 'Descrição',           type: 'text',     chartRole: 'category' },
    { key: 'receita Prevista',     label: 'Receita Prevista',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor total planejado para arrecadação neste exercício' },
    { key: 'realizada no Mês',     label: 'Realizada no Mês',    type: 'currency', chartRole: 'line',
      tooltip: 'Valor efetivamente arrecadado (fonte: API realizada)' },
    { key: 'realizada Até o Mês',  label: 'Realizada Até o Mês', type: 'currency',
      tooltip: 'Soma acumulada desde janeiro até o mês selecionado' },
    { key: 'diferença para Mais',  label: 'Diferença (+)',        type: 'currency',
      tooltip: 'Quanto foi arrecadado a mais do que o previsto' },
    { key: 'diferença para Menos', label: 'Diferença (-)',        type: 'currency',
      tooltip: 'Quanto faltou arrecadar em relação ao previsto' },
    { key: 'cod_orgao',            label: 'Cod. Org.',           type: 'number',   hidden: true },
    { key: 'competência',          label: 'Competência',         type: 'text',     hidden: true },
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
      tooltip: 'Soma de todas as receitas previstas com movimento real',
    },
    {
      label: 'Realizado no Mês',
      valueKey: 'realizada no Mês',
      compute: (data) => data
        .filter(r => r['movimento'] === 'S')
        .reduce((acc, r) => acc + (Number(r['realizada no Mês']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Total efetivamente arrecadado (fonte: API realizada)',
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
    { termo: 'Receita Prevista',     definicao: 'Valor que a prefeitura estimou arrecadar no orçamento anual.' },
    { termo: 'Realizada no Mês',     definicao: 'Quanto de fato entrou nos cofres públicos no mês consultado.' },
    { termo: 'Realizada Até o Mês',  definicao: 'Total acumulado arrecadado desde janeiro até o mês consultado.' },
    { termo: 'Diferença para Mais',  definicao: 'Arrecadou mais do que o previsto — sinal positivo para as contas.' },
    { termo: 'Diferença para Menos', definicao: 'Arrecadou menos do que o previsto — indica déficit de arrecadação.' },
    { termo: 'Movimento (S/N)',       definicao: '"S" indica receita com valor real lançado. "N" é apenas uma categoria agrupadora.' },
    { termo: 'Competência',          definicao: 'Mês e ano a que o dado se refere (ex: 01/2026 = janeiro de 2026).' },
    { termo: 'FPM',                  definicao: 'Fundo de Participação dos Municípios — principal repasse federal.' },
    { termo: 'FUNDEB',               definicao: 'Fundo de Manutenção da Educação Básica — recursos vinculados à educação.' },
    { termo: 'ISSQN',                definicao: 'Imposto Sobre Serviços de Qualquer Natureza — tributo municipal.' },
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReceitaPrevistaPage() {
  return <ApiPageLayout config={config} />
}


