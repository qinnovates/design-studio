'use client';

import { Group, Circle, Text } from 'react-konva';

interface CommentBadgeProps {
  x: number;
  y: number;
  count: number;
  hasOpen: boolean;
  onClick: () => void;
}

/**
 * Small badge rendered on canvas nodes showing comment count.
 * Orange = has open comments. Green = all resolved.
 */
export function CommentBadge({ x, y, count, hasOpen, onClick }: CommentBadgeProps) {
  if (count === 0) return null;

  const color = hasOpen ? '#f97316' : '#22c55e';
  const radius = count > 9 ? 10 : 8;

  return (
    <Group x={x} y={y} onClick={onClick} onTap={onClick}>
      <Circle
        radius={radius}
        fill={color}
        shadowColor={color}
        shadowBlur={6}
        shadowOpacity={0.4}
      />
      <Text
        x={-radius}
        y={-5}
        width={radius * 2}
        text={count > 99 ? '99+' : String(count)}
        fontSize={count > 9 ? 8 : 9}
        fontFamily="Inter"
        fontStyle="700"
        fill="#fff"
        align="center"
      />
    </Group>
  );
}
