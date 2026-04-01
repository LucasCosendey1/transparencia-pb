// app/api/ftp-file/route.ts

import { NextRequest } from 'next/server'
import { downloadArquivoFTP } from '@/lib/ftp'

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  
  if (!path) {
    return Response.json({ error: 'Path não fornecido' }, { status: 400 })
  }

  try {
    console.log('🔍 Buscando arquivo:', path)
    
    const buffer = await downloadArquivoFTP(path)
    
    console.log('✅ Arquivo encontrado:', path)
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
      },
    })
  } catch (e: any) {
    console.error('❌ Erro:', e)
    return Response.json({ error: 'Arquivo não encontrado' }, { status: 404 })
  }
}