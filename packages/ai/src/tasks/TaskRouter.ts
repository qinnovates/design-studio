export type DesignTaskType =
  | 'layout_generation'
  | 'style_suggestion'
  | 'color_palette'
  | 'accessibility_review'
  | 'content_generation'
  | 'layout_critique'
  | 'component_suggestion'
  | 'general_chat';

interface TaskClassification {
  type: DesignTaskType;
  confidence: number;
}

const TASK_PATTERNS: { type: DesignTaskType; patterns: RegExp[] }[] = [
  {
    type: 'layout_generation',
    patterns: [/\badd\b.*\b(form|section|card|nav|header|footer|hero|sidebar)\b/i, /\bcreate\b.*\b(layout|page|screen)\b/i, /\bput\b.*\b(button|input|image)\b/i],
  },
  {
    type: 'style_suggestion',
    patterns: [/\bmake\b.*\b(bigger|smaller|bolder|lighter|pop|stand out|modern|clean)\b/i, /\bchange\b.*\b(color|font|size|style)\b/i, /\bstyle\b/i],
  },
  {
    type: 'color_palette',
    patterns: [/\bcolor\b.*\b(palette|scheme|suggest)\b/i, /\bcolors?\b.*\bfor\b/i, /\btheme\b/i],
  },
  {
    type: 'accessibility_review',
    patterns: [/\baccessib/i, /\ba11y\b/i, /\bwcag\b/i, /\bcontrast\b/i, /\bscreen reader\b/i],
  },
  {
    type: 'content_generation',
    patterns: [/\bwrite\b.*\b(copy|text|heading|title|description)\b/i, /\bgenerate\b.*\bcontent\b/i],
  },
  {
    type: 'layout_critique',
    patterns: [/\bwhat'?s wrong\b/i, /\bimprove\b/i, /\bfeedback\b/i, /\breview\b.*\bdesign\b/i, /\bcluttered\b/i],
  },
  {
    type: 'component_suggestion',
    patterns: [/\bwhat\b.*\bneed\b/i, /\bsuggest\b.*\bcomponent/i, /\bwhat else\b/i],
  },
];

export function classifyTask(userMessage: string): TaskClassification {
  for (const { type, patterns } of TASK_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(userMessage)) {
        return { type, confidence: 0.8 };
      }
    }
  }
  return { type: 'general_chat', confidence: 0.5 };
}
