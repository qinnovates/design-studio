'use client';

import { Group, Rect, Text, Circle } from 'react-konva';
import { useCanvasStore } from '@/stores/canvasStore';

const ANNOTATION_COLORS: Record<string, { bg: string; border: string }> = {
  yellow: { bg: '#fef9c3', border: '#facc15' },
  blue: { bg: '#dbeafe', border: '#3b82f6' },
  green: { bg: '#dcfce7', border: '#22c55e' },
  red: { bg: '#fee2e2', border: '#ef4444' },
  purple: { bg: '#f3e8ff', border: '#a855f7' },
};

const TYPE_ICONS: Record<string, string> = {
  note: 'N',
  todo: 'T',
  question: '?',
  decision: 'D',
  warning: '!',
};

export function AnnotationLayer() {
  const { annotations, activeAnnotationId, setActiveAnnotation } = useCanvasStore();

  return (
    <>
      {Object.values(annotations).map((ann) => {
        if (ann.resolved) return null;
        const colors = ANNOTATION_COLORS[ann.color] ?? ANNOTATION_COLORS['yellow']!;
        const isActive = ann.id === activeAnnotationId;
        const width = 200;
        const height = Math.max(60, Math.min(160, ann.content.length * 0.8 + 40));

        return (
          <Group
            key={ann.id}
            x={ann.x}
            y={ann.y}
            draggable
            onClick={() => setActiveAnnotation(ann.id)}
            onDragEnd={(e) => {
              useCanvasStore.getState().updateAnnotation(ann.id, {
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
          >
            {/* Shadow */}
            <Rect
              x={2}
              y={2}
              width={width}
              height={height}
              fill="rgba(0,0,0,0.08)"
              cornerRadius={6}
            />
            {/* Card */}
            <Rect
              width={width}
              height={height}
              fill={colors.bg}
              stroke={isActive ? colors.border : 'transparent'}
              strokeWidth={isActive ? 2 : 0}
              cornerRadius={6}
            />
            {/* Type badge */}
            <Circle
              x={width - 12}
              y={12}
              radius={10}
              fill={colors.border}
            />
            <Text
              x={width - 18}
              y={6}
              text={TYPE_ICONS[ann.type] ?? 'N'}
              fontSize={10}
              fontStyle="bold"
              fill="white"
              width={12}
              align="center"
            />
            {/* Content */}
            <Text
              x={8}
              y={8}
              width={width - 32}
              height={height - 16}
              text={ann.content}
              fontSize={11}
              fill="#374151"
              fontFamily="Inter, system-ui, sans-serif"
              lineHeight={1.4}
              wrap="word"
              ellipsis
            />
          </Group>
        );
      })}
    </>
  );
}
