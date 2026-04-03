// app/api/avisos-licitacao/route.ts

import { NextRequest, NextResponse } from 'next/server'

const BASE    = 'https://transparencia-api.elmartecnologia.com.br/api/201089'
const VERSION = '1.0'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())

  try {
    const url = new URL(`${BASE}/licitacao/avisos`)
    url.searchParams.set('api-version', VERSION)

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Erro ${res.status}`)

    const json = await res.json()
    const data = Array.isArray(json) ? json : (json.data ?? [])

    // Filtra pelo exercício
    const filtered = data.filter((r: Record<string, unknown>) => {
      const assinatura = String(r['assinatura'] ?? '')
      return assinatura.startsWith(exercicio)
    })

    return NextResponse.json({
      data: filtered,
      exercicio,
      ultimaAtualizacao: json.infoUltimaAtualizacao,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}