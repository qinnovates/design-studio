'use client';

import { useState } from 'react';
import { useBrandStore, BRAND_SECTIONS } from '@/stores/brandStore';
import { useTokenStore } from '@/stores/tokenStore';

interface BrandBriefProps {
  onClose: () => void;
}

export function BrandBrief({ onClose }: BrandBriefProps) {
  const { brief, updateBrief, setBriefField, calculateCompletion, getCompletedSections, toTokenOverrides } = useBrandStore();
  const updateToken = useTokenStore((s) => s.updateToken);
  const [activeSection, setActiveSection] = useState('identity');
  const completion = calculateCompletion();
  const completedSections = getCompletedSections();

  const applyBrandTokens = () => {
    const overrides = toTokenOverrides();
    for (const [name, value] of Object.entries(overrides)) {
      try { updateToken(name, value); } catch { /* token may not exist */ }
    }
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Brand Brief</span>
          <span className="text-[10px] text-gray-400 block">Requirements & identity</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">&times;</button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500">{completion}% complete</span>
          <span className="text-[10px] text-gray-400">{completedSections.length}/{BRAND_SECTIONS.length} sections</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex overflow-x-auto border-b px-2 gap-0.5 py-1.5 flex-shrink-0">
        {BRAND_SECTIONS.map((section) => {
          const done = completedSections.includes(section.id);
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`text-[10px] px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                active ? 'bg-blue-100 text-blue-700 font-medium' :
                done ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={section.label}
            >
              {done && !active ? '✓ ' : ''}{section.label}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identity */}
        {activeSection === 'identity' && (
          <>
            <Field label="App Name" value={brief.appName} onChange={(v) => setBriefField('appName', v)} placeholder="e.g., Launchable" required />
            <Field label="Tagline" value={brief.tagline} onChange={(v) => setBriefField('tagline', v)} placeholder="e.g., Ship apps from a single pane of glass" />
            <TextArea label="Description" value={brief.description} onChange={(v) => setBriefField('description', v)} placeholder="What does this app do? (2-3 sentences)" />
            <Field label="Elevator Pitch" value={brief.elevatorPitch} onChange={(v) => setBriefField('elevatorPitch', v)} placeholder="One sentence that sells it" />
          </>
        )}

        {/* Audience */}
        {activeSection === 'audience' && (
          <>
            <Field label="Target Audience" value={brief.targetAudience} onChange={(v) => setBriefField('targetAudience', v)} placeholder="e.g., Product managers and founders at startups" />
            <Field label="Age Range" value={brief.ageRange} onChange={(v) => setBriefField('ageRange', v)} placeholder="e.g., 25-45" />
            <TextArea label="User Persona" value={brief.userPersona} onChange={(v) => setBriefField('userPersona', v)} placeholder="Describe your ideal user..." />
            <Select label="Tech Level" value={brief.techLevel} onChange={(v) => setBriefField('techLevel', v as any)} options={[
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
              { label: 'Mixed', value: 'mixed' },
            ]} />
          </>
        )}

        {/* Market */}
        {activeSection === 'market' && (
          <>
            <Select label="Category" value={brief.category} onChange={(v) => setBriefField('category', v)} options={[
              { label: 'SaaS / B2B', value: 'saas' },
              { label: 'E-Commerce', value: 'e-commerce' },
              { label: 'Social / Community', value: 'social' },
              { label: 'Health & Wellness', value: 'health' },
              { label: 'Fintech / Banking', value: 'fintech' },
              { label: 'Education', value: 'education' },
              { label: 'Other', value: 'other' },
            ]} />
            <TagInput label="Competitors" tags={brief.competitors} onChange={(v) => setBriefField('competitors', v)} placeholder="Add competitor name..." />
            <TextArea label="What Makes You Different?" value={brief.differentiator} onChange={(v) => setBriefField('differentiator', v)} placeholder="Why would users choose you over competitors?" />
          </>
        )}

        {/* Visual Identity */}
        {activeSection === 'visual' && (
          <>
            <ColorField label="Primary Color" value={brief.primaryColor} onChange={(v) => setBriefField('primaryColor', v)} />
            <ColorField label="Secondary Color" value={brief.secondaryColor} onChange={(v) => setBriefField('secondaryColor', v)} />
            <ColorField label="Accent Color" value={brief.accentColor} onChange={(v) => setBriefField('accentColor', v)} />
            <ColorField label="Background" value={brief.backgroundColor} onChange={(v) => setBriefField('backgroundColor', v)} />
            <ColorField label="Text Color" value={brief.textColor} onChange={(v) => setBriefField('textColor', v)} />
            <Field label="Color Mood" value={brief.colorMood} onChange={(v) => setBriefField('colorMood', v)} placeholder="e.g., professional, warm, vibrant, calm" />
            <button onClick={applyBrandTokens} className="w-full py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label="Apply brand colors to design tokens">
              Apply Colors to Design System
            </button>
          </>
        )}

        {/* Typography */}
        {activeSection === 'typography' && (
          <>
            <Field label="Heading Font" value={brief.headingFont} onChange={(v) => setBriefField('headingFont', v)} placeholder="e.g., Inter, Playfair Display" />
            <Field label="Body Font" value={brief.bodyFont} onChange={(v) => setBriefField('bodyFont', v)} placeholder="e.g., Inter, Source Serif 4" />
            <Field label="Font Mood" value={brief.fontMood} onChange={(v) => setBriefField('fontMood', v)} placeholder="e.g., modern, classic, playful, technical" />
          </>
        )}

        {/* Tone & Voice */}
        {activeSection === 'tone' && (
          <>
            <Field label="Voice Tone" value={brief.voiceTone} onChange={(v) => setBriefField('voiceTone', v)} placeholder="e.g., professional, casual, authoritative, friendly" />
            <TextArea label="Sample Copy" value={brief.sampleCopy} onChange={(v) => setBriefField('sampleCopy', v)} placeholder="Write a sample headline or tagline in your brand voice..." />
          </>
        )}

        {/* Technical */}
        {activeSection === 'technical' && (
          <>
            <CheckboxGroup label="Platforms" options={['web', 'ios', 'android', 'desktop']} selected={brief.platforms} onChange={(v) => setBriefField('platforms', v as any)} />
            <Toggle label="Requires Authentication" value={brief.requiresAuth} onChange={(v) => setBriefField('requiresAuth', v)} />
            <Toggle label="Dark Mode Support" value={brief.hasDarkMode} onChange={(v) => setBriefField('hasDarkMode', v)} />
            <TagInput label="Languages" tags={brief.languages} onChange={(v) => setBriefField('languages', v)} placeholder="Add language code..." />
            <Field label="Accessibility Requirements" value={brief.accessibilityRequirements} onChange={(v) => setBriefField('accessibilityRequirements', v)} placeholder="e.g., WCAG AA, WCAG AAA" />
          </>
        )}

        {/* Business */}
        {activeSection === 'business' && (
          <>
            <Field label="Monetization" value={brief.monetization} onChange={(v) => setBriefField('monetization', v)} placeholder="e.g., SaaS subscription, freemium, marketplace commission" />
            <Field label="Target Launch Date" value={brief.launchDate} onChange={(v) => setBriefField('launchDate', v)} placeholder="e.g., Q2 2026" />
            <TagInput label="MVP Features" tags={brief.mvpFeatures} onChange={(v) => setBriefField('mvpFeatures', v)} placeholder="Add feature..." />
            <TagInput label="Nice-to-Have Features" tags={brief.niceToHaveFeatures} onChange={(v) => setBriefField('niceToHaveFeatures', v)} placeholder="Add feature..." />
          </>
        )}

        {/* Assets */}
        {activeSection === 'assets' && (
          <>
            <Field label="Logo URL" value={brief.logoUrl} onChange={(v) => setBriefField('logoUrl', v)} placeholder="https://..." />
            <Field label="App Icon URL" value={brief.iconUrl} onChange={(v) => setBriefField('iconUrl', v)} placeholder="https://..." />
            <Field label="Favicon URL (16x16 or 32x32)" value={brief.faviconUrl} onChange={(v) => setBriefField('faviconUrl', v)} placeholder="https://..." />
            <Field label="App Icon URL (512x512)" value={brief.appIconUrl} onChange={(v) => setBriefField('appIconUrl', v)} placeholder="https://..." />
            <Field label="Social Share Image (1200x630)" value={brief.ogImageUrl} onChange={(v) => setBriefField('ogImageUrl', v)} placeholder="https://..." />
            <Field label="Apple Touch Icon (180x180)" value={brief.appleTouchIconUrl} onChange={(v) => setBriefField('appleTouchIconUrl', v)} placeholder="https://..." />
            <Field label="Brand Guidelines URL" value={brief.brandGuidelinesUrl} onChange={(v) => setBriefField('brandGuidelinesUrl', v)} placeholder="https://..." />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          Brief feeds into AI, tokens, market intel
        </span>
        <button
          onClick={applyBrandTokens}
          className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
          aria-label="Apply all brand settings"
        >
          Apply All →
        </button>
      </div>
    </div>
  );
}

// ─── Field Components ────────────────────────────────────────

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={label} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full text-sm border rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={label} />
    </label>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={label}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border cursor-pointer" aria-label={label} />
      <div className="flex-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="block w-full text-[11px] text-gray-500 font-mono border-none p-0 focus:outline-none" />
      </div>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center justify-between w-full py-1" aria-label={label} aria-pressed={value}>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className={`w-8 h-4.5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mt-0.5 ${value ? 'translate-x-4 ml-0.5' : 'ml-0.5'}`} />
      </div>
    </button>
  );
}

function CheckboxGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div>
      <span className="text-xs font-medium text-gray-700 block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button key={opt} onClick={() => toggle(opt)} aria-pressed={selected.includes(opt)}
            className={`text-xs px-3 py-1.5 rounded-lg border capitalize ${selected.includes(opt) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TagInput({ label, tags, onChange, placeholder }: {
  label: string; tags: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  return (
    <div>
      <span className="text-xs font-medium text-gray-700 block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 pl-2 pr-1 py-0.5 rounded-full flex items-center gap-1">
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-gray-400 hover:text-red-500" aria-label={`Remove ${tag}`}>&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={label} />
        <button onClick={add} className="text-xs px-2 py-1.5 bg-gray-100 rounded hover:bg-gray-200" aria-label="Add">+</button>
      </div>
    </div>
  );
}
