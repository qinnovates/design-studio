import type { SceneGraph } from '@design-studio/canvas';
import {
  createSceneGraph,
  createFrameNode,
  createComponentNode,
  createTextNode,
  addNode,
} from '@design-studio/canvas';

export function createLandingPageScene(): SceneGraph {
  let graph = createSceneGraph();

  // Main frame
  const frame = createFrameNode('Landing Page', {
    width: 1440,
    height: 900,
    fill: '{color.surface.primary}',
    breakpoint: 'desktop',
  });
  graph = addNode(graph, frame);

  // Navbar
  const navbar = createComponentNode('navbar', 'Navigation', {
    x: 0,
    y: 0,
    width: 1440,
    height: 64,
    props: { brandText: 'My App', sticky: true },
    tokenBindings: { background: '{color.surface.primary}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, navbar, frame.id);

  // Hero heading
  const heading = createTextNode('Design apps without design skills', {
    x: 420,
    y: 200,
    width: 600,
    height: 80,
    fontSize: 48,
    fontWeight: 700,
    textAlign: 'center',
    fill: '{color.text.primary}',
    name: 'Hero Heading',
  });
  graph = addNode(graph, heading, frame.id);

  // Hero subtitle
  const subtitle = createTextNode('Pick a template, customize with AI, export real code.', {
    x: 420,
    y: 300,
    width: 600,
    height: 30,
    fontSize: 18,
    fontWeight: 400,
    textAlign: 'center',
    fill: '{color.text.secondary}',
    name: 'Hero Subtitle',
  });
  graph = addNode(graph, subtitle, frame.id);

  // CTA Button
  const cta = createComponentNode('button', 'Get Started Button', {
    x: 620,
    y: 370,
    width: 200,
    height: 48,
    props: { text: 'Get Started', size: 'large' },
    variant: 'primary',
    tokenBindings: {
      background: '{color.action.primary}',
      text: '{color.text.onPrimary}',
      cornerRadius: '{radius.lg}',
    },
  });
  graph = addNode(graph, cta, frame.id);

  // Feature cards row
  const features = [
    { title: 'AI-Powered', desc: 'Describe what you want in plain English', x: 120 },
    { title: 'Real Code Export', desc: 'Generate React, SwiftUI, Compose', x: 520 },
    { title: 'Open Source', desc: 'Free forever, self-hostable', x: 920 },
  ];

  for (const feat of features) {
    const card = createComponentNode('card', feat.title, {
      x: feat.x,
      y: 500,
      width: 360,
      height: 180,
      props: { title: feat.title, elevated: true, padding: 'medium' },
      tokenBindings: {
        background: '{color.surface.primary}',
        cornerRadius: '{radius.lg}',
        shadow: '{shadow.md}',
      },
    });
    graph = addNode(graph, card, frame.id);

    const cardTitle = createTextNode(feat.title, {
      x: feat.x + 24,
      y: 530,
      width: 312,
      height: 30,
      fontSize: 20,
      fontWeight: 600,
      fill: '{color.text.primary}',
      name: `${feat.title} Title`,
    });
    graph = addNode(graph, cardTitle, frame.id);

    const cardDesc = createTextNode(feat.desc, {
      x: feat.x + 24,
      y: 570,
      width: 312,
      height: 24,
      fontSize: 14,
      fontWeight: 400,
      fill: '{color.text.secondary}',
      name: `${feat.title} Description`,
    });
    graph = addNode(graph, cardDesc, frame.id);
  }

  return graph;
}

export function createDashboardScene(): SceneGraph {
  let graph = createSceneGraph();

  const frame = createFrameNode('Dashboard', {
    width: 1440,
    height: 900,
    fill: '{color.surface.secondary}',
    breakpoint: 'desktop',
  });
  graph = addNode(graph, frame);

  // Sidebar
  const sidebar = createComponentNode('container', 'Sidebar', {
    x: 0,
    y: 0,
    width: 240,
    height: 900,
    props: { direction: 'vertical', gap: 'small', padding: 'medium' },
    tokenBindings: { background: '{color.surface.primary}' },
  });
  graph = addNode(graph, sidebar, frame.id);

  // Top bar
  const topbar = createComponentNode('navbar', 'Top Bar', {
    x: 240,
    y: 0,
    width: 1200,
    height: 56,
    props: { brandText: 'Dashboard' },
    tokenBindings: { background: '{color.surface.primary}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, topbar, frame.id);

  // Metric cards
  const metrics = [
    { label: 'Revenue', value: '$12,450', x: 280 },
    { label: 'Users', value: '1,234', x: 560 },
    { label: 'Orders', value: '845', x: 840 },
    { label: 'Growth', value: '+12.5%', x: 1120 },
  ];

  for (const m of metrics) {
    const card = createComponentNode('card', m.label, {
      x: m.x,
      y: 80,
      width: 240,
      height: 120,
      props: { title: m.label, elevated: true },
      tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}', shadow: '{shadow.sm}' },
    });
    graph = addNode(graph, card, frame.id);
  }

  // Data table placeholder
  const table = createComponentNode('card', 'Recent Orders', {
    x: 280,
    y: 230,
    width: 880,
    height: 400,
    props: { title: 'Recent Orders', elevated: true },
    tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, table, frame.id);

  // Chart placeholder
  const chart = createComponentNode('card', 'Revenue Chart', {
    x: 280,
    y: 660,
    width: 600,
    height: 220,
    props: { title: 'Revenue Chart' },
    tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, chart, frame.id);

  return graph;
}

export function createMobileAppScene(): SceneGraph {
  let graph = createSceneGraph();

  const frame = createFrameNode('Mobile App', {
    width: 375,
    height: 812,
    fill: '{color.surface.primary}',
    breakpoint: 'phone',
  });
  graph = addNode(graph, frame);

  // Screen title
  const heading = createTextNode('Today', {
    x: 20,
    y: 60,
    width: 335,
    height: 40,
    fontSize: 34,
    fontWeight: 700,
    fill: '{color.text.primary}',
    name: 'Screen Title',
  });
  graph = addNode(graph, heading, frame.id);

  // Summary card
  const summary = createComponentNode('card', 'Daily Summary', {
    x: 20,
    y: 120,
    width: 335,
    height: 160,
    props: { title: 'Daily Summary', elevated: true, padding: 'medium' },
    tokenBindings: { background: '{color.action.primary}', cornerRadius: '{radius.xl}', shadow: '{shadow.md}' },
  });
  graph = addNode(graph, summary, frame.id);

  // Activity cards
  const activities = [
    { title: 'Morning Run', subtitle: '5.2 km - 28 min', y: 300 },
    { title: 'Yoga Session', subtitle: '45 min - 180 cal', y: 400 },
    { title: 'Weight Training', subtitle: '1 hr - 320 cal', y: 500 },
  ];

  for (const act of activities) {
    const card = createComponentNode('card', act.title, {
      x: 20,
      y: act.y,
      width: 335,
      height: 80,
      props: { title: act.title, padding: 'medium' },
      tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}', shadow: '{shadow.sm}' },
    });
    graph = addNode(graph, card, frame.id);
  }

  // Tab bar
  const tabBar = createComponentNode('container', 'Tab Bar', {
    x: 0,
    y: 728,
    width: 375,
    height: 84,
    props: { direction: 'horizontal', align: 'center', padding: 'small' },
    tokenBindings: { background: '{color.surface.primary}', borderTop: '{color.border.primary}' },
  });
  graph = addNode(graph, tabBar, frame.id);

  return graph;
}

// Template registry
export const TEMPLATE_SCENES: Record<string, () => SceneGraph> = {
  'landing-page': createLandingPageScene,
  'saas-landing': createLandingPageScene,
  'dashboard': createDashboardScene,
  'e-commerce': createLandingPageScene,  // Reuse landing for now
  'portfolio': createLandingPageScene,
  'blog': createLandingPageScene,
  'health-fitness': createMobileAppScene,
  'mobile-app': createMobileAppScene,
  'social-app': createMobileAppScene,
};
