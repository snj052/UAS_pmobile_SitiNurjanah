import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Ruangan from '@/lib/models/Ruangan';
import { Types } from 'mongoose';

// Cek validitas ObjectId
function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

// [GET] /api/ruangan - Ambil semua ruangan
export async function GET(req) {
  try {
    await connectToDatabase();
    const ruangan = await Ruangan.find().lean();
    return NextResponse.json(Array.isArray(ruangan) ? ruangan : [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: '❌ Gagal ambil data ruangan', error: error.message }, { status: 500 });
  }
}

// [POST] /api/ruangan - Tambah ruangan baru
export async function POST(req) {
  try {
    await connectToDatabase();
    const data = await req.json();

    // Konversi fasilitas ke array jika string
    if (typeof data.fasilitas === 'string') {
      data.fasilitas = data.fasilitas.split(',').map(f => f.trim());
    }

    const requiredFields = ['nama', 'fasilitas', 'lokasi', 'status'];
    const missingFields = requiredFields.filter(field =>
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );
    if (missingFields.length > 0) {
      return NextResponse.json({ message: `❌ Field wajib kosong: ${missingFields.join(', ')}` }, { status: 400 });
    }

    const newRuangan = new Ruangan({
      ...data,
      nama: data.nama.trim(),
      lokasi: data.lokasi.trim(),
      status: data.status || 'Aktif'
    });

    await newRuangan.save();
    return NextResponse.json({ message: '✅ Berhasil menambahkan ruangan', insertedId: newRuangan._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: '❌ Gagal menyimpan data', error: error.message }, { status: 500 });
  }
}

// [PUT] /api/ruangan - Edit data ruangan
export async function PUT(req) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!isValidObjectId(data._id)) {
      return NextResponse.json({ message: '❌ ID ruangan tidak valid' }, { status: 400 });
    }

    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;

    const updatedRuangan = await Ruangan.findByIdAndUpdate(data._id, data, { new: true });
    if (!updatedRuangan) {
      return NextResponse.json({ message: '❌ Ruangan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Berhasil mengedit ruangan', data: updatedRuangan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: '❌ Gagal mengedit data', error: error.message }, { status: 500 });
  }
}

// [DELETE] /api/ruangan - Hapus data ruangan
export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { id } = await req.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: '❌ ID ruangan tidak valid' }, { status: 400 });
    }

    const result = await Ruangan.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ message: '❌ Ruangan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Berhasil menghapus ruangan', data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: '❌ Gagal menghapus ruangan', error: error.message }, { status: 500 });
  }
}
