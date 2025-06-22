import mongoose, { Schema } from 'mongoose';

const pembayaranSchema = new Schema(
  {
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    nama_pemesan: {
      type: String,
      required: true,
      trim: true,
    },
    ruangan: {
      type: Schema.Types.ObjectId,
      ref: 'Ruangan',
      required: true,
    },
    tanggalBayar: {
      type: Date,
      default: Date.now,
    },
    jumlahBayar: {
      type: Number,
      required: true,
      min: 0,
    },
    statusBayar: {
      type: String,
      enum: ['Belum', 'DP', 'Lunas', 'Terverifikasi'],
      default: 'Belum',
    },
    sumber_pembayaran: {
      type: String,
      default: 'manual',
      enum: ['manual', 'transfer', 'gateway'], // jika ingin berkembang
    },
  },
  { timestamps: true }
);

// ✅ Hindari duplikasi model saat hot reload (Next.js)
export default mongoose.models.Pembayaran || mongoose.model('Pembayaran', pembayaranSchema);
