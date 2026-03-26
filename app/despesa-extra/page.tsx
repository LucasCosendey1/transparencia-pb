'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'despesa-extra',
  titulo: 'Despesas Extraorçamentárias',
  subtitulo: 'Despesas extraorçamentárias realizadas pelo município de Itabaiana/PB',
  breadcrumb: 'Despesas Extraorçamentárias',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/despesa-extra',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'nº Guia',      label: 'Nº Guia',       type: 'text' },
    { key: 'data',         label: 'Data',           type: 'date',     chartRole: 'category' },
    { key: 'competência',  label: 'Competência',    type: 'text' },
    { key: 'fornecedor',   label: 'Fornecedor',     type: 'text' },
    { key: 'cpF|CNPJ',    label: 'CPF/CNPJ',       type: 'text',     hidden: true },
    { key: 'código',       label: 'Código',         type: 'text',     hidden: true },
    { key: 'valor',        label: 'Valor',          type: 'currency', chartRole: 'bar',
      tooltip: 'Valor da despesa extraorçamentária' },
    { key: 'descrição',    label: 'Descrição',      type: 'text',     hidden: true },
  ],

  cards: [
    {
      label: 'Total Extraorçamentário',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todas as despesas extraorçamentárias no período',
    },
    {
      label: 'Qtd. Registros',
      valueKey: 'nº Guia',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de registros no período',
    },
    {
      label: 'Maior Despesa',
      valueKey: 'valor',
      compute: data => Math.max(...data.map(r => Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'yellow',
      tooltip: 'Maior valor individual registrado',
    },
    {
      label: 'Média por Registro',
      valueKey: 'valor',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'green',
      tooltip: 'Valor médio por despesa extraorçamentária',
    },
  ],

  glossario: [
    { termo: 'Despesa Extraorçamentária', definicao: 'Saída de recursos financeiros que não representam despesas orçamentárias, como repasses de consignações, INSS, pensões alimentícias e salário-família.' },
    { termo: 'Guia',         definicao: 'Documento que identifica e formaliza cada saída extraorçamentária.' },
    { termo: 'Consignação',  definicao: 'Valor retido do salário do servidor e repassado a terceiros (bancos, sindicatos, planos de saúde etc.).' },
    { termo: 'Salário-Família', definicao: 'Benefício pago ao servidor por filho dependente, repassado pelo órgão ao INSS.' },
    { termo: 'Pensão Alimentícia', definicao: 'Valor retido do salário do servidor por determinação judicial e repassado ao beneficiário.' },
  ],
}

export default function DespesaExtraPage() {
  const [fontSize, setFontSize]         = useState(16)
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