/**
 * BrandIntelligence — AI-powered name, tagline, and brand testing.
 *
 * Uses Quorum-style iteration: multiple personas each evaluate and
 * improve names/taglines. Checks for conflicts, memorability, and
 * market fit.
 */

// ─── Brand Test Request ──────────────────────────────────────

export interface BrandTestRequest {
  /** The name to test */
  name: string;
  /** Tagline candidates */
  taglines: string[];
  /** App category */
  category: string;
  /** Target audience */
  audience: string;
  /** Known competitors */
  competitors: string[];
  /** What the app does */
  description: string;
}

// ─── Name Analysis ───────────────────────────────────────────

export interface NameAnalysis {
  name: string;
  scores: {
    memorability: number;      // 1-10: easy to remember?
    pronounceability: number;  // 1-10: easy to say?
    spellability: number;      // 1-10: easy to spell after hearing?
    uniqueness: number;        // 1-10: stands out from competitors?
    relevance: number;         // 1-10: relates to what the app does?
    seoFriendly: number;       // 1-10: searchable, not generic?
    domainPotential: number;   // 1-10: likely .com/.io/.dev available?
    globalFriendly: number;    // 1-10: works across languages/cultures?
  };
  overall: number;
  /** Potential conflicts found */
  conflicts: NameConflict[];
  /** Suggestions for improvement */
  suggestions: string[];
  /** Similar names in the space */
  similarNames: string[];
}

export interface NameConflict {
  source: 'github' | 'npm' | 'trademark' | 'domain' | 'app-store' | 'similar-product';
  name: string;
  description: string;
  severity: 'blocking' | 'warning' | 'info';
  url?: string;
}

// ─── Tagline Analysis ────────────────────────────────────────

export interface TaglineAnalysis {
  tagline: string;
  scores: {
    clarity: number;         // 1-10: immediately understandable?
    memorability: number;    // 1-10: sticks in your head?
    actionOriented: number;  // 1-10: drives action?
    differentiated: number;  // 1-10: stands out from competitors?
    emotionalHook: number;   // 1-10: creates feeling?
    brevity: number;         // 1-10: concise? (fewer words = higher)
    seoValue: number;        // 1-10: contains searchable keywords?
  };
  overall: number;
  /** What persona type would respond best */
  bestFor: string;
  /** Weaknesses */
  weaknesses: string[];
  /** Improved version */
  improvedVersion: string;
}

// ─── Brand Test Report ───────────────────────────────────────

export interface BrandTestReport {
  id: string;
  request: BrandTestRequest;
  nameAnalysis: NameAnalysis;
  taglineAnalyses: TaglineAnalysis[];
  /** AI-generated alternative names */
  alternativeNames: GeneratedName[];
  /** AI-generated alternative taglines */
  alternativeTaglines: GeneratedTagline[];
  /** Overall brand strength */
  brandStrength: number;
  /** Key recommendation */
  recommendation: string;
  createdAt: string;
}

export interface GeneratedName {
  name: string;
  rationale: string;
  style: 'descriptive' | 'abstract' | 'compound' | 'acronym' | 'metaphor';
  score: number;
}

export interface GeneratedTagline {
  tagline: string;
  rationale: string;
  style: 'benefit' | 'action' | 'question' | 'metaphor' | 'contrast';
  personaFit: string;
  score: number;
}

// ─── Evaluation Personas (Quorum-style) ──────────────────────

export interface BrandPersona {
  id: string;
  name: string;
  role: string;
  evaluationFocus: string;
  avatar: string;
}

