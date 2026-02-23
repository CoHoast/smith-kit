import Link from "next/link";
import { PRICING, COMPETITORS, COMPETITOR_TOTAL, SMITHKIT_PRICE, getLiveTools } from "@/lib/tools";
import Navigation from "@/components/Navigation";
import FAQ from "@/components/FAQ";

// Icons
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

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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

// Tool icon components
function ToolIcon({ icon, className = "w-7 h-7" }: { icon: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    scroll: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      </svg>
    ),
    activity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    'git-commit': (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <line x1="1.05" y1="12" x2="7" y2="12" />
        <line x1="17.01" y1="12" x2="22.96" y2="12" />
      </svg>
    ),
    toggle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
        <circle cx="16" cy="12" r="3" />
      </svg>
    ),
    status: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    zap: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    clock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    webhook: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
        <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
        <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
      </svg>
    ),
    brain: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
        <path d="M12 12v10" />
        <path d="M8 22h8" />
        <path d="M7 8h10" />
      </svg>
    ),
    alert: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <main className="min-h-screen bg-[#030305] text-white overflow-hidden">
      <Navigation />

      {/* HERO SECTION - Bold & Electric */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Animated gradient background */}
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/30 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[150px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-[130px] animate-pulse-slow animation-delay-4000" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-violet-500/30 backdrop-blur-sm mb-10 animate-fade-in">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-semibold text-white">{tools.length} Tools Live</span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-sm text-violet-300">All included in one plan</span>
            </div>
            
            {/* Main headline - BOLD */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tight animate-fade-in-up">
              <span className="block">10 Dev Tools.</span>
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                One Price.
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-6 animate-fade-in-up animation-delay-200">
              Changelog, monitoring, feature flags, error tracking, and more.
              Everything you need to ship faster.
            </p>
            
            {/* Price callout */}
            <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
              <span className="text-gray-500 line-through text-xl">{COMPETITOR_TOTAL}</span>
              <span className="text-4xl md:text-5xl font-black text-cyan-400">{SMITHKIT_PRICE}</span>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-600">
              <Link 
                href="https://smith-kit-production.up.railway.app/login" 
                className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-size-200 animate-gradient-x" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-fuchsia-600 via-cyan-500 to-fuchsia-600 bg-size-200 animate-gradient-x" />
                <span className="relative flex items-center justify-center gap-3">
                  <GitHubIcon className="w-5 h-5" />
                  Start Building Free
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                href="#tools" 
                className="px-10 py-5 rounded-2xl font-bold text-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                See All Tools
              </Link>
            </div>
            
            {/* Competitor comparison - compact */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up animation-delay-800">
              <span className="text-sm text-gray-400">Replaces:</span>
              {COMPETITORS.slice(0, 4).map((comp) => (
                <span key={comp.name} className="text-sm text-gray-500">
                  <span className="line-through">{comp.name}</span>
                </span>
              ))}
              <span className="text-sm text-gray-500">+ more</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" className="py-32 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-semibold mb-6">
              THE COMPLETE TOOLKIT
            </span>
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                10 Tools. Zero Bloat.
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every tool you need to build, ship, and monitor your apps.
              All included. No per-tool pricing.
            </p>
          </div>
          
          {/* Tools grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={tool.id} 
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-violet-500/50 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-600/0 via-fuchsia-600/0 to-cyan-600/0 group-hover:from-violet-600/10 group-hover:via-fuchsia-600/10 group-hover:to-cyan-600/10 transition-all duration-500" />
                
                {/* Live badge */}
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                    Live
                  </span>
                </div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <ToolIcon icon={tool.icon} className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="relative text-2xl font-bold mb-2">{tool.name}</h3>
                <p className="relative text-violet-300 text-sm font-medium mb-3">{tool.tagline}</p>
                <p className="relative text-gray-400 text-sm mb-6 leading-relaxed">{tool.description}</p>
                
                {/* Features */}
                <ul className="relative space-y-2 mb-6">
                  {tool.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Link 
                  href="https://smith-kit-production.up.railway.app/login"
                  className="relative inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Try {tool.name}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROP SECTION */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-fuchsia-950/20 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Stop paying{" "}
            <span className="line-through text-gray-600">{COMPETITOR_TOTAL}</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Start paying {SMITHKIT_PRICE}
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Other companies charge you separately for each tool.
            We bundle everything into one simple subscription.
          </p>
          
          {/* Competitor breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {COMPETITORS.map((comp) => (
              <div key={comp.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-500 line-through">{comp.name}</span>
                <span className="text-gray-600 ml-2">{comp.price}</span>
              </div>
            ))}
          </div>
          
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/30">
            <CheckIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-semibold">Early adopters locked in at this price forever</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Three steps to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                shipping faster
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Sign up free", desc: "GitHub or Google. One click. No credit card." },
              { num: "02", title: "All tools unlocked", desc: "Every tool is ready to use. No setup required." },
              { num: "03", title: "Build & ship", desc: "One dashboard for everything. Zero context switching." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30">
                  <span className="text-3xl font-black">{step.num}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-semibold mb-6">
              SIMPLE PRICING
            </span>
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              One price.{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                All tools.
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              No per-seat. No per-tool. No surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-2">{PRICING.free.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{PRICING.free.description}</p>
              <p className="text-5xl font-black mb-8">${PRICING.free.price}<span className="text-lg text-gray-500 font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.free.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl border border-white/20 text-center font-semibold hover:bg-white/5 transition-colors">
                {PRICING.free.cta}
              </Link>
            </div>
            
            {/* Pro - Popular */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-violet-600/20 to-fuchsia-600/10 border-2 border-violet-500/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold">
                Most Popular
              </div>
              
              <h3 className="text-xl font-bold mb-2">{PRICING.pro.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{PRICING.pro.description}</p>
              <p className="text-5xl font-black mb-8">${PRICING.pro.price}<span className="text-lg text-gray-500 font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-center font-semibold hover:opacity-90 transition-opacity">
                {PRICING.pro.cta}
              </Link>
            </div>
            
            {/* Team */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-2">{PRICING.team.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{PRICING.team.description}</p>
              <p className="text-5xl font-black mb-8">${PRICING.team.price}<span className="text-lg text-gray-500 font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.team.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="https://smith-kit-production.up.railway.app/login" className="block w-full py-4 rounded-xl border border-white/20 text-center font-semibold hover:bg-white/5 transition-colors">
                {PRICING.team.cta}
              </Link>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-8">
            All plans include all 10 tools. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* FINAL CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/30 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[200px]" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Ready to{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              ship faster?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of developers building with SmithKit.
          </p>
          <Link 
            href="https://smith-kit-production.up.railway.app/login"
            className="inline-flex items-center gap-4 px-12 py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-xl hover:opacity-90 transition-opacity group"
          >
            <GitHubIcon className="w-6 h-6" />
            Start Building Free
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-8 text-gray-500">
            No credit card required · Free tier forever · Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <HammerIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">SmithKit</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com/CoHoast/smith-kit" className="hover:text-white transition-colors flex items-center gap-2">
              <GitHubIcon className="w-4 h-4" />
              GitHub
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2026 SmithKit
          </p>
        </div>
      </footer>
    </main>
  );
}
