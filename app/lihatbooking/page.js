'use client'

import { useEffect, useState, useCallback } from 'react'

export default function JadwalBookingPage() {
  const [bookings, setBookings] = useState([])
  const [filters, setFilters] = useState({ status: '', ruang: '', nama: '', tanggal: '' })
  const [rooms, setRooms] = useState([])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/booking')
      const data = await res.json()

      if (!Array.isArray(data)) throw new Error("❌ Data dari API bukan array.")

      const now = new Date()
      const active = []
      const approvedOnly = data.filter(b => b.status === 'Disetujui')

      for (const b of approvedOnly) {
        const end = new Date(`${b.tanggal_booking}T${b.waktu_selesai}`)
        if (end < now) {
          await fetch('/api/riwayat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([b])
          })

          await fetch('/api/booking', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: b._id })
          })
        } else {
          active.push(b)
        }
      }

      setBookings(active)
    } catch (error) {
      console.error("❌ Error saat mengambil data booking:", error)
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/ruangan')
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("❌ Error saat mengambil data ruangan:", error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchRooms()
  }, [fetchData, fetchRooms])

  const handleSelesai = async (id) => {
    const item = bookings.find(b => b._id === id)
    if (!item) return console.error("❌ Data booking tidak ditemukan.")

    try {
      const res1 = await fetch('/api/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([item])
      })

      const res2 = await fetch('/api/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res1.ok && res2.ok) {
        setBookings(prev => prev.filter(b => b._id !== id))
      } else {
        console.error("❌ Gagal menyelesaikan booking.")
      }
    } catch (error) {
      console.error("❌ Error saat menyelesaikan booking:", error)
    }
  }

  const filteredBookings = bookings.filter(b => {
    return (
      (!filters.status || b.status === filters.status) &&
      (!filters.ruang || b.id_ruangan?.nama === filters.ruang) &&
      (!filters.nama || b.nama_pemesan.toLowerCase().includes(filters.nama.toLowerCase())) &&
      (!filters.tanggal || b.tanggal_booking?.slice(0, 10) === filters.tanggal)
    )
  })

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Lihat Jadwal Booking</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-sm">
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded">
          <option value=''>Semua Status</option>
          <option value='Menunggu'>Menunggu</option>
          <option value='Disetujui'>Disetujui</option>
          <option value='Ditolak'>Ditolak</option>
        </select>
        <input
          type="text"
          placeholder="Cari Nama"
          value={filters.nama}
          onChange={e => setFilters({ ...filters, nama: e.target.value })}
          className="border p-2 rounded"
        />
        <select value={filters.ruang} onChange={e => setFilters({ ...filters, ruang: e.target.value })} className="border p-2 rounded">
          <option value=''>Semua Ruangan</option>
          {rooms.map((r, i) => <option key={i} value={r.nama}>{r.nama}</option>)}
        </select>
        <input
          type="date"
          value={filters.tanggal}
          onChange={e => setFilters({ ...filters, tanggal: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
        <table className="min-w-full text-sm">
        <thead className="bg-blue-600 text-white font-semibold text-center">
  <tr>
    <th className="p-3 border">Nama</th>
    <th className="p-3 border">Ruangan</th>
    <th className="p-3 border">Tanggal</th>
    <th className="p-3 border">Jam</th>
    <th className="p-3 border">Durasi</th>
    <th className="p-3 border">Status</th>
    <th className="p-3 border">Pembayaran</th>
    <th className="p-3 border">Aksi</th>
  </tr>
</thead>

<tbody>
  {filteredBookings.length > 0 ? (
    filteredBookings.map(b => (
      <tr key={b._id} className="hover:bg-blue-50 border-t text-center">
        <td className="p-3 border">{b.nama_pemesan}</td>
        <td className="p-3 border">{b.id_ruangan?.nama || '-'}</td>
        <td className="p-3 border">{b.tanggal_booking?.slice(0, 10)}</td>
        <td className="p-3 border">{b.waktu_mulai} - {b.waktu_selesai}</td>
        <td className="p-3 border">{b.durasi} jam</td>
        <td className="p-3 border">{b.status}</td>
        <td className="p-3 border">{b.statusBayar || 'Belum'}</td>
        <td className="p-3 border">
          <button
            onClick={() => handleSelesai(b._id)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
          >
            Tandai Selesai
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr className="text-center">
      <td colSpan="8" className="italic text-gray-500 p-6 border">
        Tidak ada data booking sesuai filter.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  )
}
