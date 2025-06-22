// FILE: /lib/models/Booking.js

import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  id_ruangan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruangan',
    required: true,
  },
  nama_pemesan: {
    type: String,
    required: true,
    trim: true,
  },
  telp: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  nama_acara: {
    type: String,
    required: true,
  },
  tanggal_booking: {
    type: Date,
    required: true,
  },
  waktu_mulai: {
    type: String,
    required: true,
  },
  waktu_selesai: {
    type: String,
    required: true,
  },
  durasi: {
    type: Number,
    required: true,
  },
  pembayaran: {
    type: Number,
    default: 0,
  },
  total_harga: {
    type: Number,
    default: 0,
  },
  dp_minimal: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Menunggu', 'Disetujui', 'Ditolak'],
    default: 'Menunggu',
  },
  statusBayar: {
    type: String,
    enum: ['Lunas', 'DP', 'Belum'],
    default: 'Belum',
  },
  statusPembayaran: {
    type: String,
    enum: ['Terverifikasi', 'Belum Diverifikasi'],
    default: 'Belum Diverifikasi',
  },
  keterangan_penolakan: {
    type: String,
    default: '',
  },
}, { timestamps: true })

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
