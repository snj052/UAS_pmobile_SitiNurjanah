import mongoose from 'mongoose'

const RiwayatSchema = new mongoose.Schema({
  nama_pemesan: String,
  nama_acara: String,
  tanggal_booking: Date,
  waktu_mulai: String,
  waktu_selesai: String,
  durasi: Number,
  id_ruangan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruangan'
  },
  pembayaran: {
    type: Number,
    default: 0,
  },
  status: { type: String, default: 'Selesai' },
}, { timestamps: true })

export default mongoose.models.Riwayat || mongoose.model('Riwayat', RiwayatSchema)
