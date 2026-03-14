import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME_Transparencia,
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
}

export async function GET(
  _req: Request,
  { params }: { params: { pagina_id: string } }
) {
  try {
    const conn = await mysql.createConnection(dbConfig)
    const [rows] = await conn.execute(
      'SELECT pdf_base64, updated_at FROM pdf_gerado WHERE pagina_id = ?',
      [params.pagina_id]
    ) as any[]
    await conn.end()

    if ((rows as any[]).length === 0) return NextResponse.json(null)
    return NextResponse.json((rows as any[])[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar PDF' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { pagina_id: string } }
) {
  try {
    const { pdf_base64 } = await req.json()
    const conn = await mysql.createConnection(dbConfig)

    await conn.execute(`
      INSERT INTO pdf_gerado (pagina_id, pdf_base64)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE pdf_base64 = VALUES(pdf_base64)
    `, [params.pagina_id, pdf_base64])

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar PDF' }, { status: 500 })
  }
}