export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar atau Sidebar global bisa di sini */}
        {children}
      </div>
    )
  }
  