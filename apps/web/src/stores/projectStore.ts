import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  AppManifest,
  Screen,
  DataModel,
} from '@design-studio/app';
import {
  scaffoldFromPreset,
  scaffoldBlankApp,
  addScreen,
  removeScreen,
  addDataModel,
  connectScreens,
  createScreen,
  createDataModel,
} from '@design-studio/app';

// ─── Project Notes (IDA Pro-style documentation) ─────────────

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  /** Which screen or 'global' */
  scope: string;
  category: 'design-decision' | 'requirement' | 'todo' | 'bug' | 'research' | 'meeting-note';
  tags: string[];
  author: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Store Types ─────────────────────────────────────────────

interface ProjectState {
  // App manifest
  manifest: AppManifest | null;
  activeScreenId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;

  // Project notes
  notes: Record<string, ProjectNote>;
  activeNoteId: string | null;

  // Actions — Project
  scaffoldFromPreset: (presetId: string, appName: string) => void;
  scaffoldBlank: (appName: string) => void;
  loadManifest: (manifest: AppManifest) => void;
  updateManifest: (updates: Partial<AppManifest>) => void;

  // Actions — Screens
  setActiveScreen: (screenId: string) => void;
  addScreenToApp: (name: string, type?: Screen['type']) => string;
  removeScreenFromApp: (screenId: string) => void;
  updateScreen: (screenId: string, updates: Partial<Screen>) => void;
  connectTwoScreens: (fromId: string, toId: string) => void;
  getScreenList: () => Screen[];

  // Actions — Data Models
  addDataModelToApp: (name: string, description?: string) => string;
  updateDataModel: (modelId: string, updates: Partial<DataModel>) => void;

  // Actions — Notes
  addNote: (note: Omit<ProjectNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<ProjectNote>) => void;
  removeNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  getNotesForScreen: (screenId: string) => ProjectNote[];
  getNotesByCategory: (category: ProjectNote['category']) => ProjectNote[];
  searchNotes: (query: string) => ProjectNote[];
}

let noteCounter = 0;

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    manifest: null,
    activeScreenId: null,
    isLoading: false,
    isSaving: false,
    lastSavedAt: null,
    hasUnsavedChanges: false,
    notes: {},
    activeNoteId: null,

    // ── Project Actions ────────────────────────
    scaffoldFromPreset: (presetId, appName) => {
      set((state) => {
        state.manifest = scaffoldFromPreset(presetId, appName);
        // Set first entry point screen as active
        const screens = Object.values(state.manifest.screens);
        const entry = screens.find((s) => s.isEntryPoint) ?? screens[0];
        state.activeScreenId = entry?.id ?? null;
        state.hasUnsavedChanges = true;
      });
    },

    scaffoldBlank: (appName) => {
      set((state) => {
        state.manifest = scaffoldBlankApp(appName);
        const screens = Object.values(state.manifest.screens);
        state.activeScreenId = screens[0]?.id ?? null;
        state.hasUnsavedChanges = true;
      });
    },

    loadManifest: (manifest) => {
      set((state) => {
        state.manifest = manifest;
        const screens = Object.values(manifest.screens);
        const entry = screens.find((s) => s.isEntryPoint) ?? screens[0];
        state.activeScreenId = entry?.id ?? null;
        state.hasUnsavedChanges = false;
      });
    },

    updateManifest: (updates) => {
      set((state) => {
        if (!state.manifest) return;
        Object.assign(state.manifest, updates);
        state.manifest.metadata.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    // ── Screen Actions ─────────────────────────
    setActiveScreen: (screenId) => {
      set((state) => {
        state.activeScreenId = screenId;
      });
    },

    addScreenToApp: (name, type = 'page') => {
      const screen = createScreen({ name, type });
      set((state) => {
        if (!state.manifest) return;
        state.manifest = addScreen(state.manifest, screen);
        state.activeScreenId = screen.id;
        state.hasUnsavedChanges = true;
      });
      return screen.id;
    },

    removeScreenFromApp: (screenId) => {
      set((state) => {
        if (!state.manifest) return;
        state.manifest = removeScreen(state.manifest, screenId);
        if (state.activeScreenId === screenId) {
          const screens = Object.values(state.manifest.screens);
          state.activeScreenId = screens[0]?.id ?? null;
        }
        state.hasUnsavedChanges = true;
      });
    },

    updateScreen: (screenId, updates) => {
      set((state) => {
        if (!state.manifest?.screens[screenId]) return;
        Object.assign(state.manifest.screens[screenId]!, updates);
        state.hasUnsavedChanges = true;
      });
    },

    connectTwoScreens: (fromId, toId) => {
      set((state) => {
        if (!state.manifest) return;
        state.manifest = connectScreens(state.manifest, fromId, toId);
        state.hasUnsavedChanges = true;
      });
    },

    getScreenList: () => {
      const state = get();
      if (!state.manifest) return [];
      return Object.values(state.manifest.screens).sort((a, b) => a.sortOrder - b.sortOrder);
    },

    // ── Data Model Actions ─────────────────────
    addDataModelToApp: (name, description) => {
      const model = createDataModel({ name, description });
      set((state) => {
        if (!state.manifest) return;
        state.manifest = addDataModel(state.manifest, model);
        state.hasUnsavedChanges = true;
      });
      return model.id;
    },

    updateDataModel: (modelId, updates) => {
      set((state) => {
        if (!state.manifest?.dataModels[modelId]) return;
        Object.assign(state.manifest.dataModels[modelId]!, updates);
        state.hasUnsavedChanges = true;
      });
    },

    // ── Note Actions ───────────────────────────
    addNote: (note) => {
      const id = `note-${Date.now().toString(36)}-${noteCounter++}`;
      const now = new Date().toISOString();
      set((state) => {
        state.notes[id] = { ...note, id, createdAt: now, updatedAt: now };
        state.activeNoteId = id;
      });
    },

    updateNote: (id, updates) => {
      set((state) => {
        const note = state.notes[id];
        if (!note) return;
        Object.assign(note, updates, { updatedAt: new Date().toISOString() });
      });
    },

    removeNote: (id) => {
      set((state) => {
        delete state.notes[id];
        if (state.activeNoteId === id) state.activeNoteId = null;
      });
    },

    togglePinNote: (id) => {
      set((state) => {
        const note = state.notes[id];
        if (note) note.pinned = !note.pinned;
      });
    },

    setActiveNote: (id) => {
      set((state) => {
        state.activeNoteId = id;
      });
    },

    getNotesForScreen: (screenId) => {
      const state = get();
      return Object.values(state.notes)
        .filter((n) => n.scope === screenId)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    },

    getNotesByCategory: (category) => {
      const state = get();
      return Object.values(state.notes).filter((n) => n.category === category);
    },

    searchNotes: (query) => {
      const state = get();
      const q = query.toLowerCase();
      return Object.values(state.notes).filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    },
  })),
);
