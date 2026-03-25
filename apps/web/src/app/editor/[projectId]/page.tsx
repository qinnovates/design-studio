'use client';

import { useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/editor/Sidebar';
import { Inspector } from '@/components/editor/Inspector';
import { Toolbar } from '@/components/editor/Toolbar';
import { AIPanel } from '@/components/editor/AIPanel';
import { AppMap } from '@/components/editor/AppMap';
import { FontPicker } from '@/components/editor/FontPicker';
import { NotesPanel } from '@/components/editor/NotesPanel';
import { ScreenList } from '@/components/editor/ScreenList';
import { TokenManager } from '@/components/editor/TokenManager';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { A11yPanel } from '@/components/editor/A11yPanel';
import { VersionPanel } from '@/components/editor/VersionPanel';
import { PluginsPanel } from '@/components/editor/PluginsPanel';
import { PresenceBar } from '@/components/editor/PresenceBar';
import CommandCenter from '@/components/editor/CommandCenter';
import { DesignArena } from '@/components/editor/DesignArena';
import { PipelineStatus } from '@/components/editor/PipelineStatus';
import { MarketIntel } from '@/components/editor/MarketIntel';
import { BrandBrief } from '@/components/editor/BrandBrief';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { useUIStore } from '@/stores/uiStore';
import { TEMPLATE_SCENES } from '@/templates';

// Konva must be loaded client-side only (no SSR)
const DesignCanvas = dynamic(
  () =>
    import('@/components/editor/canvas/DesignCanvas').then((mod) => ({
      default: mod.DesignCanvas,
    })),
  { ssr: false, loading: () => <CanvasPlaceholder /> },
);

function CanvasPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading canvas...</p>
      </div>
    </div>
  );
}

