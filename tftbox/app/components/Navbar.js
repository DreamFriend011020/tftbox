'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white transition-colors';

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
      <div className="text-2xl font-bold text-blue-400">
        <Link href="/" className="hover:text-blue-300 transition-colors">TFTBOX.GG</Link>
      </div>
      <ul className="flex gap-6 list-none">
        <li><Link href="/" className={isActive('/')}>홈</Link></li>
        <li><Link href="/champions" className={isActive('/champions')}>챔피언</Link></li>
        <li><Link href="/items" className={isActive('/items')}>아이템</Link></li>
      </ul>
    </nav>
  );
}
