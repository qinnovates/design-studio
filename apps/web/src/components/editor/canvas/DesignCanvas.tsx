'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '@/stores/canvasStore';
import { createComponentNode } from '@design-studio/canvas';
import { ComponentRegistry } from '@design-studio/components';
import { NodeRenderer } from './NodeRenderer';
import { SelectionOverlay } from './SelectionOverlay';
import { AnnotationLayer } from './AnnotationLayer';
import { GridLayer } from './GridLayer';
import { TransitionOverlay } from './TransitionOverlay';
import { CommentBadgeLayer } from '../comments/CommentBadgeLayer';
import { useUIStore } from '@/stores/uiStore';

export function DesignCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    sceneGraph,
    selectedNodeIds,
    camera,
    setCamera,
    selectNodes,
    clearSelection,
    moveNodes,
    setHoveredNode,
    setDragging,
    addNodeToScene,
  } = useCanvasStore();
  const { showGrid, showAnnotations, showCommentBadges, showTransitionOverlay, previewWidth } = useUIStore();

  // Handle zoom with wheel
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = camera.zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.08;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      const mousePointTo = {
        x: (pointer.x - camera.x) / oldScale,
        y: (pointer.y - camera.y) / oldScale,
      };

      setCamera({
        zoom: clampedScale,
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    },
    [camera, setCamera],
  );

  // Click on empty canvas = deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection],
  );

  // Handle drop from sidebar
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const componentId = e.dataTransfer.getData('application/design-studio-component');
      if (!componentId) return;

      const def = ComponentRegistry.get(componentId);
      if (!def) return;

      // Get drop position relative to canvas
      const stage = stageRef.current;
      if (!stage) return;
      const stageRect = stage.container().getBoundingClientRect();
      const x = (e.clientX - stageRect.left - camera.x) / camera.zoom;
      const y = (e.clientY - stageRect.top - camera.y) / camera.zoom;

      // Create a ComponentNode
      const node = createComponentNode(componentId, def.name, {
        x: Math.round(x),
        y: Math.round(y),
        width: def.defaultSize.width,
        height: def.defaultSize.height,
      });

      // Set default props
      for (const prop of def.props) {
        if (prop.defaultValue !== undefined && prop.defaultValue !== null) {
          node.props[prop.name] = prop.defaultValue;
        }
      }

      // Set default token bindings
      node.tokenBindings = { ...def.defaultTokens };

      addNodeToScene(node);
    },
    [camera, addNodeToScene],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        useCanvasStore.getState().removeSelectedNodes();
      }
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().undo();
      }
      if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useCanvasStore.getState().redo();
      }
      if (meta && e.key === 'd') {
        e.preventDefault();
        useCanvasStore.getState().duplicateSelected();
      }
      if (meta && e.key === 'a') {
        e.preventDefault();
        useCanvasStore.getState().selectAll();
      }

      // Nudge with arrow keys
      const nudge = e.shiftKey ? 10 : 1;
      const selected = useCanvasStore.getState().selectedNodeIds;
      if (selected.length > 0) {
        if (e.key === 'ArrowLeft') useCanvasStore.getState().moveNodes(selected, -nudge, 0);
        if (e.key === 'ArrowRight') useCanvasStore.getState().moveNodes(selected, nudge, 0);
        if (e.key === 'ArrowUp') useCanvasStore.getState().moveNodes(selected, 0, -nudge);
        if (e.key === 'ArrowDown') useCanvasStore.getState().moveNodes(selected, 0, nudge);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="w-full h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={typeof window !== 'undefined' ? window.innerWidth - 600 : 800}
        height={typeof window !== 'undefined' ? window.innerHeight - 48 : 600}
        scaleX={camera.zoom}
        scaleY={camera.zoom}
        x={camera.x}
        y={camera.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick as any}
        draggable
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setCamera({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        {/* Grid */}
        {showGrid && (
          <Layer listening={false}>
            <GridLayer />
          </Layer>
        )}

        {/* Main scene */}
        <Layer>
          {sceneGraph.rootIds.map((nodeId) => (
              <NodeRenderer
                key={nodeId}
                nodeId={nodeId}
                onSelect={(id, append) => selectNodes([id], append)}
                onHover={setHoveredNode}
                onDragStart={() => setDragging(true, nodeId)}
                onDragEnd={(id, x, y) => {
                  setDragging(false);
                  const n = sceneGraph.nodes[id];
                  if (n) {
                    useCanvasStore.getState().pushHistory();
                    useCanvasStore.getState().updateNodeProps(id, { x, y });
                  }
                }}
              />
          ))}
        </Layer>

        {/* Selection handles */}
        <Layer>
          <SelectionOverlay stageRef={stageRef} />
        </Layer>

        {/* Annotations */}
        {showAnnotations && (
          <Layer>
            <AnnotationLayer />
          </Layer>
        )}

        {/* Transition overlay — shows which nodes have interactions */}
        <TransitionOverlay sceneGraph={sceneGraph} visible={showTransitionOverlay} />

        {/* Comment badges — shows comment count on nodes */}
        <CommentBadgeLayer
          sceneGraph={sceneGraph}
          visible={showCommentBadges}
          onBadgeClick={(nodeId) => {
            selectNodes([nodeId], false);
            // Open comments panel
            useUIStore.getState().setRightPanel('comments');
          }}
        />
      </Stage>
    </div>
  );
}
