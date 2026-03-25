'use client';

import { Line } from 'react-konva';
import { useCanvasStore } from '@/stores/canvasStore';

const GRID_SIZE = 20;
const GRID_COLOR = '#e5e7eb';

export function GridLayer() {
  const camera = useCanvasStore((s) => s.camera);
  const width = 4000;
  const height = 4000;
  const startX = -width / 2;
  const startY = -height / 2;

  const lines = [];

  // Vertical lines
  for (let x = startX; x < width / 2; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, height / 2]}
        stroke={GRID_COLOR}
        strokeWidth={x % (GRID_SIZE * 5) === 0 ? 0.5 : 0.2}
        listening={false}
      />,
    );
  }

  // Horizontal lines
  for (let y = startY; y < height / 2; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, width / 2, y]}
        stroke={GRID_COLOR}
        strokeWidth={y % (GRID_SIZE * 5) === 0 ? 0.5 : 0.2}
        listening={false}
      />,
    );
  }

  return <>{lines}</>;
}
