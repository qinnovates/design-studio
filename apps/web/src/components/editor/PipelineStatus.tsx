'use client';

import { useMemo } from 'react';
import { useSwarmStore } from '@/stores/swarmStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { usePMStore } from '@/stores/pmStore';
import {
  PIPELINE_STAGES,
  STAGE_COLORS,
  checkPipelineGates,
  type PipelineStage,
  type GateContext,
} from '@design-studio/ai';
import { useCanvasStore } from '@/stores/canvasStore';

export function PipelineStatus() {
  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const getScreenStage = useSwarmStore((s) => s.getScreenStage);
  const advanceScreen = useSwarmStore((s) => s.advanceScreen);
  const getSummary = useFeedbackStore((s) => s.getSummary);
  const getTasksByScreen = usePMStore((s) => s.getTasksByScreen);

  const currentStage = activeScreenId ? getScreenStage(activeScreenId) : 'draft';

  const gateResult = useMemo(() => {
    if (!activeScreenId) return null;

    const feedbackSummary = getSummary(`screen-${activeScreenId}`);
    const tasks = getTasksByScreen(activeScreenId);
    const openUrgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');
    const openTasks = tasks.filter((t) => t.status !== 'done');

    const context: GateContext = {
      screenId: activeScreenId,
      a11yScore: 85, // Would come from real a11y check
      feedbackScore: feedbackSummary?.score ?? 0,
      commentCount: feedbackSummary?.commentCount ?? 0,
      unresolvedBlockingComments: 0,
      approvalCount: feedbackSummary?.likes ?? 0,
      requiredApprovals: 2,
      openUrgentTasks: openUrgent.length,
      openTasks: openTasks.length,
      componentCount: Object.keys(sceneGraph.nodes).length,
    };

    return checkPipelineGates(currentStage, context);
  }, [activeScreenId, currentStage, sceneGraph, getSummary, getTasksByScreen]);

  if (!activeScreenId) return null;

  return (
    <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Stage indicators */}
      <div className="flex items-center gap-1">
        {PIPELINE_STAGES.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isPast = PIPELINE_STAGES.findIndex((s) => s.id === currentStage) > index;
          const color = STAGE_COLORS[stage.id];

          return (
            <div key={stage.id} className="flex items-center gap-1">
              {index > 0 && (
                <div className={`w-4 h-px ${isPast ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
              <div
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : isPast
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-600'
                }`}
                style={isActive ? { backgroundColor: `${color}20`, color } : {}}
                title={stage.description}
              >
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Gate status */}
      {gateResult && (
        <div className="flex items-center gap-2">
          {gateResult.requiredGates.map(({ gate, result }) => (
            <div
              key={gate.id}
              className={`text-[9px] px-1.5 py-0.5 rounded ${
                result.passed
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
              title={result.message}
            >
              {result.passed ? '\u2713' : '\u2717'} {gate.name}
            </div>
          ))}

          {/* Advance button */}
          {gateResult.canAdvance && (
            <button
              onClick={() => activeScreenId && advanceScreen(activeScreenId)}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
              aria-label={`Advance to ${gateResult.targetStage}`}
            >
              Advance \u2192
            </button>
          )}
        </div>
      )}
    </div>
  );
}
