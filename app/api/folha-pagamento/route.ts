import { NextRequest, NextResponse } from 'next/server'

const BASE    = 'https://transparencia-api.elmartecnologia.com.br/api/201089'
const VERSION = '1.0'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())
  const mes = searchParams.get('mes') ?? '01'

  try {
    const url = new URL(`${BASE}/pessoal/folha_pagamento`)
    url.searchParams.set('api-version', VERSION)
    url.searchParams.set('ano', exercicio)
    url.searchParams.set('mes', mes)

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Erro ${res.status}`)

    const json = await res.json()
    const rawData = Array.isArray(json) ? json : (json.data ?? [])
    const data = rawData.map((r: any) => ({ ...r, 'competência': `02/${exercicio}` }))


    return NextResponse.json({
      data,
      exercicio,
      ultimaAtualizacao: json.infoUltimaAtualizacao,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}