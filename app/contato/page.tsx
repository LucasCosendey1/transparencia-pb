// app/contato/page.tsx
import PdfPageLayout from '@/components/PdfPageLayout'

export default function Page() {
  return (
    <PdfPageLayout 
      paginaId="contato"
      titulo="Contato"
      breadcrumb="Contato"
    />
  )
}
