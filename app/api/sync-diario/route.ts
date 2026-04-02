import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY!
const PASTA_RAIZ_ID = process.env.DRIVE_PASTA_RAIZ_ID!
const CRON_SECRET   = process.env.CRON_SECRET!
const DRIVE_BASE    = 'https://www.googleapis.com/drive/v3'

const MESES: Record<string, string> = {
  'janeiro': '01', 'fevereiro': '02', 'marco': '03', 'março': '03',
  'abril': '04', 'maio': '05', 'junho': '06', 'julho': '07',
  'agosto': '08', 'setembro': '09', 'outubro': '10',
  'novembro': '11', 'dezembro': '12',
}

function parsearArquivo(nome: string, ano: string) {
  const semExt = nome.replace(/\.pdf$/i, '')
  console.log(`🔍 Parseando: "${semExt}"`)

  // Formato 2018: "05.10" = dia.mes
  if (/^\d{2}\.\d{2}$/.test(semExt)) {
    const [dia, mes] = semExt.split('.')
    console.log(`✅ Formato 2018 detectado: ${dia}/${mes}/${ano}`)
    return {
      titulo: `Diário Oficial — ${dia}/${mes}/${ano}`,
      data: `${ano}-${mes}-${dia}`,
    }
  }

  // Procura por padrão: qualquer coisa + DD de MÊS (ignora números antes)
  const match = semExt.match(/[^\d]*(\d{1,2})\s+de\s+([a-záéíóúãõç]+)/i)
  console.log(`🔍 Match resultado:`, match)
  
  if (match) {
    const dia = String(match[1]).padStart(2, '0')
    const mesNome = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    console.log(`📅 Dia: ${dia}, Mês nome: ${mesNome}`)
    
    const mes = MESES[mesNome]
    console.log(`📅 Mês código: ${mes}`)
    
    if (mes) {
      const resultado = {
        titulo: semExt.replace(/-/g, ' ').replace(/\s+/g, ' ').trim(),
        data: `${ano}-${mes}-${dia}`,
      }
      console.log(`✅ Data final: ${resultado.data}`)
      return resultado
    }
  }

  console.log(`⚠️ Nenhum padrão encontrado, usando data padrão: ${ano}-01-01`)
  
  return {
    titulo: semExt.replace(/-/g, ' ').replace(/\s+/g, ' ').trim(),
    data: `${ano}-01-01`,
  }
}

function urlPdf(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`
}

async function listarArquivos(pastaId: string, pageToken?: string) {
  let url = `${DRIVE_BASE}/files?q='${pastaId}'+in+parents&key=${DRIVE_API_KEY}&fields=files(id,name,mimeType),nextPageToken&pageSize=1000`
  if (pageToken) url += `&pageToken=${pageToken}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Drive API ${res.status}`)
  return res.json()
}

export async function GET(req: NextRequest) {
  // Verifica segredo do cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const conn = await pool.getConnection()
  let inseridos = 0
  let erros = 0

  try {
    // Listar pastas de anos
    const { files: pastas } = await listarArquivos(PASTA_RAIZ_ID)
    console.log('📁 Total de pastas encontradas:', pastas.length)
    console.log('📁 Pastas:', pastas.map((p: any) => p.name))

    const pastasAno = pastas
      .filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder')
      .filter((f: any) => /^\d{4}$/.test(f.name.trim()))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))

    console.log('📅 Pastas de anos válidas:', pastasAno.map((p: any) => p.name))

    for (const pasta of pastasAno) {
      const ano = pasta.name.trim()
      console.log(`\n📅 Processando ano: ${ano}`)

      try {
        let arquivos: any[] = []
        let pageToken: string | undefined

        do {
          const res = await listarArquivos(pasta.id, pageToken)
          arquivos = arquivos.concat(res.files || [])
          pageToken = res.nextPageToken
        } while (pageToken)

        const pdfs = arquivos.filter((f: any) =>
          f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        )

        console.log(`📄 PDFs encontrados em ${ano}:`, pdfs.length)
        console.log(`📄 Primeiros 5 PDFs:`, pdfs.slice(0, 5).map((p: any) => p.name))

        for (const pdf of pdfs) {
          try {
            const { titulo, data } = parsearArquivo(pdf.name, ano)
            console.log(`🔍 Processando: ${pdf.name} → ${titulo} (${data})`)
            
            const url = urlPdf(pdf.id)

            const [existente]: any = await conn.execute(
  'SELECT id FROM diario_oficial WHERE url LIKE ?',
  [`%${pdf.id}%`]
                )

                if (existente.length === 0) {
                  await conn.execute(
                    'INSERT INTO diario_oficial (titulo, data_publicacao, url, categoria) VALUES (?,?,?,?)',
                    [titulo, data, url, null]
                  )
                  console.log(`✅ Inserido: ${titulo}`)
                  inseridos++
                } else {
                  // ATUALIZA a data se estiver diferente
                  await conn.execute(
                    'UPDATE diario_oficial SET data_publicacao = ?, titulo = ? WHERE id = ?',
                    [data, titulo, existente[0].id]
                  )
                  console.log(`🔄 Atualizado: ${titulo}`)
                }

            if (existente.length === 0) {
              await conn.execute(
                'INSERT INTO diario_oficial (titulo, data_publicacao, url, categoria) VALUES (?,?,?,?)',
                [titulo, data, url, null]
              )
              console.log(`✅ Inserido: ${titulo}`)
              inseridos++
            } else {
              console.log(`⏭️  Já existe: ${titulo}`)
            }
          } catch (err) {
            console.error(`❌ Erro ao processar ${pdf.name}:`, err)
            erros++
          }
        }
      } catch (err) {
        console.error(`❌ Erro ao processar pasta ${ano}:`, err)
      }
    }

    // Atualiza última atualização
    if (inseridos > 0) {
      await conn.execute(
        `INSERT INTO config_paginas (pagina_id, updated_at) VALUES ('diario-oficial', NOW())
         ON DUPLICATE KEY UPDATE updated_at = NOW()`
      )
    }

    console.log(`\n✅ Sincronização concluída: ${inseridos} inseridos, ${erros} erros`)

    return NextResponse.json({
      ok: true,
      inseridos,
      erros,
      executadoEm: new Date().toISOString(),
    })
  } catch (err) {
    console.error('❌ Erro fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  } finally {
    conn.release()
  }
}