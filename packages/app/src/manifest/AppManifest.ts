/**
 * AppManifest — the top-level definition of an entire app.
 *
 * This is what makes Design Studio "app-aware" from inception.
 * Instead of designing isolated screens, users design a connected app
 * with screens, navigation, data models, and shared state.
 */

// ─── App Manifest ────────────────────────────────────────────

export type AppPlatform = 'web' | 'ios' | 'android' | 'desktop' | 'cross-platform';
export type AppCategory =
  | 'social'
  | 'commerce'
  | 'productivity'
  | 'health'
  | 'education'
  | 'finance'
  | 'entertainment'
  | 'utility'
  | 'other';

export interface AppManifest {
  id: string;
  name: string;
  description: string;
  /** Target platforms — drives export and component availability */
  platforms: AppPlatform[];
  category: AppCategory;
  /** App-level settings */
  settings: AppSettings;
  /** All screens in the app, keyed by screen ID */
  screens: Record<string, Screen>;
  /** Navigation flows connecting screens */
  navigation: NavigationConfig;
  /** Data models the app works with */
  dataModels: Record<string, DataModel>;
  /** Shared state that persists across screens */
  globalState: Record<string, StateField>;
  /** Active token set IDs (light + dark + custom) */
  tokenSetIds: string[];
  /** App-level metadata */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface AppSettings {
  /** Default theme */
  defaultTheme: 'light' | 'dark' | 'system';
  /** Supported orientations */
  orientations: ('portrait' | 'landscape')[];
  /** Auth required to use the app */
  requiresAuth: boolean;
  /** Auth method if required */
  authMethod?: 'email' | 'social' | 'phone' | 'magic-link';
  /** Locale support */
  locales: string[];
  /** Primary locale */
  defaultLocale: string;
}

// ─── Screens ─────────────────────────────────────────────────

export type ScreenType =
  | 'page'        // Full page (web)
  | 'tab'         // Tab screen (mobile)
  | 'modal'       // Modal overlay
  | 'sheet'       // Bottom sheet (mobile)
  | 'drawer'      // Side drawer
  | 'onboarding'  // Onboarding flow step
  | 'auth'        // Auth screen (login, signup, forgot password)
  | 'settings'    // Settings page
  | 'detail'      // Detail view (pushed from a list)
  | 'error';      // Error page (404, 500)

export interface Screen {
  id: string;
  name: string;
  /** Plain English description — shown in the app map */
  description: string;
  type: ScreenType;
  /** URL route (web) or screen name (mobile) */
  route: string;
  /** Route parameters, e.g. { "id": "string" } for /products/:id */
  params: Record<string, 'string' | 'number'>;
  /** Reference to the page's scene graph (by page ID in the DB) */
  pageId: string;
  /** Data this screen needs — references DataModel fields */
  dataRequirements: DataRequirement[];
  /** Screens this screen can navigate to */
  navigatesTo: string[];
  /** Is this screen the entry point? */
  isEntryPoint: boolean;
  /** Is this screen behind auth? */
  requiresAuth: boolean;
  /** Sort order for tabs / nav items */
  sortOrder: number;
  /** Screen-level metadata */
  metadata: Record<string, unknown>;
}

// ─── Navigation ──────────────────────────────────────────────

export type NavigationPattern =
  | 'stack'       // Push/pop (iOS nav controller, web router)
  | 'tabs'        // Tab bar (bottom tabs mobile, top tabs web)
  | 'drawer'      // Side drawer navigation
  | 'flow'        // Linear flow (onboarding, checkout)
  | 'modal';      // Modal presentation

export interface NavigationConfig {
  /** Primary navigation pattern */
  primary: NavigationPattern;
  /** Which screens are in the tab bar / drawer */
  mainScreenIds: string[];
  /** Named flows (e.g., "onboarding", "checkout") */
  flows: Record<string, NavigationFlow>;
}

export interface NavigationFlow {
  id: string;
  name: string;
  /** Ordered screen IDs in this flow */
  steps: string[];
  /** Can the user skip steps? */
  skippable: boolean;
  /** Where to go when the flow completes */
  completionTarget: string;
}

// ─── Data Models ─────────────────────────────────────────────

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'url'
  | 'image'
  | 'enum'
  | 'array'
  | 'relation';

export interface DataModel {
  id: string;
  name: string;
  /** Plain English: "A product that users can buy" */
  description: string;
  fields: DataField[];
  /** Is this a user-facing model or internal? */
  visibility: 'public' | 'internal';
}

export interface DataField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** For enum type */
  options?: string[];
  /** For relation type — references another DataModel.id */
  relatesTo?: string;
  /** For array type — what type of items */
  itemType?: FieldType;
  /** Validation rules in plain English */
  validation?: string;
}

export interface DataRequirement {
  /** Which DataModel this screen needs */
  modelId: string;
  /** How the data is fetched: single item, list, or search */
  queryType: 'single' | 'list' | 'search';
  /** Which fields are displayed on this screen */
  displayFields: string[];
  /** Filter/sort criteria */
  filters?: Record<string, unknown>;
}

// ─── Shared State ────────────────────────────────────────────

export interface StateField {
  name: string;
  type: FieldType;
  /** Where this state comes from */
  source: 'auth' | 'user-input' | 'api' | 'local-storage' | 'computed';
  /** Which screens read this state */
  usedBy: string[];
  /** Default value */
  defaultValue?: unknown;
}
