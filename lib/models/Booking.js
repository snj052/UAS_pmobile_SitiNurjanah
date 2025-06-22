import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  nama_pemesan: { type: String, required: true, trim: true },
  nama_acara: { type: String, required: true, trim: true },
  tanggal_booking: { type: Date, required: true },
  waktu_mulai: { type: String, required: true, trim: true },
  waktu_selesai: { type: String, required: true, trim: true },
  id_ruangan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruangan',
    required: true,
  },
  telp: { type: String, required: true, trim: true },
  alamat: { type: String, required: true, trim: true },
  durasi: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[1-8]$/.test(v),
      message: 'Durasi harus antara 1 sampai 8 jam',
    },
  },
  pembayaran: {
    type: Number,
    default: 0,
    min: [0, 'Pembayaran tidak boleh negatif'],
  },
  status: {
    type: String,
    enum: ['Menunggu', 'Disetujui', 'Ditolak'],
    default: 'Menunggu',
  },
  total_harga: { type: Number, default: 0, min: 0 },
  dp_minimal: { type: Number, default: 0, min: 0 },

  // ✅ Diperbaiki nama dan fieldnya
  statusBayar: {
    type: String,
    enum: ['Belum', 'DP', 'Lunas', 'Terverifikasi'],
    default: 'Belum',
    select: true,
  },

  statusPembayaran: {
    type: String,
    enum: ['Belum Diverifikasi', 'Terverifikasi'],
    default: 'Belum Diverifikasi',
  },

  // ✅ Optional: untuk alasan jika ditolak
  keterangan_penolakan: {
    type: String,
    default: '',
    trim: true,
  },

}, {
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');
