"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const DASHBOARD_URL = "https://smith-kit-production.up.railway.app";

function MenuIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo-white.png" alt="SmithKit" width={180} height={50} className="h-10 w-auto" />
        </Link>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#tools" className="text-sm text-zinc-400 hover:text-white transition-colors">Tools</Link>
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="https://github.com/CoHoast/smith-kit" className="text-sm text-zinc-400 hover:text-white transition-colors">Docs</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href={`${DASHBOARD_URL}/login`} className="text-sm text-zinc-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link 
            href={`${DASHBOARD_URL}/login`} 
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#09090b] border-b border-zinc-800">
          <div className="px-6 py-4 space-y-4">
            <Link href="#tools" onClick={() => setIsOpen(false)} className="block text-zinc-400 hover:text-white py-2">Tools</Link>
            <Link href="#pricing" onClick={() => setIsOpen(false)} className="block text-zinc-400 hover:text-white py-2">Pricing</Link>
            <Link href="https://github.com/CoHoast/smith-kit" onClick={() => setIsOpen(false)} className="block text-zinc-400 hover:text-white py-2">Docs</Link>
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <Link href={`${DASHBOARD_URL}/login`} onClick={() => setIsOpen(false)} className="block text-zinc-400 hover:text-white py-2">Log in</Link>
              <Link href={`${DASHBOARD_URL}/login`} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-center font-semibold">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
