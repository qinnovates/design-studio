'use client';

import { useState, useMemo } from 'react';
import { useTokenStore } from '@/stores/tokenStore';

interface TokenManagerProps {
  onClose: () => void;
}

// ─── Label Maps ─────────────────────────────────────────────

const COLOR_LABELS: Record<string, string> = {
  'color.text.primary': 'Text',
  'color.text.secondary': 'Muted Text',
  'color.text.onPrimary': 'Text on Buttons',
  'color.surface.primary': 'Background',
  'color.surface.secondary': 'Card Background',
  'color.action.primary': 'Primary Action',
  'color.action.secondary': 'Secondary Action',
  'color.border.primary': 'Borders',
  'color.error': 'Error',
  'color.success': 'Success',
  'color.warning': 'Warning',
};

const SPACING_LABELS: Record<string, string> = {
  'spacing.1': '4px (XS)',
  'spacing.2': '8px (S)',
  'spacing.3': '12px (SM)',
  'spacing.4': '16px (M)',
  'spacing.5': '20px (MD)',
  'spacing.6': '24px (L)',
  'spacing.8': '32px (XL)',
  'spacing.10': '40px (2XL)',
  'spacing.12': '48px (3XL)',
  'spacing.16': '64px (4XL)',
};

// ─── Helpers ────────────────────────────────────────────────

function prettyName(key: string): string {
  const last = key.split('.').pop() ?? key;
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/([A-Z])/g, ' $1');
}

function groupByPrefix(tokens: Record<string, string>, prefix: string) {
  return Object.entries(tokens).filter(([k]) => k.startsWith(prefix));
}

function isColor(value: string) {
  return /^#[0-9a-f]{3,8}$/i.test(value) || value.startsWith('rgb') || value.startsWith('hsl');
}

// ─── Section Header ─────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-2.5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 text-gray-300 font-normal">{count}</span>
        )}
      </h3>
    </div>
  );
}

// ─── Color Row ──────────────────────────────────────────────