// Map template IDs to scaffold preset IDs
const TEMPLATE_TO_PRESET: Record<string, string> = {
  'landing-page': 'saas-landing',
  'dashboard': 'dashboard',
  'mobile-app': 'health-fitness',
  'e-commerce': 'e-commerce',
  'portfolio': 'saas-landing',
  'blog': 'saas-landing',
};

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const {
    manifest,
    scaffoldFromPreset,
    scaffoldBlank,
  } = useProjectStore();
  const initializeTokens = useTokenStore((s) => s.initialize);
  const {
    leftPanel,
    rightPanel,
    activeView,
    setLeftPanel,
    setRightPanel,
    toggleLeftPanel,
    toggleRightPanel,
  } = useUIStore();

  const loadSceneGraph = useCanvasStore((s) => s.loadSceneGraph);

  // Initialize on mount
  useEffect(() => {
    initializeTokens();

    // Scaffold from template or blank
    if (!manifest) {
      const presetId = TEMPLATE_TO_PRESET[projectId];
      if (presetId) {
        scaffoldFromPreset(presetId, projectId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
      } else {
        scaffoldBlank(projectId);
      }
    }

    // Load template scene graph
    const sceneFactory = TEMPLATE_SCENES[projectId] ?? TEMPLATE_SCENES[TEMPLATE_TO_PRESET[projectId] ?? ''];
    if (sceneFactory) {
      loadSceneGraph(sceneFactory());
    }
  }, []);

  // Render left panel
  const renderLeftPanel = () => {
    switch (leftPanel) {
      case 'components':
        return <Sidebar panel="components" onClose={() => setLeftPanel(null)} />;
      case 'layers':
        return <Sidebar panel="layers" onClose={() => setLeftPanel(null)} />;
      case 'screens':
        return <ScreenList onClose={() => setLeftPanel(null)} />;
      case 'notes':
        return <NotesPanel onClose={() => setLeftPanel(null)} />;
      default:
        return null;
    }
  };

  // Render right panel
  const renderRightPanel = () => {
    switch (rightPanel) {
      case 'inspector':
        return <Inspector onClose={() => setRightPanel(null)} />;
      case 'ai':
        return <AIPanel onClose={() => setRightPanel(null)} />;
      case 'fonts':
        return <FontPicker onClose={() => setRightPanel(null)} />;
      case 'tokens':
        return <TokenManager onClose={() => setRightPanel(null)} />;
      case 'export':
        return <ExportPanel onClose={() => setRightPanel(null)} />;
      case 'a11y':
        return <A11yPanel onClose={() => setRightPanel(null)} />;
      case 'versions':
        return <VersionPanel onClose={() => setRightPanel(null)} />;
      case 'plugins':
        return <PluginsPanel onClose={() => setRightPanel(null)} />;
      case 'comments':
        return <NotesPanel onClose={() => setRightPanel(null)} />;
      case 'market-intel':
        return <MarketIntel onClose={() => setRightPanel(null)} />;
      case 'brand-brief':
        return <BrandBrief onClose={() => setRightPanel(null)} />;
      default:
        return null;
    }
  };

  // Render main content
  const renderMainContent = () => {
    switch (activeView) {
      case 'app-map':
        return <AppMap />;
      case 'command-center':
        return <CommandCenter />;
      case 'design-arena':
        return <DesignArena />;
      case 'canvas':
      default:
        return (
          <>
            <PipelineStatus />
            <DesignCanvas />
          </>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        {leftPanel && <div role="complementary" aria-label="Left panel">{renderLeftPanel()}</div>}

        {/* Main content area */}
        <div className="flex-1 relative bg-gray-100 flex flex-col" role="main" aria-label="Design canvas">
          {/* View tabs */}
          <div className="h-9 bg-white border-b flex items-center px-3 gap-1 flex-shrink-0">
            <div role="tablist" aria-label="Editor views" className="flex items-center gap-1">
            {[
              { id: 'canvas' as const, label: 'Canvas' },
              { id: 'app-map' as const, label: 'App Map' },
              { id: 'command-center' as const, label: 'Command Center' },
              { id: 'design-arena' as const, label: 'Design Arena' },
            ].map((view) => (
              <button
                key={view.id}
                role="tab"
                aria-selected={activeView === view.id}
                onClick={() => useUIStore.getState().setActiveView(view.id)}
                className={`text-xs px-3 py-1.5 rounded ${
                  activeView === view.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {view.label}
              </button>
            ))}
            </div>

            <div className="flex-1" />

            {/* Quick toggles */}
            <div role="toolbar" aria-label="Panel toggles" className="flex items-center gap-1">
            {[
              { panel: 'components' as const, label: 'Components', side: 'left' as const },
              { panel: 'screens' as const, label: 'Screens', side: 'left' as const },
              { panel: 'notes' as const, label: 'Notes', side: 'left' as const },
            ].map(({ panel, label, side }) => (
              <button
                key={panel}
                onClick={() => toggleLeftPanel(panel)}
                className={`text-[10px] px-2 py-1 rounded ${
                  leftPanel === panel
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {[
              { panel: 'inspector' as const, label: 'Inspector' },
              { panel: 'ai' as const, label: 'AI' },
              { panel: 'fonts' as const, label: 'Fonts' },
              { panel: 'tokens' as const, label: 'Theme' },
              { panel: 'export' as const, label: 'Export' },
              { panel: 'a11y' as const, label: 'Accessibility' },
              { panel: 'versions' as const, label: 'History' },
              { panel: 'plugins' as const, label: 'Plugins' },
              { panel: 'brand-brief' as const, label: 'Brand Brief' },
              { panel: 'market-intel' as const, label: 'Market Intel' },
            ].map(({ panel, label }) => (
              <button
                key={panel}
                onClick={() => toggleRightPanel(panel)}
                className={`text-[10px] px-2 py-1 rounded ${
                  rightPanel === panel
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          {/* Main view */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>

        {/* Right panel */}
        {rightPanel && <div role="complementary" aria-label="Right panel">{renderRightPanel()}</div>}
      </div>
    </div>
  );
}
