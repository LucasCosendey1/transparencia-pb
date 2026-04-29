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
    const raw: Record<string, unknown>[] = Array.isArray(json) ? json : (json.data ?? [])

    const filtered = raw.filter((r: Record<string, unknown>) => {
      const assinatura = String(r['assinatura'] ?? '')
      return assinatura.startsWith(exercicio)
    })

    const data = filtered.map(r => {
      const licNum = String(r['lic_num'] ?? '')
      const licTipo = String(r['lic_tipo'] ?? '').padStart(2, '0')
      const chave = `${licNum}${licTipo}`
      const nContrato = String(r['n_contrato'] ?? '')
      return {
        ...r,
        contrato: `https://transparencia.elmartecnologia.com.br/uploads/201089/${chave}/Contrato - ${nContrato}.pdf`,
        extrato: `https://transparencia.elmartecnologia.com.br/uploads/201089/${chave}/Extrato do Contrato - ${nContrato}.pdf`,
        n_licitacao: r['n_licitacao'],
        n_licitacao_url: `https://transparencia.elmartecnologia.com.br/Licitacao/LicitacaoView?Lic_Num=${licNum}&Lic_Tipo=${r['lic_tipo']}&ECODE=201089`,
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
