import { generateCSRFToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const { token, secret } = await generateCSRFToken()

    // Simpan CSRF secret di cookie secara aman
    const cookieStore = cookies()
    cookieStore.set('csrfSecret', secret, {
      httpOnly: true,
      path: '/',
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // Opsional: 1 jam
    })

    return NextResponse.json({ csrfToken: token })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
