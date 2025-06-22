'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  MonitorCheck,
  CalendarDays,
  BookOpenCheck,
  ClipboardList,
  LogOut,
  Menu,
  X,
  PlusCircle,
  FileText,
  Building2,
} from 'lucide-react'

// Dynamic import untuk efisiensi loading
const KelolaBookingPage = dynamic(() => import('../kelolabooking/page'))
const ApprovalBookingPage = dynamic(() => import('../approval/page'))
const Kalender = dynamic(() => import('../kalender/page'))
const Laporan = dynamic(() => import('../laporan/page'))
const Ruangan = dynamic(() => import('../ruangan/page'))
const JadwalBookingPage = dynamic(() => import('../lihatbooking/page'))
const RiwayatBooking = dynamic(() => import('../riwayat/page'))
const StatusRuangan = dynamic(() => import('../statusruangan/page'))
const PembayaranPage = dynamic(() => import('../pembayaran/page'))
const ContactPage = dynamic(() => import('../contact/page'))

export default function DashboardAdmin() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    bookingToday: 0,
    pendingBooking: 0,
    totalRuangan: 0,
    ruanganTerpakai: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem('role');
      if (role !== 'admin') {
        router.push('/login');
        return;
      }
  
      try {
        console.log("🔄 Memulai fetch data...");
        const [approvalRes, ruanganRes] = await Promise.all([
          fetch('/api/booking'),
          fetch('/api/ruangan'),
        ]);
  
        console.log("📡 Status API Booking:", approvalRes.status);
        console.log("📡 Status API Ruangan:", ruanganRes.status);
  
        if (!approvalRes.ok || !ruanganRes.ok) {
          throw new Error(`❌ Gagal mengambil data dari server: ${approvalRes.status} & ${ruanganRes.status}`);
        }
  
        const approvalJson = await approvalRes.json();
        const ruanganJson = await ruanganRes.json();
  
        console.log("✅ Data Booking diterima:", approvalJson);
        console.log("✅ Data Ruangan diterima:", ruanganJson);
  
        const approvalData = Array.isArray(approvalJson) ? approvalJson : [];
        const ruanganData = Array.isArray(ruanganJson) ? ruanganJson : [];
  
        const today = new Date().toISOString().split('T')[0];
  
        const bookingToday = approvalData.filter(
          (item) => item.tanggal_booking === today
        ).length;
  
        const pendingBooking = approvalData.filter(
          (item) => item.status === 'Menunggu'
        ).length;
  
        const ruanganTerpakai = new Set(
          approvalData
            .filter(
              (item) => item.status === 'Disetujui' && item.tanggal_booking === today
            )
            .map((item) => item.id_ruangan)
        ).size;
  
        const totalRuangan = ruanganData.length;
  
        setStats({
          bookingToday,
          pendingBooking,
          totalRuangan,
          ruanganTerpakai,
        });
  
      } catch (error) {
        console.error('❌ Kesalahan saat fetch data:', error);

      }
    };
  
    fetchData();
  }, [router]);
 
  

  const handleLogout = () => {
    localStorage.removeItem('role')
    router.push('/login')
  }

  const menu = [
    { title: 'Dashboard', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Kalender Ruangan', icon: <CalendarDays className="w-5 h-5" /> },
    { title: 'Kelola Booking', icon: <BookOpenCheck className="w-5 h-5" /> },
    { title: 'Approval Booking', icon: <MonitorCheck className="w-5 h-5" /> },
    { title: 'Lihat Jadwal Booking', icon: <CalendarDays className="w-5 h-5" /> },
    { title: 'Pembayaran', icon: <FileText className="w-5 h-5" /> },
    { title: 'Lihat Riwayat Booking', icon: <FileText className="w-5 h-5" /> },
    { title: 'Status Ruangan', icon: <Building2 className="w-5 h-5" /> },
    { title: 'Kelola Ruangan', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Laporan Booking', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Biodata', icon: <ClipboardList className="w-5 h-5" /> },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-blue-700 text-white flex-col p-6 space-y-6">
        <div className="text-2xl font-bold mb-4">SNJ BOOKING</div>
        <nav className="flex flex-col gap-3">
          {menu.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveMenu(item.title)}
              className={`flex items-center gap-3 p-2 rounded transition ${
                activeMenu === item.title ? 'bg-blue-600' : 'hover:bg-blue-600'
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-red-200 hover:text-white transition"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between bg-blue-700 text-white p-4">
        <div className="text-xl font-bold">SNJ BOOKING</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="md:hidden bg-blue-600 text-white p-4 space-y-4 z-50">
          {menu.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveMenu(item.title)
                setSidebarOpen(false)
              }}
              className={`flex items-center gap-3 p-2 rounded w-full text-left transition ${
                activeMenu === item.title ? 'bg-blue-500' : 'hover:bg-blue-500'
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-200 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-blue-100 to-white overflow-y-auto">
        {activeMenu === 'Dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-4">Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">
              Halo, selamat datang Admin. Silakan pilih menu di sebelah kiri untuk mulai mengelola sistem booking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Jumlah Booking Hari Ini" value={stats.bookingToday} color="text-blue-700" />
              <StatCard title="Booking Menunggu Persetujuan" value={stats.pendingBooking} color="text-yellow-600" />
              <StatCard
                title="Ruangan Tersedia vs Terpakai"
                value={`${stats.totalRuangan - stats.ruanganTerpakai} / ${stats.totalRuangan}`}
                color="text-green-700"
              />
              <StatCard title="Total Ruangan Terdaftar" value={stats.totalRuangan} color="text-purple-700" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <ShortcutButton title="Tambah Booking" icon={<PlusCircle />} color="bg-blue-600" onClick={() => setActiveMenu('Kelola Booking')} />
              <ShortcutButton title="Approval Booking" icon={<MonitorCheck />} color="bg-green-600" onClick={() => setActiveMenu('Approval Booking')} />
              <ShortcutButton title="Cetak Laporan" icon={<FileText />} color="bg-yellow-600" onClick={() => setActiveMenu('Laporan Booking')} />
              <ShortcutButton title="Kelola Ruangan" icon={<Building2 />} color="bg-indigo-600" onClick={() => setActiveMenu('Kelola Ruangan')} />
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Kalender Ketersediaan Ruangan</h2>
              <Kalender />
            </div>
          </div>
        )}

        <Suspense fallback={<div>Loading...</div>}>
          {activeMenu === 'Kelola Booking' && <KelolaBookingPage />}
          {activeMenu === 'Approval Booking' && <ApprovalBookingPage />}
          {activeMenu === 'Lihat Jadwal Booking' && <JadwalBookingPage  />}
          {activeMenu === 'Pembayaran' && <PembayaranPage />}
          {activeMenu === 'Kelola Ruangan' && <Ruangan />}
          {activeMenu === 'Kalender Ruangan' && <Kalender />}
          {activeMenu === 'Lihat Riwayat Booking' && <RiwayatBooking />}
          {activeMenu === 'Status Ruangan' && <StatusRuangan />}
          {activeMenu === 'Laporan Booking' && <Laporan />}
          {activeMenu === 'Biodata' && <ContactPage />}
        </Suspense>
      </main>
    </div>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function ShortcutButton({ title, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} hover:opacity-90 text-white p-4 rounded-xl flex flex-col items-center justify-center transition`}
    >
      {icon}
      <span className="mt-1 text-sm text-center">{title}</span>
    </button>
  )
}
