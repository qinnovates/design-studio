'use client';

import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '@/stores/canvasStore';

interface SelectionOverlayProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function SelectionOverlay({ stageRef }: SelectionOverlayProps) {
  const trRef = useRef<Konva.Transformer>(null);
  const { selectedNodeIds, sceneGraph } = useCanvasStore();

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    // Find the Konva nodes matching selected IDs
    const nodes = selectedNodeIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => n !== null && n !== undefined);

    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedNodeIds, stageRef]);

  if (selectedNodeIds.length === 0) return null;

  return (
    <Transformer
      ref={trRef}
      flipEnabled={false}
      boundBoxFunc={(oldBox, newBox) => {
        // Minimum size constraint
        if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={() => {
        const stage = stageRef.current;
        if (!stage) return;
        const store = useCanvasStore.getState();
        store.pushHistory();

        for (const id of selectedNodeIds) {
          const konvaNode = stage.findOne(`#${id}`);
          if (!konvaNode) continue;

          const scaleX = konvaNode.scaleX();
          const scaleY = konvaNode.scaleY();

          store.updateNodeProps(id, {
            x: konvaNode.x(),
            y: konvaNode.y(),
            width: Math.round(konvaNode.width() * scaleX),
            height: Math.round(konvaNode.height() * scaleY),
            rotation: konvaNode.rotation(),
          });

          // Reset scale after applying to width/height
          konvaNode.scaleX(1);
          konvaNode.scaleY(1);
        }
      }}
      anchorFill="#ffffff"
      anchorStroke="#2563eb"
      anchorSize={8}
      anchorCornerRadius={2}
      borderStroke="#2563eb"
      borderStrokeWidth={1.5}
    />
  );
}
