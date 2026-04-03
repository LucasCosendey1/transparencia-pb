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

// GET — busca linhas com filtro opcional de data e busca textual
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const url = new URL(req.url)
  const nome_tabela = url.searchParams.get('nome_tabela') || 'principal'
  const data_inicio = url.searchParams.get('data_inicio')
  const data_fim    = url.searchParams.get('data_fim')

  try {
    const conn = await mysql.createConnection(dbConfig)

    let query = 'SELECT * FROM tabela_linhas WHERE pagina_id = ? AND nome_tabela = ?'
    const queryParams: any[] = [pagina_id, nome_tabela]

    if (data_inicio) {
      query += ' AND created_at >= ?'
      queryParams.push(data_inicio + ' 00:00:00')
    }
    if (data_fim) {
      query += ' AND created_at <= ?'
      queryParams.push(data_fim + ' 23:59:59')
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await conn.execute(query, queryParams) as any[]
    await conn.end()

    const linhas = (rows as any[]).map(row => ({
      id: row.id,
      dados: typeof row.dados === 'string' ? JSON.parse(row.dados) : row.dados,
      created_at: row.created_at,
    }))

    return NextResponse.json(linhas)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar linhas' }, { status: 500 })
  }
}

// POST — adiciona uma ou várias linhas
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const { nome_tabela, linhas } = await req.json()
    const conn = await mysql.createConnection(dbConfig)

    for (const linha of linhas) {
      await conn.execute(
        'INSERT INTO tabela_linhas (pagina_id, nome_tabela, dados) VALUES (?, ?, ?)',
        [pagina_id, nome_tabela || 'principal', JSON.stringify(linha)]
      )
    }

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao inserir linhas' }, { status: 500 })
  }
}

// PUT — atualiza uma linha pelo id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  await params
  try {
    const { id, dados } = await req.json()
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(
      'UPDATE tabela_linhas SET dados = ? WHERE id = ?',
      [JSON.stringify(dados), id]
    )
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar linha' }, { status: 500 })
  }
}

// DELETE — remove linha pelo id
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const body = await req.json()
    const conn = await mysql.createConnection(dbConfig)

    if (body.todos && body.nome_tabela) {
      await conn.execute(
        'DELETE FROM tabela_linhas WHERE pagina_id = ? AND nome_tabela = ?',
        [pagina_id, body.nome_tabela]
      )
    } else {
      await conn.execute('DELETE FROM tabela_linhas WHERE id = ?', [body.id])
    }

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar linha' }, { status: 500 })
  }
}