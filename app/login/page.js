'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/csrf-token', {
          credentials: 'include', // <--- WAJIB ditambahkan
        })
        if (!res.ok) {
          throw new Error(`Token fetch failed: ${res.status}`)
        }
  
        const data = await res.json()
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
          localStorage.setItem('csrfToken', data.csrfToken)
        } else {
          throw new Error('CSRF token tidak ditemukan')
        }
      } catch (err) {
        console.error('Gagal mengambil CSRF token:', err)
        setError('Gagal mengambil token keamanan. Coba refresh halaman.')
      }
    }
  
    fetchToken()
  }, [])
  

  const handleLogin = async (e) => {
    e.preventDefault()
  
    if (!csrfToken) {
      setError('Token keamanan belum tersedia. Coba refresh halaman.')
      return
    }
  
    if (!username.trim()) {
      setError('Username tidak boleh kosong')
      return
    }
  
    if (!password) {
      setError('Password tidak boleh kosong')
      return
    }
  
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, csrfToken }),
      })
  
      const data = await res.json()
  
      if (res.ok) {
        localStorage.setItem('role', data.role)
        router.push(data.redirect)
      } else {
        setError(data.message || 'Login gagal!')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan saat login.')
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col items-center">
        <Image
          src="/gedung.jpeg"
          alt="Logo Booking"
          width={120}
          height={120}
          className="mb-4 rounded-xl"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-6">
           Sistem Booking Gedung Serba Guna
        </h2>

        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError('')
            }}
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && (
            <div className="text-sm text-red-600 mt-1 text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
