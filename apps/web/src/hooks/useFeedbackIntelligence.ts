import { useCallback } from 'react';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useGuardrailStore } from '@/stores/guardrailStore';

/**
 * Hook that connects feedback votes to guardrails/preferences.
 * Call voteWithIntelligence instead of feedbackStore.vote directly.
 */
export function useFeedbackIntelligence() {
  const vote = useFeedbackStore((s) => s.vote);
  const targets = useFeedbackStore((s) => s.targets);
  const createFromDislike = useGuardrailStore((s) => s.createFromDislike);
  const createFromLike = useGuardrailStore((s) => s.createFromLike);

  const voteWithIntelligence = useCallback(
    (targetId: string, type: 'like' | 'dislike', value?: string) => {
      // Record the vote
      vote(targetId, type);

      // Get target info
      const target = targets[targetId];
      if (!target) return;

      // Auto-create guardrail or preference
      if (type === 'dislike') {
        createFromDislike(target.type, target.label, value);
      } else {
        createFromLike(target.type, target.label, value);
      }
    },
    [vote, targets, createFromDislike, createFromLike],
  );

  return { voteWithIntelligence };
}
