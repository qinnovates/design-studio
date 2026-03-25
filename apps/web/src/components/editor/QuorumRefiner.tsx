'use client';

import { useState, useMemo } from 'react';
import { useTokenStore } from '@/stores/tokenStore';
import { useUIStore } from '@/stores/uiStore';
import {
  DESIGN_PERSONAS,
  createQuorumSession,
  createRefinementStep,
  calculateTotalImprovement,
  getQuorumAttribution,
  determineReviewOrder,
  type QuorumSession,
  type RefinementStep,
  type DesignScore,
  type DesignPersona,
} from '@design-studio/ai';

export function QuorumRefiner() {
  const [session, setSession] = useState<QuorumSession | null>(null);
  const [prompt, setPrompt] = useState('');
  const [maxPasses, setMaxPasses] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const updateToken = useTokenStore((s) => s.updateToken);
  const setActiveView = useUIStore((s) => s.setActiveView);

  // Start a new Quorum session
  const handleStart = () => {
    if (!prompt.trim()) return;
    const newSession = createQuorumSession(prompt, maxPasses);
    newSession.phase = 'reviewing';
    setSession(newSession);
    runNextPass(newSession);
  };

  // Simulate running the next persona's review pass
  const runNextPass = (currentSession: QuorumSession) => {
    const { currentStepIndex, reviewOrder } = currentSession;
    if (currentStepIndex >= reviewOrder.length) {
      setSession({ ...currentSession, phase: 'complete' });
      return;
    }

    setIsProcessing(true);
    const persona = reviewOrder[currentStepIndex]!;
    const step = createRefinementStep(currentStepIndex + 1, persona);
    step.status = 'generating';

    setSession({ ...currentSession, steps: [...currentSession.steps, step] });

    // Simulate AI generation (real impl would call BYOAI provider)
    setTimeout(() => {
      const mockResult = generateMockRefinement(persona, currentStepIndex, prompt);
      const updatedStep: RefinementStep = {
        ...step,
        ...mockResult,
        status: 'applied',
      };

      const updatedSession: QuorumSession = {
        ...currentSession,
        steps: [...currentSession.steps.filter((s) => s.id !== step.id), updatedStep],
        phase: 'waiting-for-user',
      };

      setSession(updatedSession);
      setIsProcessing(false);
    }, 1500);
  };

  // User accepts or rejects the current step
  const handleDecision = (decision: 'accepted' | 'rejected') => {
    if (!session) return;
    const lastStep = session.steps[session.steps.length - 1];
    if (!lastStep) return;

    const updatedStep = { ...lastStep, userDecision: decision };

    // Apply token changes if accepted
    if (decision === 'accepted') {
      for (const change of updatedStep.tokenChanges) {
        try { updateToken(change.name, change.after); } catch { /* skip */ }
      }
    }

    const updatedSteps = [...session.steps.slice(0, -1), updatedStep];
    const nextIndex = session.currentStepIndex + 1;
    const isComplete = nextIndex >= session.reviewOrder.length;

    const updatedSession: QuorumSession = {
      ...session,
      steps: updatedSteps,
      currentStepIndex: nextIndex,
      phase: isComplete ? 'complete' : 'reviewing',
      totalImprovement: calculateTotalImprovement(updatedSteps),
    };

    setSession(updatedSession);

    if (!isComplete) {
      runNextPass(updatedSession);
    }
  };

  // Preview the review order
  const previewOrder = useMemo(() => {
    if (!prompt.trim()) return [];
    return determineReviewOrder(prompt).slice(0, maxPasses);
  }, [prompt, maxPasses]);

  // ─── No session — setup view ───────────────────────────────
  if (!session) {
    return (
      <div className="w-full h-full bg-gray-950 flex items-center justify-center p-8">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">◎</span>
              <h2 className="text-2xl font-bold text-white">Quorum Design Refiner</h2>
            </div>
            <p className="text-gray-400 text-sm">
              AI personas review your design one at a time, each making a single
              targeted improvement. Accept or reject each change.
            </p>
          </div>

          <div className="mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design intent... e.g., 'Professional SaaS landing page for a developer tools company, dark theme, trustworthy but modern'"
              className="w-full h-24 bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-600"
              aria-label="Design intent"
            />
          </div>

          {/* Pass count selector */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-xs text-gray-500">Review passes:</span>
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setMaxPasses(n)}
                className={`w-8 h-8 rounded-lg text-xs font-medium ${
                  maxPasses === n ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                aria-label={`${n} passes`}
                aria-pressed={maxPasses === n}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Review order preview */}
          {previewOrder.length > 0 && (
            <div className="mb-6 bg-gray-900 rounded-xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Review Order</p>
              <div className="flex items-center gap-2">
                {previewOrder.map((persona, i) => (
                  <div key={persona.id} className="flex items-center gap-2">
                    {i > 0 && <span className="text-gray-700">→</span>}
                    <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2.5 py-1.5">
                      <span>{persona.avatar}</span>
                      <div>
                        <span className="text-xs text-white font-medium">{persona.name}</span>
                        <span className="text-[9px] text-gray-500 block">{persona.styleKeywords[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Order chosen based on your prompt. Accessibility always goes first.
              </p>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!prompt.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-40 transition-all"
            aria-label="Start Quorum review"
          >
            Start Quorum Review ({maxPasses} passes)
          </button>

          <p className="text-center text-[10px] text-gray-600 mt-3">
            Powered by <span className="text-purple-400">Quorum</span> — iterative multi-persona design review
          </p>
        </div>
      </div>
    );
  }

  // ─── Active session — step-by-step view ────────────────────
  const currentPersona = session.reviewOrder[session.currentStepIndex];
  const lastStep = session.steps[session.steps.length - 1];
  const acceptedSteps = session.steps.filter((s) => s.userDecision === 'accepted');
  const attribution = session.phase === 'complete' ? getQuorumAttribution(session) : '';

  return (
    <div className="w-full h-full bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">◎</span>
            <div>
              <h2 className="text-sm font-bold text-white">Quorum Refiner</h2>
              <p className="text-[10px] text-gray-500 truncate max-w-sm">"{session.prompt}"</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {session.reviewOrder.map((persona, i) => {
              const step = session.steps.find((s) => s.persona.id === persona.id);
              const isActive = i === session.currentStepIndex && session.phase !== 'complete';
              const isDone = step?.userDecision !== undefined && step?.userDecision !== null;

              return (
                <div
                  key={persona.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    isActive ? 'bg-purple-600 ring-2 ring-purple-400 animate-pulse' :
                    isDone && step?.userDecision === 'accepted' ? 'bg-green-600' :
                    isDone && step?.userDecision === 'rejected' ? 'bg-gray-700 line-through' :
                    'bg-gray-800'
                  }`}
                  title={`${persona.name}: ${isDone ? step?.userDecision : isActive ? 'reviewing...' : 'pending'}`}
                >
                  {persona.avatar}
                </div>
              );
            })}

            {session.totalImprovement > 0 && (
              <span className="text-xs text-green-400 font-mono ml-2">
                +{session.totalImprovement}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview Mode Banner */}
      <div className="mx-6 mt-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
        <span className="text-yellow-500 text-sm">⚠</span>
        <div>
          <span className="text-yellow-300 text-xs font-medium">Preview Mode</span>
          <span className="text-yellow-400/70 text-[10px] ml-2">
            Connect an AI provider in Settings to get real design analysis
          </span>
        </div>
      </div>

      {/* Step timeline */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {session.steps.map((step, index) => (
          <div key={step.id} className="relative pl-12 pb-8">
            {/* Timeline line */}
            {index < session.steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-800" />
            )}

            {/* Persona avatar */}
            <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              step.userDecision === 'accepted' ? 'bg-green-600/20 ring-1 ring-green-500' :
              step.userDecision === 'rejected' ? 'bg-gray-800 opacity-50' :
              step.status === 'generating' ? 'bg-purple-600/20 ring-1 ring-purple-500 animate-pulse' :
              'bg-gray-800'
            }`}>
              {step.persona.avatar}
            </div>

            {/* Step card */}
            <div className={`bg-gray-900 rounded-xl border overflow-hidden ${
              step.userDecision === 'accepted' ? 'border-green-500/30' :
              step.userDecision === 'rejected' ? 'border-gray-800 opacity-60' :
              step.status === 'generating' ? 'border-purple-500/30' :
              'border-gray-800'
            }`}>
              {/* Card header */}
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">
                    Pass #{step.passNumber}: {step.persona.name}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-2 capitalize">{step.focus.replace('-', ' ')}</span>
                </div>
                {step.confidence > 0 && (
                  <span className={`text-xs font-mono ${
                    step.confidence >= 7 ? 'text-green-400' : step.confidence >= 4 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {step.confidence}/10 confidence
                  </span>
                )}
              </div>

              {/* Loading state */}
              {step.status === 'generating' && (
                <div className="px-4 py-8 text-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-400">{step.persona.name} is reviewing the design...</p>
                </div>
              )}

              {/* Content */}
              {step.status === 'applied' && (
                <div className="px-4 py-3 space-y-3">
                  {/* What changed */}
                  <div>
                    <p className="text-sm text-white">{step.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{step.rationale}</p>
                  </div>

                  {/* Token changes */}
                  {step.tokenChanges.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Token Changes</p>
                      <div className="flex flex-wrap gap-2">
                        {step.tokenChanges.map((change) => (
                          <div key={change.name} className="flex items-center gap-1.5 bg-gray-800 rounded px-2 py-1">
                            {change.name.startsWith('color.') && (
                              <>
                                <div className="w-4 h-4 rounded border border-gray-600" style={{ backgroundColor: change.before }} />
                                <span className="text-gray-600">→</span>
                                <div className="w-4 h-4 rounded border border-gray-600" style={{ backgroundColor: change.after }} />
                              </>
                            )}
                            <span className="text-[10px] text-gray-400">{change.name.split('.').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score before/after */}
                  <div className="flex gap-4">
                    <ScoreBar label="Before" score={step.scoreBefore} />
                    <ScoreBar label="After" score={step.scoreAfter} />
                  </div>
                </div>
              )}

              {/* User decision buttons */}
              {step.status === 'applied' && !step.userDecision && (
                <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
                  <button
                    onClick={() => handleDecision('accepted')}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30"
                    aria-label="Accept this change"
                  >
                    ✓ Accept & Continue
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
                    aria-label="Skip this change"
                  >
                    ✗ Skip
                  </button>
                </div>
              )}

              {/* Decision badge */}
              {step.userDecision && (
                <div className={`px-4 py-2 text-center text-[10px] font-medium ${
                  step.userDecision === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'
                }`}>
                  {step.userDecision === 'accepted' ? '✓ Applied' : '✗ Skipped'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Completion card */}
        {session.phase === 'complete' && (
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30 p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Quorum Review Complete</h3>
            <p className="text-sm text-gray-400 mb-1">
              {acceptedSteps.length} of {session.steps.length} improvements accepted
            </p>
            {session.totalImprovement > 0 && (
              <p className="text-2xl font-bold text-green-400 mb-4">+{session.totalImprovement} overall improvement</p>
            )}

            <div className="flex gap-2 justify-center mb-4">
              <button
                onClick={() => setActiveView('canvas')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                aria-label="View updated canvas"
              >
                View Canvas
              </button>
              <button
                onClick={() => { setSession(null); setPrompt(''); }}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
                aria-label="Start new review"
              >
                New Review
              </button>
            </div>

            {/* Attribution */}
            {attribution && (
              <p className="text-[9px] text-gray-600 max-w-md mx-auto">{attribution}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score visualization ─────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: DesignScore }) {
  const overall = Math.round(((score.aesthetics + score.usability + score.accessibility + score.consistency) / 4) * 10) / 10;
  const dims = [
    { key: 'aesthetics', label: 'Visual', value: score.aesthetics },
    { key: 'usability', label: 'UX', value: score.usability },
    { key: 'accessibility', label: 'A11y', value: score.accessibility },
    { key: 'consistency', label: 'System', value: score.consistency },
  ];

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500">{label}</span>
        <span className={`text-xs font-mono ${overall >= 7 ? 'text-green-400' : overall >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
          {overall}
        </span>
      </div>
      <div className="space-y-1">
        {dims.map((dim) => (
          <div key={dim.key} className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-600 w-8">{dim.label}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  dim.value >= 7 ? 'bg-green-500' : dim.value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${dim.value * 10}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-600 w-3">{dim.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mock refinement generator (replace with real AI calls) ──

function generateMockRefinement(
  persona: DesignPersona,
  stepIndex: number,
  _prompt: string,
): Partial<RefinementStep> {
  const refinements: Record<string, { focus: RefinementStep['focus']; description: string; rationale: string; tokens: { name: string; before: string; after: string }[] }> = {
    accessible: {
      focus: 'accessibility',
      description: 'Increased text contrast and button touch targets',
      rationale: 'The current text contrast ratio was 3.8:1, below WCAG AA minimum of 4.5:1. Fixed by darkening the text color. Also ensured all interactive elements meet 44px minimum touch target.',
      tokens: [
        { name: 'color.text.primary', before: '#6b7280', after: '#111827' },
        { name: 'color.text.secondary', before: '#9ca3af', after: '#4b5563' },
      ],
    },
    minimalist: {
      focus: 'simplification',
      description: 'Reduced visual noise by simplifying shadows and borders',
      rationale: 'The design had competing visual elements. Removed heavy shadows in favor of subtle borders, creating a cleaner visual hierarchy that lets content breathe.',
      tokens: [
        { name: 'shadow.md', before: '0 4px 6px -1px rgba(0,0,0,0.1)', after: '0 1px 2px 0 rgba(0,0,0,0.05)' },
        { name: 'color.border.primary', before: '#d1d5db', after: '#f3f4f6' },
      ],
    },
    bold: {
      focus: 'visual-hierarchy',
      description: 'Strengthened the primary CTA with higher contrast accent color',
      rationale: 'The primary action button blended with the background. Made it the strongest visual element on the page by deepening the accent color and increasing size contrast.',
      tokens: [
        { name: 'color.action.primary', before: '#3b82f6', after: '#1d4ed8' },
      ],
    },
    editorial: {
      focus: 'typography',
      description: 'Improved typographic hierarchy with better font pairing',
      rationale: 'The heading and body text used the same font weight, creating a flat hierarchy. Added a serif heading font and increased the size contrast between heading levels.',
      tokens: [
        { name: 'font.size.3xl', before: '30px', after: '36px' },
        { name: 'font.size.base', before: '16px', after: '17px' },
      ],
    },
    playful: {
      focus: 'emotional-tone',
      description: 'Warmed up the color palette and softened corners',
      rationale: 'The design felt cold and corporate. Added warmth through the background tint and increased corner radius for a friendlier, more approachable feel.',
      tokens: [
        { name: 'radius.md', before: '8px', after: '12px' },
        { name: 'radius.lg', before: '12px', after: '16px' },
        { name: 'color.surface.secondary', before: '#f9fafb', after: '#fefce8' },
      ],
    },
    brutalist: {
      focus: 'consistency',
      description: 'Standardized the spacing scale for grid alignment',
      rationale: 'Elements were placed at arbitrary positions. Snapped everything to an 8px grid and standardized gaps between sections for structural clarity.',
      tokens: [
        { name: 'spacing.3', before: '12px', after: '16px' },
        { name: 'spacing.5', before: '20px', after: '24px' },
      ],
    },
  };

  const mock = refinements[persona.id] ?? refinements['minimalist']!;
  const baseScore = 5 + stepIndex * 0.5;

  return {
    focus: mock.focus,
    description: mock.description,
    rationale: mock.rationale,
    confidence: Math.min(9, 6 + stepIndex),
    tokenChanges: mock.tokens,
    componentChanges: [],
    scoreBefore: {
      aesthetics: Math.round((baseScore + Math.random()) * 10) / 10,
      usability: Math.round((baseScore + Math.random()) * 10) / 10,
      accessibility: Math.round((baseScore + Math.random() * 0.5) * 10) / 10,
      consistency: Math.round((baseScore + Math.random()) * 10) / 10,
      overall: 0,
    },
    scoreAfter: {
      aesthetics: Math.round((baseScore + 1 + Math.random()) * 10) / 10,
      usability: Math.round((baseScore + 0.8 + Math.random()) * 10) / 10,
      accessibility: Math.round((baseScore + 1.2 + Math.random() * 0.5) * 10) / 10,
      consistency: Math.round((baseScore + 0.9 + Math.random()) * 10) / 10,
      overall: 0,
    },
  };
}
