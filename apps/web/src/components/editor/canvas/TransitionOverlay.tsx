'use client';

import { Layer, Arrow, Text, Rect, Group } from 'react-konva';
import { useInteractionStore } from '@/stores/interactionStore';
import type { SceneGraph } from '@design-studio/canvas';

const EVENT_EMOJI: Record<string, string> = {
  'tap': 'Tap',
  'double-tap': 'DblTap',
  'swipe-left': 'SwpL',
  'swipe-right': 'SwpR',
  'hold': 'Hold',
  'timer': 'Timer',
};

interface TransitionOverlayProps {
  sceneGraph: SceneGraph;
  visible: boolean;
}

/**
 * Konva layer that renders transition arrows between canvas nodes.
 * Shows which nodes have interactions and what events trigger them.
 */
export function TransitionOverlay({ sceneGraph, visible }: TransitionOverlayProps) {
  const { stateMachines } = useInteractionStore();

  if (!visible) return null;

  // Collect all transitions that reference canvas nodes
  const nodeTransitions: {
    sourceNodeId: string;
    event: string;
    machineId: string;
    machineName: string;
  }[] = [];

  for (const machine of Object.values(stateMachines)) {
    for (const transition of Object.values(machine.transitions)) {
      if (transition.sourceNodeId && sceneGraph.nodes[transition.sourceNodeId]) {
        nodeTransitions.push({
          sourceNodeId: transition.sourceNodeId,
          event: transition.event,
          machineId: machine.id,
          machineName: machine.name,
        });
      }
    }
  }

  if (nodeTransitions.length === 0) return null;

  // Group by source node
  const grouped = new Map<string, typeof nodeTransitions>();
  for (const t of nodeTransitions) {
    const existing = grouped.get(t.sourceNodeId) ?? [];
    existing.push(t);
    grouped.set(t.sourceNodeId, existing);
  }

  return (
    <Layer listening={false}>
      {Array.from(grouped.entries()).map(([nodeId, transitions]) => {
        const node = sceneGraph.nodes[nodeId];
        if (!node) return null;

        // Position the badge at top-right of the node
        const badgeX = node.x + node.width;
        const badgeY = node.y - 8;

        return (
          <Group key={nodeId}>
            {/* Interaction indicator badge */}
            <Rect
              x={badgeX - 4}
              y={badgeY - 4}
              width={Math.max(60, transitions.length * 40)}
              height={18}
              cornerRadius={4}
              fill="rgba(168,85,247,0.2)"
              stroke="rgba(168,85,247,0.4)"
              strokeWidth={1}
            />
            <Text
              x={badgeX}
              y={badgeY}
              text={transitions
                .map((t) => EVENT_EMOJI[t.event] ?? t.event)
                .join(', ')}
              fontSize={9}
              fontFamily="Inter"
              fontStyle="600"
              fill="rgba(168,85,247,0.8)"
            />

            {/* Interaction border on the node */}
            <Rect
              x={node.x - 2}
              y={node.y - 2}
              width={node.width + 4}
              height={node.height + 4}
              cornerRadius={4}
              stroke="rgba(168,85,247,0.3)"
              strokeWidth={1}
              dash={[3, 3]}
            />
          </Group>
        );
      })}
    </Layer>
  );
}
