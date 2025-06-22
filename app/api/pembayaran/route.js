import { NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Pembayaran from '@/lib/models/Pembayaran';
import Booking from '@/lib/models/Booking';
import Ruangan from '@/lib/models/Ruangan';

// === POST: Simpan Pembayaran Baru ===
export async function POST(req) {
  try {
    await connectToDatabase();
    const { id, jumlahBayar } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: '❌ ID booking tidak valid' }, { status: 400 });
    }

    const jumlah = parseInt(jumlahBayar);
    if (!jumlah || isNaN(jumlah) || jumlah < 0) {
      return NextResponse.json({ error: '❌ Jumlah bayar tidak valid' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: '❌ Booking tidak ditemukan' }, { status: 404 });
    }

    const totalHarga = booking.total_harga || parseInt(booking.durasi) * 1000000;

    let statusBayar = 'Belum';
    if (jumlah >= totalHarga) {
      statusBayar = 'Lunas';
    } else if (jumlah >= totalHarga * 0.3) {
      statusBayar = 'DP';
    }

    const pembayaran = await Pembayaran.create({
      booking_id: booking._id,
      nama_pemesan: booking.nama_pemesan,
      ruangan: booking.id_ruangan,
      tanggalBayar: new Date(),
      jumlahBayar: jumlah,
      statusBayar,
      sumber_pembayaran: 'manual',
    });

    booking.pembayaran = jumlah;
    booking.statusBayar = statusBayar;
    booking.tanggalBayar = new Date();
    booking.sumber_pembayaran = 'manual';
    await booking.save();

    return NextResponse.json({ success: true, message: '✅ Pembayaran berhasil disimpan' });
  } catch (err) {
    console.error('❌ Error saat POST pembayaran:', err);
    return NextResponse.json({ error: '❌ Terjadi kesalahan server' }, { status: 500 });
  }
}

// === GET: Ambil Semua Pembayaran ===
export async function GET() {
  try {
    await connectToDatabase();
    const pembayaran = await Pembayaran.find()
      .sort({ tanggalBayar: -1 })
      .populate('ruangan', 'lokasi nama')
      .lean();

    return NextResponse.json(pembayaran);
  } catch (err) {
    console.error('❌ Error GET pembayaran:', err);
    return NextResponse.json({ error: '❌ Gagal ambil data pembayaran' }, { status: 500 });
  }
}

// === PUT: Konfirmasi Pembayaran ===
export async function PUT(req) {
  try {
    await connectToDatabase();
    const { id } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const pembayaran = await Pembayaran.findByIdAndUpdate(
      id,
      { statusBayar: 'Terverifikasi' },
      { new: true }
    );

    if (!pembayaran) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    await Booking.findByIdAndUpdate(
      pembayaran.booking_id,
      {
        pembayaran: pembayaran.jumlahBayar,
        statusBayar: 'Terverifikasi',
      }
    );

    return NextResponse.json({ success: true, message: '✅ Status pembayaran dikonfirmasi' });
  } catch (err) {
    console.error('❌ Error saat PUT pembayaran:', err);
    return NextResponse.json({ error: '❌ Terjadi kesalahan server' }, { status: 500 });
  }
}

// === PATCH: Edit jumlah pembayaran ===
export async function PATCH(req) {
  try {
    await connectToDatabase();
    const { id, jumlahBayar } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const jumlah = parseInt(jumlahBayar);
    if (!jumlah || isNaN(jumlah) || jumlah < 0) {
      return NextResponse.json({ error: '❌ Jumlah bayar tidak valid' }, { status: 400 });
    }

    const pembayaran = await Pembayaran.findById(id);
    if (!pembayaran) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    const booking = await Booking.findById(pembayaran.booking_id);
    if (!booking) {
      return NextResponse.json({ error: '❌ Booking terkait tidak ditemukan' }, { status: 404 });
    }

    const totalHarga = booking.total_harga || parseInt(booking.durasi) * 1000000;

    let statusBayar = 'Belum';
    if (jumlah >= totalHarga) {
      statusBayar = 'Lunas';
    } else if (jumlah >= totalHarga * 0.3) {
      statusBayar = 'DP';
    }

    pembayaran.jumlahBayar = jumlah;
    pembayaran.statusBayar = statusBayar;
    await pembayaran.save();

    booking.pembayaran = jumlah;
    booking.statusBayar = statusBayar;
    await booking.save();

    return NextResponse.json({ success: true, message: '✅ Pembayaran berhasil diperbarui' });
  } catch (err) {
    console.error('❌ Error saat PATCH pembayaran:', err);
    return NextResponse.json({ error: '❌ Gagal update pembayaran' }, { status: 500 });
  }
}

// === DELETE: Hapus pembayaran ===
export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const pembayaran = await Pembayaran.findByIdAndDelete(id);
    if (!pembayaran) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    await Booking.findByIdAndUpdate(pembayaran.booking_id, {
      pembayaran: 0,
      statusBayar: 'Belum',
      tanggalBayar: null,
      sumber_pembayaran: null,
    });

    return NextResponse.json({ success: true, message: '✅ Pembayaran berhasil dihapus' });
  } catch (err) {
    console.error('❌ Error DELETE pembayaran:', err);
    return NextResponse.json({ error: '❌ Gagal hapus pembayaran' }, { status: 500 });
  }
}
