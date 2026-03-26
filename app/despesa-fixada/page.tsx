'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'despesa-fixada',
  titulo: 'Despesa Fixada',
  subtitulo: 'Dotações orçamentárias fixadas e atualizadas — Itabaiana/PB',
  breadcrumb: 'Despesa Fixada',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/despesa-fixada',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'competência',        label: 'Competência',        type: 'text' },
    { key: 'und. Orçamentária',  label: 'Unidade Orçamentária', type: 'text', chartRole: 'category' },
    { key: 'cat.Econômica',      label: 'Cat. Econômica',     type: 'text' },
    { key: 'classificação',      label: 'Classificação',      type: 'text',   hidden: true },
    { key: 'fonte de Recurso',   label: 'Fonte de Recurso',   type: 'text',   hidden: true },
    { key: 'dotação Inicial',    label: 'Dotação Inicial',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor originalmente aprovado na LOA' },
    { key: 'dotação Atualizada', label: 'Dotação Atualizada', type: 'currency',
      tooltip: 'Dotação inicial + suplementações - anulações' },
    { key: 'empenhado',          label: 'Empenhado',          type: 'currency', chartRole: 'line',
      tooltip: 'Valor comprometido por empenho' },
    { key: 'liquidado no Mês',   label: 'Liquidado no Mês',   type: 'currency',
      tooltip: 'Valor liquidado no mês corrente' },
    { key: 'pago no Mês',        label: 'Pago no Mês',        type: 'currency',
      tooltip: 'Valor efetivamente pago no mês' },
    { key: 'saldo',              label: 'Saldo',              type: 'currency',
      tooltip: 'Dotação atualizada menos o empenhado' },
    { key: 'suplementado no Mês', label: 'Suplementado',      type: 'currency', hidden: true },
    { key: 'anulado no Mês',      label: 'Anulado',           type: 'currency', hidden: true },
    { key: 'ficha',               label: 'Ficha',             type: 'number',   hidden: true },
  ],

  cards: [
    {
      label: 'Dotação Atualizada',
      valueKey: 'dotação Atualizada',
      compute: data => data.reduce((acc, r) => acc + (Number(r['dotação Atualizada']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma das dotações atualizadas no período',
    },
    {
      label: 'Total Empenhado',
      valueKey: 'empenhado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['empenhado']) || 0), 0),
      format: 'currency',
      color: 'yellow',
      tooltip: 'Total comprometido por empenhos',
    },
    {
      label: 'Total Pago',
      valueKey: 'pago no Mês',
      compute: data => data.reduce((acc, r) => acc + (Number(r['pago no Mês']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Total efetivamente pago no mês',
    },
    {
      label: 'Saldo Disponível',
      valueKey: 'saldo',
      compute: data => data.reduce((acc, r) => acc + (Number(r['saldo']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Saldo remanescente para empenho',
    },
  ],

  glossario: [
    { termo: 'Dotação Inicial',    definicao: 'Valor aprovado na Lei Orçamentária Anual (LOA) para a despesa.' },
    { termo: 'Dotação Atualizada', definicao: 'Dotação inicial acrescida de suplementações e deduzida de anulações.' },
    { termo: 'Empenhado',          definicao: 'Valor comprometido por empenho, reservando recursos para pagamento futuro.' },
    { termo: 'Liquidado',          definicao: 'Reconhecimento da obrigação de pagamento após verificação do direito do credor.' },
    { termo: 'Pago',               definicao: 'Valor efetivamente transferido ao credor.' },
    { termo: 'Saldo',              definicao: 'Diferença entre a dotação atualizada e o valor empenhado.' },
    { termo: 'Suplementação',      definicao: 'Crédito adicional que aumenta a dotação de uma despesa.' },
    { termo: 'Anulação',           definicao: 'Redução de dotação orçamentária.' },
    { termo: 'Fonte de Recurso',   definicao: 'Origem dos recursos utilizados para financiar a despesa.' },
    { termo: 'Ficha',              definicao: 'Identificador único de cada linha orçamentária.' },
  ],
}

export default function DespesaFixadaPage() {
  const [fontSize, setFontSize]       = useState(16)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <ApiPageLayout
      config={config}
      highContrast={highContrast}
      fontSize={fontSize}
      adjustFontSize={n => setFontSize(prev => Math.max(12, Math.min(24, prev + n)))}
      setHighContrast={setHighContrast}
      setFontSize={setFontSize}
    />
  )
}