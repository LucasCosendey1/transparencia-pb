import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
  database: process.env.DB_NAME_Transparencia,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let connection

  try {
    connection = await mysql.createConnection(dbConfig)

    const [rows]: any = await connection.execute(
      'SELECT conteudo FROM paginas_conteudo WHERE pagina_id = ?',
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ conteudo: null })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error('Erro ao buscar conteúdo:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}