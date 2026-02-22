import Link from "next/link";
import { PRICING, COMPETITORS, getLiveTools, getComingSoonTools } from "@/lib/tools";
import Navigation from "@/components/Navigation";

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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

// Tool icons mapping
function ToolIcon({ icon, className = "w-6 h-6" }: { icon: string; className?: string }) {
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
    webhook: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
        <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
        <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
      </svg>
    ),
    toggle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
        <circle cx="16" cy="12" r="3" />
      </svg>
    ),
    clock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  };
  return icons[icon] || icons.scroll;
}

export default function HomePage() {
  const liveTools = getLiveTools();
  const comingSoon = getComingSoonTools();
  
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#f5f5f7]">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-36 pb-28 px-6 relative overflow-hidden">
        {/* Aurora background */}
        <div className="hero-aurora" />
        
        {/* Floating orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        
        {/* Grid pattern */}
        <div className="grid-pattern" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/30 mb-8 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-[#f8f8fc]">{liveTools.length} tools live</span>
              </span>
              <span className="w-px h-4 bg-[#6366f1]/30" />
              <span className="text-sm text-[#a1a1b5]">{comingSoon.length} more coming</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8 tracking-tight">
              Your entire dev toolkit
              <span className="gradient-text block mt-2">in one place</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#a1a1b5] max-w-2xl mx-auto mb-12 leading-relaxed">
              AI-powered changelogs, uptime monitoring, commit bots, and more. 
              Tools forged for developers. <span className="price-highlight font-bold">$39/mo</span> for everything.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
              <Link href="#" className="gradient-btn px-10 py-5 rounded-2xl font-semibold text-lg group">
                <span className="flex items-center justify-center gap-3">
                  <GitHubIcon className="w-5 h-5" />
                  Start for Free
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="#tools" className="px-10 py-5 rounded-2xl bg-[#12121f] border border-[#1e1e2e] font-semibold text-lg hover:bg-[#1a1a28] hover:border-[#2e2e45] transition-all flex items-center justify-center gap-2">
                Explore Tools
              </Link>
            </div>
            
            {/* Value prop comparison */}
            <div className="glass-card p-8 max-w-3xl mx-auto glow">
              <p className="text-xs text-[#6b6b80] mb-6 uppercase tracking-[0.2em] font-medium">Stop overpaying for your stack</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {COMPETITORS.map((comp) => (
                  <div key={comp.name} className="text-center p-3 rounded-xl bg-[#0a0a12]/50">
                    <p className="strike-price text-xl font-bold">{comp.price}</p>
                    <p className="text-xs text-[#6b6b80] mt-1">{comp.name}</p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-[#1e1e2e]">
                <p className="text-3xl md:text-4xl font-bold">
                  <span className="gradient-text">SmithKit:</span> <span className="price-highlight font-bold">$39/mo</span> <span className="text-[#a1a1b5] font-normal text-xl">for all of it</span>
                </p>
                <p className="text-sm text-[#10b981] mt-3 flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                  Early adopters grandfathered in forever
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-28 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#6366f1] text-sm font-semibold uppercase tracking-[0.2em] mb-4">The Toolkit</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything you need to <span className="gradient-text">build</span>
            </h2>
            <p className="text-[#a1a1b5] text-xl max-w-xl mx-auto">
              Premium dev tools at indie prices. One subscription, all tools included.
            </p>
          </div>
          
          {/* Live Tools */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {liveTools.map((tool) => (
              <div key={tool.id} className="tool-card p-6 relative">
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <span className="badge-live px-2 py-1 rounded-full text-xs font-medium text-white">
                    Live
                  </span>
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-4`}>
                  <ToolIcon icon={tool.icon} className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-1">{tool.name}</h3>
                <p className="text-[#a1a1aa] text-sm mb-4">{tool.tagline}</p>
                <p className="text-[#71717a] text-sm mb-6 leading-relaxed">{tool.description}</p>
                
                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tool.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                      <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Link 
                  href="#" 
                  className="flex items-center gap-1 text-sm font-medium text-[#6366f1] hover:text-[#8b5cf6] transition-colors"
                >
                  Try {tool.name}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
          
          {/* Coming Soon Tools */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-center text-[#71717a]">Coming Soon</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoon.map((tool) => (
                <div key={tool.id} className="tool-card p-6 relative opacity-75">
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <span className="badge-soon px-2 py-1 rounded-full text-xs font-medium text-[#71717a]">
                      Coming Soon
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-4 opacity-50`}>
                    <ToolIcon icon={tool.icon} className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-1">{tool.name}</h3>
                  <p className="text-[#a1a1aa] text-sm mb-4">{tool.tagline}</p>
                  <p className="text-[#71717a] text-sm leading-relaxed">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#0a0a12] to-[#050507]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              One forge. <span className="gradient-text">All your tools.</span>
            </h2>
            <p className="text-[#a1a1b5] text-xl max-w-xl mx-auto">
              Sign up once. Your toolkit is ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl step-circle flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Sign Up Free</h3>
              <p className="text-[#a1a1b5] text-lg leading-relaxed">
                GitHub or Google OAuth. One click, you&apos;re in. No credit card required.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl step-circle flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">All Tools Unlocked</h3>
              <p className="text-[#a1a1b5] text-lg leading-relaxed">
                Every tool is included. Changelog, Uptime, CommitBot — all yours from day one.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 rounded-2xl step-circle flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Faster</h3>
              <p className="text-[#a1a1b5] text-lg leading-relaxed">
                Everything works together. One dashboard, one bill, zero context switching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#6366f1] text-sm font-semibold uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Simple pricing. <span className="gradient-text">Unlimited value.</span>
            </h2>
            <p className="text-[#a1a1b5] text-xl mb-6">
              One price, all tools. No per-seat nonsense. No surprises.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span className="text-sm font-medium text-[#10b981]">Early adopters grandfathered in forever</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="pricing-card bg-[#12121a] border border-[#27272a] rounded-2xl p-8">
              <h3 className="text-lg font-semibold mb-2">{PRICING.free.name}</h3>
              <p className="text-[#71717a] text-sm mb-6">{PRICING.free.description}</p>
              <p className="text-4xl font-bold mb-6">${PRICING.free.price}<span className="text-lg text-[#71717a] font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.free.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 rounded-xl border border-[#27272a] font-medium hover:bg-[#1a1a25] transition-colors">
                {PRICING.free.cta}
              </button>
            </div>
            
            {/* Pro - Popular */}
            <div className="pricing-card pricing-popular bg-[#12121a] rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-btn text-xs font-medium">
                <span>Most Popular</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{PRICING.pro.name}</h3>
              <p className="text-[#71717a] text-sm mb-6">{PRICING.pro.description}</p>
              <p className="text-4xl font-bold mb-6">${PRICING.pro.price}<span className="text-lg text-[#71717a] font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.pro.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 rounded-xl gradient-btn font-medium">
                <span>{PRICING.pro.cta}</span>
              </button>
            </div>
            
            {/* Team */}
            <div className="pricing-card bg-[#12121a] border border-[#27272a] rounded-2xl p-8">
              <h3 className="text-lg font-semibold mb-2">{PRICING.team.name}</h3>
              <p className="text-[#71717a] text-sm mb-6">{PRICING.team.description}</p>
              <p className="text-4xl font-bold mb-6">${PRICING.team.price}<span className="text-lg text-[#71717a] font-normal">/mo</span></p>
              
              <ul className="space-y-3 mb-8">
                {PRICING.team.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 rounded-xl border border-[#27272a] font-medium hover:bg-[#1a1a25] transition-colors">
                {PRICING.team.cta}
              </button>
            </div>
          </div>
          
          <p className="text-center text-sm text-[#71717a] mt-8">
            All plans include all current and future tools. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#6b6b80] text-sm uppercase tracking-[0.2em] mb-12">Trusted by developers building the future</p>
          
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {/* Placeholder logos - replace with real ones */}
            <div className="text-2xl font-bold text-[#3f3f50]">acme</div>
            <div className="text-2xl font-bold text-[#3f3f50]">globex</div>
            <div className="text-2xl font-bold text-[#3f3f50]">initech</div>
            <div className="text-2xl font-bold text-[#3f3f50]">hooli</div>
            <div className="text-2xl font-bold text-[#3f3f50]">pied piper</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#6366f1] text-sm font-semibold uppercase tracking-[0.2em] mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Common <span className="gradient-text">questions</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">How does SmithKit use AI?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                Our Changelog tool uses AI to analyze your GitHub commits and automatically generate human-readable release notes. 
                CommitBot uses AI to read your code changes and craft perfect commit messages. The AI does the tedious work so you can focus on building.
              </p>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">Do I have to use all the tools?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                Nope! While all tools are included in every plan, you only use what you need. Enable Changelog today, add Uptime monitoring next month — it&apos;s up to you. 
                You&apos;re not paying extra either way.
              </p>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">What happens when you add new tools?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                You get them automatically at no extra cost. We&apos;re building WebhookLab, ToggleBox, and CronPilot right now. 
                When they launch, they&apos;ll appear in your dashboard — no price increase, no upgrade required.
              </p>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">What does &quot;grandfathered forever&quot; mean?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                If you sign up now at $39/mo, that&apos;s your price forever — even if we raise prices later. 
                Early adopters who believe in us get rewarded with locked-in pricing for life.
              </p>
            </div>
            
            {/* FAQ Item 5 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                Yes. No contracts, no commitments. Cancel with one click from your dashboard. 
                We&apos;d rather earn your business every month than lock you in.
              </p>
            </div>
            
            {/* FAQ Item 6 */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3">How is this so much cheaper than competitors?</h3>
              <p className="text-[#a1a1b5] leading-relaxed">
                We&apos;re built lean. No enterprise sales team, no bloated features, no VC pressure to maximize extraction. 
                We build focused tools that work, price them fairly, and let the product speak for itself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-[#0a0a12] to-[#050507]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[150px]" />
        
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to <span className="gradient-text">forge</span> your stack?
          </h2>
          <p className="text-xl md:text-2xl text-[#a1a1b5] mb-12">
            Stop paying $500/mo for tools that should cost <span className="price-highlight font-bold">$39</span>
          </p>
          <Link href="#" className="gradient-btn px-12 py-6 rounded-2xl font-semibold text-xl inline-flex items-center gap-4 group">
            <span className="flex items-center gap-3">
              <GitHubIcon className="w-6 h-6" />
              Get Started for Free
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <p className="mt-8 text-[#6b6b80]">
            No credit card required · Free tier forever · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center logo-glow">
                <HammerIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">SmithKit</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-[#6b6b80]">
              <Link href="#" className="hover:text-white transition-colors text-glow">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors text-glow">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors text-glow">Docs</Link>
              <Link href="#" className="hover:text-white transition-colors text-glow">Status</Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center gap-2 text-glow">
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </Link>
            </div>
            
            <p className="text-sm text-[#6b6b80]">
              © 2026 SmithKit. <span className="gradient-text font-medium">Forge ahead.</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
