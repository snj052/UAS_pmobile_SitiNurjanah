import { NextResponse } from 'next/server'
import { verifyCSRFToken } from '@/lib/csrf'
import { cookies } from 'next/headers'

export async function POST(req) {
  const { csrfToken, username, password } = await req.json()

  const csrfSecret = cookies().get('csrfSecret')?.value  // ✅ diperbaiki

  if (!csrfToken || !csrfSecret) {
    return NextResponse.json({ message: 'Token CSRF tidak ditemukan' }, { status: 403 })
  }

  const valid = await verifyCSRFToken(csrfToken, csrfSecret)
  if (!valid) {
    return NextResponse.json({ message: 'Token CSRF tidak valid' }, { status: 403 })
  }

  const users = [
    { username: 'admin',     password: 'admin123',     role: 'admin',     redirect: '/dashboardadmin' },
    { username: 'keuangan',  password: 'keuangan123',  role: 'keuangan',  redirect: '/dashboardkeuangan' },
  ]

  const user = users.find(
    (u) => u.username === username && u.password === password
  )

  if (user) {
    return NextResponse.json({ role: user.role, redirect: user.redirect })
  }

  return NextResponse.json({ message: 'Username atau password salah' }, { status: 401 })
}