export const BRAND_PERSONAS: BrandPersona[] = [
  {
    id: 'marketer',
    name: 'Marcus',
    role: 'Growth Marketer',
    evaluationFocus: 'Will this name/tagline convert? Is it shareable? Does it work in ads?',
    avatar: 'M',
  },
  {
    id: 'linguist',
    name: 'Luna',
    role: 'Naming Linguist',
    evaluationFocus: 'How does it sound? Is it pronounceable globally? Any negative connotations in other languages?',
    avatar: 'L',
  },
  {
    id: 'seo-expert',
    name: 'Sasha',
    role: 'SEO Strategist',
    evaluationFocus: 'Is it searchable? Will it rank? Is the domain landscape favorable?',
    avatar: 'S',
  },
  {
    id: 'brand-strategist',
    name: 'Blake',
    role: 'Brand Strategist',
    evaluationFocus: 'Does it align with the brand positioning? Is it scalable as the company grows?',
    avatar: 'B',
  },
  {
    id: 'user-advocate',
    name: 'Uma',
    role: 'User Research Lead',
    evaluationFocus: 'Would target users understand this immediately? Does it resonate with their pain points?',
    avatar: 'U',
  },
];

// ─── Prompt Builder ──────────────────────────────────────────

export function buildBrandTestPrompt(request: BrandTestRequest): string {
  return `You are a brand naming expert evaluating an app name and taglines.

APP DETAILS:
- Name: "${request.name}"
- Category: ${request.category}
- Audience: ${request.audience}
- Description: ${request.description}
- Competitors: ${request.competitors.join(', ') || 'None specified'}
- Tagline candidates: ${request.taglines.map((t) => `"${t}"`).join(', ') || 'None yet'}

EVALUATE THE NAME on these dimensions (1-10 each):
1. Memorability — easy to remember after hearing once?
2. Pronounceability — easy to say in conversation?
3. Spellability — can someone type it correctly after hearing it?
4. Uniqueness — stands out from competitors listed above?
5. Relevance — relates to what the app does?
6. SEO-friendly — searchable, not too generic?
7. Domain potential — likely that .com/.io/.dev is available?
8. Global-friendly — works across languages and cultures?

CHECK FOR CONFLICTS:
- Is this name already used by a well-known product?
- Any similar names in the same category?
- Potential trademark issues?

EVALUATE EACH TAGLINE on: clarity, memorability, action-orientation, differentiation, emotional hook, brevity, SEO value.

GENERATE 5 alternative names (mix of styles: descriptive, abstract, compound, acronym, metaphor).
GENERATE 5 alternative taglines (mix of styles: benefit, action, question, metaphor, contrast).

Return JSON with the full analysis.`;
}

// ─── Mock Analysis ───────────────────────────────────────────

