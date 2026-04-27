'use client';

import { useState } from 'react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  current: number;
  limit: number;
  plan: 'free' | 'pro' | 'premium';
}

export default function PlanUpgradeModal({ 
  isOpen, 
  onClose, 
  feature, 
  current, 
  limit, 
  plan 
}: PlanUpgradeModalProps) {
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (targetPlan: 'pro' | 'premium', interval: 'monthly' | 'annual') => {
    setUpgrading(true);
    
    try {
      // Fetch price IDs from API
      const priceResponse = await fetch('/api/billing/price-ids');
      const { priceIds } = await priceResponse.json();

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[targetPlan][interval],
          plan: targetPlan,
          interval,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout process');
    }
    
    setUpgrading(false);
  };

  const getNextPlan = () => {
    if (plan === 'free') return 'pro';
    if (plan === 'pro') return 'premium';
    return 'premium';
  };

  const getUpgradeMessage = () => {
    if (plan === 'free') {
      return {
        title: 'Upgrade to Pro Required',
        message: `You've reached your ${feature} limit (${current}/${limit}). Upgrade to Pro for higher limits and more features.`,
        plans: [
          { name: 'Pro', monthly: '$39.99/mo', annual: '$29.99/mo (annual)', plan: 'pro' as const }
        ]
      };
    } else if (plan === 'pro') {
      return {
        title: 'Upgrade to Premium Required', 
        message: `You've reached your Pro ${feature} limit (${current}/${limit}). Upgrade to Premium for unlimited usage.`,
        plans: [
          { name: 'Premium', monthly: '$99.99/mo', annual: '$74.99/mo (annual)', plan: 'premium' as const }
        ]
      };
    }
    
    return {
      title: 'Limit Reached',
      message: `You've reached your ${feature} limit. Contact support for enterprise options.`,
      plans: []
    };
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">{upgradeInfo.title}</h2>
          <p className="text-zinc-400 text-sm">{upgradeInfo.message}</p>
        </div>

        {upgradeInfo.plans.length > 0 && (
          <div className="space-y-4 mb-6">
            {upgradeInfo.plans.map((planInfo) => (
              <div key={planInfo.plan} className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                <h3 className="font-semibold text-white mb-3">{planInfo.name}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpgrade(planInfo.plan, 'monthly')}
                    disabled={upgrading}
                    className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {upgrading ? 'Loading...' : planInfo.monthly}
                  </button>
                  <button
                    onClick={() => handleUpgrade(planInfo.plan, 'annual')}
                    disabled={upgrading}
                    className="w-full px-4 py-2 rounded-lg border border-purple-500/30 text-purple-400 font-medium text-sm hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                  >
                    {upgrading ? 'Loading...' : planInfo.annual}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          {upgradeInfo.plans.length === 0 && (
            <a
              href="mailto:support@smithkit.ai?subject=Enterprise Plan Inquiry"
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Contact Support
            </a>
          )}
        </div>
      </div>
    </div>
  );
}