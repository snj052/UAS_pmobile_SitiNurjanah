'use client';

import { useEffect, useState, useCallback } from 'react';

export default function RuanganPage() {
  const [form, setForm] = useState({
    nama: '',
    fasilitas: '',
    lokasi: '',
    status: 'Aktif'
  });
  const [message, setMessage] = useState('');
  const [gedungList, setGedungList] = useState([]);
  const [editId, setEditId] = useState(null);

  // Ambil data dari MongoDB
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ruangan');
      const data = await res.json();
      setGedungList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Gagal fetch ruangan:", error);
      setGedungList([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simpan atau edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fasilitasArray = typeof form.fasilitas === 'string'
        ? form.fasilitas.split(',').map(f => f.trim())
        : form.fasilitas;

      const method = editId ? 'PUT' : 'POST';
      const url = '/api/ruangan';
      const body = editId ? { ...form, _id: editId, fasilitas: fasilitasArray } : { ...form, fasilitas: fasilitasArray };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(result.message);
        setForm({ nama: '', fasilitas: '', lokasi: '', status: 'Aktif' });
        setEditId(null);
        await fetchData();
      } else {
        setMessage(`❌ Gagal: ${result.message}`);
      }
    } catch (err) {
      console.error("❌ Error submit:", err);
      setMessage("❌ Error saat menyimpan ruangan.");
    }
  };

  // Isi form saat edit
  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      nama: item.nama,
      fasilitas: item.fasilitas.join(', '),
      lokasi: item.lokasi,
      status: item.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hapus ruangan
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus ruangan ini?')) return;
    try {
      const res = await fetch('/api/ruangan', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(result.message);
        await fetchData();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Gagal hapus ruangan:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{editId ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Ruangan" className="border p-2 w-full" required />
        <input name="fasilitas" value={form.fasilitas} onChange={handleChange} placeholder="Fasilitas (pisahkan dengan koma)" className="border p-2 w-full" required />
        <input name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="Lokasi" className="border p-2 w-full" required />
        <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full">
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Simpan Perubahan' : 'Tambah Ruangan'}</button>
      </form>

      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

      <hr className="my-6" />

      <h2 className="text-lg font-bold mb-2">Data Ruangan Tersimpan</h2>
      {gedungList.length === 0 ? (
        <p className="text-gray-500">Belum ada data ruangan.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Fasilitas</th>
              <th className="p-2 border">Lokasi</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {gedungList.map((item, i) => (
              <tr key={item._id}>
                <td className="p-2 border text-center">{i + 1}</td>
                <td className="p-2 border">{item.nama}</td>
                <td className="p-2 border">{item.fasilitas.join(', ')}</td>
                <td className="p-2 border">{item.lokasi}</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border text-center">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
