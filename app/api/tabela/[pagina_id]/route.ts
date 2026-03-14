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
      'SELECT * FROM tabela_conteudo WHERE pagina_id = ?',
      [params.pagina_id]
    ) as any[]
    await conn.end()

    if ((rows as any[]).length === 0) return NextResponse.json(null)
    const row = (rows as any[])[0]
    return NextResponse.json({
      ...row,
      colunas: typeof row.colunas === 'string' ? JSON.parse(row.colunas) : row.colunas,
      linhas:  typeof row.linhas  === 'string' ? JSON.parse(row.linhas)  : row.linhas,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar tabela' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { pagina_id: string } }
) {
  try {
    const { titulo_tabela, texto_intro, colunas, linhas } = await req.json()
    const conn = await mysql.createConnection(dbConfig)

    await conn.execute(`
      INSERT INTO tabela_conteudo (pagina_id, titulo_tabela, texto_intro, colunas, linhas)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        titulo_tabela = VALUES(titulo_tabela),
        texto_intro   = VALUES(texto_intro),
        colunas       = VALUES(colunas),
        linhas        = VALUES(linhas)
    `, [
      params.pagina_id,
      titulo_tabela || '',
      texto_intro   || '',
      JSON.stringify(colunas || []),
      JSON.stringify(linhas  || []),
    ])

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar tabela' }, { status: 500 })
  }
}