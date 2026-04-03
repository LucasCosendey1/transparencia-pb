'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'cedidos',
  titulo: 'Servidores Cedidos',
  subtitulo: 'Servidores do município de Itabaiana/PB cedidos a outros órgãos',
  breadcrumb: 'Cedidos',
  fonte: 'Sistema de Gestão de Pessoal — Elmar Tecnologia',

  apiUrl: '/api/cedidos',

  showYearFilter: false,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'matrícula', label: 'Matrícula', type: 'text' },
    { key: 'nome',      label: 'Nome',      type: 'text' },
    { key: 'cpf',       label: 'CPF',       type: 'text', hidden: true },
    { key: 'situação',  label: 'Situação',  type: 'text', chartRole: 'category' },
    { key: 'orgão',     label: 'Órgão Destino', type: 'text', chartRole: 'bar' },
  ],

  cards: [
    {
      label: 'Total Cedidos',
      valueKey: 'matrícula',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número de servidores cedidos a outros órgãos',
    },
    {
      label: 'Órgãos Distintos',
      valueKey: 'orgão',
      compute: data => new Set(data.map(r => r['orgão'])).size,
      format: 'number',
      color: 'purple',
      tooltip: 'Quantidade de órgãos que recebem servidores cedidos',
    },
  ],

  glossario: [
    { termo: 'Cedido',          definicao: 'Servidor que continua no quadro do município mas presta serviços a outro órgão ou entidade por interesse público.' },
    { termo: 'Cessão',          definicao: 'Ato administrativo pelo qual o servidor é colocado à disposição de outro órgão, mantendo seu vínculo com o órgão de origem.' },
    { termo: 'Órgão Destino',   definicao: 'Órgão ou entidade que recebe o servidor cedido e usufrui de sua força de trabalho.' },
  ],
}

export default function CedidosPage() {
  return <ApiPageLayout config={config} />
}


