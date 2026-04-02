// app/api/anexo-juridico/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://sapl.itabaiana.pb.leg.br/api/norma/anexonormajuridica/'
const API_KEY = '6b94111ce08dfa5b19fa56eee785aec9'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const exercicio = searchParams.get('exercicio') ?? String(new Date().getFullYear())

  try {
    const url = new URL(BASE_URL)
    url.searchParams.set('page_size', '1000')
    
    const res = await fetch(url.toString(), {
      headers: { 
        'Accept': 'application/json',
        'chave-api-dados': API_KEY,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Erro ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()
    let data = json.results ?? []

    // Filtra por ano se houver dados
    if (exercicio && data.length > 0) {
      data = data.filter((item: any) => 
        item.ano === Number(exercicio)
      )
    }

    return NextResponse.json({
      data,
      exercicio,
      ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
      pagination: json.pagination,
      total: data.length,
    })
  } catch (e: unknown) {
    console.error('Erro na API anexo-juridico:', e)
    const message = e instanceof Error ? e.message : 'Erro ao buscar dados'
    return NextResponse.json({ 
      error: message,
      data: [],
      exercicio,
    }, { status: 500 })
  }
}
