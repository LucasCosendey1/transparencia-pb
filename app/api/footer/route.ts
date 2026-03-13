import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_USER_Transparencia,
  database: process.env.DB_NAME_Transparencia,
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