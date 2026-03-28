import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [buttons, footer, ultRows] = await Promise.all([
      pool.execute('SELECT chave, titulo, caminho, description FROM botoes'),
      pool.execute('SELECT chave, titulo, caminho FROM rodape'),
      pool.execute('SELECT pagina_id, updated_at FROM config_paginas'),
    ])

    const ultimaAtualizacao: Record<string, string> = {}
    for (const row of (ultRows as any[])[0]) {
      ultimaAtualizacao[row.pagina_id] = row.updated_at
    }

    return NextResponse.json({
      buttons: (buttons as any[])[0],
      footer: (footer as any[])[0],
      ultimaAtualizacao,
    })
  } catch (error) {
    console.error('Erro ao buscar dados da home:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}