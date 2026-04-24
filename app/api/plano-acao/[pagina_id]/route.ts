// app/api/plano-acao/[pagina_id]/route.ts
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
  const body = await req.json()
  const conn = await pool.getConnection()
  try {
    // Criação — sem id
    if (!body.id) {
      const { codigo, recomendacao, acoes_adotadas, prazo, responsavel, status, beneficio, ordem } = body
      if (!codigo || !recomendacao) {
        return NextResponse.json({ error: 'Código e recomendação são obrigatórios.' }, { status: 400 })
      }
      const [result]: any = await conn.execute(
        `INSERT INTO plano_acao (pagina_id, codigo, recomendacao, acoes_adotadas, prazo, responsavel, beneficio, status, ordem)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pagina_id, codigo, recomendacao, acoes_adotadas || null, prazo || null,
         responsavel || null, beneficio || null, status || 'nao_iniciado', ordem ?? 0]
      )
      return NextResponse.json({ ok: true, id: result.insertId })
    }

    // Atualização — com id
    const { id, acoes_adotadas, prazo, responsavel, status } = body
    await conn.execute(
      `UPDATE plano_acao SET acoes_adotadas=?, prazo=?, responsavel=?, status=?
       WHERE id=? AND pagina_id=?`,
      [acoes_adotadas || null, prazo || null, responsavel || null,
       status || 'nao_iniciado', id, pagina_id]
    )
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
    await conn.execute('DELETE FROM plano_acao WHERE id=? AND pagina_id=?', [id, pagina_id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}