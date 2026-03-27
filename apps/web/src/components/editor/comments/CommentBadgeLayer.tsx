'use client';

import { Layer } from 'react-konva';
import type { SceneGraph } from '@design-studio/canvas';
import { useCommentStore } from '@/stores/commentStore';
import { CommentBadge } from './CommentBadge';

interface CommentBadgeLayerProps {
  sceneGraph: SceneGraph;
  visible: boolean;
  onBadgeClick: (nodeId: string) => void;
}

/**
 * Konva layer that renders comment count badges on all nodes.
 * Positioned at top-left corner of each node.
 */
export function CommentBadgeLayer({ sceneGraph, visible, onBadgeClick }: CommentBadgeLayerProps) {
  const { comments } = useCommentStore();

  if (!visible) return null;

  // Group root comments by node
  const nodeCounts = new Map<string, { total: number; hasOpen: boolean }>();
  for (const comment of Object.values(comments)) {
    if (!comment.nodeId || comment.parentId !== null) continue;
    const existing = nodeCounts.get(comment.nodeId) ?? { total: 0, hasOpen: false };
    existing.total++;
    if (comment.status === 'open') existing.hasOpen = true;
    nodeCounts.set(comment.nodeId, existing);
  }

  return (
    <Layer listening={true}>
      {Array.from(nodeCounts.entries()).map(([nodeId, { total, hasOpen }]) => {
        const node = sceneGraph.nodes[nodeId];
        if (!node) return null;

        return (
          <CommentBadge
            key={nodeId}
            x={node.x - 6}
            y={node.y - 6}
            count={total}
            hasOpen={hasOpen}
            onClick={() => onBadgeClick(nodeId)}
          />
        );
      })}
    </Layer>
  );
}
