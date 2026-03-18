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
      'SELECT * FROM plano_acao WHERE pagina_id = ? ORDER BY ordem ASC',
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
  const { id, acoes_adotadas, prazo, responsavel, status } = await req.json()
  const conn = await pool.getConnection()
  try {
    await conn.execute(
      `UPDATE plano_acao SET acoes_adotadas=?, prazo=?, responsavel=?, status=?
       WHERE id=? AND pagina_id=?`,
      [acoes_adotadas || null, prazo || null, responsavel || null,
       status || 'nao_iniciado', id, pagina_id]
    )
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}