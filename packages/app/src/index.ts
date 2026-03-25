// ── App Manifest ──────────────────────────────────────────
export type {
  AppManifest,
  AppPlatform,
  AppCategory,
  AppSettings,
  Screen,
  ScreenType,
  NavigationConfig,
  NavigationPattern,
  NavigationFlow,
  DataModel,
  DataField,
  DataRequirement,
  FieldType,
  StateField,
} from './manifest/AppManifest';

// ── App Factory ───────────────────────────────────────────
export {
  createApp,
  createScreen,
  createDataModel,
  addScreen,
  removeScreen,
  addDataModel,
  connectScreens,
  setNavigation,
} from './manifest/AppFactory';

// ── App Scaffolder ────────────────────────────────────────
export {
  scaffoldFromPreset,
  scaffoldBlankApp,
  getAvailablePresets,
  PRESETS,
} from './scaffold/AppScaffolder';
export type { ScaffoldPreset } from './scaffold/AppScaffolder';

// ── App Graph (relationship diagram) ──────────────────────
export {
  buildAppGraph,
  toMermaid,
  getScreenColor,
} from './graph/AppGraph';
export type {
  AppGraphData,
  GraphNode,
  GraphEdge,
} from './graph/AppGraph';

// ── Font Library ──────────────────────────────────────────
export {
  FONT_LIBRARY,
  FONT_PAIRINGS,
  searchFonts,
  getFontsByCategory,
  getFontsByPersonality,
  getFont,
  getPairingById,
  getPairingsForFont,
  getGoogleFontsImportUrl,
} from './fonts/FontLibrary';
export type {
  FontEntry,
  FontCategory,
  FontWeight,
  FontPersonality,
  FontPairing,
} from './fonts/FontLibrary';
