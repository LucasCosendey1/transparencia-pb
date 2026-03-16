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

const parseJson = (val: any, fallback: any = []) => {
  if (!val) return fallback
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return fallback } }
  return val
}

// GET — retorna todas as tabelas de uma página
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const conn = await mysql.createConnection(dbConfig)
    const [rows] = await conn.execute(
      'SELECT * FROM tabela_conteudo WHERE pagina_id = ? ORDER BY id ASC',
      [pagina_id]
    ) as any[]
    await conn.end()

    const tabelas = (rows as any[]).map(row => ({
      ...row,
      colunas:            parseJson(row.colunas,            []),
      colunas_pdf:        parseJson(row.colunas_pdf,        []),
      blocos_pdf:         parseJson(row.blocos_pdf,         []),
      blocos_exibicao:    parseJson(row.blocos_exibicao,    []),
      filtro_admin_inicio: row.filtro_admin_inicio ?? null,
      filtro_admin_fim:    row.filtro_admin_fim    ?? null,
    }))

    return NextResponse.json(tabelas)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar tabelas' }, { status: 500 })
  }
}

// POST — cria ou atualiza uma tabela
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const body = await req.json()
    const {
      nome_tabela, titulo_tabela, texto_intro, texto_final,
      colunas, modo_exibicao, colunas_pdf, blocos_pdf,
      blocos_exibicao, filtro_admin_inicio, filtro_admin_fim,
    } = body

    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(`
      INSERT INTO tabela_conteudo
        (pagina_id, nome_tabela, titulo_tabela, texto_intro, texto_final,
         colunas, modo_exibicao, colunas_pdf, blocos_pdf,
         blocos_exibicao, filtro_admin_inicio, filtro_admin_fim)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        titulo_tabela       = VALUES(titulo_tabela),
        texto_intro         = VALUES(texto_intro),
        texto_final         = VALUES(texto_final),
        colunas             = VALUES(colunas),
        modo_exibicao       = VALUES(modo_exibicao),
        colunas_pdf         = VALUES(colunas_pdf),
        blocos_pdf          = VALUES(blocos_pdf),
        blocos_exibicao     = VALUES(blocos_exibicao),
        filtro_admin_inicio = VALUES(filtro_admin_inicio),
        filtro_admin_fim    = VALUES(filtro_admin_fim)
    `, [
      pagina_id,
      nome_tabela             || 'principal',
      titulo_tabela           || '',
      texto_intro             || '',
      texto_final             || '',
      JSON.stringify(colunas          || []),
      modo_exibicao           || 'tabela',
      JSON.stringify(colunas_pdf      || []),
      JSON.stringify(blocos_pdf       || []),
      JSON.stringify(blocos_exibicao  || []),
      filtro_admin_inicio     || null,
      filtro_admin_fim        || null,
    ])
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar tabela', detail: String(error) }, { status: 500 })
  }
}

// DELETE — remove uma tabela e suas linhas
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  try {
    const { nome_tabela } = await req.json()
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(
      'DELETE FROM tabela_conteudo WHERE pagina_id = ? AND nome_tabela = ?',
      [pagina_id, nome_tabela]
    )
    await conn.execute(
      'DELETE FROM tabela_linhas WHERE pagina_id = ? AND nome_tabela = ?',
      [pagina_id, nome_tabela]
    )
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar tabela' }, { status: 500 })
  }
}