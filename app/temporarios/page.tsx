'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'temporarios',
  titulo: 'Servidores Temporários',
  subtitulo: 'Servidores contratados temporariamente pelo município de Itabaiana/PB',
  breadcrumb: 'Temporários',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/temporarios',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'competência',           label: 'Competência',       type: 'text' },
    { key: 'matrícula',             label: 'Matrícula',         type: 'text' },
    { key: 'nome',                  label: 'Nome',              type: 'text' },
    { key: 'cpf',                   label: 'CPF',               type: 'text',     hidden: true },
    { key: 'cargo',                 label: 'Cargo',             type: 'text' },
    { key: 'secretaria',            label: 'Secretaria',        type: 'text',     chartRole: 'category' },
    { key: 'regime',                label: 'Regime',            type: 'text',     hidden: true },
    { key: 'carga Horária Semanal', label: 'Carga Horária',     type: 'text',     hidden: true },
    { key: 'dt. Admissão',          label: 'Admissão',          type: 'date' },
    { key: 'vantagens',             label: 'Vantagens (Bruto)', type: 'currency', chartRole: 'bar',
      tooltip: 'Total de proventos e vantagens' },
    { key: 'descontos',             label: 'Descontos',         type: 'currency', hidden: true },
    { key: 'líquido',               label: 'Líquido',           type: 'currency',
      tooltip: 'Valor líquido recebido pelo servidor' },
  ],

  cards: [
    {
      label: 'Total de Temporários',
      valueKey: 'matrícula',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de servidores temporários no período',
    },
    {
      label: 'Total Bruto',
      valueKey: 'vantagens',
      compute: data => data.reduce((acc, r) => acc + (Number(r['vantagens']) || 0), 0),
      format: 'currency',
      color: 'purple',
      tooltip: 'Soma de todas as vantagens e proventos',
    },
    {
      label: 'Total Líquido',
      valueKey: 'líquido',
      compute: data => data.reduce((acc, r) => acc + (Number(r['líquido']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma dos valores líquidos pagos',
    },
    {
      label: 'Média Salarial Líquida',
      valueKey: 'líquido',
      compute: data => {
        if (!data.length) return 0
        return data.reduce((acc, r) => acc + (Number(r['líquido']) || 0), 0) / data.length
      },
      format: 'currency',
      color: 'yellow',
      tooltip: 'Média do salário líquido por servidor temporário',
    },
  ],

  glossario: [
    { termo: 'Servidor Temporário', definicao: 'Pessoa contratada por tempo determinado para atender necessidade temporária de excepcional interesse público, conforme Lei nº 8.745/93 ou legislação municipal equivalente.' },
    { termo: 'Contrato por Excepcional Interesse Público', definicao: 'Modalidade de contratação temporária prevista na Constituição Federal para situações emergenciais ou de interesse público inadiável.' },
    { termo: 'Vantagens',    definicao: 'Soma de todos os proventos e benefícios que compõem a remuneração bruta.' },
    { termo: 'Descontos',    definicao: 'Valores deduzidos da remuneração bruta, como INSS e outros encargos.' },
    { termo: 'Líquido',      definicao: 'Valor efetivamente recebido após dedução de todos os descontos.' },
    { termo: 'Competência',  definicao: 'Mês/ano de referência da folha de pagamento.' },
  ],
}

export default function TemporariosPage() {
  return <ApiPageLayout config={config} />
}

