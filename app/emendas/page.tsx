'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'emendas',
  titulo: 'Emendas Parlamentares',
  subtitulo: 'Emendas parlamentares destinadas ao município de Itabaiana/PB',
  breadcrumb: 'Emendas Parlamentares',
  fonte: 'Portal da Transparência Federal — CGU',

  apiUrl: '/api/emendas',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'codigoEmenda',        label: 'Código',           type: 'text' },
    { key: 'numeroEmenda',        label: 'Número',           type: 'text' },
    { key: 'nomeAutor',           label: 'Autor',            type: 'text', chartRole: 'category' },
    { key: 'tipoEmenda',          label: 'Tipo',             type: 'text' },
    { key: 'ano',                 label: 'Ano',              type: 'number' },
    { key: 'localidadeDoGasto',   label: 'Localidade',       type: 'text', hidden: true },
    { key: 'funcao',              label: 'Função',           type: 'text', hidden: true },
    { key: 'subfuncao',           label: 'Subfunção',        type: 'text', hidden: true },
    { key: 'valorEmpenhado',      label: 'Empenhado',        type: 'currency', chartRole: 'bar' },
    { key: 'valorLiquidado',      label: 'Liquidado',        type: 'currency' },
    { key: 'valorPago',           label: 'Pago',             type: 'currency', chartRole: 'line' },
    { key: 'valorRestoInscrito',  label: 'Resto Inscrito',   type: 'currency', hidden: true },
    { key: 'valorRestoCancelado', label: 'Resto Cancelado',  type: 'currency', hidden: true },
    { key: 'valorRestoPago',      label: 'Resto Pago',       type: 'currency', hidden: true },
  ],

  cards: [
    {
      label: 'Total Pago',
      valueKey: 'valorPago',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valorPago']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma dos valores pagos no período',
    },
    {
      label: 'Total Empenhado',
      valueKey: 'valorEmpenhado',
      compute: data => data.reduce((acc, r) => acc + (Number(r['valorEmpenhado']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma dos valores empenhados no período',
    },
    {
      label: 'Qtd. Emendas',
      valueKey: 'codigoEmenda',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
    },
  ],

  glossario: [
    { termo: 'Emenda Parlamentar', definicao: 'Instrumento pelo qual parlamentares destinam recursos do orçamento federal para municípios.' },
    { termo: 'Empenhado',          definicao: 'Valor reservado no orçamento para a despesa.' },
    { termo: 'Liquidado',          definicao: 'Valor cuja entrega do bem ou serviço foi confirmada.' },
    { termo: 'Pago',               definicao: 'Valor efetivamente transferido ao favorecido.' },
  ],
}

export default function EmendasPage() {
  return <ApiPageLayout config={config} />
}

