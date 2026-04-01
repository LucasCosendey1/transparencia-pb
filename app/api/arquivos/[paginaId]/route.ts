// Caminho: app/api/arquivos/[paginaId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { listarArquivosFTP, deletarArquivoFTP } from '@/lib/ftp'
import path from 'path'

interface ArquivoInfo {
  nome: string
  tipo: string
  tamanho: number
  categoria: string
  url: string
  criado_em: string
}

const CATEGORIAS = ['geral', 'pdf', 'imagem', 'doc', 'planilha']

const tipoMap: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv', '.txt': 'text/plain',
  '.json': 'application/json', '.zip': 'application/zip',
}

// GET /api/arquivos/[paginaId]?categoria=pdf
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paginaId: string }> }
) {
  try {
    const { paginaId } = await params
    const { searchParams } = new URL(req.url)
    const categoriaFiltro = searchParams.get('categoria')
    const publicUrl = process.env.PUBLIC_URL || 'https://transparencia.itabaiana.pb.gov.br'

    const categoriasParaBuscar = categoriaFiltro ? [categoriaFiltro] : CATEGORIAS

    const arquivos: ArquivoInfo[] = []

    for (const cat of categoriasParaBuscar) {
      const remotePath = `uploads/${paginaId}/${cat}`
      const lista = await listarArquivosFTP(remotePath)

      for (const item of lista) {
        if (item.isDirectory) continue
        const ext = path.extname(item.name).toLowerCase()

        arquivos.push({
          nome: item.name,
          tipo: tipoMap[ext] || 'application/octet-stream',
          tamanho: item.size,
          categoria: cat,
          url: `${publicUrl}/uploads/${paginaId}/${cat}/${item.name}`,
          criado_em: item.modifiedAt?.toISOString() || new Date().toISOString(),
        })
      }
    }

    arquivos.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())

    return NextResponse.json(arquivos)
  } catch (e: any) {
    console.error('Erro ao listar arquivos FTP:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/arquivos/[paginaId] body: { nome, categoria }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ paginaId: string }> }
) {
  try {
    const { paginaId } = await params
    const { nome, categoria } = await req.json()

    if (!nome || !categoria) {
      return NextResponse.json({ error: 'nome e categoria são obrigatórios.' }, { status: 400 })
    }

    const remotePath = `uploads/${paginaId}/${categoria}/${nome}`
    await deletarArquivoFTP(remotePath)

    return NextResponse.json({ sucesso: true, deletado: nome })
  } catch (e: any) {
    console.error('Erro ao deletar FTP:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}