import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const { searchParams } = new URL(req.url)
  const eixo_id = searchParams.get('eixo_id')

  const conn = await pool.getConnection()
  try {
    let query = `
      SELECT m.*, e.nome AS eixo_nome
      FROM plano_metas m
      JOIN plano_eixos e ON e.id = m.eixo_id
      WHERE m.pagina_id = ?
    `
    const args: any[] = [pagina_id]
    if (eixo_id) { query += ' AND m.eixo_id = ?'; args.push(eixo_id) }
    query += ' ORDER BY m.eixo_id ASC, m.id ASC'

    const [rows] = await conn.execute(query, args)
    return NextResponse.json(rows)
  } finally { conn.release() }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const { id, eixo_id, objetivo_geral, objetivo_especifico, acao, indicador, meta_descricao, status, situacao_original, ano_2025, ano_2026, ano_2027, ano_2028 } = await req.json()
  const conn = await pool.getConnection()
  try {
    if (id) {
      await conn.execute(
        `UPDATE plano_metas SET eixo_id=?, objetivo_geral=?, objetivo_especifico=?, acao=?,
        indicador=?, meta_descricao=?, status=?, situacao_original=?,
        ano_2025=?, ano_2026=?, ano_2027=?, ano_2028=? WHERE id=? AND pagina_id=?`
        ,
        [eixo_id, objetivo_geral || null, objetivo_especifico || null, acao,
        indicador || null, meta_descricao || null, status || 'nao_iniciado', situacao_original || null,
        ano_2025 ? 1 : 0, ano_2026 ? 1 : 0, ano_2027 ? 1 : 0, ano_2028 ? 1 : 0, id, pagina_id]
      )
    } else {
      const [r]: any = await conn.execute(
       `INSERT INTO plano_metas (pagina_id, eixo_id, objetivo_geral, objetivo_especifico, acao, indicador, meta_descricao, status, situacao_original, ano_2025, ano_2026, ano_2027, ano_2028)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [pagina_id, eixo_id, objetivo_geral || null, objetivo_especifico || null, acao,
        indicador || null, meta_descricao || null, status || 'nao_iniciado', situacao_original || null,
        ano_2025 ? 1 : 0, ano_2026 ? 1 : 0, ano_2027 ? 1 : 0, ano_2028 ? 1 : 0]
      )
      return NextResponse.json({ id: r.insertId })
    }
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const { id } = await req.json()
  const conn = await pool.getConnection()
  try {
    await conn.execute('DELETE FROM plano_metas WHERE id=? AND pagina_id=?', [id, pagina_id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}