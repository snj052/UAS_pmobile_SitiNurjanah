import mongoose from 'mongoose'

const RuanganSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  lokasi: { type: String, required: true },
  kapasitas: { type: Number, default: 0 },
  fasilitas: { type: [String], default: [] },
  status: { type: String, enum: ['Aktif', 'Tidak Aktif'], default: 'Aktif' },
}, { timestamps: true })

// 👇 Tambahkan nama koleksi eksplisit di argumen ketiga: 'ruangans'
export default mongoose.models.Ruangan || mongoose.model('Ruangan', RuanganSchema, 'ruangans')
