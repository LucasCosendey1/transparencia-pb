import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME_Transparencia,
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
  connectTimeout: 30000,
}

// GET — retorna todos os PDFs da página, ou um específico via ?nome_pdf=xxx
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const url = new URL(req.url)
  const nome_pdf = url.searchParams.get('nome_pdf')

  try {
    const conn = await mysql.createConnection(dbConfig)
    let rows: any[]

    if (nome_pdf) {
      const [r] = await conn.execute(
        'SELECT nome_pdf, pdf_base64, updated_at FROM pdf_gerado WHERE pagina_id = ? AND nome_pdf = ?',
        [pagina_id, nome_pdf]
      ) as any[]
      rows = r
    } else {
      const [r] = await conn.execute(
        'SELECT nome_pdf, pdf_base64, updated_at FROM pdf_gerado WHERE pagina_id = ? ORDER BY updated_at DESC',
        [pagina_id]
      ) as any[]
      rows = r
    }

    await conn.end()

    if (nome_pdf) {
      return NextResponse.json(rows.length > 0 ? rows[0] : null)
    }
    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar PDF' }, { status: 500 })
  }
}

// POST — salva ou atualiza um PDF (upsert por pagina_id + nome_pdf)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const { pdf_base64, nome_pdf } = await req.json()
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(`
      INSERT INTO pdf_gerado (pagina_id, nome_pdf, pdf_base64)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE pdf_base64 = VALUES(pdf_base64)
    `, [pagina_id, nome_pdf || 'principal', pdf_base64])
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar PDF' }, { status: 500 })
  }
}

// DELETE — remove um PDF específico
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const { nome_pdf } = await req.json()
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(
      'DELETE FROM pdf_gerado WHERE pagina_id = ? AND nome_pdf = ?',
      [pagina_id, nome_pdf]
    )
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar PDF' }, { status: 500 })
  }
}