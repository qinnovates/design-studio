'use client';

import { Group, Rect, Text, Circle } from 'react-konva';
import type Konva from 'konva';
import type { SceneNode, SceneGraph } from '@design-studio/canvas';
import { useTokenStore } from '@/stores/tokenStore';
import { ComponentRegistry } from '@design-studio/components';

interface NodeRendererProps {
  node: SceneNode;
  sceneGraph: SceneGraph;
  isSelected: boolean;
  onSelect: (id: string, append: boolean) => void;
  onHover: (id: string | null) => void;
  onDragStart: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export function NodeRenderer({
  node,
  sceneGraph,
  isSelected,
  onSelect,
  onHover,
  onDragStart,
  onDragEnd,
}: NodeRendererProps) {
  const resolveToken = useTokenStore((s) => s.getResolvedValue);

  if (!node.visible) return null;

  const resolveColor = (value: string | null | undefined): string => {
    if (!value) return 'transparent';
    if (value.startsWith('{')) return resolveToken(value);
    return value;
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect(node.id, e.evt.shiftKey);
  };

  const commonProps = {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    rotation: node.rotation,
    opacity: node.opacity,
    draggable: !node.locked,
    onClick: handleClick,
    onTap: handleClick as any,
    onMouseEnter: () => onHover(node.id),
    onMouseLeave: () => onHover(null),
    onDragStart: () => onDragStart(),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(node.id, e.target.x(), e.target.y());
    },
  };

  // Render children recursively
  const renderChildren = () =>
    node.children.map((childId) => {
      const child = sceneGraph.nodes[childId];
      if (!child) return null;
      return (
        <NodeRenderer
          key={childId}
          node={child}
          sceneGraph={sceneGraph}
          isSelected={false}
          onSelect={onSelect}
          onHover={onHover}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      );
    });

  switch (node.type) {
    case 'frame':
      return (
        <Group {...commonProps}>
          <Rect
            width={node.width}
            height={node.height}
            fill={resolveColor(node.fill)}
            cornerRadius={4}
            stroke={isSelected ? '#2563eb' : '#e5e7eb'}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Frame label */}
          <Text
            text={node.name}
            x={0}
            y={-20}
            fontSize={11}
            fill="#6b7280"
            fontFamily="Inter, system-ui, sans-serif"
          />
          {renderChildren()}
        </Group>
      );

    case 'component': {
      const def = ComponentRegistry.get(node.componentId);
      const bg = resolveColor(
        node.tokenBindings['background'] ??
          def?.defaultTokens['background'] ??
          '{color.surface.primary}',
      );
      const textColor = resolveColor(
        node.tokenBindings['text'] ?? def?.defaultTokens['text'] ?? '{color.text.primary}',
      );
      const radius = parseInt(
        resolveColor(
          node.tokenBindings['cornerRadius'] ?? def?.defaultTokens['cornerRadius'] ?? '8',
        ),
      ) || 0;

      return (
        <Group {...commonProps}>
          <Rect
            width={node.width}
            height={node.height}
            fill={bg}
            cornerRadius={radius}
            stroke={isSelected ? '#2563eb' : 'transparent'}
            strokeWidth={isSelected ? 2 : 0}
          />
          <Text
            text={String(node.props['text'] ?? node.props['content'] ?? def?.name ?? node.name)}
            x={8}
            y={node.height / 2 - 7}
            width={node.width - 16}
            fontSize={14}
            fill={textColor}
            fontFamily="Inter, system-ui, sans-serif"
            align="center"
            verticalAlign="middle"
            ellipsis
            wrap="none"
          />
          {renderChildren()}
        </Group>
      );
    }

    case 'text':
      return (
        <Group {...commonProps}>
          {isSelected && (
            <Rect
              width={node.width}
              height={node.height}
              stroke="#2563eb"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          <Text
            text={node.content}
            width={node.width}
            height={node.height}
            fontSize={node.fontSize}
            fontFamily={node.fontFamily}
            fontStyle={node.fontWeight > 500 ? 'bold' : 'normal'}
            fill={resolveColor(node.fill)}
            lineHeight={node.lineHeight}
            letterSpacing={node.letterSpacing}
            align={node.textAlign}
          />
        </Group>
      );

    case 'shape': {
      if (node.shapeKind === 'ellipse') {
        return (
          <Group {...commonProps}>
            <Circle
              x={node.width / 2}
              y={node.height / 2}
              radiusX={node.width / 2}
              radiusY={node.height / 2}
              fill={resolveColor(node.fill)}
              stroke={resolveColor(node.stroke) || (isSelected ? '#2563eb' : undefined)}
              strokeWidth={node.strokeWidth || (isSelected ? 2 : 0)}
            />
          </Group>
        );
      }
      // Default: rectangle
      return (
        <Group {...commonProps}>
          <Rect
            width={node.width}
            height={node.height}
            fill={resolveColor(node.fill)}
            stroke={resolveColor(node.stroke) || (isSelected ? '#2563eb' : undefined)}
            strokeWidth={node.strokeWidth || (isSelected ? 2 : 0)}
            cornerRadius={node.cornerRadius}
          />
          {renderChildren()}
        </Group>
      );
    }

    case 'image':
      // Image placeholder (actual image loading requires useImage hook)
      return (
        <Group {...commonProps}>
          <Rect
            width={node.width}
            height={node.height}
            fill="#f3f4f6"
            cornerRadius={4}
            stroke={isSelected ? '#2563eb' : '#e5e7eb'}
            strokeWidth={isSelected ? 2 : 1}
          />
          <Text
            text={node.alt || 'Image'}
            x={8}
            y={node.height / 2 - 7}
            width={node.width - 16}
            fontSize={12}
            fill="#9ca3af"
            align="center"
          />
        </Group>
      );

    case 'group':
      return (
        <Group {...commonProps}>
          {isSelected && (
            <Rect
              width={node.width}
              height={node.height}
              stroke="#2563eb"
              strokeWidth={1}
              dash={[6, 3]}
            />
          )}
          {renderChildren()}
        </Group>
      );

    default:
      return null;
  }
}
