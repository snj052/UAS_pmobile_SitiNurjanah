// app/contact/page.js
import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Biodata Saya</h1>
        <div className="flex flex-col items-center">
          <Image
            src="/siti.jpg"
            alt="Foto Profil"
            width={150}
            height={150}
            className="rounded-full mb-4"
          />
          <p className="text-lg font-semibold">Nama: Siti Nurjanah</p>
          <p className="text-lg">NIM: 232302023</p>
          <p className="text-lg">Program Studi: Komputerisasi Akuntansi</p>
          <p className="text-lg">Fakultas: Komputer</p>
          <p className="text-lg">Universitas: Universitas Ma'soem</p>
          <p className="text-lg">Email: janah030905@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
