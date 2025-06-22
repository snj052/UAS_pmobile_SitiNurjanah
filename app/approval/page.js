'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function ApprovalBookingPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [role, setRole] = useState('')

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/booking')
      if (!res.ok) throw new Error(`Gagal ambil booking: ${res.status}`)
      const data = await res.json()

      if (role === 'admin') {
        setBookings(data.filter(b => ['Menunggu', 'Disetujui', 'Ditolak'].includes(b.status)))
      } else {
        setBookings(data)
      }
    } catch (err) {
      console.error('❌ Gagal fetch booking:', err.message)
    }
  }, [role])

  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    if (!['admin', 'keuangan'].includes(storedRole)) {
      router.push('/login')
      return
    }
    setRole(storedRole)
  }, [router])

  useEffect(() => {
    if (role) fetchBookings()
  }, [role, fetchBookings])

  const refreshBookings = async () => fetchBookings()

  const handleSetujui = async (id) => {
    await fetch('/api/booking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, status: 'Disetujui' }),
    })
    refreshBookings()
  }

  const handleTolak = async (id) => {
    const alasan = prompt('Masukkan alasan penolakan:')
    if (!alasan) return
    await fetch('/api/booking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, status: 'Ditolak', alasan }),
    })
    refreshBookings()
  }

  const handleVerifikasi = async (id) => {
    await fetch('/api/booking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, statusPembayaran: 'Terverifikasi' }),
    })
    refreshBookings()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-blue-800 text-center md:text-left">
        Validasi Booking
      </h1>

      {/* TABEL WRAPPER */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[950px] bg-white shadow-md rounded-xl border border-gray-200">
          <table className="w-full table-auto text-sm text-gray-800 text-center">
          <thead className="bg-blue-600 text-white text-[14px]">
  <tr>
    <th className="p-2 border">Nama</th>
    <th className="p-2 border">Telepon</th>
    <th className="p-2 border">Alamat</th>
    <th className="p-2 border">Tanggal</th>
    <th className="p-2 border">Waktu</th>
    <th className="p-2 border">Durasi</th>
    <th className="p-2 border">Selesai</th>
    <th className="p-2 border">Ruangan</th>
    <th className="p-2 border">Acara</th>
    {role === 'keuangan' && (
      <>
        <th className="p-2 border">Status Approve</th>
        <th className="p-2 border">Status Bayar</th>
        <th className="p-2 border">Verifikasi</th>
      </>
    )}
    {role === 'admin' && (
      <>
        <th className="p-2 border">Status</th>
        <th className="p-2 border">Bayar</th>
        <th className="p-2 border">Aksi</th>
      </>
    )}
  </tr>
</thead>

            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-blue-50 transition">
                    <td className="p-3 border">{b.nama_pemesan}</td>
                    <td className="p-3 border">{b.telp}</td>
                    <td className="p-3 border">{b.alamat}</td>
                    <td className="p-3 border">{new Date(b.tanggal_booking).toLocaleDateString('id-ID')}</td>
                    <td className="p-3 border whitespace-nowrap">{b.waktu_mulai} - {b.waktu_selesai}</td>
                    <td className="p-3 border">{b.durasi} jam</td>
                    <td className="p-3 border">{b.waktu_selesai}</td>
                    <td className="p-3 border">{b.id_ruangan?.lokasi} ({b.id_ruangan?.nama})</td>
                    <td className="p-3 border">{b.nama_acara}</td>
                    <td className="p-3 border capitalize">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        b.status === 'Disetujui'
                          ? 'bg-green-100 text-green-700'
                          : b.status === 'Ditolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 border">{b.statusBayar || 'Belum'}</td>

                    {/* Tambahan untuk keuangan */}
                    {role === 'keuangan' && (
  <>
    <td className="p-3 border capitalize">
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        b.status === 'Disetujui'
          ? 'bg-green-100 text-green-700'
          : b.status === 'Ditolak'
          ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {b.status}
      </span>
    </td>
    <td className="p-3 border">{b.statusPembayaran || 'Belum'}</td>
    <td className="p-3 border">
      {b.statusPembayaran === 'Terverifikasi' ? (
        <span className="text-green-600 font-semibold text-xs">✔ Terverifikasi</span>
      ) : (
        <button
          onClick={() => handleVerifikasi(b._id)}
          className="text-blue-600 hover:underline text-xs font-semibold"
        >
          Verifikasi
        </button>
      )}
    </td>
  </>
)}


                    {/* Aksi admin */}
                    {role === 'admin' && (
                      <td className="p-3 border">
                        <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                          <button
                            onClick={() => handleSetujui(b._id)}
                            className="text-green-600 hover:underline text-xs font-semibold"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleTolak(b._id)}
                            className="text-red-600 hover:underline text-xs font-semibold"
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
  colSpan={role === 'keuangan' ? 14 : role === 'admin' ? 13 : 12}
  className="p-4 text-center text-gray-500 italic"
>
  Tidak ada data booking saat ini.
</td>

                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
