// app/inscritos-divida-ativa/page.tsx

import PdfPageLayout from '@/components/PdfPageLayout'

export default function Page() {
  return (
    <PdfPageLayout 
      paginaId="inscritos-divida-ativa"
      titulo="Inscritos em Dívida Ativa"
      breadcrumb="Inscritos em Dívida Ativa"
    />
  )
}
