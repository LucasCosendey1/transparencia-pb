import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME_Transparencia,
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
  connectTimeout: 30000,
}

export async function GET() {
  try {
    const conn = await mysql.createConnection(dbConfig)
    const [rows] = await conn.execute(
      'SELECT pagina_id, updated_at FROM config_paginas'
    ) as any[]
    await conn.end()

    const map: Record<string, string> = {}
    for (const row of rows as any[]) {
      map[row.pagina_id] = row.updated_at
    }

    return NextResponse.json(map)
  } catch (error) {
    console.error(error)
    return NextResponse.json({}, { status: 500 })
  }
}