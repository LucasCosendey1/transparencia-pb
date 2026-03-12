import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT chave, titulo, caminho FROM rodape'
    )
    
    await connection.end()
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Erro ao buscar rodapé:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rodapé' },
      { status: 500 }
    )
  }
}