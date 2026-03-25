'use client';

import { useState, useMemo } from 'react';
import { ComponentRegistry } from '@design-studio/components';

interface SidebarProps {
  panel: 'components' | 'layers';
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  layout: 'Layout',
  input: 'Inputs',
  display: 'Content',
  navigation: 'Navigation',
  feedback: 'Feedback',
  data: 'Data',
};

export function Sidebar({ panel, onClose }: SidebarProps) {
  const [search, setSearch] = useState('');

  if (panel === 'components') {
    const components = ComponentRegistry.getAll();

    // Filter by search query
    const filtered = useMemo(() => {
      if (!search.trim()) return components;
      return ComponentRegistry.search(search.trim());
    }, [search, components]);

    const categories = useMemo(
      () => [...new Set(filtered.map((c) => c.category))],
      [filtered],
    );

    return (
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Components</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2" role="search">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search components"
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50"
          />
        </div>

        {/* Component list by category */}
        <div className="flex-1 overflow-y-auto px-3 py-2" role="tree" aria-label="Component library">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No components match &ldquo;{search}&rdquo;</p>
          )}
          {categories.map((category) => {
            const catComponents = filtered.filter((c) => c.category === category);
            if (catComponents.length === 0) return null;
            return (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {categoryLabels[category] ?? category}
                </h4>
                <div className="space-y-1">
                  {catComponents.map((comp) => (
                    <button
                      key={comp.id}
                      role="treeitem"
                      aria-grabbed="false"
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 flex items-center gap-2 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/design-studio-component', comp.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      <span className="text-gray-400 text-xs w-5">{comp.icon.slice(0, 2)}</span>
                      <span>{comp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Layers panel placeholder
  return (
    <div className="w-64 border-r bg-white flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Layers</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">
          &times;
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        No layers yet
      </div>
    </div>
  );
}
