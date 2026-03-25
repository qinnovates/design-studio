'use client';

import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { VersionHistory, type VersionSnapshot } from '@design-studio/collab';

interface VersionPanelProps {
  onClose: () => void;
}

// Singleton version history instance
const versionHistory = new VersionHistory(50);

export function VersionPanel({ onClose }: VersionPanelProps) {
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const loadSceneGraph = useCanvasStore((s) => s.loadSceneGraph);
  const resolvedTokens = useTokenStore((s) => s.resolvedTokens);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  // Refresh version list
  const refresh = () => setVersions(versionHistory.getAll());

  useEffect(() => { refresh(); }, []);

  // Auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(sceneGraph.nodes).length > 0) {
        versionHistory.autoSave(sceneGraph, resolvedTokens);
        refresh();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [sceneGraph, resolvedTokens]);

  const handleSave = () => {
    const name = saveName.trim() || `Snapshot ${new Date().toLocaleString()}`;
    versionHistory.save(name, sceneGraph, resolvedTokens, 'You');
    setSaveName('');
    setShowSaveInput(false);
    refresh();
  };

  const handleRestore = (id: string) => {
    const data = versionHistory.restore(id);
    if (data && data.sceneGraph) {
      loadSceneGraph(data.sceneGraph as any);
      setRestoredId(id);
      setTimeout(() => setRestoredId(null), 2000);
    }
  };

  const handleDelete = (id: string) => {
    versionHistory.delete(id);
    refresh();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="w-72 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">
          Versions
          <span className="text-gray-400 font-normal ml-1">({versions.length})</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
      </div>

      {/* Save input */}
      {showSaveInput && (
        <div className="p-3 border-b bg-gray-50 flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Version name..."
            className="flex-1 text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded">
            Save
          </button>
        </div>
      )}

      {/* Current state indicator */}
      <div className="px-4 py-2.5 border-b bg-blue-50 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-xs text-blue-700 font-medium">Current</span>
        <span className="text-[10px] text-blue-500 ml-auto">
          {Object.keys(sceneGraph.nodes).length} elements
        </span>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No saved versions yet
          </div>
        ) : (
          <div className="divide-y">
            {versions.map((version) => {
              const isRestored = version.id === restoredId;
              const isAuto = version.createdBy === 'system';

              return (
                <div
                  key={version.id}
                  className={`p-3 hover:bg-gray-50 ${isRestored ? 'bg-green-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {version.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">
                          {formatTime(version.createdAt)}
                        </span>
                        <span className="text-[10px] text-gray-300">
                          {version.nodeCount} elements
                        </span>
                        {isAuto && (
                          <span className="text-[9px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded">
                            auto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => handleRestore(version.id)}
                      className={`text-[10px] px-2 py-1 rounded ${
                        isRestored
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isRestored ? 'Restored!' : 'Restore'}
                    </button>
                    <button
                      onClick={() => handleDelete(version.id)}
                      className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-[10px] text-gray-400">
        Auto-saves every 2 minutes. Max 50 versions.
      </div>
    </div>
  );
}
