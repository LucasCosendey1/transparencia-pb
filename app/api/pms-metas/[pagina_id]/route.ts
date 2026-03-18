import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pagina_id: string }> }
) {
  const { pagina_id } = await params
  const {
    id,
    meta_2026, meta_2027, meta_2028, meta_2029,
    realizado_2026, realizado_2027, realizado_2028, realizado_2029,
    data_realizado_2026, data_realizado_2027, data_realizado_2028, data_realizado_2029,
    obs_2026, obs_2027, obs_2028, obs_2029,
  } = await req.json()
  const conn = await pool.getConnection()
  try {
    await conn.execute(
      `UPDATE pms_metas SET
        meta_2026=?, meta_2027=?, meta_2028=?, meta_2029=?,
        realizado_2026=?, realizado_2027=?, realizado_2028=?, realizado_2029=?,
        data_realizado_2026=?, data_realizado_2027=?, data_realizado_2028=?, data_realizado_2029=?,
        obs_2026=?, obs_2027=?, obs_2028=?, obs_2029=?
       WHERE id=? AND pagina_id=?`,
      [
        meta_2026 ?? null, meta_2027 ?? null, meta_2028 ?? null, meta_2029 ?? null,
        realizado_2026 ?? null, realizado_2027 ?? null, realizado_2028 ?? null, realizado_2029 ?? null,
        data_realizado_2026 ?? null, data_realizado_2027 ?? null, data_realizado_2028 ?? null, data_realizado_2029 ?? null,
        obs_2026 ?? null, obs_2027 ?? null, obs_2028 ?? null, obs_2029 ?? null,
        id, pagina_id,
      ]
    )
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}