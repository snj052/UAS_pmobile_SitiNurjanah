import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Riwayat from '@/lib/models/Riwayat'

export async function GET() {
  try {
    await connectToDatabase()

    const semuaRiwayat = await Riwayat.find({
      status: { $in: ['Disetujui', 'approved'] }
    }).populate('id_ruangan', 'nama lokasi').lean()

    const now = new Date()

    const selesai = semuaRiwayat.filter(item => {
      const tanggal = item.tanggal_booking
      const waktuSelesai = item.waktu_selesai || '00:00'
      if (!tanggal) return false

      const tanggalStr = new Date(tanggal).toISOString().slice(0, 10)
      const selesaiDate = new Date(`${tanggalStr}T${waktuSelesai}:00+07:00`)

      return selesaiDate < now
    })

    const result = selesai.map(item => ({
      id: item._id.toString(),
      nama: item.nama_pemesan || '-',
      ruang: item.id_ruangan?.nama || '-',
      lokasi: item.id_ruangan?.lokasi || '-',
      tanggal: item.tanggal_booking?.toISOString().slice(0, 10) || '-',
      jam: `${item.waktu_mulai || '-'} - ${item.waktu_selesai || '-'}`,
      durasi: item.durasi || '-',
      status: item.status,
      pembayaran: item.pembayaran || 0
    }))

    const totalPendapatan = result.reduce((acc, curr) => acc + (curr.pembayaran || 0), 0)

    return NextResponse.json({ success: true, data: result, totalPendapatan }, { status: 200 })
  } catch (error) {
    console.error('❌ Gagal ambil laporan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data laporan',
      error: error.message
    }, { status: 500 })
  }
}
