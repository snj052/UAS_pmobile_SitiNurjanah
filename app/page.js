'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [autoRedirect, setAutoRedirect] = useState(false)

  useEffect(() => {
    if (autoRedirect) {
      const timeout = setTimeout(() => router.push('/login'), 5000)
      return () => clearTimeout(timeout)
    }
  }, [autoRedirect, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <h1 className="text-3xl md:text-5xl font-bold text-blue-700 mb-4">
        Selamat Datang di Sistem Booking Gedung Serba Guna
      </h1>
      <p className="text-gray-700 text-lg mb-6 max-w-2xl">
        Silakan masuk sebagai <strong>Admin</strong> atau <strong>Keuangan</strong> untuk mengelola pemesanan gedung.
      </p>

      <button
        onClick={() => router.push('/login')}
        className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-2 rounded-lg mb-3"
      >
        Masuk Sekarang
      </button>
    </div>
  )
}
