/**
 * Importação completa do Diário Oficial
 * 
 * 1. Rode: TRUNCATE TABLE diario_oficial;
 * 2. Rode: node importar-diario.js
 */

const mysql = require('mysql2/promise')
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const DRIVE_API_KEY  = 'AIzaSyBALtqzstQ2Z23NkbqA7kpVw3oNxGxZK38'
const PASTA_RAIZ_ID  = '1rABn5XIEVuW3IjZ8xw5J_Z1NXa0904TE'
const DRIVE_BASE     = 'https://www.googleapis.com/drive/v3'

const DB_CONFIG = {
  host:     'painel.hchost.net',
  port:     3306,
  user:     'lucascosendey1',
  password: 'GC&bnpq?xje7Dz26GC&bnpq?xje7Dz26',
  database: 'itabaiana_Transparencia_Login',
}

const MESES = {
  'janeiro': '01', 'fevereiro': '02', 'marco': '03', 'março': '03',
  'abril': '04', 'maio': '05', 'junho': '06', 'julho': '07',
  'agosto': '08', 'setembro': '09', 'outubro': '10',
  'novembro': '11', 'dezembro': '12',
}

function parsearArquivo(nome, ano) {
  const semExt = nome.replace(/\.pdf$/i, '')

  // Formato 2018: "05.10" = dia.mes
  if (/^\d{2}\.\d{2}$/.test(semExt)) {
    const [dia, mes] = semExt.split('.')
    return {
      titulo: `Diário Oficial — ${dia}/${mes}/${ano}`,
      data: `${ano}-${mes}-${dia}`,
    }
  }

  // Formato novo: "FOLHA-161-01-de-Outubro" ou "A-FOLHA-161-01-de-Outubro"
  const match = semExt.match(/(\d{1,2})-de-([a-záéíóúãõç]+)/i)
  if (match) {
    const dia = String(match[1]).padStart(2, '0')
    const mesNome = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const mes = MESES[mesNome]
    if (mes) {
      return {
        titulo: semExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data: `${ano}-${mes}-${dia}`,
      }
    }
  }

  // Fallback
  return {
    titulo: semExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    data: `${ano}-01-01`,
  }
}

function urlPdf(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`
}

async function listarArquivos(pastaId, pageToken = null) {
  let url = `${DRIVE_BASE}/files?q='${pastaId}'+in+parents&key=${DRIVE_API_KEY}&fields=files(id,name,mimeType),nextPageToken&pageSize=1000`
  if (pageToken) url += `&pageToken=${pageToken}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text().then(t => t.substring(0, 200))}`)
  return res.json()
}

async function main() {
  console.log('🚀 Iniciando importação completa do Diário Oficial...\n')

  const conn = await mysql.createConnection(DB_CONFIG)
  console.log('✅ Banco conectado\n')

  // Listar pastas de anos
  const { files: pastas } = await listarArquivos(PASTA_RAIZ_ID)
  const pastasAno = pastas
    .filter(f => f.mimeType === 'application/vnd.google-apps.folder')
    .sort((a, b) => a.name.localeCompare(b.name))

  console.log(`📁 Pastas encontradas: ${pastasAno.map(p => p.name).join(', ')}\n`)

  let totalInseridos = 0
  let totalErros = 0

  for (const pasta of pastasAno) {
    const ano = pasta.name.trim()
    console.log(`📅 Processando ano ${ano}...`)

    try {
      let arquivos = []
      let pageToken = null

      do {
        const res = await listarArquivos(pasta.id, pageToken)
        arquivos = arquivos.concat(res.files || [])
        pageToken = res.nextPageToken || null
      } while (pageToken)

      const pdfs = arquivos.filter(f =>
        f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      )

      console.log(`   ${pdfs.length} PDFs encontrados`)

      for (const pdf of pdfs) {
        try {
          const { titulo, data } = parsearArquivo(pdf.name, ano)
          const url = urlPdf(pdf.id)

          await conn.execute(
            'INSERT INTO diario_oficial (titulo, data_publicacao, url, categoria) VALUES (?,?,?,?)',
            [titulo, data, url, null]
          )

          console.log(`   ✅ ${pdf.name} → ${data}`)
          totalInseridos++
        } catch (e) {
          console.log(`   ❌ ${pdf.name}: ${e.message}`)
          totalErros++
        }
      }
    } catch (e) {
      console.log(`   ❌ Pasta ${ano}: ${e.message}`)
    }

    console.log('')
  }

  // Atualiza última atualização
  await conn.execute(
    `INSERT INTO config_paginas (pagina_id, updated_at) VALUES ('diario-oficial', NOW())
     ON DUPLICATE KEY UPDATE updated_at = NOW()`
  )

  await conn.end()

  console.log('─'.repeat(50))
  console.log(`✅ Importação concluída!`)
  console.log(`   Inseridos: ${totalInseridos}`)
  console.log(`   Erros:     ${totalErros}`)
}

main().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1) })