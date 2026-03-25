'use client';

import { useState } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { ComponentRegistry } from '@design-studio/components';

type SectionId = 'position' | 'component' | 'text' | 'shape' | 'tokens' | 'annotations';

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs tabular-nums focus:border-blue-400 focus:outline-none"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded border border-gray-200"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
      />
      <span className="text-[10px] text-gray-400">{label}</span>
    </label>
  );
}

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
    >
      {title}
      <span className="text-xs">{open ? '\u25B4' : '\u25BE'}</span>
    </button>
  );
}

export function Inspector({ onClose }: { onClose: () => void }) {
  const { sceneGraph, selectedNodeIds, updateNodeProps, annotations } = useCanvasStore();
  const tokens = useTokenStore();
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    position: true,
    component: true,
    text: true,
    shape: true,
    tokens: true,
    annotations: false,
  });

  const toggleSection = (id: SectionId) =>
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  const selectedNodes = selectedNodeIds.map((id) => sceneGraph.nodes[id]).filter(Boolean);
  const node = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const update = (key: string, value: unknown) => {
    if (node) updateNodeProps(node.id, { [key]: value });
  };

  // --- No Selection ---
  if (selectedNodes.length === 0) {
    return (
      <div className="flex w-72 flex-col border-l bg-white">
        <PanelHeader onClose={onClose} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm text-gray-400">Select an element to inspect</p>
            <p className="mt-1 text-xs text-gray-300">Click any element on the canvas</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Multi-select ---
  if (selectedNodes.length > 1) {
    return (
      <div className="flex w-72 flex-col border-l bg-white">
        <PanelHeader onClose={onClose} />
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm font-medium text-gray-700">
            {selectedNodes.length} elements selected
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Align</p>
            <div className="flex gap-1">
              {['Left', 'Center', 'Right', 'Top', 'Middle', 'Bottom'].map((dir) => (
                <button
                  key={dir}
                  className="rounded border border-gray-200 px-2 py-1 text-[10px] hover:bg-gray-50"
                >
                  {dir}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-gray-400">Distribute</p>
            <div className="flex gap-1">
              {['Horizontal', 'Vertical'].map((dir) => (
                <button
                  key={dir}
                  className="rounded border border-gray-200 px-2 py-1 text-[10px] hover:bg-gray-50"
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Single Selection ---
  const nodeAnnotations = Object.values(annotations).filter(
    (a) => a.nodeId === node!.id
  );

  return (
    <div className="flex w-72 flex-col border-l bg-white">
      <PanelHeader onClose={onClose} />

      <div className="flex-1 space-y-0 overflow-y-auto">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={node!.name}
              onChange={(e) => update('name', e.target.value)}
              className="flex-1 rounded border border-transparent bg-transparent px-1 text-sm font-medium hover:border-gray-200 focus:border-blue-400 focus:outline-none"
            />
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
              {node!.type}
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => update('locked', !node!.locked)}
              className={`rounded px-2 py-0.5 text-[10px] ${
                node!.locked ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {node!.locked ? 'Locked' : 'Unlocked'}
            </button>
            <button
              onClick={() => update('visible', !node!.visible)}
              className={`rounded px-2 py-0.5 text-[10px] ${
                node!.visible ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'
              }`}
            >
              {node!.visible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>

        {/* Position & Size */}
        <div className="border-b px-4">
          <SectionHeader
            title="Position & Size"
            open={openSections.position}
            onToggle={() => toggleSection('position')}
          />
          {openSections.position && (
            <div className="space-y-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={node!.x} onChange={(v) => update('x', v)} />
                <NumberInput label="Y" value={node!.y} onChange={(v) => update('y', v)} />
                <NumberInput label="W" value={node!.width} onChange={(v) => update('width', v)} min={0} />
                <NumberInput label="H" value={node!.height} onChange={(v) => update('height', v)} min={0} />
              </div>
              <NumberInput
                label="Rotation"
                value={node!.rotation}
                onChange={(v) => update('rotation', v)}
                min={0}
                max={360}
              />
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  Opacity {Math.round(node!.opacity * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={node!.opacity}
                  onChange={(e) => update('opacity', parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Component Props */}
        {node!.type === 'component' && <ComponentPropsSection node={node!} update={update} open={openSections.component} onToggle={() => toggleSection('component')} />}

        {/* Text Properties */}
        {node!.type === 'text' && (
          <div className="border-b px-4">
            <SectionHeader title="Text" open={openSections.text} onToggle={() => toggleSection('text')} />
            {openSections.text && (
              <div className="space-y-3 pb-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Content</span>
                  <textarea
                    value={(node as any).content ?? ''}
                    onChange={(e) => update('content', e.target.value)}
                    rows={3}
                    className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput label="Font Size" value={(node as any).fontSize ?? 16} onChange={(v) => update('fontSize', v)} min={1} />
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">Weight</span>
                    <select
                      value={(node as any).fontWeight ?? 'regular'}
                      onChange={(e) => update('fontWeight', e.target.value)}
                      className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
                    >
                      {['light', 'regular', 'medium', 'semibold', 'bold'].map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Align</span>
                  <div className="mt-1 flex gap-1">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => update('textAlign', a)}
                        className={`flex-1 rounded border px-2 py-1 text-[10px] ${
                          (node as any).textAlign === a
                            ? 'border-blue-400 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput label="Line Height" value={(node as any).lineHeight ?? 1.5} onChange={(v) => update('lineHeight', v)} step={0.1} min={0.5} />
                  <NumberInput label="Letter Spacing" value={(node as any).letterSpacing ?? 0} onChange={(v) => update('letterSpacing', v)} step={0.1} />
                </div>
                <ColorInput label="Fill" value={(node as any).fill ?? '#000000'} onChange={(v) => update('fill', v)} />
              </div>
            )}
          </div>
        )}

        {/* Shape Properties */}
        {node!.type === 'shape' && (
          <div className="border-b px-4">
            <SectionHeader title="Shape" open={openSections.shape} onToggle={() => toggleSection('shape')} />
            {openSections.shape && (
              <div className="space-y-3 pb-3">
                <ColorInput label="Fill" value={(node as any).fill ?? '#000000'} onChange={(v) => update('fill', v)} />
                <ColorInput label="Stroke" value={(node as any).stroke ?? '#000000'} onChange={(v) => update('stroke', v)} />
                <NumberInput label="Stroke Width" value={(node as any).strokeWidth ?? 1} onChange={(v) => update('strokeWidth', v)} min={0} />
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">
                    Corner Radius {(node as any).cornerRadius ?? 0}px
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={(node as any).cornerRadius ?? 0}
                    onChange={(e) => update('cornerRadius', parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Token Bindings */}
        <div className="border-b px-4">
          <SectionHeader title="Token Bindings" open={openSections.tokens} onToggle={() => toggleSection('tokens')} />
          {openSections.tokens && (
            <div className="space-y-2 pb-3">
              {node!.tokenBindings && Object.keys(node!.tokenBindings).length > 0 ? (
                Object.entries(node!.tokenBindings).map(([prop, tokenRef]) => {
                  const resolved = tokens.getResolvedValue(tokenRef as string);
                  return (
                    <div key={prop} className="flex items-center justify-between rounded bg-gray-50 px-2 py-1.5">
                      <span className="text-xs text-gray-600">{prop}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{tokenRef as string}</span>
                        <button
                          className="rounded bg-white px-1.5 py-0.5 text-[10px] text-blue-500 shadow-sm hover:bg-blue-50"
                        >
                          {resolved ?? '—'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-2 text-xs text-gray-300">No token bindings</p>
              )}
            </div>
          )}
        </div>

        {/* Annotations */}
        <div className="px-4">
          <SectionHeader title="Annotations" open={openSections.annotations} onToggle={() => toggleSection('annotations')} />
          {openSections.annotations && (
            <div className="space-y-2 pb-3">
              {nodeAnnotations.length > 0 ? (
                nodeAnnotations.map((a) => (
                  <div key={a.id} className="rounded bg-yellow-50 px-2 py-1.5 text-xs text-yellow-800">
                    {a.content}
                  </div>
                ))
              ) : (
                <p className="py-1 text-xs text-gray-300">No annotations</p>
              )}
              <button className="w-full rounded border border-dashed border-gray-300 py-1.5 text-[10px] text-gray-400 hover:border-gray-400 hover:text-gray-600">
                + Add annotation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <span className="text-sm font-medium">Inspector</span>
      <button onClick={onClose} className="text-lg text-gray-400 hover:text-gray-600">
        &times;
      </button>
    </div>
  );
}

function ComponentPropsSection({
  node,
  update,
  open,
  onToggle,
}: {
  node: any;
  update: (key: string, value: unknown) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const definition = ComponentRegistry.get(node.componentId);
  if (!definition) return null;

  const updateProp = (key: string, value: unknown) => {
    update('props', { ...node.props, [key]: value });
  };

  return (
    <div className="border-b px-4">
      <SectionHeader title="Component Props" open={open} onToggle={onToggle} />
      {open && (
        <div className="space-y-3 pb-3">
          {/* Variant selector */}
          {definition.variants && definition.variants.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Variant</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {definition.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => update('variant', v.name)}
                    className={`rounded border px-2 py-0.5 text-[10px] ${
                      node.variant === v.name
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Props from definition */}
          {definition.props?.map((propDef: any) => {
            const val = node.props?.[propDef.name];
            switch (propDef.type) {
              case 'string':
                return (
                  <label key={propDef.name} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{propDef.name}</span>
                    <input
                      type="text"
                      value={val ?? propDef.default ?? ''}
                      onChange={(e) => updateProp(propDef.name, e.target.value)}
                      className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
                    />
                  </label>
                );
              case 'number':
                return (
                  <NumberInput
                    key={propDef.name}
                    label={propDef.name}
                    value={val ?? propDef.default ?? 0}
                    onChange={(v) => updateProp(propDef.name, v)}
                  />
                );
              case 'boolean':
                return (
                  <label key={propDef.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={val ?? propDef.default ?? false}
                      onChange={(e) => updateProp(propDef.name, e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span className="text-xs text-gray-600">{propDef.name}</span>
                  </label>
                );
              case 'enum':
                return (
                  <label key={propDef.name} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{propDef.name}</span>
                    <select
                      value={val ?? propDef.default ?? ''}
                      onChange={(e) => updateProp(propDef.name, e.target.value)}
                      className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
                    >
                      {propDef.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>
                );
              case 'color':
                return (
                  <ColorInput
                    key={propDef.name}
                    label={propDef.name}
                    value={val ?? propDef.default ?? '#000000'}
                    onChange={(v) => updateProp(propDef.name, v)}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
}
