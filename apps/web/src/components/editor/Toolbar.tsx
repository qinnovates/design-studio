'use client';

import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { PresenceBar } from './PresenceBar';
import { useUIStore } from '@/stores/uiStore';

export function Toolbar() {
  const manifest = useProjectStore((s) => s.manifest);
  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const screens = useProjectStore((s) => s.getScreenList)();
  const activeScreen = screens.find((s) => s.id === activeScreenId);

  const { canUndo, canRedo, undo, redo, addAnnotation } = useCanvasStore();
  const { activeSetId, switchTheme } = useTokenStore();
  const {
    previewMode,
    setPreviewMode,
    showGrid,
    toggleGrid,
    showAnnotations,
    toggleAnnotations,
    showA11yOverlay,
    toggleA11yOverlay,
  } = useUIStore();

  const isDark = activeSetId === 'default-dark';

  const handleAddAnnotation = () => {
    addAnnotation({
      nodeId: null,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      content: 'New note — double click to edit',
      author: 'You',
      color: 'yellow',
      type: 'note',
      resolved: false,
    });
  };

  return (
    <div className="h-12 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
      {/* Left — logo + project name + screen */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-[var(--accent)] rounded" />
        <div>
          <span className="text-sm font-medium">{manifest?.name ?? 'Untitled'}</span>
          {activeScreen && (
            <span className="text-xs text-gray-400 ml-2">/ {activeScreen.name}</span>
          )}
        </div>
      </div>

      {/* Center — viewport + tools */}
      <div className="flex items-center gap-1.5">
        <button onClick={undo} disabled={!canUndo} className="text-xs px-2 py-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Undo">↩</button>
        <button onClick={redo} disabled={!canRedo} className="text-xs px-2 py-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Redo">↪</button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {(['desktop', 'tablet', 'phone'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(previewMode === mode ? null : mode)}
            className={`text-xs px-2.5 py-1.5 rounded capitalize ${previewMode === mode ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
          >
            {mode}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button onClick={toggleGrid} className={`text-xs px-2 py-1.5 rounded ${showGrid ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Grid</button>
        <button onClick={toggleAnnotations} className={`text-xs px-2 py-1.5 rounded ${showAnnotations ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Notes</button>
        <button onClick={toggleA11yOverlay} className={`text-xs px-2 py-1.5 rounded ${showA11yOverlay ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>A11y</button>
        <button onClick={handleAddAnnotation} className="text-xs px-2 py-1.5 rounded hover:bg-gray-100">+ Note</button>
      </div>

      {/* Right — theme + actions */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => switchTheme(isDark ? 'default-light' : 'default-dark')} className="text-xs px-2.5 py-1.5 rounded hover:bg-gray-100">
          {isDark ? '☀ Light' : '◑ Dark'}
        </button>
        <button className="text-xs px-2.5 py-1.5 rounded hover:bg-gray-100">Export</button>
        <PresenceBar />
        <button className="text-xs px-3 py-1.5 rounded bg-[var(--accent)] text-white hover:opacity-90">Share</button>
      </div>
    </div>
  );
}
