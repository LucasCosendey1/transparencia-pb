import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const conn = await pool.getConnection()
  try {
    const [diretrizes] = await conn.execute(
      'SELECT * FROM pms_diretrizes WHERE pagina_id = ? ORDER BY ordem ASC',
      [pagina_id]
    )
    const [objetivos] = await conn.execute(
      'SELECT * FROM pms_objetivos WHERE pagina_id = ? ORDER BY ordem ASC',
      [pagina_id]
    )
    const [metas] = await conn.execute(
      'SELECT * FROM pms_metas WHERE pagina_id = ? ORDER BY objetivo_id ASC, ordem ASC',
      [pagina_id]
    )
    return NextResponse.json({ diretrizes, objetivos, metas })
  } finally { conn.release() }
}