import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Riwayat from '@/lib/models/Riwayat'

// === GET: Ambil Semua Riwayat ===
export async function GET() {
  try {
    await connectToDatabase()

    const data = await Riwayat.find()
      .sort({ tanggal_booking: -1 })
      .populate('id_ruangan', 'nama lokasi')
      .lean()

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err) {
    console.error('❌ Gagal ambil riwayat:', err)
    return NextResponse.json({
      success: false,
      message: 'Gagal ambil data riwayat',
      error: err.message,
    }, { status: 500 })
  }
}

// === POST: Simpan ke Riwayat ===
export async function POST(req) {
  try {
    await connectToDatabase()
    const body = await req.json()

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Data kosong',
      }, { status: 400 })
    }

    const result = await Riwayat.insertMany(body)

    return NextResponse.json({
      success: true,
      message: 'Data riwayat disimpan',
      data: result,
    }, { status: 201 })
  } catch (err) {
    console.error('❌ Gagal simpan riwayat:', err)
    return NextResponse.json({
      success: false,
      message: 'Gagal simpan riwayat',
      error: err.message,
    }, { status: 500 })
  }
}
