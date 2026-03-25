import type {
  AppManifest,
  AppPlatform,
  AppCategory,
  Screen,
  DataModel,
  NavigationConfig,
} from './AppManifest';
import { generateId } from '@design-studio/canvas';

// ─── App Factory ─────────────────────────────────────────────

export interface CreateAppOptions {
  name: string;
  description?: string;
  platforms?: AppPlatform[];
  category?: AppCategory;
  requiresAuth?: boolean;
}

export function createApp(options: CreateAppOptions): AppManifest {
  return {
    id: generateId(),
    name: options.name,
    description: options.description ?? '',
    platforms: options.platforms ?? ['web'],
    category: options.category ?? 'other',
    settings: {
      defaultTheme: 'system',
      orientations: ['portrait'],
      requiresAuth: options.requiresAuth ?? false,
      locales: ['en'],
      defaultLocale: 'en',
    },
    screens: {},
    navigation: {
      primary: 'stack',
      mainScreenIds: [],
      flows: {},
    },
    dataModels: {},
    globalState: {},
    tokenSetIds: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '0.1.0',
    },
  };
}

// ─── Screen Factory ──────────────────────────────────────────

export interface CreateScreenOptions {
  name: string;
  description?: string;
  type?: Screen['type'];
  route?: string;
  isEntryPoint?: boolean;
  requiresAuth?: boolean;
}

export function createScreen(options: CreateScreenOptions): Screen {
  const id = generateId();
  return {
    id,
    name: options.name,
    description: options.description ?? '',
    type: options.type ?? 'page',
    route: options.route ?? `/${options.name.toLowerCase().replace(/\s+/g, '-')}`,
    params: {},
    pageId: '', // Linked when page is created in DB
    dataRequirements: [],
    navigatesTo: [],
    isEntryPoint: options.isEntryPoint ?? false,
    requiresAuth: options.requiresAuth ?? false,
    sortOrder: 0,
    metadata: {},
  };
}

// ─── Data Model Factory ──────────────────────────────────────

export interface CreateDataModelOptions {
  name: string;
  description?: string;
}

export function createDataModel(options: CreateDataModelOptions): DataModel {
  return {
    id: generateId(),
    name: options.name,
    description: options.description ?? '',
    fields: [],
    visibility: 'public',
  };
}

// ─── App Mutation Helpers ────────────────────────────────────

export function addScreen(app: AppManifest, screen: Screen): AppManifest {
  return {
    ...app,
    screens: { ...app.screens, [screen.id]: screen },
    metadata: { ...app.metadata, updatedAt: new Date().toISOString() },
  };
}

export function removeScreen(app: AppManifest, screenId: string): AppManifest {
  const { [screenId]: _, ...remaining } = app.screens;
  return {
    ...app,
    screens: remaining,
    navigation: {
      ...app.navigation,
      mainScreenIds: app.navigation.mainScreenIds.filter((id) => id !== screenId),
    },
    metadata: { ...app.metadata, updatedAt: new Date().toISOString() },
  };
}

export function addDataModel(app: AppManifest, model: DataModel): AppManifest {
  return {
    ...app,
    dataModels: { ...app.dataModels, [model.id]: model },
    metadata: { ...app.metadata, updatedAt: new Date().toISOString() },
  };
}

export function connectScreens(
  app: AppManifest,
  fromScreenId: string,
  toScreenId: string,
): AppManifest {
  const screen = app.screens[fromScreenId];
  if (!screen) return app;

  const updatedScreen: Screen = {
    ...screen,
    navigatesTo: [...new Set([...screen.navigatesTo, toScreenId])],
  };

  return {
    ...app,
    screens: { ...app.screens, [fromScreenId]: updatedScreen },
    metadata: { ...app.metadata, updatedAt: new Date().toISOString() },
  };
}

export function setNavigation(
  app: AppManifest,
  config: Partial<NavigationConfig>,
): AppManifest {
  return {
    ...app,
    navigation: { ...app.navigation, ...config },
    metadata: { ...app.metadata, updatedAt: new Date().toISOString() },
  };
}
