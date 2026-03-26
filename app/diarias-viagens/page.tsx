'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'diarias-viagens',
  titulo: 'Diárias e Viagens',
  subtitulo: 'Concessão de diárias a servidores do município de Itabaiana/PB',
  breadcrumb: 'Diárias e Viagens',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/diarias-viagens',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',              label: 'Empenho',            type: 'text' },
    { key: 'data',                 label: 'Data',               type: 'date',     chartRole: 'category' },
    { key: 'competência',          label: 'Competência',        type: 'text' },
    { key: 'und.Orçamentária',     label: 'Unid. Orçamentária', type: 'text' },
    { key: 'fornecedor',           label: 'Beneficiário',       type: 'text' },
    { key: 'cpF|CNPJ',            label: 'CPF',                type: 'text',     hidden: true },
    { key: 'função',               label: 'Função',             type: 'text',     hidden: true },
    { key: 'sub-Função',           label: 'Sub-Função',         type: 'text',     hidden: true },
    { key: 'f.Recurso',            label: 'Fonte de Recurso',   type: 'text',     hidden: true },
    { key: 'modalidade Licitação', label: 'Modalidade',         type: 'text',     hidden: true },
    { key: 'valor',                label: 'Valor Empenhado',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor empenhado para pagamento de diárias' },
    { key: 'valor Pagamento',      label: 'Valor Pago',         type: 'currency',
      tooltip: 'Valor efetivamente pago' },
    { key: 'valor Anulação',       label: 'Valor Anulado',      type: 'currency', hidden: true },
    { key: 'especificação',        label: 'Especificação',      type: 'text',     hidden: true },
    { key: 'docs',                 label: 'Documento',          type: 'link',
      tooltip: 'Ver empenho original' },
  ],

  cards: [
    {
      label: 'Total Empenhado',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todas as diárias empenhadas no período',
    },
    {
      label: 'Total Pago',
      valueKey: 'valor Pagamento',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Pagamento']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma das diárias efetivamente pagas',
    },
    {
      label: 'Qtd. Concessões',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de concessões de diárias no período',
    },
    {
      label: 'Média por Concessão',
      valueKey: 'valor',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'yellow',
      tooltip: 'Valor médio por concessão de diária',
    },
  ],

  glossario: [
    { termo: 'Diária',          definicao: 'Indenização paga ao servidor público para cobrir despesas de alimentação e hospedagem durante viagens a serviço.' },
    { termo: 'Diária Civil',    definicao: 'Diária concedida a servidores civis (não militares) para deslocamentos a trabalho fora do município sede.' },
    { termo: 'Empenho',         definicao: 'Ato que reserva dotação orçamentária para pagar a diária antes da viagem.' },
    { termo: 'Beneficiário',    definicao: 'Servidor que recebe as diárias para custear despesas durante a viagem a serviço.' },
    { termo: 'Fonte de Recurso', definicao: 'Origem dos recursos utilizados para o pagamento das diárias.' },
  ],
}

export default function DiariasViagensPage() {
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