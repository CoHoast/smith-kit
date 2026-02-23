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

// Tool categories for organized display
const toolCategories = [
  {
    name: "Monitoring",
    description: "Keep your apps running smoothly",
    color: "emerald",
    tools: [
      { name: "Uptime", desc: "Monitor sites & APIs with multi-region checks" },
      { name: "StatusKit", desc: "Beautiful public status pages" },
      { name: "ErrorWatch", desc: "Catch errors before users complain" },
    ],
  },
  {
    name: "Developer",
    description: "Ship faster, ship better",
    color: "purple",
    tools: [
      { name: "Changelog", desc: "AI-powered release notes from commits" },
      { name: "CommitBot", desc: "AI writes your commit messages" },
      { name: "ToggleBox", desc: "Feature flags without the $400/mo" },
    ],
  },
  {
    name: "Automation",
    description: "Automate the boring stuff",
    color: "cyan",
    tools: [
      { name: "CronPilot", desc: "Scheduled jobs without servers" },
      { name: "WebhookLab", desc: "Debug & replay webhooks" },
      { name: "EventLog", desc: "Real-time event tracking" },
    ],
  },
  {
    name: "AI & Security",
    description: "Modern tools for modern apps",
    color: "orange",
    tools: [
      { name: "LLM Analytics", desc: "Track AI costs & usage" },
      { name: "VaultKit", desc: "Encrypted secrets management" },
      { name: "DepWatch", desc: "Dependency vulnerability scanner" },
    ],
  },
];

export default function HomePage() {
  const tools = getLiveTools();
  
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navigation />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[200px]" />
        <div className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[180px]" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-zinc-200">{tools.length} tools — one subscription</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
              Your complete
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                dev toolkit
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Monitoring, changelogs, feature flags, error tracking, and 8 more tools.
              <span className="text-zinc-300"> All for {SMITHKIT_PRICE}.</span>
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link 
                href="https://smith-kit-production.up.railway.app/login" 
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5"
              >
                Start Free
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#tools" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                See All Tools
              </Link>
            </div>
            
            {/* Trust line */}
            <p className="text-sm text-zinc-500">
              No credit card required · Free tier forever · Cancel anytime
            </p>
          </div>
          
          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-2xl blur-2xl scale-105" />
            
            {/* Browser frame */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700/50 shadow-2xl shadow-purple-500/10">
              {/* Browser bar */}
              <div className="bg-zinc-800/80 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-zinc-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-lg bg-zinc-900/80 text-xs text-zinc-400 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    app.smithkit.dev
                  </div>
                </div>
              </div>
              
              {/* Screenshot */}
              <Image 
                src="/dashboard-preview.jpg" 
                alt="SmithKit Dashboard" 
                width={1920} 
                height={1080} 
                className="w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop paying for 10 different subscriptions
          </h2>
          <p className="text-zinc-400 text-lg mb-12">
            Replace expensive tools with one affordable suite
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
            {COMPETITORS.map((comp) => (
              <div key={comp.name} className="group px-5 py-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <span className="text-zinc-500 line-through text-sm">{comp.name}</span>
                <span className="text-red-400/80 text-sm ml-2">{comp.price}</span>
              </div>
            ))}
          </div>
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 px-10 py-8 rounded-3xl bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-cyan-600/10 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-lg">Total:</span>
              <span className="text-zinc-500 line-through text-2xl">{COMPETITOR_TOTAL}</span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-zinc-700" />
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-lg">SmithKit:</span>
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{SMITHKIT_PRICE}</span>
            </div>
          </div>
          
          <p className="mt-8 text-emerald-400 text-sm font-medium">
            ✓ Early adopters locked in at this price forever
          </p>
        </div>
      </section>

      {/* TOOLS BY CATEGORY */}
      <section id="tools" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              12 tools. One dashboard.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Everything you need to build, ship, and monitor your apps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {toolCategories.map((category) => {
              const colorMap: Record<string, { border: string; dot: string; bg: string }> = {
                emerald: { border: 'border-emerald-500/20 hover:border-emerald-500/40', dot: 'bg-emerald-500', bg: 'from-emerald-500/5' },
                purple: { border: 'border-purple-500/20 hover:border-purple-500/40', dot: 'bg-purple-500', bg: 'from-purple-500/5' },
                cyan: { border: 'border-cyan-500/20 hover:border-cyan-500/40', dot: 'bg-cyan-500', bg: 'from-cyan-500/5' },
                orange: { border: 'border-orange-500/20 hover:border-orange-500/40', dot: 'bg-orange-500', bg: 'from-orange-500/5' },
              };
              const colors = colorMap[category.color];
              
              return (
                <div 
                  key={category.name} 
                  className={`p-8 rounded-3xl bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 mb-6">{category.description}</p>
                  
                  <div className="space-y-4">
                    {category.tools.map((tool) => (
                      <div key={tool.name} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{tool.name}</p>
                          <p className="text-sm text-zinc-500">{tool.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Up and running in minutes
            </h2>
            <p className="text-zinc-400 text-lg">No complex setup. No configuration headaches.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "1", 
                title: "Sign up free", 
                desc: "Create your account with GitHub or Google. No credit card required.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                )
              },
              { 
                step: "2", 
                title: "All tools ready", 
                desc: "Every tool is unlocked from day one. Start using what you need.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                )
              },
              { 
                step: "3", 
                title: "Ship faster", 
                desc: "One dashboard for everything. Zero context switching between tools.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
                    <div className="text-purple-400">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/30">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
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
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <h3 className="text-xl font-semibold mb-1">{PRICING.free.name}</h3>
              <p className="text-zinc-500 text-sm mb-6">{PRICING.free.description}</p>
              <p className="text-5xl font-bold mb-8">${PRICING.free.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
              
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
                  <p className="text-5xl font-bold mb-8">${PRICING.pro.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
                  
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
              <p className="text-5xl font-bold mb-8">${PRICING.premium.price}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
              
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

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/30 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[200px]" />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to simplify
            <br />
            your stack?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
            Join developers who switched from {COMPETITOR_TOTAL} in tools
            <br className="hidden sm:block" /> to one {SMITHKIT_PRICE} subscription.
          </p>
          <Link 
            href="https://smith-kit-production.up.railway.app/login"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold text-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5"
          >
            Start Building Free
            <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-white.png" alt="SmithKit" width={180} height={50} className="h-10 w-auto" />
          </Link>
          
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com/CoHoast/smith-kit" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          
          <p className="text-sm text-zinc-600">© 2026 SmithKit</p>
        </div>
      </footer>
    </main>
  );
}
