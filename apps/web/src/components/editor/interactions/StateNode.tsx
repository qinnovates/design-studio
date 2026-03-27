'use client';

import { Group, Rect, Text, Circle } from 'react-konva';
import type { InteractionState } from '@design-studio/interactions';

const STATE_COLORS: Record<string, string> = {
  gray: '#6b7280',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#a855f7',
};

interface StateNodeProps {
  state: InteractionState;
  isInitial: boolean;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (stateId: string) => void;
  onDragEnd: (stateId: string, x: number, y: number) => void;
}

export function StateNode({
  state,
  isInitial,
  isActive,
  isSelected,
  onSelect,
  onDragEnd,
}: StateNodeProps) {
  const color = STATE_COLORS[state.color] ?? STATE_COLORS.gray;
  const width = 160;
  const height = 60;

  return (
    <Group
      x={state.editorPosition.x}
      y={state.editorPosition.y}
      draggable
      onClick={() => onSelect(state.id)}
      onTap={() => onSelect(state.id)}
      onDragEnd={(e) => {
        onDragEnd(state.id, e.target.x(), e.target.y());
      }}
    >
      {/* Selection ring */}
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          cornerRadius={14}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}

      {/* Active glow (during preview) */}
      {isActive && (
        <Rect
          x={-6}
          y={-6}
          width={width + 12}
          height={height + 12}
          cornerRadius={16}
          fill="transparent"
          stroke="#22c55e"
          strokeWidth={3}
          shadowColor="#22c55e"
          shadowBlur={12}
          shadowOpacity={0.5}
        />
      )}

      {/* Background */}
      <Rect
        width={width}
        height={height}
        cornerRadius={10}
        fill={isActive ? '#1a2e1a' : '#1e1e2e'}
        stroke={color}
        strokeWidth={isInitial ? 3 : 1.5}
      />

      {/* Initial state indicator */}
      {isInitial && (
        <Circle
          x={-12}
          y={height / 2}
          radius={6}
          fill={color}
        />
      )}

      {/* State name */}
      <Text
        x={12}
        y={14}
        width={width - 24}
        text={state.name}
        fontSize={14}
        fontFamily="Inter"
        fontStyle="600"
        fill="rgba(255,255,255,0.9)"
        ellipsis
        wrap="none"
      />

      {/* Action counts */}
      <Text
        x={12}
        y={36}
        width={width - 24}
        text={`${state.onEnter.length} enter / ${state.onExit.length} exit / ${Object.keys(state.nodeOverrides).length} overrides`}
        fontSize={10}
        fontFamily="Inter"
        fill="rgba(255,255,255,0.4)"
        ellipsis
        wrap="none"
      />
    </Group>
  );
}
