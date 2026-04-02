// app/anexo-juridico/page.tsx

'use client'

import { useState } from 'react'
import ApiPageLayout, { ApiPageConfig } from '@/components/ApiPageLayout'

const config: ApiPageConfig = {
  paginaId: 'anexo-juridico',
  titulo: 'Anexos de Normas Jurídicas',
  subtitulo: 'Documentos e anexos relacionados às normas jurídicas do município de Itabaiana/PB',
  breadcrumb: 'Anexo Jurídico',
  fonte: 'Sistema de Apoio ao Processo Legislativo (SAPL) - Câmara Municipal de Itabaiana/PB',

  apiUrl: '/api/anexo-juridico',

  showYearFilter: true,
  showMonthFilter: false,
  showSearchFilter: true,
  showMovimentoFilter: false,

  columns: [
    { key: 'id',              label: 'ID',              type: 'number' },
    { key: 'ano',             label: 'Ano',             type: 'number', chartRole: 'category' },
    { key: 'assunto_anexo',   label: 'Assunto',         type: 'text' },
    { key: 'norma',           label: 'Norma',           type: 'number' },
    { key: 'anexo_arquivo',   label: 'Arquivo',         type: 'link', tooltip: 'Link para download do anexo' },
    { key: '__str__',         label: 'Descrição',       type: 'text', hidden: true },
  ],

  cards: [
    {
      label: 'Total de Anexos',
      valueKey: 'id',
      compute: data => data.length,
      format: 'number',
      color: 'blue',
      tooltip: 'Número total de anexos de normas jurídicas',
    },
    {
      label: 'Anos com Registro',
      valueKey: 'ano',
      compute: data => {
        const anos = new Set(data.map(item => item.ano))
        return anos.size
      },
      format: 'number',
      color: 'green',
      tooltip: 'Quantidade de anos com anexos registrados',
    },
  ],

  glossario: [
    { 
      termo: 'Norma Jurídica', 
      definicao: 'Ato normativo aprovado pela Câmara Municipal, como leis, decretos legislativos, resoluções e emendas.' 
    },
    { 
      termo: 'Anexo de Norma', 
      definicao: 'Documento complementar à norma jurídica, contendo informações detalhadas, tabelas, mapas ou outros elementos necessários à sua aplicação.' 
    },
    { 
      termo: 'SAPL', 
      definicao: 'Sistema de Apoio ao Processo Legislativo - plataforma digital para gestão e transparência das atividades legislativas.' 
    },
  ],
}

export default function AnexoJuridicoPage() {
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