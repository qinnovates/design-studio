'use client';

import { useState, useMemo } from 'react';
import {
  FONT_LIBRARY,
  FONT_PAIRINGS,
  searchFonts,
  getFontsByCategory,
  getGoogleFontsImportUrl,
} from '@design-studio/app';
import type { FontEntry, FontCategory, FontPairing } from '@design-studio/app';
import { useTokenStore } from '@/stores/tokenStore';

interface FontPickerProps {
  onClose: () => void;
}

type Tab = 'browse' | 'pairings';

export function FontPicker({ onClose }: FontPickerProps) {
  const [tab, setTab] = useState<Tab>('pairings');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FontCategory | 'all'>('all');
  const [previewText, setPreviewText] = useState('Design apps without design skills');
  const { headingFontId, bodyFontId, setHeadingFont, setBodyFont } = useTokenStore();

  const filteredFonts = useMemo(() => {
    let fonts = search ? searchFonts(search) : FONT_LIBRARY;
    if (category !== 'all') {
      fonts = fonts.filter((f) => f.category === category);
    }
    return fonts;
  }, [search, category]);

  // Load Google Fonts for preview
  const fontIds = FONT_LIBRARY.map((f) => f.id);
  const fontsUrl = useMemo(() => getGoogleFontsImportUrl(fontIds), []);

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Google Fonts loader */}
      {fontsUrl && (
        <link rel="stylesheet" href={fontsUrl} />
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Fonts</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('pairings')}
          className={`flex-1 text-xs py-2.5 font-medium ${
            tab === 'pairings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          Pairings
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 text-xs py-2.5 font-medium ${
            tab === 'browse' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          All Fonts
        </button>
      </div>

      {/* Preview text input */}
      <div className="px-3 py-2 border-b">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Preview text..."
          className="w-full text-xs px-2 py-1.5 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'pairings' && (
          <div className="p-3 space-y-3">
            {FONT_PAIRINGS.map((pairing) => {
              const headingFont = FONT_LIBRARY.find((f) => f.id === pairing.headingFont);
              const bodyFont = FONT_LIBRARY.find((f) => f.id === pairing.bodyFont);
              const isActive =
                headingFontId === pairing.headingFont && bodyFontId === pairing.bodyFont;

              return (
                <button
                  key={pairing.id}
                  onClick={() => {
                    setHeadingFont(pairing.headingFont);
                    setBodyFont(pairing.bodyFont);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">{pairing.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Live preview */}
                  <div
                    className="text-lg font-semibold mb-1 leading-tight"
                    style={{ fontFamily: `'${headingFont?.name}', sans-serif` }}
                  >
                    {previewText}
                  </div>
                  <div
                    className="text-sm text-gray-600 leading-relaxed"
                    style={{ fontFamily: `'${bodyFont?.name}', sans-serif` }}
                  >
                    {previewText}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {pairing.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {headingFont?.name} + {bodyFont?.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'browse' && (
          <div>
            {/* Category filter */}
            <div className="px-3 py-2 flex gap-1 flex-wrap border-b">
              {(['all', 'sans-serif', 'serif', 'monospace', 'display', 'handwriting'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] px-2 py-1 rounded-full ${
                      category === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ),
              )}
            </div>

            {/* Search */}
            <div className="px-3 py-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full text-xs px-2 py-1.5 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Font list */}
            <div className="px-3 pb-3 space-y-2">
              {filteredFonts.map((font) => (
                <div key={font.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{font.name}</span>
                    <span className="text-[10px] text-gray-400">{font.category}</span>
                  </div>
                  <div
                    className="text-xl leading-tight mb-2"
                    style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
                  >
                    {previewText}
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{font.description}</p>

                  {/* Weight preview */}
                  <div className="flex gap-1 flex-wrap mb-2">
                    {font.weights.map((w) => (
                      <span
                        key={w}
                        className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded"
                        style={{
                          fontFamily: `'${font.name}', ${font.fallback}`,
                          fontWeight: w,
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setHeadingFont(font.id)}
                      className={`text-[10px] px-2 py-1 rounded ${
                        headingFontId === font.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Use for Headings
                    </button>
                    <button
                      onClick={() => setBodyFont(font.id)}
                      className={`text-[10px] px-2 py-1 rounded ${
                        bodyFontId === font.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Use for Body
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current selection */}
      <div className="border-t p-3 bg-gray-50">
        <p className="text-[10px] text-gray-400 mb-1">Current Selection</p>
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-gray-500">Headings:</span>{' '}
            <span className="font-medium">
              {FONT_LIBRARY.find((f) => f.id === headingFontId)?.name ?? headingFontId}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Body:</span>{' '}
            <span className="font-medium">
              {FONT_LIBRARY.find((f) => f.id === bodyFontId)?.name ?? bodyFontId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
