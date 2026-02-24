'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/tools';

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual (better value)

  return (
    <section id="pricing" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 via-transparent to-transparent" />
      
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, honest pricing</h2>
          <p className="text-zinc-400 text-lg mb-8">All tools included. No per-seat fees. No surprises.</p>
          
          {/* Monthly/Annual Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isAnnual 
                  ? 'bg-white text-zinc-900 shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual 
                  ? 'bg-white text-zinc-900 shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Annual
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isAnnual 
                  ? 'bg-emerald-500/20 text-emerald-600' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                Save 25%
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-xl font-semibold mb-1">{PRICING.free.name}</h3>
            <p className="text-zinc-500 text-sm mb-6">{PRICING.free.description}</p>
            <p className="text-5xl font-bold mb-2">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
            <p className="text-zinc-500 text-sm mb-6 h-5">Free forever</p>
            
            <ul className="space-y-4 mb-8">
              {PRICING.free.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckIcon className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            
            <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl border border-zinc-700 text-center font-semibold hover:bg-zinc-800 transition-colors">
              {PRICING.free.cta}
            </Link>
          </div>
          
          {/* Pro - Featured */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500 via-fuchsia-500 to-cyan-500 rounded-3xl blur-sm opacity-50" />
            <div className="relative p-[2px] rounded-3xl bg-gradient-to-b from-purple-500 via-fuchsia-500 to-cyan-500">
              <div className="relative p-8 rounded-3xl bg-zinc-900 h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-sm font-semibold shadow-lg shadow-purple-500/30">
                  Most Popular
                </div>
                
                <h3 className="text-xl font-semibold mb-1 mt-2">{PRICING.pro.name}</h3>
                <p className="text-zinc-500 text-sm mb-6">{PRICING.pro.description}</p>
                
                <div className="mb-2">
                  <span className="text-5xl font-bold">
                    ${isAnnual ? PRICING.pro.priceAnnual : PRICING.pro.price}
                  </span>
                  <span className="text-lg text-zinc-500 font-normal">/mo</span>
                </div>
                <p className="text-zinc-500 text-sm mb-6 h-5">
                  {isAnnual ? (
                    <span className="text-emerald-400">
                      ${PRICING.pro.annualTotal}/year — Save ${PRICING.pro.savings}
                    </span>
                  ) : (
                    'Billed monthly'
                  )}
                </p>
                
                <ul className="space-y-4 mb-8">
                  {PRICING.pro.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckIcon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                
                <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-center font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                  {PRICING.pro.cta}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Premium */}
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-xl font-semibold mb-1">{PRICING.premium.name}</h3>
            <p className="text-zinc-500 text-sm mb-6">{PRICING.premium.description}</p>
            
            <div className="mb-2">
              <span className="text-5xl font-bold">
                ${isAnnual ? PRICING.premium.priceAnnual : PRICING.premium.price}
              </span>
              <span className="text-lg text-zinc-500 font-normal">/mo</span>
            </div>
            <p className="text-zinc-500 text-sm mb-6 h-5">
              {isAnnual ? (
                <span className="text-emerald-400">
                  ${PRICING.premium.annualTotal}/year — Save ${PRICING.premium.savings}
                </span>
              ) : (
                'Billed monthly'
              )}
            </p>
            
            <ul className="space-y-4 mb-8">
              {PRICING.premium.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckIcon className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            
            <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl border border-zinc-700 text-center font-semibold hover:bg-zinc-800 transition-colors">
              {PRICING.premium.cta}
            </Link>
          </div>
        </div>
        
        <p className="text-center text-zinc-500 text-sm mt-10">
          All plans include all 12 tools. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
