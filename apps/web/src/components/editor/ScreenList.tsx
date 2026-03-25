'use client';

import { useProjectStore } from '@/stores/projectStore';
import { useUIStore } from '@/stores/uiStore';
import { getScreenColor } from '@design-studio/app';

interface ScreenListProps {
  onClose: () => void;
}

export function ScreenList({ onClose }: ScreenListProps) {
  const {
    manifest,
    activeScreenId,
    setActiveScreen,
    addScreenToApp,
    removeScreenFromApp,
    getScreenList,
  } = useProjectStore();
  const setActiveView = useUIStore((s) => s.setActiveView);

  const screens = getScreenList();

  return (
    <div className="w-64 border-r bg-white flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Screens</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addScreenToApp('New Screen')}
            className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            + Add
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
            &times;
          </button>
        </div>
      </div>

      {/* App Map link */}
      <button
        onClick={() => setActiveView('app-map')}
        className="mx-3 mt-3 mb-1 text-xs text-blue-600 hover:text-blue-700 text-left flex items-center gap-1.5"
      >
        <span>◎</span> View App Map
      </button>

      {/* Screen list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {screens.map((screen) => {
          const color = getScreenColor(screen.type);
          const isActive = screen.id === activeScreenId;

          return (
            <button
              key={screen.id}
              onClick={() => {
                setActiveScreen(screen.id);
                setActiveView('canvas');
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${
                isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{screen.name}</div>
                <div className="text-[10px] text-gray-400 truncate">
                  {screen.type} &middot; {screen.route}
                </div>
              </div>
              {screen.isEntryPoint && (
                <span className="text-[9px] bg-green-100 text-green-600 px-1 py-0.5 rounded flex-shrink-0">
                  Entry
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {manifest && (
        <div className="border-t p-3 text-[10px] text-gray-400">
          {screens.length} screens &middot;{' '}
          {Object.keys(manifest.dataModels).length} models &middot;{' '}
          {manifest.navigation.primary} nav
        </div>
      )}
    </div>
  );
}
