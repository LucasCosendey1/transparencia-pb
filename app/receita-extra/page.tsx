'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'receita-extra-orcamentaria',
  titulo: 'Receita Extra Orçamentária',
  subtitulo: 'Valores arrecadados fora do orçamento pelo município de Itabaiana/PB',
  breadcrumb: 'Receita Extra Orçamentária',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/receita-extra-orcamentaria',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'código',       label: 'Código',       type: 'number' },
    { key: 'descrição',    label: 'Descrição',    type: 'text',     chartRole: 'category' },
    { key: 'competência',  label: 'Competência',  type: 'text' },
    { key: 'data',         label: 'Data',         type: 'date' },
    { key: 'valor',        label: 'Valor',        type: 'currency', chartRole: 'bar' },
    { key: 'histórico',    label: 'Histórico',    type: 'text',     hidden: true },
    { key: 'origem',       label: 'Origem',       type: 'text',     hidden: true },
    { key: 'cnpj Origem',  label: 'CNPJ Origem',  type: 'text',     hidden: true },
    { key: 'cod. Órgão',   label: 'Cod. Órgão',   type: 'text',     hidden: true },
    { key: 'cod. Unidade', label: 'Cod. Unidade', type: 'text',     hidden: true },
    { key: 'classificação',label: 'Classificação',type: 'number',   hidden: true },
  ],

  cards: [
    {
      label: 'Total Arrecadado',
      valueKey: 'valor',
      compute: (data) => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os valores extra orçamentários no período selecionado',
    },
    {
      label: 'Lançamentos',
      valueKey: 'valor',
      compute: (data) => data.length,
      format: 'number',
      color: 'green',
      tooltip: 'Quantidade de lançamentos extra orçamentários no período',
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
      label: 'Maior Lançamento',
      valueKey: 'valor',
      compute: (data) => data.length > 0
        ? Math.max(...data.map(r => Number(r['valor']) || 0))
        : 0,
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor registrado em um único lançamento',
    },
  ],

  glossario: [
    { termo: 'Receita Extra Orçamentária', definicao: 'Valores arrecadados que não integram o orçamento, como consignações, retenções e cauções.' },
    { termo: 'Competência',                definicao: 'Mês e ano a que o lançamento se refere (ex: 01/2026 = janeiro de 2026).' },
    { termo: 'Código',                     definicao: 'Identificador da natureza do lançamento extra orçamentário.' },
    { termo: 'Histórico',                  definicao: 'Descrição complementar do lançamento.' },
    { termo: 'Consignação',                definicao: 'Desconto em folha repassado a terceiros (ex: empréstimos, sindicatos).' },
    { termo: 'INSS',                       definicao: 'Instituto Nacional do Seguro Social — contribuição previdenciária retida dos servidores.' },
    { termo: 'Pensão Alimentícia',         definicao: 'Desconto judicial em folha para pagamento de pensão alimentícia.' },
  ],
}

export default function ReceitaExtraOrcamentariaPage() {
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