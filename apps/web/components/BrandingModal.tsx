'use client';

import { useState } from 'react';

interface BrandingSettings {
  logo_url: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  custom_css: string;
}

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoId: string;
  initialSettings?: BrandingSettings;
  onSave: (settings: BrandingSettings) => Promise<void>;
}

const defaultSettings: BrandingSettings = {
  logo_url: '',
  primary_color: '#6366f1',
  accent_color: '#8b5cf6',
  background_color: '#0a0a0f',
  custom_css: '',
};

export default function BrandingModal({ 
  isOpen, 
  onClose, 
  repoId, 
  initialSettings,
  onSave 
}: BrandingModalProps) {
  const [settings, setSettings] = useState<BrandingSettings>(initialSettings || defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save branding:', error);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#12121a] border border-[#27272a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#1e1e2e]">
          <h2 className="text-xl font-bold text-white">Customize Changelog</h2>
          <p className="text-sm text-[#6b6b80] mt-1">Personalize your public changelog page</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Logo URL</label>
            <input
              type="url"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
            />
            <p className="text-xs text-[#6b6b80] mt-1">Displayed at the top of your changelog</p>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white text-sm font-mono focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white text-sm font-mono focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.background_color}
                onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={settings.background_color}
                onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#27272a] text-white text-sm font-mono focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Custom CSS (Pro)</label>
            <textarea
              value={settings.custom_css}
              onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
              placeholder=".changelog-header { ... }"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none font-mono text-sm resize-none"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Preview</label>
            <div 
              className="rounded-xl p-4 border border-[#27272a]"
              style={{ backgroundColor: settings.background_color }}
            >
              <div className="flex items-center gap-3 mb-3">
                {settings.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.logo_url} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    S
                  </div>
                )}
                <span className="font-bold text-white">Your Changelog</span>
              </div>
              <div 
                className="text-sm px-2 py-1 rounded inline-block"
                style={{ backgroundColor: settings.primary_color + '20', color: settings.primary_color }}
              >
                v1.0.0
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1e1e2e] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </div>
    </div>
  );
}
