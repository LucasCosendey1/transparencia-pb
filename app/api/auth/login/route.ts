// app/api/auth/login/route.ts

// app/api/auth/login/route.ts

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

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'

// ── LOGIN ──
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const connection = await mysql.createConnection(dbConfig)
    const [rows]: any = await connection.execute(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    )
    await connection.end()

    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return NextResponse.json({ message: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const user = rows[0]
    const token = jwt.sign(
      { id: user.id, username: user.username, nivel: user.nivel },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nome: user.nome, nivel: user.nivel }
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Erro interno', details: error.message }, { status: 500 })
  }
}

// ── CRIAR CONTA (apenas nível 1) ──
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded: any = jwt.verify(token, JWT_SECRET)

    if (decoded.nivel !== 1) {
      return NextResponse.json({ message: 'Apenas administradores nível 1 podem criar contas' }, { status: 403 })
    }

    const { username, password, nome, nivel } = await request.json()

    if (!username || !password || !nome || ![1, 2].includes(nivel)) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const connection = await mysql.createConnection(dbConfig)

    const [existing]: any = await connection.execute(
      'SELECT id FROM usuarios WHERE username = ?', [username]
    )
    if (existing.length > 0) {
      await connection.end()
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 409 })
    }

    await connection.execute(
      'INSERT INTO usuarios (username, password_hash, nome, nivel) VALUES (?, ?, ?, ?)',
      [username, password_hash, nome, nivel]
    )
    await connection.end()

    return NextResponse.json({ success: true, message: 'Conta criada com sucesso' })
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Erro interno', details: error.message }, { status: 500 })
  }
}