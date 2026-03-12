import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

export async function PUT(request: Request) {
  try {
    const { chave, titulo, caminho } = await request.json()
    
    const connection = await mysql.createConnection(dbConfig)
    
    await connection.execute(
      'UPDATE rodape SET titulo = ?, caminho = ? WHERE chave = ?',
      [titulo, caminho, chave]
    )
    
    await connection.end()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar rodapé:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar rodapé' },
      { status: 500 }
    )
  }
}