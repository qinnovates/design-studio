'use client';

import { Arrow, Group, Text, Rect } from 'react-konva';
import type { Transition, InteractionState } from '@design-studio/interactions';

interface TransitionArrowProps {
  transition: Transition;
  fromState: InteractionState;
  toState: InteractionState;
  isSelected: boolean;
  onSelect: (transitionId: string) => void;
}

const EVENT_LABELS: Record<string, string> = {
  'tap': 'Tap',
  'double-tap': 'Dbl Tap',
  'swipe-left': 'Swipe L',
  'swipe-right': 'Swipe R',
  'swipe-up': 'Swipe Up',
  'swipe-down': 'Swipe Dn',
  'hold': 'Hold',
  'hover-enter': 'Hover In',
  'hover-leave': 'Hover Out',
  'timer': 'Timer',
  'state-change': 'State',
  'variable-change': 'Var',
};

export function TransitionArrow({
  transition,
  fromState,
  toState,
  isSelected,
  onSelect,
}: TransitionArrowProps) {
  const fromX = fromState.editorPosition.x + 160; // right edge of state node
  const fromY = fromState.editorPosition.y + 30;  // vertical center
  const toX = toState.editorPosition.x;            // left edge of target
  const toY = toState.editorPosition.y + 30;

  // Self-transition: loop above the node
  const isSelf = transition.fromStateId === transition.toStateId;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  const color = isSelected ? '#3b82f6' : 'rgba(255,255,255,0.35)';
  const label = EVENT_LABELS[transition.event] ?? transition.event;

  if (isSelf) {
    const cx = fromState.editorPosition.x + 80;
    const cy = fromState.editorPosition.y - 40;
    return (
      <Group onClick={() => onSelect(transition.id)} onTap={() => onSelect(transition.id)}>
        <Arrow
          points={[
            fromState.editorPosition.x + 60, fromState.editorPosition.y,
            cx - 30, cy,
            cx + 30, cy,
            fromState.editorPosition.x + 100, fromState.editorPosition.y,
          ]}
          tension={0.4}
          stroke={color}
          strokeWidth={isSelected ? 2.5 : 1.5}
          pointerLength={8}
          pointerWidth={6}
          fill={color}
        />
        <Rect
          x={cx - 24}
          y={cy - 10}
          width={48}
          height={20}
          cornerRadius={4}
          fill="#1e1e2e"
          stroke={color}
          strokeWidth={1}
        />
        <Text
          x={cx - 24}
          y={cy - 6}
          width={48}
          text={label}
          fontSize={9}
          fontFamily="Inter"
          fill={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.6)'}
          align="center"
        />
      </Group>
    );
  }

  return (
    <Group onClick={() => onSelect(transition.id)} onTap={() => onSelect(transition.id)}>
      <Arrow
        points={[fromX, fromY, toX, toY]}
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        pointerLength={10}
        pointerWidth={8}
        fill={color}
      />
      {/* Label pill */}
      <Rect
        x={midX - 28}
        y={midY - 12}
        width={56}
        height={20}
        cornerRadius={4}
        fill="#1e1e2e"
        stroke={color}
        strokeWidth={1}
      />
      <Text
        x={midX - 28}
        y={midY - 8}
        width={56}
        text={label}
        fontSize={10}
        fontFamily="Inter"
        fill={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.6)'}
        align="center"
      />
      {/* Guard indicator */}
      {transition.guard && (
        <Text
          x={midX - 28}
          y={midY + 10}
          width={56}
          text="[guard]"
          fontSize={8}
          fontFamily="Inter"
          fill="rgba(255,200,0,0.5)"
          align="center"
        />
      )}
    </Group>
  );
}
