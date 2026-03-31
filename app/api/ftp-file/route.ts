import { NextRequest, NextResponse } from 'next/server'
import Client from 'ftp'

const FTP_CONFIG = {
  host: process.env.FTP_HOST!,
  port: parseInt(process.env.FTP_PORT || '21'),
  user: process.env.FTP_USER!,
  password: process.env.FTP_PASS!,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  
  if (!path) {
    return NextResponse.json({ error: 'Path não fornecido' }, { status: 400 })
  }

  const remotePath = `/Transparencia/uploads/${path}`
  console.log('🔍 Buscando arquivo FTP:', remotePath)

  return new Promise((resolve) => {
    const client = new Client()
    
    client.on('ready', () => {
      client.get(remotePath, (err, stream) => {
        if (err) {
          console.error('❌ Erro FTP:', err)
          client.end()
          resolve(NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 }))
          return
        }

        const chunks: Buffer[] = []
        
        stream.on('data', (chunk) => chunks.push(chunk))
        
        stream.on('end', () => {
          client.end()
          const buffer = Buffer.concat(chunks)
          
          console.log('✅ Arquivo encontrado:', path)
          
          resolve(new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
            },
          }))
        })
      })
    })

    client.on('error', (err) => {
      console.error('❌ Erro de conexão FTP:', err)
      resolve(NextResponse.json({ error: 'Erro de conexão FTP' }, { status: 500 }))
    })

    client.connect(FTP_CONFIG)
  })
}