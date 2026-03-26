'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'empenhos',
  titulo: 'Empenhos',
  subtitulo: 'Despesas empenhadas pelo município de Itabaiana/PB',
  breadcrumb: 'Empenhos',
  fonte: 'Sistema de Contabilidade Pública — Elmar Tecnologia',

  apiUrl: '/api/empenhos',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'empenho',             label: 'Empenho',            type: 'text' },
    { key: 'data',                label: 'Data',               type: 'date',   chartRole: 'category' },
    { key: 'competência',         label: 'Competência',        type: 'text' },
    { key: 'und.Orçamentária',    label: 'Unid. Orçamentária', type: 'text' },
    { key: 'fornecedor',          label: 'Fornecedor',         type: 'text' },
    { key: 'cpF|CNPJ',            label: 'CPF/CNPJ',           type: 'text',   hidden: true },
    { key: 'classificação',       label: 'Classificação',      type: 'text',   hidden: true },
    { key: 'modalidade Licitação',label: 'Modalidade',         type: 'text',   hidden: true },
    { key: 'licitação',           label: 'Licitação',          type: 'text',   hidden: true },
    { key: 'f.Recurso',           label: 'Fonte de Recurso',   type: 'text',   hidden: true },
    { key: 'função',              label: 'Função',             type: 'text',   hidden: true },
    { key: 'sub-Função',          label: 'Sub-Função',         type: 'text',   hidden: true },
    { key: 'valor',               label: 'Valor Empenhado',    type: 'currency', chartRole: 'bar',
      tooltip: 'Valor comprometido pelo empenho' },
    { key: 'valor Orçado',        label: 'Valor Orçado',       type: 'currency', hidden: true },
    { key: 'valor Anulação',      label: 'Anulação',           type: 'currency', hidden: true },
    { key: 'valor Pagamento',     label: 'Valor Pago',         type: 'currency', chartRole: 'line',
      tooltip: 'Valor efetivamente pago' },
    { key: 'especificação',       label: 'Especificação',      type: 'text',   hidden: true },
    { key: 'docs',                label: 'Documento',          type: 'link',   hidden: false,
      tooltip: 'Clique para ver o documento' },
  ],

  cards: [
    {
      label: 'Total Empenhado',
      valueKey: 'valor',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todos os valores empenhados no período',
    },
    {
      label: 'Total Pago',
      valueKey: 'valor Pagamento',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Pagamento']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma de todos os pagamentos realizados',
    },
    {
      label: 'Total Anulado',
      valueKey: 'valor Anulação',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valor Anulação']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Soma dos valores anulados',
    },
    {
      label: 'Qtd. Empenhos',
      valueKey: 'empenho',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de empenhos no período',
    },
  ],

  glossario: [
    { termo: 'Empenho',        definicao: 'Ato pelo qual a autoridade competente reserva dotação orçamentária para atender obrigação de pagamento.' },
    { termo: 'Liquidação',     definicao: 'Verificação do direito do credor ao pagamento, após confirmação da entrega do bem ou serviço.' },
    { termo: 'Pagamento',      definicao: 'Transferência efetiva de recursos ao credor após a liquidação.' },
    { termo: 'Anulação',       definicao: 'Cancelamento parcial ou total de um empenho.' },
    { termo: 'Fonte de Recurso', definicao: 'Origem dos recursos utilizados para cobrir a despesa empenhada.' },
    { termo: 'Modalidade',     definicao: 'Tipo de licitação utilizada para a contratação do fornecedor.' },
    { termo: 'Classificação',  definicao: 'Código que identifica a natureza da despesa conforme a tabela de classificação orçamentária.' },
    { termo: 'Unidade Orçamentária', definicao: 'Secretaria ou órgão responsável pela execução da despesa.' },
  ],
}

export default function EmpenhosPage() {
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