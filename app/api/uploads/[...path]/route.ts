// app/api/uploads/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { downloadArquivoFTP } from '@/lib/ftp'
import path from 'path'

const mimeTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path: segments } = await params
    const remotePath = `uploads/${segments.join('/')}`
    const ext = path.extname(segments[segments.length - 1]).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    const buffer = await downloadArquivoFTP(remotePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': contentType === 'application/pdf'
          ? `inline; filename="${segments[segments.length - 1]}"`
          : `attachment; filename="${segments[segments.length - 1]}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e: any) {
    console.error('Erro ao servir arquivo:', e)
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
  }
}