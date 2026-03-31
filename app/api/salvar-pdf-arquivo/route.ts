// Caminho: app/api/salvar-pdf-arquivo/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { uploadArquivoFTP } from '@/lib/ftp'

function slugify(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

// POST /api/salvar-pdf-arquivo
// body: { pagina_id, nome_pdf, pdf_base64 }
export async function POST(req: NextRequest) {
  try {
    const { pagina_id, nome_pdf, pdf_base64 } = await req.json()

    if (!pagina_id || !nome_pdf || !pdf_base64) {
      return NextResponse.json({ error: 'pagina_id, nome_pdf e pdf_base64 são obrigatórios.' }, { status: 400 })
    }

    const nomeArquivo = `${slugify(nome_pdf)}.pdf`
    const remotePath = `uploads/${slugify(pagina_id)}/pdf/${nomeArquivo}`

    const buffer = Buffer.from(pdf_base64, 'base64')
    const urlPublica = await uploadArquivoFTP(buffer, remotePath)

    return NextResponse.json({
      sucesso: true,
      arquivo: {
        nome: nomeArquivo,
        url: urlPublica,
        tamanho: buffer.length,
        criado_em: new Date().toISOString(),
      },
    })
  } catch (e: any) {
    console.error('Erro ao salvar PDF via FTP:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}