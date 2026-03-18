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
      'SELECT * FROM pms_graficos WHERE pagina_id = ? ORDER BY ordem ASC',
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
  const { id, titulo, tipo, filtro_diretriz_id, filtro_objetivo_id, ordem } = await req.json()
  const conn = await pool.getConnection()
  try {
    if (id) {
      await conn.execute(
        `UPDATE pms_graficos SET titulo=?, tipo=?, filtro_diretriz_id=?, filtro_objetivo_id=?, ordem=?
         WHERE id=? AND pagina_id=?`,
        [titulo, tipo, filtro_diretriz_id || null, filtro_objetivo_id || null, ordem ?? 0, id, pagina_id]
      )
    } else {
      const [r]: any = await conn.execute(
        `INSERT INTO pms_graficos (pagina_id, titulo, tipo, filtro_diretriz_id, filtro_objetivo_id, ordem)
         VALUES (?,?,?,?,?,?)`,
        [pagina_id, titulo, tipo, filtro_diretriz_id || null, filtro_objetivo_id || null, ordem ?? 0]
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
    await conn.execute('DELETE FROM pms_graficos WHERE id=? AND pagina_id=?', [id, pagina_id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}