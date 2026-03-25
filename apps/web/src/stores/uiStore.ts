import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ─── Types ───────────────────────────────────────────────────

export type LeftPanel = 'components' | 'layers' | 'screens' | 'app-map' | 'notes' | null;
export type RightPanel = 'inspector' | 'tokens' | 'ai' | 'comments' | 'fonts' | 'export' | 'a11y' | 'versions' | 'plugins' | 'market-intel' | null;
export type PreviewMode = 'desktop' | 'tablet' | 'phone' | null;
export type EditorView = 'canvas' | 'app-map' | 'command-center' | 'design-arena' | 'tokens' | 'export' | 'notes';

interface UIState {
  // Panel visibility
  leftPanel: LeftPanel;
  rightPanel: RightPanel;

  // Editor view
  activeView: EditorView;

  // Preview
  previewMode: PreviewMode;
  previewWidth: number;

  // Overlays
  showA11yOverlay: boolean;
  showGrid: boolean;
  showSnapGuides: boolean;
  showAnnotations: boolean;
  showRulers: boolean;

  // Theme
  editorTheme: 'light' | 'dark';

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown>;

  // Actions
  setLeftPanel: (panel: LeftPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  toggleLeftPanel: (panel: LeftPanel) => void;
  toggleRightPanel: (panel: RightPanel) => void;
  setActiveView: (view: EditorView) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  toggleA11yOverlay: () => void;
  toggleGrid: () => void;
  toggleSnapGuides: () => void;
  toggleAnnotations: () => void;
  toggleRulers: () => void;
  toggleEditorTheme: () => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const PREVIEW_WIDTHS: Record<string, number> = {
  phone: 375,
  tablet: 768,
  desktop: 1440,
};

export const useUIStore = create<UIState>()(
  immer((set) => ({
    leftPanel: 'components',
    rightPanel: 'inspector',
    activeView: 'canvas',
    previewMode: null,
    previewWidth: 1440,
    showA11yOverlay: false,
    showGrid: false,
    showSnapGuides: true,
    showAnnotations: true,
    showRulers: false,
    editorTheme: 'light',
    activeModal: null,
    modalData: {},

    setLeftPanel: (panel) => set((s) => { s.leftPanel = panel; }),
    setRightPanel: (panel) => set((s) => { s.rightPanel = panel; }),

    toggleLeftPanel: (panel) => set((s) => {
      s.leftPanel = s.leftPanel === panel ? null : panel;
    }),

    toggleRightPanel: (panel) => set((s) => {
      s.rightPanel = s.rightPanel === panel ? null : panel;
    }),

    setActiveView: (view) => set((s) => {
      s.activeView = view;
      // Auto-switch left panel for certain views
      if (view === 'app-map') s.leftPanel = 'screens';
      if (view === 'notes') s.leftPanel = 'notes';
      if (view === 'canvas') s.leftPanel = s.leftPanel === 'screens' ? 'components' : s.leftPanel;
    }),

    setPreviewMode: (mode) => set((s) => {
      s.previewMode = mode;
      s.previewWidth = mode ? PREVIEW_WIDTHS[mode] ?? 1440 : 1440;
    }),

    toggleA11yOverlay: () => set((s) => { s.showA11yOverlay = !s.showA11yOverlay; }),
    toggleGrid: () => set((s) => { s.showGrid = !s.showGrid; }),
    toggleSnapGuides: () => set((s) => { s.showSnapGuides = !s.showSnapGuides; }),
    toggleAnnotations: () => set((s) => { s.showAnnotations = !s.showAnnotations; }),
    toggleRulers: () => set((s) => { s.showRulers = !s.showRulers; }),

    toggleEditorTheme: () => set((s) => {
      s.editorTheme = s.editorTheme === 'light' ? 'dark' : 'light';
    }),

    openModal: (modalId, data = {}) => set((s) => {
      s.activeModal = modalId;
      s.modalData = data;
    }),

    closeModal: () => set((s) => {
      s.activeModal = null;
      s.modalData = {};
    }),
  })),
);
