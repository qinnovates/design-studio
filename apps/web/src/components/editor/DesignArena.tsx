'use client';

import { useState } from 'react';
import { useSwarmStore } from '@/stores/swarmStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { useUIStore } from '@/stores/uiStore';
import {
  DESIGN_PERSONAS,
  type DesignVariation,
  type DesignCritique,
  type DesignPersona,
} from '@design-studio/ai';

export function DesignArena() {
  const {
    session,
    isGenerating,
    isCritiquing,
    startSession,
    userVote,
    selectWinner,
    clearSession,
    getRankedVariations,
  } = useSwarmStore();
  const loadSceneGraph = useCanvasStore((s) => s.loadSceneGraph);
  const updateToken = useTokenStore((s) => s.updateToken);
  const setActiveView = useUIStore((s) => s.setActiveView);

  const [prompt, setPrompt] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(
    DESIGN_PERSONAS.map((p) => p.id),
  );
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);

  const handleStartSwarm = () => {
    if (!prompt.trim()) return;
    startSession(prompt, selectedPersonas.length > 0 ? selectedPersonas : undefined);

    // Simulate AI generation (in production, this calls the BYOAI provider for each persona)
    setTimeout(() => {
      const store = useSwarmStore.getState();
      if (!store.session) return;

      // Simulate generated variations with different aesthetics
      for (const variation of store.session.variations) {
        const persona = variation.persona;
        const mockTokens = generateMockTokens(persona);
        const mockComponents = generateMockComponents(persona, prompt);

        store.updateVariation(variation.id, {
          tokenOverrides: mockTokens,
          components: mockComponents,
          rationale: `As ${persona.name}, I designed this with ${persona.styleKeywords.join(', ')} aesthetics. ${persona.philosophy}`,
          status: 'ready',
        });
      }

      store.setGenerating(false);
      store.setPhase('critiquing');

      // Simulate critique phase
      setTimeout(() => {
        const state = useSwarmStore.getState();
        if (!state.session) return;

        for (const variation of state.session.variations) {
          // Each other persona critiques this variation
          const otherPersonas = DESIGN_PERSONAS.filter((p) => p.id !== variation.personaId);
          for (const reviewer of otherPersonas.slice(0, 3)) {
            const critique = generateMockCritique(reviewer, variation);
            state.addCritique(variation.id, critique);
          }
        }

        state.setCritiquing(false);
        state.setPhase('voting');
      }, 1500);
    }, 2000);
  };

  const handleApplyWinner = (variation: DesignVariation) => {
    selectWinner(variation.id);

    // Apply token overrides
    for (const [name, value] of Object.entries(variation.tokenOverrides)) {
      try { updateToken(name, value); } catch { /* token may not exist */ }
    }

    // Switch to canvas view
    setActiveView('canvas');
  };

  const togglePersona = (id: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // No session — show prompt input
  if (!session) {
    return (
      <div className="w-full h-full bg-gray-950 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Design Arena</h2>
            <p className="text-gray-400">
              Describe your design — AI personas will each create a variation, critique each other,
              and the best design wins.
            </p>
          </div>

          {/* Prompt input */}
          <div className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to design... e.g., 'A modern SaaS pricing page with 3 tiers, dark theme, professional but friendly'"
              className="w-full h-32 bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
              aria-label="Design prompt"
            />
          </div>

          {/* Persona selector */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3">Select AI designers ({selectedPersonas.length} selected)</p>
            <div className="grid grid-cols-3 gap-2">
              {DESIGN_PERSONAS.map((persona) => {
                const selected = selectedPersonas.includes(persona.id);
                return (
                  <button
                    key={persona.id}
                    onClick={() => togglePersona(persona.id)}
                    aria-pressed={selected}
                    aria-label={`${persona.name}: ${persona.philosophy}`}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{persona.avatar}</span>
                      <span className="text-sm font-medium">{persona.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{persona.philosophy}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {persona.styleKeywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch button */}
          <button
            onClick={handleStartSwarm}
            disabled={!prompt.trim() || selectedPersonas.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Generate design variations"
          >
            Generate {selectedPersonas.length} Design Variations
          </button>
        </div>
      </div>
    );
  }

  // Session active — show arena
  const ranked = getRankedVariations();

  return (
    <div className="w-full h-full bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Design Arena</h2>
            <p className="text-xs text-gray-500 truncate max-w-md">&quot;{session.prompt}&quot;</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase indicator */}
            <div className="flex items-center gap-2">
              {(['generating', 'critiquing', 'voting', 'complete'] as const).map((phase, i) => (
                <div key={phase} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    session.phase === phase ? 'bg-blue-500 animate-pulse' :
                    (['generating', 'critiquing', 'voting', 'complete'].indexOf(session.phase) > i) ? 'bg-green-500' :
                    'bg-gray-700'
                  }`} />
                  <span className={`text-[10px] capitalize ${
                    session.phase === phase ? 'text-blue-400' : 'text-gray-600'
                  }`}>
                    {phase}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={clearSession}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded"
              aria-label="Start over"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="flex gap-2 mb-4 justify-center">
              {session.variations.map((v) => (
                <div
                  key={v.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    v.status === 'generating' ? 'bg-gray-800 animate-pulse' : 'bg-gray-800'
                  }`}
                >
                  {v.persona.avatar}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">AI designers are creating variations...</p>
          </div>
        </div>
      )}

      {/* Variation cards */}
      {!isGenerating && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {ranked.map((variation, index) => (
            <div
              key={variation.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                variation.status === 'selected' ? 'border-green-500 ring-2 ring-green-500/30' :
                variation.status === 'rejected' ? 'border-gray-800 opacity-50' :
                expandedVariation === variation.id ? 'border-blue-500' :
                'border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Card header */}
              <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{variation.persona.avatar}</span>
                  <div>
                    <span className="text-sm font-medium text-white">{variation.persona.name}</span>
                    {index === 0 && session.phase !== 'generating' && (
                      <span className="ml-2 text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                        #1 Ranked
                      </span>
                    )}
                  </div>
                </div>
                {variation.critiqueScore > 0 && (
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      variation.critiqueScore >= 7 ? 'text-green-400' :
                      variation.critiqueScore >= 5 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {variation.critiqueScore}
                    </span>
                    <span className="text-[10px] text-gray-500 block">/10</span>
                  </div>
                )}
              </div>

              {/* Color preview */}
              <div className="px-4 py-3 bg-gray-900/50">
                <div className="flex gap-1.5">
                  {Object.entries(variation.tokenOverrides)
                    .filter(([k]) => k.startsWith('color.'))
                    .slice(0, 6)
                    .map(([name, value]) => (
                      <div
                        key={name}
                        className="w-8 h-8 rounded-md border border-gray-700"
                        style={{ backgroundColor: value }}
                        title={`${name}: ${value}`}
                      />
                    ))}
                </div>
              </div>

              {/* Rationale */}
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400 line-clamp-3">{variation.rationale}</p>
              </div>

              {/* Critiques summary */}
              {variation.critiques.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-800">
                  <button
                    onClick={() => setExpandedVariation(
                      expandedVariation === variation.id ? null : variation.id,
                    )}
                    className="text-[10px] text-gray-500 hover:text-gray-300 w-full text-left"
                    aria-label="Toggle critiques"
                  >
                    {variation.critiques.length} critiques {expandedVariation === variation.id ? '\u25B2' : '\u25BC'}
                  </button>

                  {expandedVariation === variation.id && (
                    <div className="mt-2 space-y-2">
                      {variation.critiques.map((critique, ci) => (
                        <div key={ci} className="bg-gray-900 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400">{critique.fromPersonaName}</span>
                            <span className="text-[10px] font-mono text-gray-500">
                              {critique.overall.toFixed(1)}/10
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">{critique.feedback}</p>
                          <div className="flex gap-2 mt-1 text-[9px] text-gray-600">
                            <span>Visual: {critique.scores.aesthetics}</span>
                            <span>UX: {critique.scores.usability}</span>
                            <span>A11y: {critique.scores.accessibility}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User voting + apply */}
              {session.phase === 'voting' && (
                <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-2">
                  <button
                    onClick={() => userVote(variation.id, variation.userVote === 'like' ? null : 'like')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      variation.userVote === 'like'
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent'
                    }`}
                    aria-label="Like this design"
                    aria-pressed={variation.userVote === 'like'}
                  >
                    Like
                  </button>
                  <button
                    onClick={() => userVote(variation.id, variation.userVote === 'dislike' ? null : 'dislike')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      variation.userVote === 'dislike'
                        ? 'bg-red-500/20 text-red-400 border border-red-500'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent'
                    }`}
                    aria-label="Dislike this design"
                    aria-pressed={variation.userVote === 'dislike'}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleApplyWinner(variation)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                    aria-label="Apply this design"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Winner badge */}
              {variation.status === 'selected' && (
                <div className="px-4 py-3 bg-green-500/10 border-t border-green-500/30 text-center">
                  <span className="text-sm font-medium text-green-400">Winner — Applied to Canvas</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mock Data Generators (replace with real AI calls in production) ───

function generateMockTokens(persona: DesignPersona): Record<string, string> {
  const palettes: Record<string, Record<string, string>> = {
    minimalist: {
      'color.action.primary': '#18181b',
      'color.surface.primary': '#fafafa',
      'color.surface.secondary': '#f4f4f5',
      'color.text.primary': '#09090b',
      'color.text.secondary': '#71717a',
      'color.border.primary': '#e4e4e7',
    },
    bold: {
      'color.action.primary': '#dc2626',
      'color.surface.primary': '#0f0f0f',
      'color.surface.secondary': '#1a1a1a',
      'color.text.primary': '#ffffff',
      'color.text.secondary': '#a3a3a3',
      'color.border.primary': '#333333',
    },
    accessible: {
      'color.action.primary': '#1d4ed8',
      'color.surface.primary': '#ffffff',
      'color.surface.secondary': '#eff6ff',
      'color.text.primary': '#111827',
      'color.text.secondary': '#374151',
      'color.border.primary': '#6b7280',
    },
    editorial: {
      'color.action.primary': '#92400e',
      'color.surface.primary': '#fefce8',
      'color.surface.secondary': '#fef9c3',
      'color.text.primary': '#1c1917',
      'color.text.secondary': '#78716c',
      'color.border.primary': '#d6d3d1',
    },
    playful: {
      'color.action.primary': '#7c3aed',
      'color.surface.primary': '#faf5ff',
      'color.surface.secondary': '#f3e8ff',
      'color.text.primary': '#1e1b4b',
      'color.text.secondary': '#6b21a8',
      'color.border.primary': '#c4b5fd',
    },
    brutalist: {
      'color.action.primary': '#000000',
      'color.surface.primary': '#ffffff',
      'color.surface.secondary': '#f5f5f5',
      'color.text.primary': '#000000',
      'color.text.secondary': '#666666',
      'color.border.primary': '#000000',
    },
  };

  return palettes[persona.id] ?? palettes['minimalist']!;
}

function generateMockComponents(
  persona: DesignPersona,
  prompt: string,
): Array<{ componentId: string; name: string; x: number; y: number; width: number; height: number; variant: string; props: Record<string, unknown>; tokenBindings: Record<string, string> }> {
  return [
    {
      componentId: 'navbar',
      name: `${persona.name}'s Navbar`,
      x: 0, y: 0, width: 1440, height: 64,
      variant: 'default',
      props: { brandText: 'Design Studio' },
      tokenBindings: { background: '{color.surface.primary}' },
    },
    {
      componentId: 'heading',
      name: `${persona.name}'s Heading`,
      x: 120, y: 120, width: 800, height: 60,
      variant: 'default',
      props: { content: prompt.slice(0, 50), level: 'h1' },
      tokenBindings: { color: '{color.text.primary}' },
    },
    {
      componentId: 'button',
      name: `${persona.name}'s CTA`,
      x: 120, y: 220, width: 200, height: 48,
      variant: 'primary',
      props: { text: 'Get Started', size: 'large' },
      tokenBindings: { background: '{color.action.primary}' },
    },
  ];
}

function generateMockCritique(
  reviewer: DesignPersona,
  _variation: DesignVariation,
): DesignCritique {
  const base = Math.random() * 3 + 5; // 5-8 base range
  const aesthetics = Math.min(10, Math.max(1, Math.round(base + (Math.random() * 2 - 1))));
  const usability = Math.min(10, Math.max(1, Math.round(base + (Math.random() * 2 - 1))));
  const accessibility = reviewer.id === 'accessible' ? Math.min(10, Math.round(base - 1)) : Math.min(10, Math.round(base + 1));
  const creativity = Math.min(10, Math.max(1, Math.round(base + (Math.random() * 3 - 1.5))));
  const consistency = Math.min(10, Math.max(1, Math.round(base + (Math.random() * 2 - 1))));
  const overall = Math.round(((aesthetics + usability + accessibility + creativity + consistency) / 5) * 10) / 10;

  const feedbacks: Record<string, string[]> = {
    minimalist: [
      'Too cluttered. Remove non-essential elements for cleaner focus.',
      'Good whitespace usage, but the color palette could be more restrained.',
      'Typography hierarchy is clear. Consider lighter font weights.',
    ],
    bold: [
      'Needs more visual impact. The hero section should command attention.',
      'Great color contrast. Consider making the CTA even larger.',
      'The layout feels safe. Push the boundaries more.',
    ],
    accessible: [
      'Check contrast ratios on the secondary text. May not pass WCAG AA.',
      'Touch targets look adequate. Good semantic structure.',
      'Consider adding visible focus indicators for keyboard navigation.',
    ],
    editorial: [
      'The typography could tell a better story. Consider a serif heading.',
      'The layout has good rhythm. The spacing scale feels intentional.',
      'Color palette is appropriate but could be more sophisticated.',
    ],
    playful: [
      'This could be friendlier. Add some rounded corners and warmer colors.',
      'Good energy! Maybe add some visual delight elements.',
      'The CTA button could be more inviting. Try a softer color.',
    ],
    brutalist: [
      'Strip it back further. The decoration doesn\'t serve the content.',
      'Good structural clarity. Let the grid do the heavy lifting.',
      'Information hierarchy is solid. The monospace font would add character.',
    ],
  };

  const feedbackOptions = feedbacks[reviewer.id] ?? feedbacks['minimalist']!;
  const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]!;

  return {
    fromPersonaId: reviewer.id,
    fromPersonaName: `${reviewer.avatar} ${reviewer.name}`,
    scores: { aesthetics, usability, accessibility, creativity, consistency },
    overall,
    feedback,
    suggestions: [`Consider ${reviewer.styleKeywords[0]} approach for the header`, `The ${reviewer.density} spacing would improve readability`],
  };
}
