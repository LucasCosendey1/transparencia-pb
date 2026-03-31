import { NextRequest, NextResponse } from 'next/server'

const BASE    = 'https://api.portaldatransparencia.gov.br/api-de-dados'
const API_KEY = '6b94111ce08dfa5b19fa56eee785aec9'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())

  try {
    const allData: Record<string, unknown>[] = []
    let pagina = 1
    let temMais = true

    while (temMais) {
      const url = new URL(`${BASE}/emendas`)
      url.searchParams.set('pagina', String(pagina))
      url.searchParams.set('ano', exercicio)

      const res = await fetch(url.toString(), {
        headers: {
          'accept': '*/*',
          'chave-api-dados': API_KEY,
        },
        cache: 'no-store',
      })

      if (!res.ok) throw new Error(`Erro ${res.status}`)

      const json = await res.json()
      const data = Array.isArray(json) ? json : (json.data ?? [])

      if (data.length === 0) {
        temMais = false
      } else {
        allData.push(...data)
        pagina++
        if (data.length < 100) temMais = false
      }
    }

    // Converte valores monetários de string para number
const parsed = allData.map(row => {
  const r = { ...row }
  for (const key of ['valorEmpenhado','valorLiquidado','valorPago','valorRestoInscrito','valorRestoCancelado','valorRestoPago']) {
    if (typeof r[key] === 'string') {
      r[key] = parseFloat((r[key] as string).replace(/\./g, '').replace(',', '.')) || 0
    }
  }
  return r
})

return NextResponse.json({ data: parsed, exercicio, ultimaAtualizacao: null })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}