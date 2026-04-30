//app/api/receita-realizada/route.ts

import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://transparencia-api.elmartecnologia.com.br/api/201089'
const VERSION = '1.0'

async function fetchApi(path: string, exercicio: string): Promise<Record<string, unknown>[]> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api-version', VERSION)
  url.searchParams.set('exercicio', exercicio)

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Erro ${res.status} em ${path}`)

  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())

  try {
    const raw = await fetchApi('/contab/receitas/realizada', exercicio)
    const data = raw.map(r => ({
      ...r,
      código: r['código'],
      código_url: `https://transparencia.elmartecnologia.com.br/Contab/ReceitaView?CodReceita=${r['codReceita']}&ecode=201089&cpt=${r['cpt']}&sequencia=${r['sequencia']}&Data=${encodeURIComponent(String(r['data']).replace(/T.*/, ' 00:00:00'))}`,
    }))
    return NextResponse.json({ data, exercicio })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}