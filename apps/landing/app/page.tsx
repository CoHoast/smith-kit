import Link from "next/link";
import Image from "next/image";
import { PRICING, COMPETITORS, COMPETITOR_TOTAL, SMITHKIT_PRICE, getLiveTools } from "@/lib/tools";
import Navigation from "@/components/Navigation";
import FAQ from "@/components/FAQ";

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Tool icon components - all use brand gradient
function ToolIcon({ icon, className = "w-6 h-6" }: { icon: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    scroll: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      </svg>
    ),
    activity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    'git-commit': (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="4" />
        <line x1="1.05" y1="12" x2="7" y2="12" />
        <line x1="17.01" y1="12" x2="22.96" y2="12" />
      </svg>
    ),
    toggle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
        <circle cx="16" cy="12" r="3" />
      </svg>
    ),
    status: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    zap: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    clock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    webhook: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
        <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
        <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
      </svg>
    ),
    brain: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
      </svg>
    ),
    alert: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#brand-gradient)" strokeWidth="2">
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  };
  return <>{icons[icon] || icons.scroll}</>;
}

export default function HomePage() {
  const tools = getLiveTools();
  
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navigation />

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-zinc-300">{tools.length} tools live — all included</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            The complete dev toolkit
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              for {SMITHKIT_PRICE}
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Changelogs, uptime monitoring, feature flags, error tracking, and 6 more tools. 
            One subscription replaces <span className="text-zinc-300 line-through">{COMPETITOR_TOTAL}</span> in separate services.
          </p>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="https://smith-kit-production.up.railway.app/login" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
            >
              Start Free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              href="#tools" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              See All Tools
            </Link>
          </div>
          
          {/* Trust line */}
          <p className="text-sm text-zinc-500">
            No credit card required · Free tier forever · Cancel anytime
          </p>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              10 tools. One dashboard.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Everything you need to build, ship, and monitor — without the $500/mo price tag.
            </p>
          </div>
          
          {/* Tools grid - Premium cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-purple-500/20 via-transparent to-cyan-500/20 hover:from-purple-500/40 hover:to-cyan-500/40 transition-all duration-500"
              >
                <div className="relative p-6 rounded-2xl bg-zinc-900 h-full backdrop-blur-xl">
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon with gradient background */}
                  <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                    <ToolIcon icon={tool.icon} className="w-7 h-7" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="relative text-xl font-semibold mb-2">{tool.name}</h3>
                  <p className="relative text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">{tool.tagline}</p>
                  <p className="relative text-zinc-400 text-sm leading-relaxed mb-5">{tool.description}</p>
                  
                  {/* Features */}
                  <div className="relative flex flex-wrap gap-2">
                    {tool.features.slice(0, 2).map((feature) => (
                      <span key={feature} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROP */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Stop paying for 10 different subscriptions
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {COMPETITORS.map((comp) => (
              <div key={comp.name} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-zinc-500 line-through text-sm">{comp.name}</span>
                <span className="text-zinc-600 text-sm ml-2">{comp.price}</span>
              </div>
            ))}
          </div>
          
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/30">
            <span className="text-zinc-400">Total:</span>
            <span className="text-zinc-500 line-through text-xl">{COMPETITOR_TOTAL}</span>
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{SMITHKIT_PRICE}</span>
          </div>
          
          <p className="mt-8 text-emerald-400 text-sm font-medium">
            ✓ Early adopters locked in at this price forever
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Up and running in minutes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign up free", desc: "GitHub or Google OAuth. No credit card needed." },
              { step: "2", title: "All tools ready", desc: "Every tool is unlocked and ready to use immediately." },
              { step: "3", title: "Ship faster", desc: "One dashboard for everything. Zero context switching." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-purple-500/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-zinc-400 text-lg">All tools included. No per-seat fees. No surprises.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-xl font-semibold mb-1">{PRICING.free.name}</h3>
              <p className="text-zinc-500 text-sm mb-4">{PRICING.free.description}</p>
              <p className="text-4xl font-bold mb-6">${PRICING.free.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.free.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-3 rounded-xl border border-zinc-700 text-center font-medium hover:bg-zinc-800 transition-colors">
                {PRICING.free.cta}
              </Link>
            </div>
            
            {/* Pro */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-purple-500 via-fuchsia-500 to-cyan-500">
              <div className="relative p-8 rounded-2xl bg-zinc-900 h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-xs font-semibold">
                  Most Popular
                </div>
                
                <h3 className="text-xl font-semibold mb-1">{PRICING.pro.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{PRICING.pro.description}</p>
                <p className="text-4xl font-bold mb-6">${PRICING.pro.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
                
                <ul className="space-y-3 mb-8">
                  {PRICING.pro.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                
                <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-center font-medium hover:opacity-90 transition-opacity">
                  {PRICING.pro.cta}
                </Link>
              </div>
            </div>
            
            {/* Team */}
            <div className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-xl font-semibold mb-1">{PRICING.premium.name}</h3>
              <p className="text-zinc-500 text-sm mb-4">{PRICING.premium.description}</p>
              <p className="text-4xl font-bold mb-6">${PRICING.premium.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-3 rounded-xl border border-zinc-700 text-center font-medium hover:bg-zinc-800 transition-colors">
                {PRICING.premium.cta}
              </Link>
            </div>
          </div>
          
          <p className="text-center text-zinc-500 text-sm mt-8">
            All plans include all 10 tools. Cancel anytime.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to simplify your stack?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join developers who switched from $500/mo in tools to one {SMITHKIT_PRICE} subscription.
          </p>
          <Link 
            href="https://smith-kit-production.up.railway.app/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            Start Building Free
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-white.png" alt="SmithKit" width={180} height={50} className="h-10 w-auto" />
          </Link>
          
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com/CoHoast/smith-kit" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          
          <p className="text-sm text-zinc-500">© 2026 SmithKit</p>
        </div>
      </footer>
    </main>
  );
}
