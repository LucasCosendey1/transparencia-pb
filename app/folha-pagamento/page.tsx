'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'folha-pagamento',
  titulo: 'Folha de Pagamento',
  subtitulo: 'Remuneração dos servidores públicos do município de Itabaiana/PB',
  breadcrumb: 'Folha de Pagamento',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/folha-pagamento',

  showYearFilter: true,
  showMonthFilter: true,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'competência',            label: 'Competência',      type: 'text' },
    { key: 'matrícula',              label: 'Matrícula',        type: 'text' },
    { key: 'nome',                   label: 'Nome',             type: 'text' },
    { key: 'cpf',                    label: 'CPF',              type: 'text',     hidden: true },
    { key: 'cargo',                  label: 'Cargo',            type: 'text' },
    { key: 'secretaria',             label: 'Secretaria',       type: 'text',     chartRole: 'category' },
    { key: 'regime',                 label: 'Regime',           type: 'text',     hidden: true },
    { key: 'carga Horária Semanal',  label: 'Carga Horária',    type: 'text',     hidden: true },
    { key: 'dt. Admissão',           label: 'Admissão',         type: 'date',     hidden: true },
    { key: 'vantagens',              label: 'Vantagens (Bruto)', type: 'currency', chartRole: 'bar',
      tooltip: 'Total de proventos e vantagens' },
    { key: 'descontos',              label: 'Descontos',        type: 'currency',
      tooltip: 'Total de descontos aplicados' },
    { key: 'líquido',                label: 'Líquido',          type: 'currency',
      tooltip: 'Valor líquido recebido pelo servidor' },
  ],

  cards: [
    {
      label: 'Total Bruto (Vantagens)',
      valueKey: 'vantagens',
      compute: data => data.reduce((acc, r) => acc + (Number(r['vantagens']) || 0), 0),
      format: 'currency',
      color: 'blue',
      tooltip: 'Soma de todas as vantagens e proventos no período',
    },
    {
      label: 'Total Descontos',
      valueKey: 'descontos',
      compute: data => data.reduce((acc, r) => acc + (Number(r['descontos']) || 0), 0),
      format: 'currency',
      color: 'red',
      tooltip: 'Soma de todos os descontos realizados',
    },
    {
      label: 'Total Líquido',
      valueKey: 'líquido',
      compute: data => data.reduce((acc, r) => acc + (Number(r['líquido']) || 0), 0),
      format: 'currency',
      color: 'green',
      tooltip: 'Soma de todos os valores líquidos pagos',
    },
    {
      label: 'Qtd. Servidores',
      valueKey: 'matrícula',
      compute: data => data.length,
      format: 'number',
      color: 'purple',
      tooltip: 'Número de servidores na folha do período',
    },
  ],

  glossario: [
    { termo: 'Vantagens',        definicao: 'Soma de todos os proventos e benefícios que compõem a remuneração bruta do servidor.' },
    { termo: 'Descontos',        definicao: 'Valores deduzidos da remuneração bruta, como INSS, IR, consignações e outros.' },
    { termo: 'Líquido',          definicao: 'Valor efetivamente recebido pelo servidor após dedução de todos os descontos.' },
    { termo: 'Regime',           definicao: 'Vínculo jurídico do servidor com a Administração (estatutário, celetista, temporário etc.).' },
    { termo: 'Competência',      definicao: 'Mês/ano de referência ao qual a folha de pagamento se refere.' },
    { termo: 'Carga Horária',    definicao: 'Número de horas semanais de trabalho previstas para o cargo.' },
  ],
}

export default function FolhaPagamentoPage() {
  return <ApiPageLayout config={config} />
}

