import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
  database: process.env.DB_NAME_Transparencia,
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    console.log('Tentativa de login:', username)

    const connection = await mysql.createConnection(dbConfig)

    const [rows]: any = await connection.execute(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    )

    await connection.end()

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    const user = rows[0]
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error: any) {
    console.error('Erro no login:', error.message)
    return NextResponse.json(
      { message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}