export function generateMockBrandTest(request: BrandTestRequest): BrandTestReport {
  const name = request.name;
  const nameLen = name.length;

  // Score based on actual name characteristics
  const hasVowels = (name.match(/[aeiou]/gi) || []).length;
  const syllables = Math.max(1, Math.round(hasVowels / 1.5));
  const isShort = nameLen <= 10;
  const hasCommonEnding = /(?:ly|able|ify|hub|io|ful)$/i.test(name);

  const nameScores = {
    memorability: Math.min(10, isShort ? 8 : 6 + Math.round(Math.random() * 2)),
    pronounceability: Math.min(10, syllables <= 3 ? 8 : 5 + Math.round(Math.random() * 2)),
    spellability: Math.min(10, isShort ? 7 : 5 + Math.round(Math.random() * 2)),
    uniqueness: Math.min(10, hasCommonEnding ? 5 : 7 + Math.round(Math.random() * 2)),
    relevance: 6 + Math.round(Math.random() * 3),
    seoFriendly: Math.min(10, nameLen <= 12 ? 7 : 4 + Math.round(Math.random() * 2)),
    domainPotential: Math.min(10, nameLen <= 8 ? 4 : 6 + Math.round(Math.random() * 2)),
    globalFriendly: Math.min(10, 6 + Math.round(Math.random() * 3)),
  };

  const nameOverall = Math.round(
    Object.values(nameScores).reduce((a, b) => a + b, 0) / Object.values(nameScores).length * 10,
  ) / 10;

  // Check for known conflicts
  const knownProducts = [
    'figma', 'linear', 'notion', 'slack', 'vercel', 'stripe', 'shopify',
    'canva', 'miro', 'asana', 'jira', 'trello', 'airtable', 'webflow',
    'framer', 'sketch', 'abstract', 'zeplin', 'storybook', 'chromatic',
  ];

  const conflicts: NameConflict[] = [];
  const lowerName = name.toLowerCase();

  for (const known of knownProducts) {
    if (lowerName === known) {
      conflicts.push({
        source: 'similar-product',
        name: known,
        description: `"${known}" is an established product in the design/dev tools space`,
        severity: 'blocking',
      });
    } else if (lowerName.includes(known) || known.includes(lowerName)) {
      conflicts.push({
        source: 'similar-product',
        name: known,
        description: `Name partially overlaps with "${known}"`,
        severity: 'warning',
      });
    }
  }

  // Levenshtein-ish similarity check
  for (const comp of request.competitors) {
    const compLower = comp.toLowerCase();
    if (lowerName.length > 0 && compLower.length > 0) {
      const shared = [...lowerName].filter((c) => compLower.includes(c)).length;
      const similarity = shared / Math.max(lowerName.length, compLower.length);
      if (similarity > 0.6) {
        conflicts.push({
          source: 'similar-product',
          name: comp,
          description: `High character overlap with competitor "${comp}" (${Math.round(similarity * 100)}%)`,
          severity: 'warning',
        });
      }
    }
  }

  // Tagline analyses
  const taglineAnalyses: TaglineAnalysis[] = request.taglines.map((tagline) => {
    const words = tagline.split(/\s+/).length;
    const hasAction = /build|ship|launch|create|design|make|get|start/i.test(tagline);
    const hasQuestion = tagline.includes('?');
    const hasEmotion = /love|hate|pain|joy|fast|easy|simple|powerful/i.test(tagline);

    const scores = {
      clarity: Math.min(10, words <= 8 ? 8 : 5 + Math.round(Math.random() * 2)),
      memorability: Math.min(10, words <= 6 ? 7 : 5 + Math.round(Math.random() * 2)),
      actionOriented: hasAction ? 8 : 4 + Math.round(Math.random() * 2),
      differentiated: 5 + Math.round(Math.random() * 3),
      emotionalHook: hasEmotion ? 7 : hasQuestion ? 6 : 4 + Math.round(Math.random() * 2),
      brevity: Math.min(10, Math.max(2, 10 - words)),
      seoValue: 5 + Math.round(Math.random() * 3),
    };

    const overall = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length * 10,
    ) / 10;

    return {
      tagline,
      scores,
      overall,
      bestFor: hasAction ? 'Growth-focused users' : hasQuestion ? 'Problem-aware users' : 'General audience',
      weaknesses: [
        words > 8 ? 'Too long for quick scanning' : null,
        !hasAction ? 'No clear call to action' : null,
        !hasEmotion ? 'Missing emotional resonance' : null,
      ].filter(Boolean) as string[],
      improvedVersion: tagline.replace(/\.$/, '') + (hasAction ? '' : ' — start building today'),
    };
  });

  // Generate alternative names
  const category = request.category;
  const nameStyles: Record<string, GeneratedName[]> = {
    saas: [
      { name: 'Buildstream', rationale: 'Combines building + streaming workflow', style: 'compound', score: 7.5 },
      { name: 'Shipwright', rationale: 'Craftsperson who builds ships — metaphor for shipping products', style: 'metaphor', score: 8.2 },
      { name: 'Orbiter', rationale: 'Suggests oversight, orbiting around your project', style: 'abstract', score: 7.0 },
      { name: 'Canopy', rationale: 'A covering that sees everything — single pane of glass', style: 'metaphor', score: 7.8 },
      { name: 'Forgekit', rationale: 'Forge (build) + kit (toolkit)', style: 'compound', score: 7.3 },
    ],
    'e-commerce': [
      { name: 'Cartwright', rationale: 'Cart + craftsmanship', style: 'compound', score: 7.4 },
      { name: 'Bazaar', rationale: 'Market/commerce association, memorable', style: 'metaphor', score: 6.8 },
      { name: 'Vendora', rationale: 'Vendor + feminine suffix, elegant', style: 'abstract', score: 7.1 },
      { name: 'ShelfSpace', rationale: 'Where products live, clear meaning', style: 'descriptive', score: 7.0 },
      { name: 'Mosaic', rationale: 'Many pieces forming one picture', style: 'metaphor', score: 7.6 },
    ],
  };

  const altNames = nameStyles[category] ?? [
    { name: 'Launchpad', rationale: 'Where things launch from', style: 'metaphor' as const, score: 6.5 },
    { name: 'Assemblr', rationale: 'Assemble + modern suffix', style: 'abstract' as const, score: 7.0 },
    { name: 'Blueprint', rationale: 'Classic design/planning reference', style: 'metaphor' as const, score: 7.2 },
    { name: 'Scaffold', rationale: 'Building support structure', style: 'descriptive' as const, score: 7.4 },
    { name: 'Nexus', rationale: 'Central connection point', style: 'abstract' as const, score: 7.1 },
  ];

  // Generate alternative taglines
  const altTaglines: GeneratedTagline[] = [
    { tagline: `Ship ${category} apps with confidence`, rationale: 'Benefit-focused, category-specific', style: 'benefit', personaFit: 'Decision makers', score: 7.5 },
    { tagline: 'From idea to production in one view', rationale: 'Emphasizes the single-pane-of-glass value', style: 'benefit', personaFit: 'PMs and founders', score: 8.0 },
    { tagline: 'What if your design tool had CI/CD?', rationale: 'Provocative question for dev-tool audience', style: 'question', personaFit: 'Engineers', score: 7.8 },
    { tagline: 'Design. Review. Gate. Ship.', rationale: 'Four verbs showing the pipeline', style: 'action', personaFit: 'Process-oriented teams', score: 8.2 },
    { tagline: `Stop context-switching. Start shipping.`, rationale: 'Contrasts pain (switching) with solution (shipping)', style: 'contrast', personaFit: 'Overworked builders', score: 8.5 },
  ];

  const brandStrength = Math.round(
    (nameOverall * 0.4 +
      (taglineAnalyses.length > 0
        ? taglineAnalyses.reduce((s, t) => s + t.overall, 0) / taglineAnalyses.length
        : 5) * 0.3 +
      (10 - conflicts.filter((c) => c.severity !== 'info').length * 2) * 0.3) * 10,
  ) / 10;

  return {
    id: `brand-${Date.now().toString(36)}`,
    request,
    nameAnalysis: {
      name,
      scores: nameScores,
      overall: nameOverall,
      conflicts,
      suggestions: [
        nameLen > 12 ? 'Consider a shorter name (under 10 characters ideal)' : null,
        !isShort ? 'Shorter names are easier to type in URLs' : null,
        hasCommonEnding ? `The "${name.match(/(?:ly|able|ify|hub|io|ful)$/i)?.[0]}" suffix is overused in tech` : null,
        conflicts.length > 0 ? 'Check trademark databases for the conflicts found' : null,
      ].filter(Boolean) as string[],
      similarNames: knownProducts.filter((p) => {
        const shared = [...lowerName].filter((c) => p.includes(c)).length;
        return shared / Math.max(lowerName.length, p.length) > 0.4;
      }),
    },
    taglineAnalyses,
    alternativeNames: altNames,
    alternativeTaglines: altTaglines,
    brandStrength,
    recommendation: brandStrength >= 7
      ? `"${name}" is a strong brand choice. Focus on securing the domain and refining your tagline.`
      : brandStrength >= 5
        ? `"${name}" has potential but needs work. ${conflicts.length > 0 ? 'Address the naming conflicts first.' : 'Consider the alternative names below.'}`
        : `"${name}" faces significant challenges. We recommend exploring the alternative names generated below.`,
    createdAt: new Date().toISOString(),
  };
}

// ─── Scoring Helpers ─────────────────────────────────────────

export function getNameScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6.5) return 'Strong';
  if (score >= 5) return 'Adequate';
  if (score >= 3) return 'Weak';
  return 'Poor';
}

export function getNameScoreColor(score: number): string {
  if (score >= 8) return '#22c55e';
  if (score >= 6.5) return '#3b82f6';
  if (score >= 5) return '#eab308';
  return '#ef4444';
}
