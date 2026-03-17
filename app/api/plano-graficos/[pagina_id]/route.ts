import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM plano_graficos WHERE pagina_id = ? ORDER BY ordem ASC',
      [pagina_id]
    )
    return NextResponse.json(rows)
  } finally { conn.release() }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const { id, titulo, tipo, filtro_eixo_id, filtro_status, filtro_ano, filtro_objetivo, ordem } = await req.json()
  const conn = await pool.getConnection()
  try {
    if (id) {
      await conn.execute(
        `UPDATE plano_graficos SET titulo=?, tipo=?, filtro_eixo_id=?, filtro_status=?,
         filtro_ano=?, filtro_objetivo=?, ordem=? WHERE id=? AND pagina_id=?`,
        [titulo, tipo, filtro_eixo_id || null, filtro_status || null,
         filtro_ano || null, filtro_objetivo || null, ordem ?? 0, id, pagina_id]
      )
    } else {
      const [r]: any = await conn.execute(
        `INSERT INTO plano_graficos (pagina_id, titulo, tipo, filtro_eixo_id, filtro_status, filtro_ano, filtro_objetivo, ordem)
         VALUES (?,?,?,?,?,?,?,?)`,
        [pagina_id, titulo, tipo, filtro_eixo_id || null, filtro_status || null,
         filtro_ano || null, filtro_objetivo || null, ordem ?? 0]
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
    await conn.execute('DELETE FROM plano_graficos WHERE id=? AND pagina_id=?', [id, pagina_id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}