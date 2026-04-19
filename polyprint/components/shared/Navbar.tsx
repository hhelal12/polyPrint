import Link from 'next/link'
import Image from 'next/image' // 1. Import the Image component

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2">
          {/* 2. Use the Image component */}
          <Image 
            src="/logo.svg" 
            alt="Bahrain Polytechnic Logo" 
            width={32} 
            height={32} 
            priority // This ensures the logo loads immediately
          />
          <span className="text-xl font-bold text-poly-dark">PolyPrint</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium hover:text-poly-accent transition-colors">
            Dashboard
          </Link>
          <Link href="/orders/new" className="text-sm font-medium hover:text-poly-accent transition-colors">
            New Order
          </Link>
        </div>

        {/* User Profile / Auth */}
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-poly-accent/20 border border-poly-accent flex items-center justify-center text-poly-dark font-semibold">
            HM
          </div>
        </div>

      </div>
    </nav>
  )
}