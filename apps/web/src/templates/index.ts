import type { SceneGraph } from '@design-studio/canvas';
import {
  createSceneGraph,
  createFrameNode,
  createComponentNode,
  createTextNode,
  createShapeNode,
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

export function createECommerceScene(): SceneGraph {
  let graph = createSceneGraph();

  const frame = createFrameNode('E-Commerce', {
    width: 1440, height: 1200, fill: '{color.surface.primary}', breakpoint: 'desktop',
  });
  graph = addNode(graph, frame);

  // Top nav
  const nav = createComponentNode('navbar', 'Store Nav', {
    x: 0, y: 0, width: 1440, height: 56,
    props: { brandText: 'Shop', sticky: true },
    tokenBindings: { background: '{color.surface.primary}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, nav, frame.id);

  // Search bar
  const search = createComponentNode('text-input', 'Search', {
    x: 420, y: 80, width: 600, height: 44,
    props: { label: 'Search', placeholder: 'Search products...', inputType: 'text' },
    tokenBindings: { background: '{color.surface.secondary}', cornerRadius: '{radius.full}' },
  });
  graph = addNode(graph, search, frame.id);

  // Category heading
  const catHeading = createTextNode('Featured Products', {
    x: 60, y: 160, width: 400, height: 36, fontSize: 28, fontWeight: 700,
    fill: '{color.text.primary}', name: 'Category Heading',
  });
  graph = addNode(graph, catHeading, frame.id);

  // Product grid (2x3)
  const products = [
    { name: 'Classic Sneaker', price: '$89', x: 60, y: 220 },
    { name: 'Running Shoe', price: '$129', x: 380, y: 220 },
    { name: 'Canvas Slip-On', price: '$59', x: 700, y: 220 },
    { name: 'Leather Boot', price: '$199', x: 60, y: 520 },
    { name: 'Sport Sandal', price: '$45', x: 380, y: 520 },
    { name: 'High Top', price: '$110', x: 700, y: 520 },
  ];

  for (const prod of products) {
    const card = createComponentNode('card', prod.name, {
      x: prod.x, y: prod.y, width: 280, height: 270,
      props: { title: prod.name, elevated: true, padding: 'none' },
      tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}', shadow: '{shadow.sm}' },
    });
    graph = addNode(graph, card, frame.id);

    // Product image placeholder
    const img = createShapeNode('rectangle', {
      x: prod.x, y: prod.y, width: 280, height: 180,
      fill: '{color.surface.secondary}', cornerRadius: 12, name: `${prod.name} Image`,
    });
    graph = addNode(graph, img, frame.id);

    // Product name
    const pName = createTextNode(prod.name, {
      x: prod.x + 16, y: prod.y + 195, width: 248, height: 22,
      fontSize: 15, fontWeight: 500, fill: '{color.text.primary}', name: `${prod.name} Title`,
    });
    graph = addNode(graph, pName, frame.id);

    // Price
    const pPrice = createTextNode(prod.price, {
      x: prod.x + 16, y: prod.y + 222, width: 100, height: 20,
      fontSize: 16, fontWeight: 700, fill: '{color.action.primary}', name: `${prod.name} Price`,
    });
    graph = addNode(graph, pPrice, frame.id);

    // Add to cart button
    const btn = createComponentNode('button', 'Add to Cart', {
      x: prod.x + 150, y: prod.y + 222, width: 110, height: 32,
      props: { text: 'Add to Cart', size: 'small' }, variant: 'primary',
      tokenBindings: { background: '{color.action.primary}', text: '{color.text.onPrimary}', cornerRadius: '{radius.md}' },
    });
    graph = addNode(graph, btn, frame.id);
  }

  // Cart summary bar
  const cartBar = createComponentNode('container', 'Cart Bar', {
    x: 1020, y: 80, width: 360, height: 44,
    props: { direction: 'horizontal', align: 'center', padding: 'small' },
    tokenBindings: { background: '{color.surface.secondary}', cornerRadius: '{radius.lg}' },
  });
  graph = addNode(graph, cartBar, frame.id);

  return graph;
}

export function createPortfolioScene(): SceneGraph {
  let graph = createSceneGraph();

  const frame = createFrameNode('Portfolio', {
    width: 1440, height: 1000, fill: '{color.surface.primary}', breakpoint: 'desktop',
  });
  graph = addNode(graph, frame);

  // Name heading
  const name = createTextNode('Jane Designer', {
    x: 120, y: 100, width: 600, height: 60, fontSize: 48, fontWeight: 700,
    fill: '{color.text.primary}', name: 'Name',
  });
  graph = addNode(graph, name, frame.id);

  // Title
  const title = createTextNode('Product Designer & Creative Director', {
    x: 120, y: 170, width: 600, height: 30, fontSize: 20, fontWeight: 400,
    fill: '{color.text.secondary}', name: 'Title',
  });
  graph = addNode(graph, title, frame.id);

  // Bio
  const bio = createTextNode('I design digital products that people love. 10 years of experience shipping apps for startups and Fortune 500 companies.', {
    x: 120, y: 220, width: 550, height: 48, fontSize: 16, fontWeight: 400,
    fill: '{color.text.secondary}', name: 'Bio',
  });
  graph = addNode(graph, bio, frame.id);

  // CTA buttons row
  const viewWork = createComponentNode('button', 'View Work', {
    x: 120, y: 300, width: 160, height: 48,
    props: { text: 'View My Work', size: 'large' }, variant: 'primary',
    tokenBindings: { background: '{color.action.primary}', text: '{color.text.onPrimary}', cornerRadius: '{radius.lg}' },
  });
  graph = addNode(graph, viewWork, frame.id);

  const contact = createComponentNode('button', 'Contact', {
    x: 300, y: 300, width: 140, height: 48,
    props: { text: 'Contact Me', size: 'large' }, variant: 'outline',
    tokenBindings: { cornerRadius: '{radius.lg}' },
  });
  graph = addNode(graph, contact, frame.id);

  // Project grid (3 columns)
  const heading = createTextNode('Selected Work', {
    x: 120, y: 400, width: 400, height: 36, fontSize: 28, fontWeight: 700,
    fill: '{color.text.primary}', name: 'Projects Heading',
  });
  graph = addNode(graph, heading, frame.id);

  const projects = [
    { name: 'Fintech Dashboard', desc: 'Banking app redesign', x: 120 },
    { name: 'Health Tracker', desc: 'iOS wellness app', x: 520 },
    { name: 'E-Commerce', desc: 'Fashion marketplace', x: 920 },
  ];

  for (const proj of projects) {
    const card = createComponentNode('card', proj.name, {
      x: proj.x, y: 460, width: 360, height: 280,
      props: { title: proj.name, elevated: true, padding: 'none' },
      tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.xl}', shadow: '{shadow.md}' },
    });
    graph = addNode(graph, card, frame.id);

    const projImg = createShapeNode('rectangle', {
      x: proj.x, y: 460, width: 360, height: 200,
      fill: '{color.surface.secondary}', cornerRadius: 16, name: `${proj.name} Image`,
    });
    graph = addNode(graph, projImg, frame.id);

    const projName = createTextNode(proj.name, {
      x: proj.x + 20, y: 680, width: 320, height: 24,
      fontSize: 18, fontWeight: 600, fill: '{color.text.primary}', name: `${proj.name} Title`,
    });
    graph = addNode(graph, projName, frame.id);

    const projDesc = createTextNode(proj.desc, {
      x: proj.x + 20, y: 710, width: 320, height: 20,
      fontSize: 14, fontWeight: 400, fill: '{color.text.secondary}', name: `${proj.name} Desc`,
    });
    graph = addNode(graph, projDesc, frame.id);
  }

  return graph;
}

export function createBlogScene(): SceneGraph {
  let graph = createSceneGraph();

  const frame = createFrameNode('Blog', {
    width: 1440, height: 1000, fill: '{color.surface.secondary}', breakpoint: 'desktop',
  });
  graph = addNode(graph, frame);

  // Header
  const nav = createComponentNode('navbar', 'Blog Nav', {
    x: 0, y: 0, width: 1440, height: 56,
    props: { brandText: 'The Blog', sticky: true },
    tokenBindings: { background: '{color.surface.primary}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, nav, frame.id);

  // Featured article
  const featuredCard = createComponentNode('card', 'Featured Article', {
    x: 120, y: 80, width: 800, height: 320,
    props: { title: 'Featured', elevated: true, padding: 'none' },
    tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.xl}', shadow: '{shadow.md}' },
  });
  graph = addNode(graph, featuredCard, frame.id);

  const featImg = createShapeNode('rectangle', {
    x: 120, y: 80, width: 400, height: 320,
    fill: '{color.action.primary}', cornerRadius: 16, name: 'Featured Image',
  });
  graph = addNode(graph, featImg, frame.id);

  const featTitle = createTextNode('How We Redesigned Our Entire Product in 30 Days', {
    x: 540, y: 130, width: 350, height: 60, fontSize: 24, fontWeight: 700,
    fill: '{color.text.primary}', name: 'Featured Title',
  });
  graph = addNode(graph, featTitle, frame.id);

  const featExcerpt = createTextNode('A deep dive into our design process, the tools we used, and the lessons we learned along the way.', {
    x: 540, y: 210, width: 350, height: 48, fontSize: 15, fontWeight: 400,
    fill: '{color.text.secondary}', name: 'Featured Excerpt',
  });
  graph = addNode(graph, featExcerpt, frame.id);

  const readMore = createComponentNode('button', 'Read More', {
    x: 540, y: 290, width: 130, height: 40,
    props: { text: 'Read More', size: 'medium' }, variant: 'primary',
    tokenBindings: { background: '{color.action.primary}', text: '{color.text.onPrimary}', cornerRadius: '{radius.md}' },
  });
  graph = addNode(graph, readMore, frame.id);

  // Sidebar
  const sidebar = createComponentNode('container', 'Sidebar', {
    x: 960, y: 80, width: 360, height: 600,
    props: { direction: 'vertical', gap: 'medium', padding: 'medium' },
    tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.xl}', shadow: '{shadow.sm}' },
  });
  graph = addNode(graph, sidebar, frame.id);

  const sidebarTitle = createTextNode('Newsletter', {
    x: 980, y: 100, width: 320, height: 28, fontSize: 20, fontWeight: 700,
    fill: '{color.text.primary}', name: 'Newsletter Title',
  });
  graph = addNode(graph, sidebarTitle, frame.id);

  const emailInput = createComponentNode('text-input', 'Email', {
    x: 980, y: 140, width: 320, height: 44,
    props: { label: 'Email', placeholder: 'you@example.com', inputType: 'email' },
    tokenBindings: { cornerRadius: '{radius.md}' },
  });
  graph = addNode(graph, emailInput, frame.id);

  const subscribeBtn = createComponentNode('button', 'Subscribe', {
    x: 980, y: 200, width: 320, height: 44,
    props: { text: 'Subscribe', size: 'medium', fullWidth: true }, variant: 'primary',
    tokenBindings: { background: '{color.action.primary}', text: '{color.text.onPrimary}', cornerRadius: '{radius.md}' },
  });
  graph = addNode(graph, subscribeBtn, frame.id);

  // Article list
  const articles = [
    { title: 'Getting Started with Design Tokens', date: 'Mar 20', y: 440 },
    { title: 'Why Your App Needs a Design Pipeline', date: 'Mar 15', y: 540 },
    { title: 'The Case for AI Design Reviews', date: 'Mar 10', y: 640 },
  ];

  for (const article of articles) {
    const card = createComponentNode('card', article.title, {
      x: 120, y: article.y, width: 800, height: 80,
      props: { title: article.title, elevated: false, padding: 'medium' },
      tokenBindings: { background: '{color.surface.primary}', cornerRadius: '{radius.lg}' },
    });
    graph = addNode(graph, card, frame.id);

    const artTitle = createTextNode(article.title, {
      x: 140, y: article.y + 15, width: 600, height: 24,
      fontSize: 18, fontWeight: 600, fill: '{color.text.primary}', name: article.title,
    });
    graph = addNode(graph, artTitle, frame.id);

    const artDate = createTextNode(article.date, {
      x: 140, y: article.y + 48, width: 200, height: 18,
      fontSize: 13, fontWeight: 400, fill: '{color.text.secondary}', name: `${article.title} Date`,
    });
    graph = addNode(graph, artDate, frame.id);
  }

  return graph;
}

// Template registry
export const TEMPLATE_SCENES: Record<string, () => SceneGraph> = {
  'landing-page': createLandingPageScene,
  'saas-landing': createLandingPageScene,
  'dashboard': createDashboardScene,
  'e-commerce': createECommerceScene,
  'portfolio': createPortfolioScene,
  'blog': createBlogScene,
  'health-fitness': createMobileAppScene,
  'mobile-app': createMobileAppScene,
  'social-app': createMobileAppScene,
};
