// Caminho: app/api/upload-arquivo/route.ts

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { uploadArquivoFTP } from '@/lib/ftp'

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'text/plain', 'application/json',
  'application/zip', 'application/x-rar-compressed',
]

function slugify(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const arquivo = formData.get('arquivo') as File | null
    const paginaId = formData.get('pagina_id') as string | null
    const categoria = (formData.get('categoria') as string) || 'geral'

    if (!arquivo || !paginaId) {
      return NextResponse.json({ error: 'Arquivo e pagina_id são obrigatórios.' }, { status: 400 })
    }

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      return NextResponse.json({ error: `Tipo não permitido: ${arquivo.type}` }, { status: 400 })
    }

    const ext = path.extname(arquivo.name) || ''
    const baseName = slugify(path.basename(arquivo.name, ext))
    const timestamp = Date.now()
    const nomeArquivo = `${baseName}-${timestamp}${ext}`

    const remotePath = `uploads/${slugify(paginaId)}/${slugify(categoria)}/${nomeArquivo}`

    const buffer = Buffer.from(await arquivo.arrayBuffer())
    const urlPublica = await uploadArquivoFTP(buffer, remotePath)

    return NextResponse.json({
      sucesso: true,
      arquivo: {
        nome: arquivo.name,
        nome_salvo: nomeArquivo,
        tipo: arquivo.type,
        tamanho: arquivo.size,
        categoria,
        url: urlPublica,
        caminho_remoto: remotePath,
        criado_em: new Date().toISOString(),
      },
    })
  } catch (e: any) {
    console.error('Erro no upload FTP:', e)
    return NextResponse.json({ error: 'Erro no upload.', detalhe: e.message }, { status: 500 })
  }
}