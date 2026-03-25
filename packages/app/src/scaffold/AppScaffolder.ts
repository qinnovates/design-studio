/**
 * AppScaffolder — generates a complete app structure from a description.
 *
 * This is the "auto-scaffold" engine. Given an app description (name, category,
 * feature list), it generates:
 * 1. AppManifest with all screens defined
 * 2. Navigation config wired up
 * 3. Data models inferred from the app type
 * 4. Scene graph templates for each screen
 *
 * The AI layer calls this with structured output from the LLM.
 * But it also works without AI — the preset scaffolds cover common app types.
 */

import type { AppManifest, Screen, DataModel, DataField, NavigationFlow } from '../manifest/AppManifest';
import { createApp, createScreen, createDataModel, addScreen, addDataModel, setNavigation, connectScreens } from '../manifest/AppFactory';

// ─── Scaffold Presets ────────────────────────────────────────

export interface ScaffoldPreset {
  id: string;
  name: string;
  description: string;
  category: AppManifest['category'];
  screens: Omit<Screen, 'id' | 'pageId' | 'metadata'>[];
  dataModels: Omit<DataModel, 'id'>[];
  navigationPattern: AppManifest['navigation']['primary'];
  flows?: { name: string; steps: string[]; completionTarget: string }[];
}

export const PRESETS: Record<string, ScaffoldPreset> = {
  'social-app': {
    id: 'social-app',
    name: 'Social App',
    description: 'Feed, profiles, messaging, notifications',
    category: 'social',
    navigationPattern: 'tabs',
    screens: [
      { name: 'Feed', description: 'Main content feed', type: 'tab', route: '/', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: true, requiresAuth: true, sortOrder: 0 },
      { name: 'Search', description: 'Search users and content', type: 'tab', route: '/search', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 1 },
      { name: 'Create Post', description: 'Create a new post', type: 'modal', route: '/create', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 2 },
      { name: 'Notifications', description: 'Activity and alerts', type: 'tab', route: '/notifications', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 3 },
      { name: 'Profile', description: 'User profile and settings', type: 'tab', route: '/profile', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 4 },
      { name: 'Post Detail', description: 'Single post view with comments', type: 'detail', route: '/post/:id', params: { id: 'string' }, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 5 },
      { name: 'Login', description: 'Sign in or create account', type: 'auth', route: '/login', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 6 },
    ],
    dataModels: [
      {
        name: 'User',
        description: 'App user with profile info',
        fields: [
          { name: 'username', label: 'Username', type: 'string', required: true },
          { name: 'displayName', label: 'Display Name', type: 'string', required: true },
          { name: 'avatar', label: 'Avatar', type: 'image', required: false },
          { name: 'bio', label: 'Bio', type: 'string', required: false },
        ],
        visibility: 'public',
      },
      {
        name: 'Post',
        description: 'A content post in the feed',
        fields: [
          { name: 'content', label: 'Content', type: 'string', required: true },
          { name: 'image', label: 'Image', type: 'image', required: false },
          { name: 'author', label: 'Author', type: 'relation', required: true, relatesTo: 'User' },
          { name: 'likes', label: 'Likes', type: 'number', required: false, defaultValue: 0 },
          { name: 'createdAt', label: 'Posted', type: 'date', required: true },
        ],
        visibility: 'public',
      },
    ],
  },

  'e-commerce': {
    id: 'e-commerce',
    name: 'E-Commerce App',
    description: 'Product catalog, cart, checkout, orders',
    category: 'commerce',
    navigationPattern: 'tabs',
    screens: [
      { name: 'Home', description: 'Featured products and categories', type: 'tab', route: '/', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: true, requiresAuth: false, sortOrder: 0 },
      { name: 'Browse', description: 'Product catalog with filters', type: 'tab', route: '/browse', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 1 },
      { name: 'Product Detail', description: 'Single product with images, price, reviews', type: 'detail', route: '/product/:id', params: { id: 'string' }, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 2 },
      { name: 'Cart', description: 'Shopping cart with item list and total', type: 'tab', route: '/cart', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 3 },
      { name: 'Checkout', description: 'Address, payment, and order confirmation', type: 'page', route: '/checkout', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 4 },
      { name: 'Orders', description: 'Order history and tracking', type: 'tab', route: '/orders', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 5 },
      { name: 'Account', description: 'Profile, addresses, payment methods', type: 'page', route: '/account', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 6 },
    ],
    dataModels: [
      {
        name: 'Product',
        description: 'A product available for purchase',
        fields: [
          { name: 'name', label: 'Product Name', type: 'string', required: true },
          { name: 'price', label: 'Price', type: 'number', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true },
          { name: 'description', label: 'Description', type: 'string', required: false },
          { name: 'category', label: 'Category', type: 'string', required: true },
          { name: 'inStock', label: 'In Stock', type: 'boolean', required: true, defaultValue: true },
          { name: 'rating', label: 'Rating', type: 'number', required: false },
        ],
        visibility: 'public',
      },
      {
        name: 'Order',
        description: 'A customer order',
        fields: [
          { name: 'items', label: 'Items', type: 'array', required: true, itemType: 'relation' },
          { name: 'total', label: 'Total', type: 'number', required: true },
          { name: 'status', label: 'Status', type: 'enum', required: true, options: ['pending', 'confirmed', 'shipped', 'delivered'] },
          { name: 'createdAt', label: 'Order Date', type: 'date', required: true },
        ],
        visibility: 'internal',
      },
    ],
    flows: [
      { name: 'checkout', steps: ['Cart', 'Checkout'], completionTarget: 'Orders' },
    ],
  },

  'dashboard': {
    id: 'dashboard',
    name: 'Dashboard App',
    description: 'Analytics, data tables, settings',
    category: 'productivity',
    navigationPattern: 'drawer',
    screens: [
      { name: 'Overview', description: 'Key metrics and charts', type: 'page', route: '/', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: true, requiresAuth: true, sortOrder: 0 },
      { name: 'Analytics', description: 'Detailed charts and graphs', type: 'page', route: '/analytics', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 1 },
      { name: 'Data Table', description: 'Searchable, sortable data table', type: 'page', route: '/data', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 2 },
      { name: 'Detail View', description: 'Single record detail', type: 'detail', route: '/data/:id', params: { id: 'string' }, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 3 },
      { name: 'Settings', description: 'App and account settings', type: 'settings', route: '/settings', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 4 },
      { name: 'Login', description: 'Sign in', type: 'auth', route: '/login', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 5 },
    ],
    dataModels: [
      {
        name: 'Metric',
        description: 'A tracked KPI or metric',
        fields: [
          { name: 'name', label: 'Metric Name', type: 'string', required: true },
          { name: 'value', label: 'Value', type: 'number', required: true },
          { name: 'unit', label: 'Unit', type: 'string', required: false },
          { name: 'trend', label: 'Trend', type: 'enum', required: false, options: ['up', 'down', 'flat'] },
          { name: 'timestamp', label: 'Timestamp', type: 'date', required: true },
        ],
        visibility: 'public',
      },
    ],
  },

  'saas-landing': {
    id: 'saas-landing',
    name: 'SaaS Landing Page',
    description: 'Hero, features, pricing, testimonials, footer',
    category: 'other',
    navigationPattern: 'stack',
    screens: [
      { name: 'Home', description: 'Hero, value proposition, CTA', type: 'page', route: '/', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: true, requiresAuth: false, sortOrder: 0 },
      { name: 'Features', description: 'Feature breakdown with icons', type: 'page', route: '/features', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 1 },
      { name: 'Pricing', description: 'Pricing tiers and comparison', type: 'page', route: '/pricing', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 2 },
      { name: 'About', description: 'Team, mission, story', type: 'page', route: '/about', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 3 },
      { name: 'Contact', description: 'Contact form and info', type: 'page', route: '/contact', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 4 },
      { name: 'Sign Up', description: 'Account creation', type: 'auth', route: '/signup', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: false, sortOrder: 5 },
    ],
    dataModels: [],
  },

  'health-fitness': {
    id: 'health-fitness',
    name: 'Health & Fitness App',
    description: 'Workout tracking, stats, goals',
    category: 'health',
    navigationPattern: 'tabs',
    screens: [
      { name: 'Today', description: 'Daily summary and quick actions', type: 'tab', route: '/', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: true, requiresAuth: true, sortOrder: 0 },
      { name: 'Workouts', description: 'Workout library and history', type: 'tab', route: '/workouts', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 1 },
      { name: 'Workout Detail', description: 'Single workout with exercises', type: 'detail', route: '/workout/:id', params: { id: 'string' }, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 2 },
      { name: 'Progress', description: 'Charts, streaks, goals', type: 'tab', route: '/progress', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 3 },
      { name: 'Profile', description: 'Settings and body metrics', type: 'tab', route: '/profile', params: {}, dataRequirements: [], navigatesTo: [], isEntryPoint: false, requiresAuth: true, sortOrder: 4 },
    ],
    dataModels: [
      {
        name: 'Workout',
        description: 'A recorded workout session',
        fields: [
          { name: 'name', label: 'Workout Name', type: 'string', required: true },
          { name: 'duration', label: 'Duration (min)', type: 'number', required: true },
          { name: 'calories', label: 'Calories', type: 'number', required: false },
          { name: 'type', label: 'Type', type: 'enum', required: true, options: ['strength', 'cardio', 'flexibility', 'sports'] },
          { name: 'date', label: 'Date', type: 'date', required: true },
        ],
        visibility: 'public',
      },
    ],
  },
};

