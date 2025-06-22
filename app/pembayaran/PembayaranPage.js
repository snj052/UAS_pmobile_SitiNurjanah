'use client';

import { useState, useEffect } from 'react';

export default function PembayaranPage() {
  const [bookings, setBookings] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [pesan, setPesan] = useState('');
  const [role, setRole] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [cetakData, setCetakData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role') || 'admin';
    setRole(storedRole);
    fetchBookings();
    fetchRiwayat();
  }, []);

  const fetchBookings = async () => {
    const res = await fetch('/api/booking');
    const data = await res.json();
    setBookings(data);
  };

  const fetchRiwayat = async () => {
    const res = await fetch('/api/pembayaran');
    const data = await res.json();
    setRiwayat(data);
  };

  const showMessage = (msg) => {
    setPesan(msg);
    setTimeout(() => setPesan(''), 4000);
  };

  const handlePembayaran = async () => {
    const idToUse = isEditMode ? editId : selectedId;
    if (!idToUse || !jumlahBayar || Number(jumlahBayar) <= 0) {
      return showMessage('❗ Pilih pemesan dan isi jumlah bayar dengan benar');
    }

    const res = await fetch('/api/pembayaran', {
      method: isEditMode ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idToUse, jumlahBayar: Number(jumlahBayar) }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || '✅ Pembayaran berhasil dicatat');
      setJumlahBayar('');
      if (!isEditMode) setSelectedId('');
      setEditId('');
      setIsEditMode(false);
      fetchRiwayat();
      fetchBookings();
    } else {
      showMessage(data.error || '❌ Gagal menyimpan pembayaran');
    }
  };

  const handleKonfirmasi = async (id) => {
    const res = await fetch('/api/pembayaran', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || '✅ Konfirmasi berhasil');
      fetchRiwayat();
    } else {
      showMessage(data.error || '❌ Gagal konfirmasi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data pembayaran ini?')) return;
    const res = await fetch(`/api/pembayaran?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('✅ Pembayaran berhasil dihapus');
      fetchRiwayat();
    } else {
      showMessage('❌ Gagal hapus pembayaran');
    }
  };

  const handleEdit = (r) => {
    setJumlahBayar(r.jumlahBayar);
    setEditId(r._id);
    setIsEditMode(true);
    window.scrollTo(0, 0);
  };

  const handleBatalEdit = () => {
    setIsEditMode(false);
    setEditId('');
    setJumlahBayar('');
  };

  const handleCetakData = (data) => {
    setCetakData(data);
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 300);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-blue-700">Form Pembayaran Booking</h1>

      {role === 'admin' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {isEditMode ? (
              <div className="p-3 border rounded-lg bg-blue-50 text-sm space-y-1 shadow">
                {(() => {
                  const dataEdit = riwayat.find((r) => r._id === editId);
                  if (!dataEdit) return <div className="text-red-500">Data tidak ditemukan</div>;
                  return (
                    <>
                      <div><strong>Nama:</strong> {dataEdit.nama_pemesan}</div>
                      <div><strong>Ruangan:</strong> {dataEdit.ruangan?.lokasi} ({dataEdit.ruangan?.nama})</div>
                      <div><strong>Tanggal Bayar:</strong> {dataEdit.tanggalBayar ? new Date(dataEdit.tanggalBayar).toLocaleDateString('id-ID') : '-'}</div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-500 w-full text-sm"
              >
                <option value="">Pilih Pemesan</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.nama_pemesan} - {b.id_ruangan?.lokasi || '-'} ({b.tanggal_booking ? new Date(b.tanggal_booking).toLocaleDateString('id-ID') : '-'})
                  </option>
                ))}
              </select>
            )}
            <input
              type="number"
              placeholder="Jumlah Bayar"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              className="p-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-500 w-full text-sm"
            />
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handlePembayaran}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              {isEditMode ? 'Update Pembayaran' : 'Simpan Pembayaran'}
            </button>
            {isEditMode && (
              <button
                onClick={handleBatalEdit}
                className="text-sm text-red-600 underline"
              >
                Batal Edit
              </button>
            )}
          </div>
        </>
      )}

      {pesan && <p className="mt-3 text-sm text-green-600">{pesan}</p>}

      <div className="flex justify-between items-center mt-8 mb-2">
        <h2 className="text-lg font-semibold text-blue-700">Riwayat Pembayaran</h2>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-sm text-center text-gray-800">
          <thead className="bg-blue-600 text-white text-[14px] font-semibold">
            <tr>
              <th className="p-3 border">Nama</th>
              <th className="p-3 border">Tanggal Bayar</th>
              <th className="p-3 border">Ruangan</th>
              <th className="p-3 border">Jumlah</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                  Belum ada data pembayaran
                </td>
              </tr>
            ) : (
              riwayat.map((r) => (
                <tr key={r._id} className="border-t hover:bg-blue-50 transition">
                  <td className="p-3 border">{r.nama_pemesan}</td>
                  <td className="p-3 border">{r.tanggalBayar ? new Date(r.tanggalBayar).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="p-3 border">
                    {r.ruangan?.lokasi && r.ruangan?.nama
                      ? `${r.ruangan.lokasi} (${r.ruangan.nama})`
                      : '-'}
                  </td>
                  <td className="p-3 border">
                    {r.jumlahBayar != null ? `Rp ${r.jumlahBayar.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="p-3 border capitalize">{r.statusBayar || '-'}</td>
                  <td className="p-3 border">
                    <div className="flex flex-col gap-1 items-center justify-center">
                      {(role === 'keuangan' && (r.statusBayar === 'DP' || r.statusBayar === 'Lunas')) && (
                        <button
                          onClick={() => handleKonfirmasi(r._id)}
                          className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(r)}
                            className="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCetakData(r)}
                        className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                      >
                        Cetak
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Print Area */}
      {showPrint && cetakData && (
  <div id="print-area" className="p-6 text-sm text-black bg-white">
    <h2 className="text-lg font-bold text-center uppercase mb-2">Gedung Serbaguna SNJ</h2>
    <p className="text-center mb-4">Jl. Merdeka No. 123, Jakarta</p>
    <h3 className="text-base font-semibold mb-4 text-center underline">Bukti Pembayaran</h3>
    <table className="w-full border text-sm mb-4">
      <tbody>
        <tr>
          <td className="border p-2 font-semibold w-1/3">Nama Pemesan</td>
          <td className="border p-2">{cetakData.nama_pemesan}</td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Tanggal Bayar</td>
          <td className="border p-2">{new Date(cetakData.tanggalBayar).toLocaleDateString('id-ID')}</td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Ruangan</td>
          <td className="border p-2">
            {cetakData.ruangan?.lokasi} ({cetakData.ruangan?.nama})
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Jumlah Bayar</td>
          <td className="border p-2">
            Rp {Number(cetakData.jumlahBayar || 0).toLocaleString('id-ID')}
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Status</td>
          <td className="border p-2">{cetakData.statusBayar}</td>
        </tr>
      </tbody>
    </table>
    <div className="mt-6 text-right">
      <p>Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
      <p className="mt-12 font-semibold">Petugas</p>
    </div>
  </div>
)}


      {/* Print-only Styling */}
      <style jsx global>{`
  @media print {
    body * {
      visibility: hidden !important;
    }
    #print-area, #print-area * {
      visibility: visible !important;
    }
    #print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 40px;
    }
  }
`}</style>

    </div>
  );
}
