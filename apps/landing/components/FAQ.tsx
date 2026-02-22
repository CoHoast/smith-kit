"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How does SmithKit use AI?",
    answer: "Our Changelog tool uses AI to analyze your GitHub commits and automatically generate human-readable release notes. CommitBot uses AI to read your code changes and craft perfect commit messages. The AI does the tedious work so you can focus on building."
  },
  {
    question: "Do I have to use all the tools?",
    answer: "Nope! While all tools are included in every plan, you only use what you need. Enable Changelog today, add Uptime monitoring next month — it's up to you. You're not paying extra either way."
  },
  {
    question: "What happens when you add new tools?",
    answer: "You get them automatically at no extra cost. We're building WebhookLab, ToggleBox, and CronPilot right now. When they launch, they'll appear in your dashboard — no price increase, no upgrade required."
  },
  {
    question: "What does \"grandfathered forever\" mean?",
    answer: "If you sign up now at $39/mo, that's your price forever — even if we raise prices later. Early adopters who believe in us get rewarded with locked-in pricing for life."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. No contracts, no commitments. Cancel with one click from your dashboard. We'd rather earn your business every month than lock you in."
  },
  {
    question: "How is this so much cheaper than competitors?",
    answer: "We're built lean. No enterprise sales team, no bloated features, no VC pressure to maximize extraction. We build focused tools that work, price them fairly, and let the product speak for itself."
  }
];

function ChevronIcon({ className = "w-5 h-5", expanded = false }: { className?: string; expanded?: boolean }) {
  return (
    <svg 
      className={`${className} transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-28 px-6 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent" />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#6366f1] text-sm font-semibold uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Common <span className="gradient-text">questions</span>
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                <ChevronIcon 
                  className="w-5 h-5 text-[#6366f1] flex-shrink-0" 
                  expanded={openIndex === index} 
                />
              </button>
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-[#a1a1b5] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
