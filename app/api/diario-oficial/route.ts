import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dataIni = searchParams.get('dataIni')
  const dataFim = searchParams.get('dataFim')
  const busca = searchParams.get('busca')
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 20

  const conn = await pool.getConnection()
  try {
    const wheres: string[] = []
    const vals: any[] = []
    if (dataIni) { wheres.push('data_publicacao >= ?'); vals.push(dataIni) }
    if (dataFim) { wheres.push('data_publicacao <= ?'); vals.push(dataFim) }
    if (busca) { wheres.push('titulo LIKE ?'); vals.push(`%${busca}%`) }
    const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : ''

    const [[{ total }]]: any = await conn.execute(
      `SELECT COUNT(*) as total FROM diario_oficial ${where}`, vals
    )
    const [rows] = await conn.execute(
      `SELECT * FROM diario_oficial ${where} ORDER BY data_publicacao DESC, id DESC LIMIT ? OFFSET ?`,
      [...vals, perPage, (page - 1) * perPage]
    )
    return NextResponse.json({ total, rows })
  } finally { conn.release() }
}

export async function POST(req: NextRequest) {
  const { id, titulo, data_publicacao, url, categoria, ordem } = await req.json()
  console.log('data_publicacao recebida:', data_publicacao)
  const conn = await pool.getConnection()
  try {
    if (id) {
      await conn.execute(
        `UPDATE diario_oficial SET titulo=?, data_publicacao=?, url=?, categoria=?, ordem=? WHERE id=?`,
        [titulo, data_publicacao, url, categoria || null, ordem ?? 0, id]
      )
    } else {
      const [r]: any = await conn.execute(
        `INSERT INTO diario_oficial (titulo, data_publicacao, url, categoria, ordem) VALUES (?,?,?,?,?)`,
        [titulo, data_publicacao, url, categoria || null, ordem ?? 0]
      )
      return NextResponse.json({ id: r.insertId })
    }
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const conn = await pool.getConnection()
  try {
    await conn.execute('DELETE FROM diario_oficial WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } finally { conn.release() }
}