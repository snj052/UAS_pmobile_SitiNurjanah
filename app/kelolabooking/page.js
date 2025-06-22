'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KelolaBookingPage() {
  const router = useRouter();

  const requiredFields = [
    'nama_pemesan', 'nama_acara', 'tanggal_booking', 'waktu_mulai',
    'waktu_selesai', 'id_ruangan', 'telp', 'alamat', 'durasi',
  ];

  const [formData, setFormData] = useState({
    nama_pemesan: '',
    nama_acara: '',
    tanggal_booking: '',
    waktu_mulai: '',
    waktu_selesai: '',
    id_ruangan: '',
    telp: '',
    alamat: '',
    durasi: '',
  });

  const [ruanganList, setRuanganList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [totalHarga, setTotalHarga] = useState(0);
  const [dpMinimal, setDpMinimal] = useState(0);
  const [pesan, setPesan] = useState('');
  const [isLangsung, setIsLangsung] = useState(false);

  const HARGA_PER_JAM = 1000000;

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') router.push('/login');
  }, [router]);

  useEffect(() => {
    const fetchRuangan = async () => {
      try {
        const res = await fetch('/api/ruangan');
        const data = await res.json();
        setRuanganList(data);
      } catch (err) {
        console.error("❌ Gagal ambil data ruangan:", err);
      }
    };

    const fetchBooking = async () => {
      try {
        const res = await fetch('/api/booking');
        const data = await res.json();
        setBookingList(data);
      } catch (err) {
        console.error("❌ Gagal ambil data booking:", err);
      }
    };

    fetchRuangan();
    fetchBooking();
  }, []);

  // Hitung total harga dan DP saat durasi berubah
  useEffect(() => {
    const durasiJam = parseInt(formData.durasi);
    if (!isNaN(durasiJam) && durasiJam > 0 && durasiJam <= 8) {
      const total = durasiJam * HARGA_PER_JAM;
      setTotalHarga(total);
      setDpMinimal(Math.floor(total * 0.3));
    } else {
      setTotalHarga(0);
      setDpMinimal(0);
    }
  }, [formData.durasi]);

  // Hitung waktu_selesai otomatis saat durasi atau waktu_mulai berubah
  useEffect(() => {
    const durasiJam = parseInt(formData.durasi);
    if (formData.waktu_mulai && !isNaN(durasiJam) && durasiJam > 0) {
      const [hour, minute] = formData.waktu_mulai.split(':').map(Number);
      const newHour = Math.min(hour + durasiJam, 23);
      const waktu_selesai = `${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      setFormData(prev => ({
        ...prev,
        waktu_selesai
      }));
    }
  }, [formData.durasi, formData.waktu_mulai]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchBookingList = async () => {
    const res = await fetch('/api/booking');
    const data = await res.json();
    setBookingList(data);
  };

  const tambahBooking = async () => {
    const missingFields = requiredFields.filter(field => !formData[field] || String(formData[field]).trim() === '');

    if (missingFields.length > 0) {
      setPesan(`❗ Lengkapi semua field wajib: ${missingFields.join(', ')}`);
      return;
    }

    const newBooking = {
      ...formData,
      pembayaran: dpMinimal,
      total_harga: totalHarga,
      dp_minimal: dpMinimal,
      status: isLangsung ? 'Disetujui' : 'Menunggu',
    };

    const res = await fetch('/api/booking', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingId ? { ...newBooking, _id: editingId } : newBooking),
    });

    const result = await res.json();
    if (res.ok) {
      setPesan(editingId ? '✅ Booking berhasil diupdate.' : '✅ Booking berhasil ditambahkan.');
      setFormData({
        nama_pemesan: '',
        nama_acara: '',
        tanggal_booking: '',
        waktu_mulai: '',
        waktu_selesai: '',
        id_ruangan: '',
        telp: '',
        alamat: '',
        durasi: '',
      });
      setTotalHarga(0);
      setDpMinimal(0);
      setIsLangsung(false);
      setEditingId(null);
      fetchBookingList();
    } else {
      setPesan(result.message || '❌ Terjadi kesalahan.');
    }
  };

  const hapusBooking = async (id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const res = await fetch('/api/booking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (res.ok) {
      setPesan('✅ Data booking dihapus.');
      fetchBookingList();
    } else {
      setPesan(result.message || '❌ Gagal hapus data.');
    }
  };

  const editBooking = (booking) => {
    setFormData(booking);
    setEditingId(booking._id);

    const durasiJam = parseInt(booking.durasi);
    if (!isNaN(durasiJam)) {
      const total = durasiJam * HARGA_PER_JAM;
      setTotalHarga(total);
      setDpMinimal(Math.floor(total * 0.3));
    }

    setPesan('📝 Edit mode aktif');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Kelola Booking Gedung</h1>

      {/* Form */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Tanggal */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Booking</label>
    <input name="tanggal_booking" type="date" value={formData.tanggal_booking} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Jam Mulai */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
    <input name="waktu_mulai" type="time" value={formData.waktu_mulai} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Jam Selesai */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai (Otomatis)</label>
    <input name="waktu_selesai" type="time" value={formData.waktu_selesai} readOnly className="w-full bg-gray-100 border rounded px-3 py-2" />
  </div>

  {/* Nama Pemesan */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemesan</label>
    <input name="nama_pemesan" type="text" value={formData.nama_pemesan} onChange={handleChange} placeholder="Nama Pemesan" className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Nama Acara */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Acara</label>
    <input name="nama_acara" type="text" value={formData.nama_acara} onChange={handleChange} placeholder="Nama Acara" className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Pilih Ruangan */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
    <select name="id_ruangan" value={formData.id_ruangan} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200">
      <option value="">-- Pilih Ruangan --</option>
      {ruanganList.map(r => (
        <option key={r._id} value={r._id}>{r.lokasi} ({r.nama})</option>
      ))}
    </select>
  </div>

  {/* Nomor Telepon */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
    <input name="telp" type="text" value={formData.telp} onChange={handleChange} placeholder="08xxxxxxxx" className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Alamat */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
    <input name="alamat" type="text" value={formData.alamat} onChange={handleChange} placeholder="Alamat lengkap" className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>

  {/* Durasi */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (jam)</label>
    <input name="durasi" type="number" value={formData.durasi} onChange={handleChange} placeholder="Contoh: 2" min={1} max={8} className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200" />
  </div>
</div>


      {/* Harga */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-sm text-gray-700">
        <p><strong>Total Harga:</strong> Rp {totalHarga.toLocaleString('id-ID')}</p>
        <p><strong>DP Minimal (30%):</strong> Rp {dpMinimal.toLocaleString('id-ID')}</p>
      </div>

      {/* Opsi Langsung */}
      <div className="flex items-center gap-3 mb-6">
        <input type="checkbox" id="langsung" checked={isLangsung} onChange={e => setIsLangsung(e.target.checked)} className="accent-green-600" />
        <label htmlFor="langsung" className="text-sm text-gray-700">Booking langsung disetujui</label>
      </div>

      <button onClick={tambahBooking} className="bg-green-600 hover:bg-green-700 transition text-white text-sm px-5 py-2 rounded-lg">
        {editingId ? 'Simpan Perubahan' : 'Tambah Booking'}
      </button>

      {pesan && <p className="mt-4 text-sm text-blue-600">{pesan}</p>}

      {/* Tabel Booking */}
      <h2 className="text-lg font-semibold mt-10 mb-4 text-gray-800">Daftar Booking</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
  <table className="min-w-full text-sm text-gray-800 border border-gray-200">
    <thead className="bg-blue-600 text-white">
      <tr>
        <th className="p-3 border text-center align-middle">Nama</th>
        <th className="p-3 border text-center align-middle">Telepon</th>
        <th className="p-3 border text-center align-middle">Alamat</th>
        <th className="p-3 border text-center align-middle">Tanggal</th>
        <th className="p-3 border text-center align-middle">Mulai</th>
        <th className="p-3 border text-center align-middle">Durasi</th>
        <th className="p-3 border text-center align-middle">Selesai</th>
        <th className="p-3 border text-center align-middle">Total</th>
        <th className="p-3 border text-center align-middle">DP</th>
        <th className="p-3 border text-center align-middle">Ruangan</th>
        <th className="p-3 border text-center align-middle">Acara</th>
        <th className="p-3 border text-center align-middle">Status</th>
        <th className="p-3 border text-center align-middle">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {bookingList.map((b) => (
        <tr key={b._id} className="border-t hover:bg-blue-50 transition-colors">
          <td className="p-3 border text-center align-middle">{b.nama_pemesan}</td>
          <td className="p-3 border text-center align-middle">{b.telp}</td>
          <td className="p-3 border text-center align-middle">{b.alamat}</td>
          <td className="p-3 border text-center align-middle">{new Date(b.tanggal_booking).toLocaleDateString('id-ID')}</td>
          <td className="p-3 border text-center align-middle">{b.waktu_mulai}</td>
          <td className="p-3 border text-center align-middle">{b.durasi} jam</td>
          <td className="p-3 border text-center align-middle">{b.waktu_selesai}</td>
          <td className="p-3 border text-center align-middle">
            Rp {b.total_harga ? b.total_harga.toLocaleString('id-ID') : '-'}
          </td>
          <td className="p-3 border text-center align-middle">
            Rp {b.dp_minimal ? b.dp_minimal.toLocaleString('id-ID') : '-'}
          </td>
          <td className="p-3 border text-center align-middle">
            {typeof b.id_ruangan === 'object'
              ? `${b.id_ruangan.lokasi} (${b.id_ruangan.nama})`
              : '❓ Tidak tersedia'}
          </td>
          <td className="p-3 border text-center align-middle">{b.nama_acara}</td>
          <td className="p-3 border text-center align-middle">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              b.status === 'Disetujui'
                ? 'bg-green-100 text-green-700'
                : b.status === 'Ditolak'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {b.status}
            </span>
          </td>
          <td className="p-3 border text-center align-middle">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => editBooking(b)}
                className="text-blue-600 hover:underline text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => hapusBooking(b._id)}
                className="text-red-600 hover:underline text-xs font-semibold"
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      ))}
      {bookingList.length === 0 && (
        <tr>
          <td colSpan={13} className="p-4 text-center text-gray-500 italic">
            Belum ada data booking.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>



    </div>
  );
}
