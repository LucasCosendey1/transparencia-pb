import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url')

  if (!target) return NextResponse.json({ error: 'url obrigatória' }, { status: 400 })

  const res = await fetch(decodeURIComponent(target), {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data)
}