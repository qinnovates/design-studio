/**
 * MarketIntelligence — AI-powered competitive analysis and market readiness.
 *
 * Analyzes the user's app design against:
 * 1. Competitive landscape (what do successful apps in this category look like?)
 * 2. UX research patterns (proven patterns for this type of interaction)
 * 3. Market readiness signals (does this look professional? trustworthy? intuitive?)
 * 4. User intuition predictions (will users understand this without instructions?)
 *
 * Feeds scores into the Design Pipeline as a quality gate.
 */

// ─── Market Analysis Request ─────────────────────────────────

export interface MarketAnalysisRequest {
  /** App category (e.g., "fintech", "health", "social", "saas", "e-commerce") */
  category: string;
  /** Target audience description */
  targetAudience: string;
  /** What the app does (one sentence) */
  appDescription: string;
  /** Current design tokens (colors, fonts, spacing) */
  designTokens: Record<string, string>;
  /** Current component list with types */
  components: { type: string; name: string; variant: string }[];
  /** Screen names and types */
  screens: { name: string; type: string; route: string }[];
  /** Number of elements on canvas */
  elementCount: number;
}

// ─── Market Intelligence Report ──────────────────────────────

export interface MarketIntelReport {
  id: string;
  /** Overall market readiness score (0-100) */
  marketReadyScore: number;
  /** Dimensional scores */
  scores: {
    /** Does it look like it belongs in this category? */
    categoryFit: DimensionScore;
    /** Will users understand the UI without instructions? */
    intuitivenessScore: DimensionScore;
    /** Does it look professional/trustworthy? */
    professionalismScore: DimensionScore;
    /** Is it visually competitive with top apps in the space? */
    visualCompetitiveness: DimensionScore;
    /** Does it follow proven UX patterns for this category? */
    uxPatternAdherence: DimensionScore;
    /** Is the information architecture clear? */
    informationArchitecture: DimensionScore;
    /** Would users convert (sign up, buy, engage)? */
    conversionReadiness: DimensionScore;
  };
  /** Competitive landscape insights */
  competitiveLandscape: CompetitiveInsight[];
  /** UX pattern recommendations */
  uxRecommendations: UXRecommendation[];
  /** Market-specific signals */
  marketSignals: MarketSignal[];
  /** Actionable improvements ranked by impact */
  improvements: MarketImprovement[];
  /** Overall assessment in plain English */
  summary: string;
  /** Confidence level of this analysis */
  confidence: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface DimensionScore {
  score: number; // 0-100
  label: string;
  description: string;
  /** What top apps in this category score */
  benchmark: number;
  /** Gap between current and benchmark */
  gap: number;
}

export interface CompetitiveInsight {
  /** Competitor or category reference */
  reference: string;
  /** What they do well that this design could learn from */
  insight: string;
  /** Relevance to the user's app (1-10) */
  relevance: number;
  /** Source category (direct competitor, adjacent market, industry leader) */
  source: 'direct-competitor' | 'adjacent-market' | 'industry-leader' | 'ux-research';
}

export interface UXRecommendation {
  /** Pattern name */
  pattern: string;
  /** Why this pattern matters for this app category */
  rationale: string;
  /** Is the design currently following this pattern? */
  currentlyFollowing: boolean;
  /** How to implement if not following */
  implementation: string;
  /** Impact if implemented (1-10) */
  impact: number;
  /** Effort to implement (1-10, lower = easier) */
  effort: number;
  /** Source research or evidence */
  evidence: string;
}

export interface MarketSignal {
  signal: string;
  /** Positive or negative indicator */
  sentiment: 'positive' | 'negative' | 'neutral';
  /** What it means for the design */
  implication: string;
  /** Category this applies to */
  category: 'trend' | 'user-expectation' | 'competitive-gap' | 'opportunity';
}

export interface MarketImprovement {
  id: string;
  title: string;
  description: string;
  /** Expected score increase */
  scoreImpact: number;
  /** Which dimension(s) this improves */
  dimensions: string[];
  /** Priority ranking */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Estimated effort */
  effort: 'quick-win' | 'moderate' | 'significant';
  /** Specific token/component changes */
  changes: { type: 'token' | 'component' | 'layout' | 'content'; description: string }[];
}

// ─── Category Benchmarks ─────────────────────────────────────

/** Known UX patterns and benchmarks by app category */
export const CATEGORY_BENCHMARKS: Record<string, CategoryBenchmark> = {
  fintech: {
    category: 'fintech',
    displayName: 'Fintech / Banking',
    topApps: ['Stripe Dashboard', 'Mercury', 'Wise', 'Revolut', 'Robinhood'],
    expectedPatterns: [
      'Trust indicators above the fold (security badges, encryption mentions)',
      'Clean data visualization with clear number formatting',
      'Minimal color palette — blue, green for positive, red for negative',
      'Prominent account balance / portfolio value',
      'Progressive disclosure of complex financial data',
      'Strong typography hierarchy for monetary amounts',
    ],
    colorExpectations: {
      primary: ['blue', 'dark-blue', 'green'],
      avoid: ['bright-red-as-primary', 'neon', 'playful-pastels'],
      rationale: 'Trust, stability, and professionalism. Blue = trust, green = money/growth.',
    },
    fontExpectations: {
      heading: ['geometric-sans', 'humanist-sans'],
      body: ['humanist-sans'],
      avoid: ['handwriting', 'display', 'serif-for-numbers'],
      rationale: 'Clean, modern, highly legible. Numbers must be tabular-aligned.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 80, professionalism: 90, visual: 82, uxPatterns: 85, infoArch: 80, conversion: 78 },
  },
  health: {
    category: 'health',
    displayName: 'Health & Wellness',
    topApps: ['Headspace', 'Calm', 'MyFitnessPal', 'Peloton', 'Oura'],
    expectedPatterns: [
      'Warm, inviting color palette with calming tones',
      'Progress visualization (rings, streaks, charts)',
      'Large touch targets for fitness tracking during exercise',
      'Motivational copy and achievement celebrations',
      'Dark mode for bedtime / sleep tracking features',
      'Rounded corners and soft shadows throughout',
    ],
    colorExpectations: {
      primary: ['teal', 'green', 'purple', 'warm-blue'],
      avoid: ['aggressive-red', 'corporate-gray', 'harsh-contrast'],
      rationale: 'Calming, encouraging, non-clinical. Avoid medical/sterile aesthetics.',
    },
    fontExpectations: {
      heading: ['rounded-sans', 'humanist-sans'],
      body: ['humanist-sans'],
      avoid: ['monospace', 'condensed', 'brutalist'],
      rationale: 'Friendly, approachable, easy to read during exercise.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 85, professionalism: 80, visual: 88, uxPatterns: 82, infoArch: 78, conversion: 80 },
  },
  saas: {
    category: 'saas',
    displayName: 'SaaS / B2B',
    topApps: ['Linear', 'Notion', 'Vercel', 'Figma', 'Slack'],
    expectedPatterns: [
      'Clear navigation with sidebar or top nav',
      'Feature-rich but not cluttered — progressive disclosure',
      'Keyboard shortcuts for power users',
      'Consistent component library throughout',
      'Empty states that guide users to action',
      'Dark mode support (developer audience expects it)',
    ],
    colorExpectations: {
      primary: ['blue', 'purple', 'dark-neutral'],
      avoid: ['childish-colors', 'excessive-gradients'],
      rationale: 'Professional, modern, tool-like. Should feel productive.',
    },
    fontExpectations: {
      heading: ['geometric-sans', 'neo-grotesque'],
      body: ['geometric-sans', 'humanist-sans'],
      avoid: ['serif', 'decorative'],
      rationale: 'Clean, efficient, scannable. Inter, SF Pro, and similar dominate.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 82, professionalism: 88, visual: 80, uxPatterns: 85, infoArch: 85, conversion: 82 },
  },
  'e-commerce': {
    category: 'e-commerce',
    displayName: 'E-Commerce',
    topApps: ['Shopify Storefront', 'Apple Store', 'Nike', 'Amazon', 'Glossier'],
    expectedPatterns: [
      'Product images as hero content (large, high-quality)',
      'Clear pricing with currency formatting',
      'Prominent Add to Cart / Buy Now CTA',
      'Trust signals (reviews, ratings, secure checkout badges)',
      'Search prominently placed',
      'Cart indicator always visible',
    ],
    colorExpectations: {
      primary: ['brand-specific', 'black', 'blue'],
      avoid: ['too-many-colors', 'competing-ctas'],
      rationale: 'CTA must stand out. Background recedes. Product is the star.',
    },
    fontExpectations: {
      heading: ['any-clean-sans', 'brand-serif-for-luxury'],
      body: ['humanist-sans'],
      avoid: ['hard-to-read-at-small-sizes'],
      rationale: 'Scannable product names, readable prices, clear descriptions.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 88, professionalism: 82, visual: 85, uxPatterns: 88, infoArch: 82, conversion: 90 },
  },
  social: {
    category: 'social',
    displayName: 'Social / Community',
    topApps: ['Instagram', 'Discord', 'Twitter/X', 'Threads', 'BeReal'],
    expectedPatterns: [
      'Feed-based layout with infinite scroll',
      'User avatars and profile elements prominent',
      'Quick-action buttons (like, comment, share)',
      'Create/compose button always accessible',
      'Notification indicators',
      'Tab bar navigation (mobile) or sidebar (desktop)',
    ],
    colorExpectations: {
      primary: ['brand-accent', 'blue', 'purple'],
      avoid: ['too-corporate', 'muted-everything'],
      rationale: 'Engaging, personality-driven. Accent color defines the brand.',
    },
    fontExpectations: {
      heading: ['geometric-sans', 'neo-grotesque'],
      body: ['system-font', 'humanist-sans'],
      avoid: ['serif-for-feed-content'],
      rationale: 'Quick scanning of short-form content. Emoji-compatible.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 90, professionalism: 75, visual: 85, uxPatterns: 88, infoArch: 80, conversion: 85 },
  },
  education: {
    category: 'education',
    displayName: 'Education / EdTech',
    topApps: ['Duolingo', 'Khan Academy', 'Coursera', 'Brilliant', 'Anki'],
    expectedPatterns: [
      'Progress tracking (streaks, XP, completion bars)',
      'Gamification elements (achievements, levels)',
      'Clear lesson structure and navigation',
      'Large interactive elements for learning activities',
      'Encouraging feedback on correct/incorrect answers',
      'Spaced repetition or curriculum flow visible',
    ],
    colorExpectations: {
      primary: ['green', 'blue', 'friendly-purple'],
      avoid: ['intimidating-dark-themes', 'corporate-gray'],
      rationale: 'Encouraging, warm, non-intimidating. Learning should feel rewarding.',
    },
    fontExpectations: {
      heading: ['rounded-sans', 'friendly-geometric'],
      body: ['highly-readable-sans'],
      avoid: ['tiny-fonts', 'dense-typography'],
      rationale: 'Maximum readability. Must work for long reading sessions.',
    },
    benchmarkScores: { categoryFit: 85, intuitiveness: 88, professionalism: 78, visual: 82, uxPatterns: 85, infoArch: 85, conversion: 82 },
  },
};

export interface CategoryBenchmark {
  category: string;
  displayName: string;
  topApps: string[];
  expectedPatterns: string[];
  colorExpectations: {
    primary: string[];
    avoid: string[];
    rationale: string;
  };
  fontExpectations: {
    heading: string[];
    body: string[];
    avoid: string[];
    rationale: string;
  };
  benchmarkScores: {
    categoryFit: number;
    intuitiveness: number;
    professionalism: number;
    visual: number;
    uxPatterns: number;
    infoArch: number;
    conversion: number;
  };
}

// ─── Prompt Builder ──────────────────────────────────────────

export function buildMarketAnalysisPrompt(request: MarketAnalysisRequest): string {
  const benchmark = CATEGORY_BENCHMARKS[request.category];
  const benchmarkContext = benchmark
    ? `
CATEGORY BENCHMARKS (${benchmark.displayName}):
Top apps in this space: ${benchmark.topApps.join(', ')}
Expected UX patterns:
${benchmark.expectedPatterns.map((p) => `  - ${p}`).join('\n')}
Color expectations: ${benchmark.colorExpectations.primary.join(', ')} (avoid: ${benchmark.colorExpectations.avoid.join(', ')})
Font expectations: heading=${benchmark.fontExpectations.heading.join('/')}, body=${benchmark.fontExpectations.body.join('/')}
Industry benchmarks: categoryFit=${benchmark.benchmarkScores.categoryFit}, intuitiveness=${benchmark.benchmarkScores.intuitiveness}, professionalism=${benchmark.benchmarkScores.professionalism}
`
    : 'No specific category benchmarks available. Use general UX best practices.';

  return `You are a market intelligence analyst for app design. Analyze this design against the competitive landscape.

APP DETAILS:
- Category: ${request.category}
- Target audience: ${request.targetAudience}
- Description: ${request.appDescription}
- Screens: ${request.screens.map((s) => `${s.name} (${s.type})`).join(', ')}
- Components: ${request.components.length} elements (${request.components.map((c) => c.type).join(', ')})
- Design tokens: ${Object.entries(request.designTokens).filter(([k]) => k.startsWith('color.')).map(([k, v]) => `${k}=${v}`).join(', ')}

${benchmarkContext}

Analyze and return JSON:
{
  "marketReadyScore": 0-100,
  "scores": {
    "categoryFit": { "score": N, "label": "...", "description": "..." },
    "intuitivenessScore": { "score": N, "label": "...", "description": "..." },
    "professionalismScore": { "score": N, "label": "...", "description": "..." },
    "visualCompetitiveness": { "score": N, "label": "...", "description": "..." },
    "uxPatternAdherence": { "score": N, "label": "...", "description": "..." },
    "informationArchitecture": { "score": N, "label": "...", "description": "..." },
    "conversionReadiness": { "score": N, "label": "...", "description": "..." }
  },
  "competitiveLandscape": [{ "reference": "...", "insight": "...", "relevance": N, "source": "..." }],
  "uxRecommendations": [{ "pattern": "...", "rationale": "...", "currentlyFollowing": bool, "implementation": "...", "impact": N, "effort": N, "evidence": "..." }],
  "marketSignals": [{ "signal": "...", "sentiment": "...", "implication": "...", "category": "..." }],
  "improvements": [{ "title": "...", "description": "...", "scoreImpact": N, "dimensions": [...], "priority": "...", "effort": "...", "changes": [...] }],
  "summary": "2-3 sentence market readiness assessment",
  "confidence": "high|medium|low"
}`;
}

// ─── Score Label Mapping ─────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Adequate';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Weak';
  return 'Critical';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

// ─── Mock Analysis (replace with real AI call) ───────────────

export function generateMockAnalysis(request: MarketAnalysisRequest): MarketIntelReport {
  const benchmark = CATEGORY_BENCHMARKS[request.category] ?? CATEGORY_BENCHMARKS['saas']!;
  const hasEnoughScreens = request.screens.length >= 3;
  const hasEnoughComponents = request.components.length >= 5;
  const baseScore = 55 + (hasEnoughScreens ? 10 : 0) + (hasEnoughComponents ? 10 : 0);

  const mkDim = (name: string, benchKey: keyof typeof benchmark.benchmarkScores, offset: number): DimensionScore => {
    const score = Math.min(100, Math.max(20, baseScore + offset + Math.round(Math.random() * 10)));
    const bm = benchmark.benchmarkScores[benchKey];
    return { score, label: getScoreLabel(score), description: `${name} analysis based on ${request.category} category standards`, benchmark: bm, gap: bm - score };
  };

  const scores = {
    categoryFit: mkDim('Category fit', 'categoryFit', 5),
    intuitivenessScore: mkDim('Intuitiveness', 'intuitiveness', -2),
    professionalismScore: mkDim('Professionalism', 'professionalism', 3),
    visualCompetitiveness: mkDim('Visual competitiveness', 'visual', -5),
    uxPatternAdherence: mkDim('UX pattern adherence', 'uxPatterns', 0),
    informationArchitecture: mkDim('Information architecture', 'infoArch', -3),
    conversionReadiness: mkDim('Conversion readiness', 'conversion', -8),
  };

  const allScores = Object.values(scores).map((s) => s.score);
  const marketReadyScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  return {
    id: `intel-${Date.now().toString(36)}`,
    marketReadyScore,
    scores,
    competitiveLandscape: benchmark.topApps.slice(0, 3).map((app, i) => ({
      reference: app,
      insight: benchmark.expectedPatterns[i] ?? 'Strong visual design and clear user flows',
      relevance: 8 - i,
      source: i === 0 ? 'direct-competitor' as const : 'industry-leader' as const,
    })),
    uxRecommendations: benchmark.expectedPatterns.slice(0, 4).map((pattern, i) => ({
      pattern,
      rationale: `This is a proven pattern in the ${benchmark.displayName} space`,
      currentlyFollowing: i < 2,
      implementation: `Review ${benchmark.topApps[0]} for reference implementation`,
      impact: 8 - i,
      effort: 3 + i,
      evidence: `Used by ${benchmark.topApps.slice(0, 3).join(', ')}`,
    })),
    marketSignals: [
      { signal: `${benchmark.displayName} apps are trending toward ${benchmark.colorExpectations.primary[0]} primary colors`, sentiment: 'neutral' as const, implication: 'Ensure your color palette aligns with category expectations', category: 'trend' as const },
      { signal: 'Users expect mobile-first responsive design', sentiment: hasEnoughScreens ? 'positive' as const : 'negative' as const, implication: hasEnoughScreens ? 'Your screen structure supports mobile' : 'Add mobile-specific screens', category: 'user-expectation' as const },
      { signal: `Dark mode is ${request.category === 'saas' || request.category === 'social' ? 'expected' : 'nice-to-have'} in ${benchmark.displayName}`, sentiment: 'neutral' as const, implication: 'Consider adding dark mode support', category: 'competitive-gap' as const },
    ],
    improvements: [
      { id: 'imp-1', title: 'Add trust indicators', description: `Top ${benchmark.displayName} apps show trust signals above the fold`, scoreImpact: 8, dimensions: ['professionalism', 'conversion'], priority: 'high' as const, effort: 'quick-win' as const, changes: [{ type: 'component' as const, description: 'Add security badge or testimonial component' }] },
      { id: 'imp-2', title: 'Strengthen CTA visibility', description: 'Primary call-to-action should be the most prominent element', scoreImpact: 6, dimensions: ['conversion', 'visual'], priority: 'high' as const, effort: 'quick-win' as const, changes: [{ type: 'token' as const, description: 'Increase CTA button contrast and size' }] },
      { id: 'imp-3', title: `Follow ${benchmark.displayName} navigation patterns`, description: `${benchmark.expectedPatterns[0]}`, scoreImpact: 5, dimensions: ['uxPatterns', 'intuitiveness'], priority: 'medium' as const, effort: 'moderate' as const, changes: [{ type: 'layout' as const, description: 'Restructure navigation to match category conventions' }] },
    ],
    summary: `This ${request.category} design scores ${marketReadyScore}/100 for market readiness. ${marketReadyScore >= 70 ? 'It has a solid foundation' : 'It needs significant improvement'} compared to top apps like ${benchmark.topApps.slice(0, 2).join(' and ')}. Key areas to improve: ${Object.entries(scores).sort((a, b) => a[1].gap - b[1].gap).slice(-2).map(([, s]) => s.description.split(' ')[0]).join(', ')}.`,
    confidence: hasEnoughComponents && hasEnoughScreens ? 'high' : hasEnoughComponents || hasEnoughScreens ? 'medium' : 'low',
    createdAt: new Date().toISOString(),
  };
}
