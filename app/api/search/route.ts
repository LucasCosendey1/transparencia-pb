import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const [rows] = await pool.query(
      `SELECT chave, titulo, caminho, description 
       FROM buttons 
       WHERE titulo LIKE ? OR description LIKE ? OR chave LIKE ?
       ORDER BY titulo ASC
       LIMIT 10`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json([])
  }
}