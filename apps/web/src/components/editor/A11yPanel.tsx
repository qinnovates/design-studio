'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { checkContrast } from '@design-studio/a11y';
import { checkTouchTarget } from '@design-studio/a11y';
import { createReport, type A11yIssue } from '@design-studio/a11y';
import { ComponentRegistry } from '@design-studio/components';

interface A11yPanelProps {
  onClose: () => void;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  serious: 'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  minor: 'bg-blue-100 text-blue-700 border-blue-200',
};

export function A11yPanel({ onClose }: A11yPanelProps) {
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const selectNodes = useCanvasStore((s) => s.selectNodes);
  const getResolvedValue = useTokenStore((s) => s.getResolvedValue);

  const report = useMemo(() => {
    const issues: A11yIssue[] = [];
    let issueId = 0;

    for (const node of Object.values(sceneGraph.nodes)) {
      // Check touch targets for interactive components
      if (node.type === 'component') {
        const def = ComponentRegistry.get(node.componentId);
        const isInteractive = ['button', 'text-input', 'select', 'checkbox', 'toggle', 'slider', 'link'].includes(node.componentId);

        if (isInteractive) {
          const result = checkTouchTarget(node.id, node.name, node.width, node.height);
          if (!result.passes) {
            issues.push({
              id: `issue-${issueId++}`,
              nodeId: node.id,
              nodeName: node.name,
              severity: 'serious',
              message: result.message,
              suggestion: `Increase the size to at least ${result.minRequired}x${result.minRequired}px`,
              wcag: '2.5.8',
            });
          }
        }

        // Check for missing required accessibility props
        if (def?.accessibility.requiredProps) {
          for (const reqProp of def.accessibility.requiredProps) {
            if (!node.props[reqProp]) {
              issues.push({
                id: `issue-${issueId++}`,
                nodeId: node.id,
                nodeName: node.name,
                severity: 'critical',
                message: `Missing required "${reqProp}" for ${def.name}`,
                suggestion: def.accessibility.guidelines,
                wcag: '4.1.2',
              });
            }
          }
        }
      }

      // Check images for alt text
      if (node.type === 'image' && !node.alt) {
        issues.push({
          id: `issue-${issueId++}`,
          nodeId: node.id,
          nodeName: node.name,
          severity: 'critical',
          message: 'Image missing description (alt text)',
          suggestion: 'Add a description for screen readers. If decorative, set to empty string.',
          wcag: '1.1.1',
        });
      }

      // Check text contrast
      if (node.type === 'text' && node.fill) {
        const fg = node.fill.startsWith('{') ? getResolvedValue(node.fill) : node.fill;
        const bg = '#ffffff'; // Assume white background for now
        if (fg.startsWith('#') && bg.startsWith('#')) {
          const result = checkContrast(fg, bg);
          if (!result.passesAA) {
            issues.push({
              id: `issue-${issueId++}`,
              nodeId: node.id,
              nodeName: node.name,
              severity: result.passesAALargeText ? 'moderate' : 'critical',
              message: `Low contrast ratio: ${result.ratio}:1 (needs 4.5:1 for AA)`,
              suggestion: `Darken the text color or lighten the background. Current: ${fg} on ${bg}`,
              wcag: '1.4.3',
            });
          }
        }
      }

      // Check text size
      if (node.type === 'text' && node.fontSize < 12) {
        issues.push({
          id: `issue-${issueId++}`,
          nodeId: node.id,
          nodeName: node.name,
          severity: 'moderate',
          message: `Text size ${node.fontSize}px may be too small`,
          suggestion: 'Use at least 12px for body text, 16px recommended',
          wcag: '1.4.4',
        });
      }
    }

    return createReport(issues);
  }, [sceneGraph, getResolvedValue]);

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Accessibility</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      {/* Score */}
      <div className={`px-4 py-4 border-b ${
        report.score >= 90 ? 'bg-green-50' : report.score >= 70 ? 'bg-yellow-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-3xl font-bold ${
              report.score >= 90 ? 'text-green-600' : report.score >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {report.score}
            </p>
            <p className="text-xs text-gray-500">Accessibility Score</p>
          </div>
          <div className="text-right text-xs space-y-0.5">
            {report.errors > 0 && <p className="text-red-600 font-medium">{report.errors} errors</p>}
            {report.warnings > 0 && <p className="text-yellow-600">{report.warnings} warnings</p>}
            {report.issues.length === 0 && <p className="text-green-600 font-medium">All checks pass!</p>}
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="flex-1 overflow-y-auto">
        {report.issues.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No accessibility issues found
          </div>
        ) : (
          <div className="divide-y">
            {report.issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => selectNodes([issue.nodeId])}
                className="w-full text-left p-3 hover:bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[issue.severity]}`}>
                    {issue.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{issue.nodeName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{issue.message}</p>
                    <p className="text-xs text-blue-600 mt-1">{issue.suggestion}</p>
                    {issue.wcag && (
                      <span className="text-[9px] text-gray-400 mt-1 inline-block">WCAG {issue.wcag}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t p-3 text-[10px] text-gray-400 flex gap-3">
        <span className="text-red-500">● Critical</span>
        <span className="text-orange-500">● Serious</span>
        <span className="text-yellow-500">● Moderate</span>
        <span className="text-blue-500">● Minor</span>
      </div>
    </div>
  );
}
