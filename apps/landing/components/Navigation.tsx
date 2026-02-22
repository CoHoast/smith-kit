"use client";

import { useState } from "react";
import Link from "next/link";

function HammerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15L22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

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
    <nav className="fixed top-0 w-full z-50 nav-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center logo-glow">
            <HammerIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">SmithKit</span>
        </Link>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#tools" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Tools</Link>
          <Link href="#pricing" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Pricing</Link>
          <Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Docs</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="#" className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium">
            <span className="flex items-center gap-2">
              <GitHubIcon className="w-4 h-4" />
              Get Started
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#a1a1aa] hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a12]/98 backdrop-blur-xl border-b border-[#1e1e2e]">
          <div className="px-6 py-6 space-y-4">
            <Link 
              href="#tools" 
              onClick={() => setIsOpen(false)}
              className="block text-lg text-[#a1a1aa] hover:text-white transition-colors py-2"
            >
              Tools
            </Link>
            <Link 
              href="#pricing" 
              onClick={() => setIsOpen(false)}
              className="block text-lg text-[#a1a1aa] hover:text-white transition-colors py-2"
            >
              Pricing
            </Link>
            <Link 
              href="#" 
              onClick={() => setIsOpen(false)}
              className="block text-lg text-[#a1a1aa] hover:text-white transition-colors py-2"
            >
              Docs
            </Link>
            <div className="pt-4 border-t border-[#1e1e2e] space-y-4">
              <Link 
                href="#" 
                onClick={() => setIsOpen(false)}
                className="block text-lg text-[#a1a1aa] hover:text-white transition-colors py-2"
              >
                Log in
              </Link>
              <Link 
                href="#" 
                onClick={() => setIsOpen(false)}
                className="gradient-btn px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  <GitHubIcon className="w-5 h-5" />
                  Get Started
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
