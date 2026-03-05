import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal de Transparência - Itabaiana",
  description: "Portal de Transparência da Prefeitura de Itabaiana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <div dangerouslySetInnerHTML={{ __html: `
          <div vw class="enabled">
            <div vw-access-button class="active"></div>
            <div vw-plugin-wrapper></div>
          </div>
        `}} />

        <Script id="vlibras-init" strategy="afterInteractive">
          {`
            var s = document.createElement('script');
            s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
            s.onload = function() {
              new window.VLibras.Widget('https://vlibras.gov.br/app');
            };
            document.body.appendChild(s);
          `}
        </Script>
      </body>
    </html>
  );
}