// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME_Transparencia,
  user: process.env.DB_USER_Transparencia,
  password: process.env.DB_PASSWORD_Transparencia,
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

    console.log('Usuários encontrados:', rows.length)

    if (rows.length === 0) {
      console.log('Usuário não encontrado')
      return NextResponse.json(
        { message: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    const user = rows[0]
    console.log('Hash do banco:', user.password_hash)
    console.log('Senha digitada:', password)
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log('Senhas batem?', passwordMatch)

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'seu_secret_aqui',
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

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}