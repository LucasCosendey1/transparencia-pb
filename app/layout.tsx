import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminInactivityLogout from '../components/AdminInactivityLogout'
import AdvancedTextEditor from '../components/AdvancedTextEditor'
import LoadingBar from '../components/LoadingBar'

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Portal de Transparência - Itabaiana/PB",
  description: "Portal de Transparência da Prefeitura Municipal de Itabaiana - Paraíba. Acesse informações públicas sobre receitas, despesas, licitações, contratos e muito mais.",
  keywords: "transparência, prefeitura, itabaiana, paraíba, licitações, contratos, governo",
  authors: [{ name: "Prefeitura Municipal de Itabaiana" }],
  openGraph: {
    title: "Portal de Transparência - Itabaiana/PB",
    description: "Acesse informações públicas da Prefeitura de Itabaiana",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Componente de logout automático por inatividade */}
        <LoadingBar />
        <AdminInactivityLogout />
        
        {/* Editor de texto avançado (lateral esquerda) */}
        <AdvancedTextEditor />
        
        {/* Conteúdo principal das páginas */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}