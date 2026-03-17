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
      'SELECT * FROM plano_eixos WHERE pagina_id = ? ORDER BY ordem ASC',
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
  const { id, nome, descricao, ordem } = await req.json()
  const conn = await pool.getConnection()
  try {
    if (id) {
      await conn.execute(
        'UPDATE plano_eixos SET nome=?, descricao=?, ordem=? WHERE id=? AND pagina_id=?',
        [nome, descricao || null, ordem ?? 0, id, pagina_id]
      )
    } else {
      const [r]: any = await conn.execute(
        'INSERT INTO plano_eixos (pagina_id, nome, descricao, ordem) VALUES (?,?,?,?)',
        [pagina_id, nome, descricao || null, ordem ?? 0]
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
    await conn.execute('DELETE FROM plano_eixos WHERE id=? AND pagina_id=?', [id, pagina_id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}