function ColorRow({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 rounded-md group">
      <label className="relative w-6 h-6 rounded-full border border-gray-200 cursor-pointer shrink-0 shadow-sm overflow-hidden">
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value.length === 7 ? value : '#000000'}
          onChange={(e) => onChange(name, e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <span className="text-sm text-gray-700 flex-1 truncate">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-20 text-xs font-mono text-gray-500 bg-transparent border border-transparent
                   group-hover:border-gray-200 rounded px-1.5 py-0.5 text-right focus:outline-none
                   focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function TokenManager({ onClose }: TokenManagerProps) {
  const {
    resolvedTokens,
    updateToken,
    activeSetId,
    switchTheme,
    tokenSets,
    cssOutput,
    headingFontId,
    bodyFontId,
  } = useTokenStore();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cssOpen, setCssOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Group tokens
  const groups = useMemo(() => {
    const semanticColors = Object.entries(resolvedTokens).filter(
      ([k, v]) =>
        k.startsWith('color.') &&
        !k.match(/^color\.(blue|gray|green|red|yellow|purple|orange|pink|teal|indigo)\./) &&
        isColor(v)
    );
    const paletteColors = Object.entries(resolvedTokens).filter(
      ([k, v]) =>
        k.match(/^color\.(blue|gray|green|red|yellow|purple|orange|pink|teal|indigo)\./) &&
        isColor(v)
    );
    const typography = groupByPrefix(resolvedTokens, 'font.');
    const spacing = groupByPrefix(resolvedTokens, 'spacing.');
    const radius = groupByPrefix(resolvedTokens, 'radius.');
    const shadow = groupByPrefix(resolvedTokens, 'shadow.');
    return { semanticColors, paletteColors, typography, spacing, radius, shadow };
  }, [resolvedTokens]);

  const fontSizes = groups.typography.filter(([k]) => k.startsWith('font.size.'));
  const fontWeights = groups.typography.filter(([k]) => k.startsWith('font.weight.'));
  const lineHeights = groups.typography.filter(([k]) => k.startsWith('font.lineHeight.'));

  const themeIds = Object.keys(tokenSets);

  const copyCSS = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold">Design Tokens</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Theme Switcher ─────────────────────────── */}
        <div className="px-4 py-3 border-b">
          <p className="text-xs text-gray-400 mb-2">Theme</p>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {themeIds.map((id) => {
              const label = id.includes('light') ? 'Light' : id.includes('dark') ? 'Dark' : prettyName(id);
              return (
                <button
                  key={id}
                  onClick={() => switchTheme(id)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                    activeSetId === id
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colors ─────────────────────────────────── */}
        <SectionHeader title="Colors" count={groups.semanticColors.length} />
        <div className="py-1">
          {groups.semanticColors.map(([name, value]) => (
            <ColorRow
              key={name}
              name={name}
              label={COLOR_LABELS[name] ?? prettyName(name)}
              value={value}
              onChange={updateToken}
            />
          ))}
        </div>

        {/* Palette (collapsible) */}
        {groups.paletteColors.length > 0 && (
          <div className="border-t">
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              <span className="font-medium uppercase tracking-wider">
                Palette ({groups.paletteColors.length})
              </span>
              <span className="text-gray-300">{paletteOpen ? '\u25B2' : '\u25BC'}</span>
            </button>
            {paletteOpen && (
              <div className="py-1">
                {groups.paletteColors.map(([name, value]) => (
                  <ColorRow
                    key={name}
                    name={name}
                    label={prettyName(name)}
                    value={value}
                    onChange={updateToken}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Typography ─────────────────────────────── */}
        <SectionHeader title="Typography" />
        <div className="px-4 py-3 space-y-4">
          {/* Font families */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">Font Families</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Heading</span>
              <span className="text-gray-800 font-medium capitalize">{headingFontId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Body</span>
              <span className="text-gray-800 font-medium capitalize">{bodyFontId}</span>
            </div>
          </div>

          {/* Font sizes */}
          {fontSizes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Scale</p>
              {fontSizes.map(([name, value]) => (
                <div key={name} className="flex items-baseline gap-3 group">
                  <span
                    className="text-gray-800 truncate flex-1"
                    style={{ fontSize: value }}
                  >
                    Aa
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">{prettyName(name)}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateToken(name, e.target.value)}
                    className="w-14 text-xs font-mono text-gray-500 bg-transparent border border-transparent
                               group-hover:border-gray-200 rounded px-1 py-0.5 text-right focus:outline-none
                               focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Font weights */}
          {fontWeights.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Weights</p>
              {fontWeights.map(([name, value]) => (
                <div key={name} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-700" style={{ fontWeight: value }}>
                    {prettyName(name)}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateToken(name, e.target.value)}
                    className="w-12 text-xs font-mono text-gray-500 bg-transparent border border-transparent
                               group-hover:border-gray-200 rounded px-1 py-0.5 text-right focus:outline-none
                               focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Line heights */}
          {lineHeights.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Line Heights</p>
              {lineHeights.map(([name, value]) => (
                <div key={name} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-600">{prettyName(name)}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateToken(name, e.target.value)}
                    className="w-12 text-xs font-mono text-gray-500 bg-transparent border border-transparent
                               group-hover:border-gray-200 rounded px-1 py-0.5 text-right focus:outline-none
                               focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Spacing ────────────────────────────────── */}
        <SectionHeader title="Spacing" count={groups.spacing.length} />
        <div className="px-4 py-3 space-y-1.5">
          {groups.spacing.map(([name, value]) => {
            const px = parseInt(value, 10) || 0;
            return (
              <div key={name} className="flex items-center gap-3 group">
                <div
                  className="h-3 rounded-sm bg-blue-400/70 shrink-0 transition-all"
                  style={{ width: `${Math.min(px * 2, 160)}px` }}
                />
                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                  {SPACING_LABELS[name] ?? prettyName(name)}
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateToken(name, e.target.value)}
                  className="ml-auto w-14 text-xs font-mono text-gray-500 bg-transparent border border-transparent
                             group-hover:border-gray-200 rounded px-1 py-0.5 text-right focus:outline-none
                             focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            );
          })}
        </div>

        {/* ── Corners ────────────────────────────────── */}
        <SectionHeader title="Corners" count={groups.radius.length} />
        <div className="px-4 py-3 flex flex-wrap gap-3">
          {groups.radius.map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-1.5 group">
              <div
                className="w-10 h-10 border-2 border-gray-300 bg-gray-50 transition-all"
                style={{ borderRadius: value }}
              />
              <span className="text-[10px] text-gray-400">{prettyName(name)}</span>
              <input
                type="text"
                value={value}
                onChange={(e) => updateToken(name, e.target.value)}
                className="w-12 text-[10px] font-mono text-gray-500 text-center bg-transparent border border-transparent
                           group-hover:border-gray-200 rounded px-0.5 py-0.5 focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}
        </div>

        {/* ── Shadows ────────────────────────────────── */}
        <SectionHeader title="Shadows" count={groups.shadow.length} />
        <div className="px-4 py-3 space-y-3">
          {groups.shadow.map(([name, value]) => (
            <div key={name} className="group">
              <div
                className="h-12 rounded-lg bg-white border border-gray-100 transition-shadow"
                style={{ boxShadow: value === 'none' ? 'none' : value }}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">{prettyName(name)}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateToken(name, e.target.value)}
                  className="max-w-[140px] text-[10px] font-mono text-gray-500 bg-transparent border border-transparent
                             group-hover:border-gray-200 rounded px-1 py-0.5 text-right truncate focus:outline-none
                             focus:border-blue-400"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── CSS Output ─────────────────────────────── */}
        <div className="border-t">
          <button
            onClick={() => setCssOpen(!cssOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            <span className="font-semibold uppercase tracking-wider">CSS Variables</span>
            <span className="text-gray-300">{cssOpen ? '\u25B2' : '\u25BC'}</span>
          </button>
          {cssOpen && (
            <div className="px-4 pb-4">
              <div className="relative">
                <pre className="text-[10px] font-mono text-gray-600 bg-gray-50 border rounded-lg p-3 max-h-64 overflow-auto whitespace-pre-wrap">
                  {cssOutput || ':root {\n  /* No tokens resolved */\n}'}
                </pre>
                <button
                  onClick={copyCSS}
                  className="absolute top-2 right-2 text-[10px] bg-white border border-gray-200 rounded px-2 py-0.5
                             text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
