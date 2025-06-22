'use client';

import { useEffect, useState } from 'react';

export default function StatusRuangan() {
  const [ruangan, setRuangan] = useState([]);
  const [bookingApprovedToday, setBookingApprovedToday] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRuangan = await fetch('/api/ruangan');
        const ruanganData = await resRuangan.json();
        setRuangan(ruanganData);

        const resBooking = await fetch('/api/booking');
        const bookingData = await resBooking.json();

        const today = new Date().toISOString().split('T')[0];
        const filtered = bookingData.filter(b => {
          const tanggal = b.tanggal_booking?.slice(0, 10);
          return b.status === 'Disetujui' && tanggal === today;
        });

        setBookingApprovedToday(filtered);
      } catch (error) {
        console.error('❌ Error saat mengambil data:', error);
      }
    };

    fetchData();
  }, []);

  // ✅ Cek apakah sedang dipakai (waktu saat ini di antara waktu booking)
  const isSedangDipakai = (tanggal_booking, waktu_mulai, waktu_selesai) => {
    try {
      const now = new Date();
  
      const toDate = (tanggal, jam) => {
        const [h, m] = jam.split(':').map(Number);
        const d = new Date(tanggal);
        d.setHours(h);
        d.setMinutes(m);
        d.setSeconds(0);
        return d;
      };
  
      const mulai = toDate(tanggal_booking, waktu_mulai);
      const selesai = toDate(tanggal_booking, waktu_selesai);
  
      return now >= mulai && now <= selesai;
    } catch (e) {
      console.error('❌ Format waktu tidak valid:', { tanggal_booking, waktu_mulai, waktu_selesai });
      return false;
    }
  };
  

  const getBookingForRoom = ruangId =>
    bookingApprovedToday.filter(b => {
      const idRuangan = typeof b.id_ruangan === 'object' ? b.id_ruangan._id : b.id_ruangan;
      return idRuangan?.toString() === ruangId?.toString();
    });

  const ruanganSedangDipakai = bookings =>
    bookings.some(b =>
      isSedangDipakai(b.tanggal_booking, b.waktu_mulai, b.waktu_selesai)
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-blue-800 mb-6">Status Ruangan Hari Ini</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ruangan.map(r => {
          const bookings = getBookingForRoom(r._id);
          const sedangDipakai = ruanganSedangDipakai(bookings);

          return (
            <div key={r._id} className="border p-5 rounded-lg shadow">
              <h3 className="text-lg font-bold text-blue-700 mb-1">
                {r.nama || r.nama_ruangan}
              </h3>

              {bookings.length === 0 ? (
                <p className="text-green-600 font-medium">
                  ✅ Kosong / Tidak ada booking
                </p>
              ) : (
                <>
                  {sedangDipakai && (
                    <p className="text-red-600 font-medium mb-1">
                      ⚠️ Sedang dipakai sekarang
                    </p>
                  )}
                  <ul className="list-disc list-inside text-sm">
                    {bookings.map((b, i) => (
                      <li key={i}>
                        <strong>{b.nama_pemesan}</strong> - {b.waktu_mulai} s/d {b.waktu_selesai} ({b.durasi} jam)
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
