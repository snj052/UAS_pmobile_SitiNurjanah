import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Ruangan from '@/lib/models/Ruangan';
import { Types } from 'mongoose';

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

function hitungStatusBayar(pembayaran = 0, durasi = 1) {
  const total = durasi * 1000000;
  if (pembayaran >= total) return 'Lunas';
  if (pembayaran >= total * 0.3) return 'DP';
  return 'Belum';
}

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find()
      .populate('id_ruangan', 'nama lokasi')
      .select('+statusBayar')
      .lean();

    const now = new Date();

    const result = bookings.map(b => {
      const selesai = new Date(b.tanggal_booking);
      if (b.waktu_selesai) {
        const [jam, menit] = b.waktu_selesai.split(':').map(Number);
        selesai.setHours(jam || 0);
        selesai.setMinutes(menit || 0);
      }

      return {
        ...b,
        statusBayar: b.statusBayar || hitungStatusBayar(b.pembayaran, b.durasi),
        isSelesai: b.status === 'Disetujui' && b.pembayaran > 0 && selesai < now
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ GET booking error:', error);
    return NextResponse.json({ message: '❌ Gagal ambil data booking', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const requiredFields = [
      'nama_pemesan', 'nama_acara', 'tanggal_booking',
      'waktu_mulai', 'waktu_selesai', 'id_ruangan',
      'telp', 'alamat', 'durasi'
    ];

    const missing = requiredFields.filter(field => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
    if (missing.length > 0) {
      return NextResponse.json({ success: false, message: `❌ Field wajib: ${missing.join(', ')}` }, { status: 400 });
    }

    if (!isValidObjectId(body.id_ruangan)) {
      return NextResponse.json({ success: false, message: '❌ ID ruangan tidak valid' }, { status: 400 });
    }

    const ruangan = await Ruangan.findById(body.id_ruangan).lean();
    if (!ruangan) {
      return NextResponse.json({ success: false, message: '❌ Ruangan tidak ditemukan' }, { status: 404 });
    }

    const durasi = parseInt(body.durasi);
    const HARGA_PER_JAM = 1000000;
    const totalHarga = durasi * HARGA_PER_JAM;
    const dpMinimal = Math.floor(totalHarga * 0.3);
    const pembayaran = body.pembayaran ?? 0;

    const bookingBaru = new Booking({
      ...body,
      id_ruangan: new Types.ObjectId(body.id_ruangan),
      tanggal_booking: new Date(body.tanggal_booking),
      pembayaran,
      total_harga: totalHarga,
      dp_minimal: dpMinimal,
      statusBayar: hitungStatusBayar(pembayaran, durasi),
      statusPembayaran: 'Belum Diverifikasi',
      status: body.status || 'Menunggu',
    });

    await bookingBaru.save();

    const populatedBooking = await Booking.findById(bookingBaru._id)
      .populate('id_ruangan', 'nama lokasi')
      .lean();

    return NextResponse.json({ success: true, message: '✅ Booking berhasil disimpan', data: populatedBooking }, { status: 201 });
  } catch (error) {
    console.error('❌ POST booking error:', error);
    return NextResponse.json({ success: false, message: '❌ Gagal simpan booking', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!isValidObjectId(data._id)) {
      return NextResponse.json({ message: '❌ ID booking tidak valid' }, { status: 400 });
    }

    const updateData = {};

    if (['Disetujui', 'Ditolak'].includes(data.status)) {
      updateData.status = data.status;
      if (data.status === 'Ditolak' && data.alasan) {
        updateData.keterangan_penolakan = data.alasan;
      }
    }

    if (typeof data.statusPembayaran === 'string') {
      updateData.statusPembayaran = data.statusPembayaran;
    }

    if (data.id_ruangan) {
      if (!isValidObjectId(data.id_ruangan)) {
        return NextResponse.json({ message: '❌ ID ruangan tidak valid' }, { status: 400 });
      }

      const ruangan = await Ruangan.findById(data.id_ruangan).lean();
      if (!ruangan) {
        return NextResponse.json({ message: '❌ Ruangan tidak ditemukan' }, { status: 404 });
      }

      const durasi = parseInt(data.durasi);
      const HARGA_PER_JAM = 1000000;
      const totalHarga = durasi * HARGA_PER_JAM;
      const dpMinimal = Math.floor(totalHarga * 0.3);
      const pembayaran = data.pembayaran ?? 0;

      Object.assign(updateData, {
        ...data,
        id_ruangan: new Types.ObjectId(data.id_ruangan),
        tanggal_booking: new Date(data.tanggal_booking),
        durasi,
        pembayaran,
        total_harga: totalHarga,
        dp_minimal: dpMinimal,
        statusBayar: hitungStatusBayar(pembayaran, durasi),
      });
    }

    const updated = await Booking.findByIdAndUpdate(data._id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ message: '❌ Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Booking berhasil diperbarui', data: updated }, { status: 200 });
  } catch (error) {
    console.error('❌ PUT booking error:', error);
    return NextResponse.json({ message: '❌ Gagal update booking', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { id } = await req.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: '❌ ID booking tidak valid' }, { status: 400 });
    }

    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: '❌ Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Booking berhasil dihapus', data: deleted }, { status: 200 });
  } catch (error) {
    console.error('❌ DELETE booking error:', error);
    return NextResponse.json({ message: '❌ Gagal hapus booking', error: error.message }, { status: 500 });
  }
}
