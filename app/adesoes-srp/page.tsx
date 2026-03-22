import PdfPageLayout from '@/components/PdfPageLayout'

export default function Page() {
  return (
    <PdfPageLayout 
      paginaId="adesoes-srp"
      titulo="Adesões SRP"
      breadcrumb={[
        { label: 'Início', href: '/' },
        { label: 'Adesões SRP' }
      ]}
    />
  )
}