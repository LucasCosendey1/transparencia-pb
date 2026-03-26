'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'quadro-funcional',
  titulo: 'Quadro Funcional',
  subtitulo: 'Servidores ativos no quadro de pessoal do município de Itabaiana/PB',
  breadcrumb: 'Quadro Funcional',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/quadro-funcional',

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
    { key: 'regime',                label: 'Regime',            type: 'text' },
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
      label: 'Total de Servidores',
      valueKey: 'matrícula',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de servidores no quadro funcional',
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
      tooltip: 'Média do salário líquido por servidor',
    },
  ],

  glossario: [
    { termo: 'Quadro Funcional',  definicao: 'Conjunto de servidores ativos vinculados à Administração Municipal, independente do vínculo ou regime.' },
    { termo: 'Regime Estatutário',definicao: 'Servidores concursados cujas relações com o poder público são regidas por estatuto próprio.' },
    { termo: 'Regime CLT',        definicao: 'Servidores contratados sob as regras da Consolidação das Leis do Trabalho.' },
    { termo: 'Temporário',        definicao: 'Servidor contratado por tempo determinado para atender necessidade temporária de excepcional interesse público.' },
    { termo: 'Vantagens',         definicao: 'Soma de todos os proventos e benefícios que compõem a remuneração bruta do servidor.' },
    { termo: 'Líquido',           definicao: 'Valor efetivamente recebido após dedução de descontos como INSS, IR e consignações.' },
  ],
}

export default function QuadroFuncionalPage() {
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