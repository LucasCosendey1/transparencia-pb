// app/api/licitacoes/route.ts

import { NextRequest, NextResponse } from 'next/server'

const BASE    = 'https://transparencia-api.elmartecnologia.com.br/api/201089'
const VERSION = '1.0'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())

  try {
    const url = new URL(`${BASE}/licitacao/listar`)
    url.searchParams.set('api-version', VERSION)
    url.searchParams.set('exercicio', exercicio)

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Erro ${res.status}`)

    const json = await res.json()
    const raw: Record<string, unknown>[] = Array.isArray(json) ? json : (json.data ?? [])
const data = raw.map(r => {
  const licNum = String(r['lic_num'] ?? '')
  const licTipo = String(r['lic_tipo'] ?? '').padStart(2, '0')
  const chave = `${licNum}${licTipo}`
  return {
    ...r,
    docs: `https://transparencia.elmartecnologia.com.br/Licitacao/LicitacaoView?Lic_Num=${licNum}&Lic_Tipo=${r['lic_tipo']}&ECODE=201089`,
    edital: `https://intranet.elmartecnologia.com.br/ci/uploads/201089/${chave}/Edital.pdf`,
  }
})

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
