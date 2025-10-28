'use client';

import { usePathname } from 'next/navigation';

import Navbar from 'src/components/navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  // Esconde a Navbar apenas na rota inicial
  if (pathname === '/') return null;
  return <Navbar />;
}
