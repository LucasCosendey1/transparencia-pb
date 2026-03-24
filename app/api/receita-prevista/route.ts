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
    const [prevista, realizada] = await Promise.all([
      fetchApi('/contab/receitas/prevista', exercicio),
      fetchApi('/contab/receitas/realizada', exercicio),
    ])

    const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0')

    // Realizado no Mês — apenas lançamentos do mês atual
    const realizadoMes = realizada.reduce<Record<string, number>>((acc, r) => {
      const codigo = String(r['código'] ?? '')
      const mes = String(r['competência'] ?? '').split('/')[0]
      if (!codigo || mes !== mesAtual) return acc
      acc[codigo] = (acc[codigo] ?? 0) + (Number(r['valor']) || 0)
      return acc
    }, {})

    // Agrupado por código + mês para permitir recalculo com filtros no cliente
    // Estrutura: { "1112500101": { "01": 500, "02": 300 } }
    const realizadoPorCodigoMes = realizada.reduce<Record<string, Record<string, number>>>((acc, r) => {
      const codigo = String(r['código'] ?? '')
      const mes = String(r['competência'] ?? '').split('/')[0]
      if (!codigo || !mes) return acc
      if (!acc[codigo]) acc[codigo] = {}
      acc[codigo][mes] = (acc[codigo][mes] ?? 0) + (Number(r['valor']) || 0)
      return acc
    }, {})

    const data = prevista.map(row => {
      const codigo = String(row['cód.Receita'] ?? '')
      const porMes = realizadoPorCodigoMes[codigo] ?? {}

      // Acumulado total do exercício (sem filtro — o cliente recalcula com filtros)
      const acumuladoTotal = Object.values(porMes).reduce((a, b) => a + b, 0)

      return {
        ...row,
        'realizada no Mês': realizadoMes[codigo] ?? 0,
        'realizada Até o Mês': acumuladoTotal,
        // Campo auxiliar: cliente usa para recalcular acumulado quando filtra por mês
        _realizadoPorMes: porMes,
      }
    })

    return NextResponse.json({ data, exercicio })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}