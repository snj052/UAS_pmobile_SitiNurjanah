'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Menu, X, LogOut,
  LayoutDashboard, FileText, CreditCard
} from 'lucide-react'

export default function DashboardKeuangan() {
  const router = useRouter()
  const [approvalData, setApprovalData] = useState([])
  const [pembayaranData, setPembayaranData] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('Dashboard')

  const menu = [
    { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Approval Booking', icon: <FileText className="w-5 h-5" /> },
    { title: 'Data Pembayaran', icon: <CreditCard className="w-5 h-5" /> }
  ]

  const handleLogout = () => {
    localStorage.removeItem('role')
    router.push('/login')
  }

  const fetchApprovalData = async () => {
    try {
      const res = await fetch('/api/booking')
      const data = await res.json()
      setApprovalData(data.filter(b => b.status === 'Menunggu'))
    } catch (err) {
      console.error('Gagal fetch booking:', err.message)
    }
  }

  const fetchPembayaranData = async () => {
    try {
      const res = await fetch('/api/pembayaran')
      const data = await res.json()
      setPembayaranData(data)
    } catch (err) {
      console.error('Gagal fetch pembayaran:', err.message)
    }
  }

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'keuangan') {
      router.push('/login')
      return
    }
    fetchApprovalData()
    fetchPembayaranData()
  }, [router])

  const handleKonfirmasiPembayaran = async (id) => {
    const res = await fetch('/api/pembayaran', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })

    if (res.ok) {
      alert('✅ Pembayaran dikonfirmasi.')
      fetchPembayaranData()
    } else {
      alert('❌ Gagal mengkonfirmasi pembayaran.')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Topbar mobile */}
      <div className="md:hidden flex items-center justify-between bg-blue-700 text-white p-4">
        <div className="text-xl font-bold">KEUANGAN</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`bg-blue-700 text-white w-full md:w-64 md:h-screen flex flex-col p-6 space-y-6 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="text-2xl font-bold mb-4 hidden md:block">KEUANGAN</div>
        <nav className="flex flex-col gap-3">
          {menu.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveMenu(item.title)}
              className={`flex items-center gap-3 p-2 rounded transition ${activeMenu === item.title ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-red-200 hover:text-white">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen p-4 md:p-6 bg-gradient-to-br from-white via-blue-100 to-blue-200 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">
          Dashboard Keuangan - {activeMenu}
        </h1>

        {activeMenu === 'Dashboard' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
              <h2 className="text-lg font-semibold text-yellow-700 mb-1">Booking Menunggu</h2>
              <p className="text-3xl font-bold text-yellow-800">{approvalData.length}</p>
              <p className="text-sm text-gray-500">Menunggu validasi keuangan</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <h2 className="text-lg font-semibold text-green-700 mb-1">Pembayaran Masuk</h2>
              <p className="text-3xl font-bold text-green-800">{pembayaranData.length}</p>
              <p className="text-sm text-gray-500">
                {pembayaranData.filter(p => p.statusBayar !== 'Terverifikasi').length} belum dikonfirmasi
              </p>
            </div>
          </div>
        )}

        {activeMenu === 'Approval Booking' && (
          <div className="p-2 bg-white rounded shadow mt-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Data Booking Menunggu</h2>
            <table className="w-full text-sm border">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border px-2 py-1">Nama</th>
                  <th className="border px-2 py-1">Telepon</th>
                  <th className="border px-2 py-1">Alamat</th>
                  <th className="border px-2 py-1">Tanggal</th>
                  <th className="border px-2 py-1">Waktu</th>
                  <th className="border px-2 py-1">Durasi</th>
                  <th className="border px-2 py-1">Ruangan</th>
                  <th className="border px-2 py-1">Acara</th>
                </tr>
              </thead>
              <tbody>
                {approvalData.length > 0 ? approvalData.map((item) => (
                  <tr key={item._id} className="text-center">
                    <td className="border p-2">{item.nama_pemesan}</td>
                    <td className="border p-2">{item.telp}</td>
                    <td className="border p-2">{item.alamat}</td>
                    <td className="border p-2">{new Date(item.tanggal_booking).toLocaleDateString('id-ID')}</td>
                    <td className="border p-2">{item.waktu_mulai} - {item.waktu_selesai}</td>
                    <td className="border p-2">{item.durasi} jam</td>
                    <td className="border p-2">{item.id_ruangan?.lokasi}</td>
                    <td className="border p-2">{item.nama_acara}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center p-4 text-gray-500">Tidak ada booking menunggu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeMenu === 'Data Pembayaran' && (
          <div className="p-2 bg-white rounded shadow mt-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Data Pembayaran</h2>
            <table className="w-full border text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2">Nama</th>
                  <th className="border p-2">Tanggal Bayar</th>
                  <th className="border p-2">Jumlah</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranData.length > 0 ? (
                  pembayaranData.map((item) => (
                    <tr key={item._id} className="text-center border-t">
                      <td className="p-2 border">{item.nama_pemesan}</td>
                      <td className="p-2 border">{item.tanggalBayar ? new Date(item.tanggalBayar).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="p-2 border">Rp {item.jumlahBayar?.toLocaleString('id-ID')}</td>
                      <td className="p-2 border">{item.statusBayar}</td>
                      <td className="p-2 border">
                        {item.statusBayar !== 'Terverifikasi' && (
                          <button
                            onClick={() => handleKonfirmasiPembayaran(item._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Konfirmasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Tidak ada data pembayaran.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
