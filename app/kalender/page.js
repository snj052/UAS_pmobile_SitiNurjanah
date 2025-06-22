'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function KalenderPage() {
  const router = useRouter()
  const [value, setValue] = useState(new Date())
  const [infoPerTanggal, setInfoPerTanggal] = useState({})
  const [filterRuangan, setFilterRuangan] = useState('')
  const [tanggalDipilih, setTanggalDipilih] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [ruanganList, setRuanganList] = useState([])

  const formatTanggal = (input) => {
    const date = new Date(input)
    return isNaN(date) ? null : date.toISOString().split('T')[0]
  }

  const loadRuangan = async () => {
    try {
      const res = await fetch('/api/ruangan')
      const data = await res.json()
      const ruangAktif = (Array.isArray(data) ? data : data.data || []).filter(r => r.status === 'Aktif')

      const list = ruangAktif.map(r => ({
        nama: r.nama,
        label: `${r.nama} (${r.lokasi})`,
        jumlah: 1
      }))

      setRuanganList(list)
    } catch (err) {
      console.error('❌ Gagal mengambil ruangan:', err)
    }
  }

  const loadData = async () => {
    try {
      const bookingRes = await fetch('/api/booking')
      const bookingJson = await bookingRes.json()

      const bookings = Array.isArray(bookingJson)
        ? bookingJson
        : Array.isArray(bookingJson.data)
        ? bookingJson.data
        : Array.isArray(bookingJson.result)
        ? bookingJson.result
        : Array.isArray(bookingJson.bookings)
        ? bookingJson.bookings
        : []

      const info = {}
      bookings.forEach(b => {
        const tanggal = formatTanggal(b.tanggal_booking)
        if (!tanggal) return

        const ruang = b.id_ruangan?.nama

        const status = b.status
        const nama = b.nama_pemesan || 'Tanpa Nama'

        const ruangan = ruanganList.find(r => r.nama === ruang)
        const jumlahTersedia = ruangan?.jumlah || 1

        info[tanggal] ??= {}
        info[tanggal][ruang] ??= {
          jumlah: jumlahTersedia,
          terisi: 0,
          pending: 0,
          pemesan: []
        }

        if (status === 'Disetujui') {
          info[tanggal][ruang].terisi += 1
        } else if (status === 'Menunggu') {
          info[tanggal][ruang].pending += 1
        }

        info[tanggal][ruang].pemesan.push({ nama, status })
      })

      setInfoPerTanggal(info)
    } catch (err) {
      console.error('❌ Gagal mengambil data booking:', err)
    }
  }

  useEffect(() => {
    setIsClient(true)
    const role = localStorage.getItem('role')
    if (!role) router.push('/login')
    else {
      setTanggalDipilih(formatTanggal(new Date()))
      loadRuangan().then(() => loadData())
    }
  }, [router])

  const tileClassName = ({ date }) => {
    if (!filterRuangan) return '' // tidak ada warna sebelum filter dipilih

    const d = formatTanggal(date)
    const data = infoPerTanggal[d]
    if (!data) return 'tile-available'

    let isFull = false
    let hasPending = false
    let hasBooking = false

    for (const ruang in data) {
      if (filterRuangan && ruang !== filterRuangan) continue

      const { jumlah, terisi, pending } = data[ruang]
      if (pending > 0) hasPending = true
      if (terisi >= jumlah) isFull = true
      if (terisi > 0) hasBooking = true
    }

    if (isFull) return 'tile-full'
    if (hasPending) return 'tile-pending'
    if (hasBooking) return 'tile-partial'
    return 'tile-available'
  }

  const handleTanggalChange = date => {
    setValue(date)
    setTanggalDipilih(formatTanggal(date))
  }

  const detail = infoPerTanggal[tanggalDipilih] || {}

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kalender Ketersediaan Ruangan</h1>

      <div className="mb-4">
        <label className="mr-2 text-sm">Filter Gedung:</label>
        <select
          className="border rounded px-2 py-1"
          value={filterRuangan}
          onChange={e => setFilterRuangan(e.target.value)}
        >
          <option value=''>-- Pilih Gedung --</option>
          {ruanganList.map(r => (
            <option key={r.nama} value={r.nama}>{r.label}</option>
          ))}
        </select>
      </div>

      {isClient && (
        <Calendar
          onChange={handleTanggalChange}
          value={value}
          tileClassName={tileClassName}
        />
      )}

      <style jsx global>{`
        .tile-full { background: #f87171; color: white; border-radius: .5rem; }
        .tile-partial { background: #facc15; color: black; border-radius: .5rem; }
        .tile-pending { background: #fb923c; color: white; border-radius: .5rem; }
        .tile-available { background: #4ade80; color: white; border-radius: .5rem; }
      `}</style>

      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Ketersediaan pada {tanggalDipilih}</h2>
        {Object.keys(detail).length ? (
          <ul className="list-disc pl-4 space-y-2">
            {Object.entries(detail).map(([ruang, data]) => (
              <li key={ruang}>
                <b>{ruang}</b>: {data.jumlah - data.terisi} dari {data.jumlah} tersedia
                {data.pending > 0 && ` (${data.pending} menunggu)`}
                {data.pemesan.length > 0 && (
                  <ul className="ml-4 list-circle text-sm mt-1">
                    {data.pemesan.map((p, idx) => (
                      <li key={idx}>{p.nama} - {p.status}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada booking atau semua tersedia pada tanggal ini.</p>
        )}
      </div>
    </div>
  )
}
