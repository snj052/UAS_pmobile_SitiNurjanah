'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LaporanPage() {
  const router = useRouter()
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPendapatan, setTotalPendapatan] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role')
      if (role !== 'admin' && role !== 'fasilitas') {
        router.push('/login')
        return
      }

      const fetchLaporan = async () => {
        try {
          const res = await fetch('/api/riwayat')
          const json = await res.json()

          if (json.success && Array.isArray(json.data)) {
            setLaporan(json.data)
            const total = json.data.reduce((sum, b) => sum + (b.pembayaran || 0), 0)
            setTotalPendapatan(total)
          } else {
            console.error('Format data salah:', json)
          }
        } catch (error) {
          console.error('❌ Gagal ambil data laporan:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchLaporan()
    }
  }, [router])

  const printLaporan = () => window.print()

  return (
    <div className="p-6">
      {/* Identitas Perusahaan - Selalu tampil dan bisa dicetak */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase">Gedung Serbaguna SNJ</h2>
        <p className="text-sm">Jl. Merdeka No. 123, Jakarta</p>
        <p className="text-sm font-medium">Laporan Data Booking Gedung</p>
      </div>

      {/* Tombol hanya muncul di layar, tidak dicetak */}
      <div className="mb-4 print:hidden">
        <button onClick={printLaporan} className="bg-blue-600 text-white px-4 py-2 rounded">
          Cetak
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data laporan...</p>
      ) : laporan.length > 0 ? (
        <>
          <table className="w-full border text-sm mb-4 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nama Pemesan</th>
                <th className="border p-2">Ruangan</th>
                <th className="border p-2">Tanggal</th>
                <th className="border p-2">Jam</th>
                <th className="border p-2">Durasi</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {laporan.map((b, index) => (
                <tr key={index}>
                  <td className="border p-2">{b.nama_pemesan}</td>
                  <td className="border p-2">
                    {b.id_ruangan?.lokasi} ({b.id_ruangan?.nama})
                  </td>
                  <td className="border p-2">
                    {new Date(b.tanggal_booking).toLocaleDateString('id-ID')}
                  </td>
                  <td className="border p-2">
                    {b.waktu_mulai} - {b.waktu_selesai}
                  </td>
                  <td className="border p-2">{b.durasi}</td>
                  <td className="border p-2">{b.status}</td>
                  <td className="border p-2">
                    Rp {Number(b.pembayaran || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-semibold text-blue-800 text-lg print:text-black print:mt-4">
            Total Pendapatan: Rp {totalPendapatan.toLocaleString('id-ID')}
          </div>
        </>
      ) : (
        <p className="text-gray-600">Tidak ada booking yang selesai.</p>
      )}

      {/* Styling khusus cetak */}
      <style jsx global>{`
        @media print {
          body {
            padding: 20px;
            font-size: 12px;
          }

          .print\\:hidden {
            display: none !important;
          }

          button, nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
