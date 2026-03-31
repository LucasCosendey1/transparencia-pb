//lib/ftp.ts

import * as ftp from 'basic-ftp'
import { Readable } from 'stream'

interface FTPConfig {
  host: string
  user: string
  password: string
  port: number
  secure: boolean
  remoteBase: string
}

function getConfig(): FTPConfig {
  const host = process.env.FTP_HOST
  const user = process.env.FTP_USER
  const password = process.env.FTP_PASS

  if (!host || !user || !password) {
    throw new Error('Variáveis FTP_HOST, FTP_USER e FTP_PASS são obrigatórias no .env')
  }

  return {
    host,
    user,
    password,
    port: parseInt(process.env.FTP_PORT || '21'),
    secure: process.env.FTP_SECURE === 'true',
    remoteBase: process.env.FTP_REMOTE_BASE || '/Transparencia',
  }
}

async function getClient(): Promise<ftp.Client> {
  const config = getConfig()
  const client = new ftp.Client()
  client.ftp.verbose = process.env.NODE_ENV === 'development'

  await client.access({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    secure: config.secure,
    secureOptions: config.secure ? { rejectUnauthorized: false } : undefined,
  })

  return client
}

/**
 * Envia um buffer para o servidor FTP
 * @param buffer - conteúdo do arquivo
 * @param remotePath - caminho relativo (ex: "uploads/lista-medicamentos/pdf/relatorio.pdf")
 * @returns URL pública do arquivo
 */
export async function uploadArquivoFTP(
  buffer: Buffer,
  remotePath: string
): Promise<string> {
  const config = getConfig()
  const client = await getClient()

  try {
    const fullRemotePath = `${config.remoteBase}/${remotePath}`
    const dir = fullRemotePath.substring(0, fullRemotePath.lastIndexOf('/'))

    // Cria diretórios recursivamente
    await client.ensureDir(dir)

    // Faz upload
    const stream = Readable.from(buffer)
    await client.uploadFrom(stream, fullRemotePath)

    // Monta URL pública
    return `/api/${remotePath}`
  } finally {
    client.close()
  }
}

/**
 * Lista arquivos de um diretório remoto
 * @param remotePath - caminho relativo (ex: "uploads/lista-medicamentos/pdf")
 */
export async function listarArquivosFTP(remotePath: string): Promise<ftp.FileInfo[]> {
  const config = getConfig()
  const client = await getClient()

  try {
    const fullRemotePath = `${config.remoteBase}/${remotePath}`

    try {
      return await client.list(fullRemotePath)
    } catch {
      // Diretório não existe ainda
      return []
    }
  } finally {
    client.close()
  }
}

/**
 * Deleta um arquivo do servidor FTP
 * @param remotePath - caminho relativo (ex: "uploads/lista-medicamentos/pdf/relatorio.pdf")
 */
export async function deletarArquivoFTP(remotePath: string): Promise<void> {
  const config = getConfig()
  const client = await getClient()

  try {
    const fullRemotePath = `${config.remoteBase}/${remotePath}`
    await client.remove(fullRemotePath)
  } finally {
    client.close()
  }
}

/**
 * Testa a conexão FTP (útil para diagnóstico)
 */
export async function testarConexaoFTP(): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    const client = await getClient()
    const config = getConfig()
    const lista = await client.list(config.remoteBase)
    client.close()
    return {
      sucesso: true,
      mensagem: `Conectado! ${lista.length} item(s) no diretório ${config.remoteBase}`,
    }
  } catch (e: any) {
    return {
      sucesso: false,
      mensagem: `Erro: ${e.message}`,
    }
  }
}

export async function downloadArquivoFTP(remotePath: string): Promise<Buffer> {
  const config = getConfig()
  console.log('🔍 [FTP] Conectando...', config.host)
  
  const client = await getClient()
  console.log('✅ [FTP] Conectado!')

  try {
    const fullRemotePath = `${config.remoteBase}/${remotePath}`
    console.log('🔍 [FTP] Baixando:', fullRemotePath)
    
    const { PassThrough } = await import('stream')
    const passThrough = new PassThrough()
    const chunks: Buffer[] = []
    
    passThrough.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
      console.log('📦 [FTP] Chunk recebido:', chunk.length, 'bytes')
    })
    
    await client.downloadTo(passThrough, fullRemotePath)
    
    const buffer = Buffer.concat(chunks)
    console.log('✅ [FTP] Download completo! Total:', buffer.length, 'bytes')
    
    return buffer
  } catch (e: any) {
    console.error('❌ [FTP] Erro no download:', e.message)
    throw e
  } finally {
    client.close()
    console.log('🔌 [FTP] Conexão fechada')
  }
}