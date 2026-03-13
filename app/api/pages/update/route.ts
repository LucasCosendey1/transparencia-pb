import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
  database: process.env.DB_NAME_Transparencia,
}

export async function PUT(request: Request) {
  let connection

  try {
    const { pagina_id, conteudo } = await request.json()

    console.log('Salvando página:', pagina_id)

    connection = await mysql.createConnection(dbConfig)

    await connection.execute(
      `INSERT INTO paginas_conteudo (pagina_id, conteudo) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE conteudo = VALUES(conteudo)`,
      [pagina_id, conteudo]
    )

    console.log('✅ Salvo com sucesso!')

    return NextResponse.json({ success: true, message: 'Conteúdo salvo com sucesso' })
  } catch (error: any) {
    console.error('❌ Erro ao salvar:', error.message)
    return NextResponse.json({ 
      error: 'Erro ao salvar', 
      details: error.message 
    }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}