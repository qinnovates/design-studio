'use client';

import { useState } from 'react';
import { EXAMPLE_PLUGINS, type PluginManifest } from '@design-studio/plugins';

interface PluginsPanelProps {
  onClose: () => void;
}

const PERMISSION_LABELS: Record<string, string> = {
  'canvas:read': 'Read canvas',
  'canvas:write': 'Modify canvas',
  'tokens:read': 'Read tokens',
  'tokens:write': 'Modify tokens',
  'selection:read': 'Read selection',
  'ui:panel': 'Show panels',
  'ui:notification': 'Show notifications',
  'ui:modal': 'Show modals',
  'network:fetch': 'Make network requests',
  'export:trigger': 'Trigger exports',
};

export function PluginsPanel({ onClose }: PluginsPanelProps) {
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const handleInstall = (plugin: PluginManifest) => {
    setInstalled((prev) => new Set([...prev, plugin.id]));
  };

  const handleUninstall = (pluginId: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      next.delete(pluginId);
      return next;
    });
  };

  const handleRun = async (plugin: PluginManifest) => {
    setRunning(plugin.id);
    setNotification(null);

    // Simple execution — in production this would use PluginHost with iframe sandbox
    try {
      // Simulate plugin execution
      await new Promise((r) => setTimeout(r, 800));
      setNotification({
        message: `"${plugin.name}" executed successfully`,
        type: 'success',
      });
    } catch {
      setNotification({
        message: `"${plugin.name}" failed`,
        type: 'error',
      });
    }

    setRunning(null);
  };

  return (
    <div className="w-72 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Plugins</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mx-3 mt-3 p-2 rounded text-xs ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' :
          notification.type === 'error' ? 'bg-red-50 text-red-700' :
          notification.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {EXAMPLE_PLUGINS.map((plugin) => {
          const isInstalled = installed.has(plugin.id);
          const isRunning = running === plugin.id;

          return (
            <div key={plugin.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-sm font-medium">{plugin.name}</h4>
                <span className="text-[9px] text-gray-400">v{plugin.version}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{plugin.description}</p>

              {/* Permissions */}
              <div className="flex flex-wrap gap-1 mb-2">
                {plugin.permissions.map((perm) => (
                  <span key={perm} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {PERMISSION_LABELS[perm] ?? perm}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                {!isInstalled ? (
                  <button
                    onClick={() => handleInstall(plugin)}
                    className="text-[10px] px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Install
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleRun(plugin)}
                      disabled={isRunning}
                      className="text-[10px] px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                      onClick={() => handleUninstall(plugin.id)}
                      className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600"
                    >
                      Uninstall
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-[10px] text-gray-400">
        Plugins run in a sandbox. They cannot access your data directly.
      </div>
    </div>
  );
}
