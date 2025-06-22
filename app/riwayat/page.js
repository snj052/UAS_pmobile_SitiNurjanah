'use client'

import { useEffect, useState } from 'react'

export default function RiwayatBooking() {
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const res = await fetch('/api/riwayat')
        const json = await res.json()

        if (Array.isArray(json.data)) {
          setRiwayat(json.data)
        } else {
          setRiwayat([])
        }
      } catch (err) {
        console.error('❌ Gagal fetch data riwayat:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiwayat()
  }, [])

  const handlePrint = () => window.print()

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-800">Riwayat Booking</h2>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Cetak
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <table className="w-full border text-sm text-center">
  <thead className="bg-blue-100">
    <tr>
      <th className="p-2 border">No</th>
      <th className="p-2 border">Nama Pemesan</th>
      <th className="p-2 border">Ruangan</th>
      <th className="p-2 border">Tanggal</th>
      <th className="p-2 border">Waktu</th>
      <th className="p-2 border">Durasi</th>
      <th className="p-2 border">Status</th>
      <th className="p-2 border">Pembayaran</th>
    </tr>
  </thead>
  <tbody>
    {riwayat.length > 0 ? (
      riwayat.map((item, index) => (
        <tr key={item._id || index} className="border-t">
          <td className="p-2 border">{index + 1}</td>
          <td className="p-2 border">{item.nama_pemesan || '-'}</td>
          <td className="p-2 border">
            {item.id_ruangan?.nama
              ? `${item.id_ruangan?.nama} (${item.id_ruangan?.lokasi || '-'})`
              : '-'}
          </td>
          <td className="p-2 border">
            {item.tanggal_booking
              ? new Date(item.tanggal_booking).toLocaleDateString('id-ID')
              : '-'}
          </td>
          <td className="p-2 border">
            {item.waktu_mulai || '-'} - {item.waktu_selesai || '-'}
          </td>
          <td className="p-2 border">
            {item.durasi ? `${item.durasi} jam` : '-'}
          </td>
          <td className="p-2 border text-green-600 font-semibold">
            {item.status || 'Selesai'}
          </td>
          <td className="p-2 border text-blue-700 font-medium">
            Rp {Number(item.pembayaran || 0).toLocaleString('id-ID')}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={8} className="text-center text-gray-500 p-4">
          Tidak ada riwayat booking.
        </td>
      </tr>
    )}
  </tbody>
</table>

      )}
    </div>
  )
}
