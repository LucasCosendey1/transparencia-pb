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

// GET — retorna { pagina_id: updated_at } para todos
export async function POST(req: Request) {
  const { id, titulo, data_publicacao, url, categoria, ordem } = await req.json()
  const conn = await mysql.createConnection(dbConfig)
  try {
    if (id) {
      await conn.execute(
        `UPDATE diario_oficial SET titulo=?, data_publicacao=?, url=?, categoria=?, ordem=? WHERE id=?`,
        [titulo, data_publicacao, url, categoria || null, ordem ?? 0, id]
      )
    } else {
      const [r]: any = await conn.execute(
        `INSERT INTO diario_oficial (titulo, data_publicacao, url, categoria, ordem) VALUES (?,?,?,?,?)`,
        [titulo, data_publicacao, url, categoria || null, ordem ?? 0]
      )
      await conn.execute(
        `INSERT INTO config_paginas (pagina_id, updated_at) VALUES ('diario-oficial', NOW())
         ON DUPLICATE KEY UPDATE updated_at = NOW()`
      )
      await conn.end()
      return NextResponse.json({ id: r.insertId })
    }
    await conn.execute(
      `INSERT INTO config_paginas (pagina_id, updated_at) VALUES ('diario-oficial', NOW())
       ON DUPLICATE KEY UPDATE updated_at = NOW()`
    )
    await conn.end()
    return NextResponse.json({ ok: true })
  } catch(e) { await conn.end(); throw e }
}