// ─── Scaffolder ──────────────────────────────────────────────

export function scaffoldFromPreset(presetId: string, appName: string): AppManifest {
  const preset = PRESETS[presetId];
  if (!preset) {
    throw new Error(`Scaffold preset "${presetId}" not found. Available: ${Object.keys(PRESETS).join(', ')}`);
  }

  let app = createApp({
    name: appName,
    description: preset.description,
    category: preset.category,
    requiresAuth: preset.screens.some((s) => s.requiresAuth),
  });

  // Add screens
  const screenIdMap = new Map<string, string>(); // name -> generated ID
  for (const screenDef of preset.screens) {
    const screen = createScreen({
      name: screenDef.name,
      description: screenDef.description,
      type: screenDef.type,
      route: screenDef.route,
      isEntryPoint: screenDef.isEntryPoint,
      requiresAuth: screenDef.requiresAuth,
    });
    screen.sortOrder = screenDef.sortOrder;
    screen.params = screenDef.params;
    screenIdMap.set(screenDef.name, screen.id);
    app = addScreen(app, screen);
  }

  // Add data models
  for (const modelDef of preset.dataModels) {
    const model = createDataModel({ name: modelDef.name, description: modelDef.description });
    model.fields = modelDef.fields as DataField[];
    model.visibility = modelDef.visibility;
    app = addDataModel(app, model);
  }

  // Set navigation
  const tabScreenIds = preset.screens
    .filter((s) => s.type === 'tab')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => screenIdMap.get(s.name))
    .filter((id): id is string => id !== undefined);

  app = setNavigation(app, {
    primary: preset.navigationPattern,
    mainScreenIds: tabScreenIds,
  });

  // Wire up flows
  if (preset.flows) {
    const flows: Record<string, NavigationFlow> = {};
    for (const flowDef of preset.flows) {
      const flowStepIds = flowDef.steps
        .map((name) => screenIdMap.get(name))
        .filter((id): id is string => id !== undefined);
      const completionId = screenIdMap.get(flowDef.completionTarget) ?? '';

      flows[flowDef.name] = {
        id: flowDef.name,
        name: flowDef.name,
        steps: flowStepIds,
        skippable: false,
        completionTarget: completionId,
      };
    }
    app = setNavigation(app, { flows });
  }

  // Auto-connect entry point to main tab screens
  const entryScreen = preset.screens.find((s) => s.isEntryPoint);
  if (entryScreen) {
    const entryId = screenIdMap.get(entryScreen.name);
    if (entryId) {
      for (const tabId of tabScreenIds) {
        if (tabId !== entryId) {
          app = connectScreens(app, entryId, tabId);
        }
      }
    }
  }

  return app;
}

/** Scaffold a blank app with just a home screen */
export function scaffoldBlankApp(appName: string): AppManifest {
  let app = createApp({ name: appName });
  const homeScreen = createScreen({
    name: 'Home',
    description: 'Main screen',
    type: 'page',
    route: '/',
    isEntryPoint: true,
  });
  app = addScreen(app, homeScreen);
  app = setNavigation(app, { mainScreenIds: [homeScreen.id] });
  return app;
}

/** Get all available preset IDs and names */
export function getAvailablePresets(): { id: string; name: string; description: string }[] {
  return Object.values(PRESETS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
}
