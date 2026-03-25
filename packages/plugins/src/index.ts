// ─── Plugin Manifest ─────────────────────────────────────────

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  permissions: PluginPermission[];
  icon?: string;
}

export type PluginPermission =
  | 'canvas:read'
  | 'canvas:write'
  | 'tokens:read'
  | 'tokens:write'
  | 'selection:read'
  | 'ui:panel'
  | 'ui:modal'
  | 'ui:notification'
  | 'network:fetch'
  | 'export:trigger';

// ─── Plugin API ──────────────────────────────────────────────

export interface PluginAPI {
  canvas: {
    getSelectedNodes: () => unknown[];
    getNodeById: (id: string) => unknown | undefined;
    getAllNodes: () => unknown[];
    addNode: (node: unknown) => string;
    updateNode: (id: string, updates: unknown) => void;
    removeNode: (id: string) => void;
  };
  tokens: {
    getAll: () => Record<string, string>;
    get: (name: string) => string | undefined;
    update: (name: string, value: string) => void;
  };
  selection: {
    getSelected: () => string[];
    select: (ids: string[]) => void;
    clear: () => void;
  };
  ui: {
    showPanel: (html: string, title: string) => void;
    showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    closePanel: () => void;
  };
}

// ─── Plugin Host ─────────────────────────────────────────────

export type PluginMessageType =
  | 'api-call'
  | 'api-response'
  | 'plugin-ready'
  | 'plugin-error'
  | 'show-ui'
  | 'notification';

export interface PluginMessage {
  type: PluginMessageType;
  id: string;
  method?: string;
  args?: unknown[];
  result?: unknown;
  error?: string;
}

/**
 * PluginHost manages sandboxed plugin execution.
 * Each plugin runs in an iframe with no direct DOM/cookie/network access.
 * Communication happens via postMessage RPC.
 */
export class PluginHost {
  private plugins = new Map<string, LoadedPlugin>();
  private api: PluginAPI;

  constructor(api: PluginAPI) {
    this.api = api;
  }

  /** Load and start a plugin */
  async load(manifest: PluginManifest): Promise<void> {
    if (this.plugins.has(manifest.id)) {
      this.unload(manifest.id);
    }

    // Create sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';
    iframe.srcdoc = this.buildPluginHTML(manifest);
    document.body.appendChild(iframe);

    const plugin: LoadedPlugin = {
      manifest,
      iframe,
      pendingCalls: new Map(),
    };

    // Listen for messages from the plugin
    const handler = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      this.handlePluginMessage(manifest.id, event.data);
    };
    window.addEventListener('message', handler);
    plugin.messageHandler = handler;

    this.plugins.set(manifest.id, plugin);
  }

  /** Unload a plugin */
  unload(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    if (plugin.messageHandler) {
      window.removeEventListener('message', plugin.messageHandler);
    }
    plugin.iframe.remove();
    this.plugins.delete(pluginId);
  }

  /** Get all loaded plugins */
  getLoaded(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  /** Check if plugin has a specific permission */
  private hasPermission(pluginId: string, permission: PluginPermission): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin?.manifest.permissions.includes(permission) ?? false;
  }

  private handlePluginMessage(pluginId: string, message: PluginMessage): void {
    if (message.type === 'api-call' && message.method) {
      const result = this.executeAPICall(pluginId, message.method, message.args ?? []);
      const plugin = this.plugins.get(pluginId);
      plugin?.iframe.contentWindow?.postMessage(
        { type: 'api-response', id: message.id, result } satisfies PluginMessage,
        '*',
      );
    }
  }

  private executeAPICall(pluginId: string, method: string, args: unknown[]): unknown {
    const [namespace, fn] = method.split('.') as [string, string];

    // Permission check
    const permMap: Record<string, PluginPermission> = {
      'canvas.getSelectedNodes': 'canvas:read',
      'canvas.getNodeById': 'canvas:read',
      'canvas.getAllNodes': 'canvas:read',
      'canvas.addNode': 'canvas:write',
      'canvas.updateNode': 'canvas:write',
      'canvas.removeNode': 'canvas:write',
      'tokens.getAll': 'tokens:read',
      'tokens.get': 'tokens:read',
      'tokens.update': 'tokens:write',
      'selection.getSelected': 'selection:read',
      'selection.select': 'selection:read',
      'selection.clear': 'selection:read',
      'ui.showPanel': 'ui:panel',
      'ui.showNotification': 'ui:notification',
      'ui.closePanel': 'ui:panel',
    };

    const requiredPerm = permMap[method];
    if (requiredPerm && !this.hasPermission(pluginId, requiredPerm)) {
      throw new Error(`Plugin "${pluginId}" lacks permission "${requiredPerm}" for ${method}`);
    }

    // Execute
    const apiObj = this.api[namespace as keyof PluginAPI];
    if (apiObj && typeof (apiObj as any)[fn] === 'function') {
      return (apiObj as any)[fn](...args);
    }

    throw new Error(`Unknown API method: ${method}`);
  }

  private buildPluginHTML(manifest: PluginManifest): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  // Plugin SDK injected by host
  const DesignStudio = {
    _callId: 0,
    _pending: new Map(),

    _call(method, ...args) {
      return new Promise((resolve, reject) => {
        const id = 'call-' + (this._callId++);
        this._pending.set(id, { resolve, reject });
        parent.postMessage({ type: 'api-call', id, method, args }, '*');
      });
    },

    canvas: {
      getSelectedNodes: () => DesignStudio._call('canvas.getSelectedNodes'),
      getNodeById: (id) => DesignStudio._call('canvas.getNodeById', id),
      getAllNodes: () => DesignStudio._call('canvas.getAllNodes'),
      addNode: (node) => DesignStudio._call('canvas.addNode', node),
      updateNode: (id, updates) => DesignStudio._call('canvas.updateNode', id, updates),
      removeNode: (id) => DesignStudio._call('canvas.removeNode', id),
    },
    tokens: {
      getAll: () => DesignStudio._call('tokens.getAll'),
      get: (name) => DesignStudio._call('tokens.get', name),
      update: (name, value) => DesignStudio._call('tokens.update', name, value),
    },
    selection: {
      getSelected: () => DesignStudio._call('selection.getSelected'),
      select: (ids) => DesignStudio._call('selection.select', ids),
      clear: () => DesignStudio._call('selection.clear'),
    },
    ui: {
      showPanel: (html, title) => DesignStudio._call('ui.showPanel', html, title),
      showNotification: (msg, type) => DesignStudio._call('ui.showNotification', msg, type),
      closePanel: () => DesignStudio._call('ui.closePanel'),
    },
  };

  window.addEventListener('message', (e) => {
    if (e.data.type === 'api-response') {
      const pending = DesignStudio._pending.get(e.data.id);
      if (pending) {
        DesignStudio._pending.delete(e.data.id);
        if (e.data.error) pending.reject(new Error(e.data.error));
        else pending.resolve(e.data.result);
      }
    }
  });

  parent.postMessage({ type: 'plugin-ready', id: '${manifest.id}' }, '*');
</script>
<script>
${manifest.entry}
</script>
</body>
</html>`;
  }
}

interface LoadedPlugin {
  manifest: PluginManifest;
  iframe: HTMLIFrameElement;
  pendingCalls: Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>;
  messageHandler?: (event: MessageEvent) => void;
}

// ─── Example Plugin Manifests ────────────────────────────────

export const EXAMPLE_PLUGINS: PluginManifest[] = [
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    version: '1.0.0',
    description: 'Generate harmonious color palettes from a base color',
    author: 'Design Studio',
    permissions: ['tokens:read', 'tokens:write', 'ui:notification'],
    entry: `
(async function() {
  const tokens = await DesignStudio.tokens.getAll();
  const primary = tokens['color.action.primary'] || '#3b82f6';

  // Generate complementary colors
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3), 16) / 255;
    let g = parseInt(hex.slice(3,5), 16) / 255;
    let b = parseInt(hex.slice(5,7), 16) / 255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = ((g-b)/d + (g<b?6:0)) / 6; break;
        case g: h = ((b-r)/d + 2) / 6; break;
        case b: h = ((r-g)/d + 4) / 6; break;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1-l);
    const f = n => { const k = (n + h/30) % 12; return l - a * Math.max(Math.min(k-3, 9-k, 1), -1); };
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
  }

  const [h, s, l] = hexToHsl(primary);
  const complement = hslToHex((h + 180) % 360, s, l);
  const analogous1 = hslToHex((h + 30) % 360, s, l);
  const analogous2 = hslToHex((h - 30 + 360) % 360, s, l);

  await DesignStudio.ui.showNotification(
    'Palette: ' + primary + ' | ' + complement + ' | ' + analogous1 + ' | ' + analogous2,
    'success'
  );
})();
    `,
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Filler',
    version: '1.0.0',
    description: 'Fill selected text elements with placeholder text',
    author: 'Design Studio',
    permissions: ['canvas:read', 'canvas:write', 'selection:read', 'ui:notification'],
    entry: `
(async function() {
  const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';
  const SHORT = ['Click here', 'Learn more', 'Get started', 'Sign up free', 'Contact us', 'Read more'];

  const selected = await DesignStudio.selection.getSelected();
  if (selected.length === 0) {
    await DesignStudio.ui.showNotification('Select text elements first', 'warning');
    return;
  }

  let filled = 0;
  for (const id of selected) {
    const node = await DesignStudio.canvas.getNodeById(id);
    if (node && (node.type === 'text' || (node.type === 'component' && node.componentId === 'text'))) {
      await DesignStudio.canvas.updateNode(id, { content: LOREM.slice(0, 120) });
      filled++;
    } else if (node && node.type === 'component' && node.componentId === 'button') {
      const text = SHORT[Math.floor(Math.random() * SHORT.length)];
      await DesignStudio.canvas.updateNode(id, { props: { ...node.props, text } });
      filled++;
    }
  }

  await DesignStudio.ui.showNotification('Filled ' + filled + ' elements with placeholder text', 'success');
})();
    `,
  },
  {
    id: 'spacing-checker',
    name: 'Spacing Consistency Checker',
    version: '1.0.0',
    description: 'Checks for inconsistent spacing between elements',
    author: 'Design Studio',
    permissions: ['canvas:read', 'ui:notification'],
    entry: `
(async function() {
  const nodes = await DesignStudio.canvas.getAllNodes();
  const gaps = new Map();

  // Collect vertical gaps between sibling elements
  const sorted = nodes.filter(n => n.parentId).sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i-1];
    const curr = sorted[i];
    if (prev.parentId === curr.parentId) {
      const gap = Math.round(curr.y - (prev.y + prev.height));
      if (gap > 0 && gap < 200) {
        gaps.set(gap, (gaps.get(gap) || 0) + 1);
      }
    }
  }

  if (gaps.size === 0) {
    await DesignStudio.ui.showNotification('No spacing patterns detected', 'info');
    return;
  }

  const sorted_gaps = [...gaps.entries()].sort((a, b) => b[1] - a[1]);
  const msg = sorted_gaps.slice(0, 5).map(([gap, count]) => gap + 'px (' + count + 'x)').join(', ');

  if (gaps.size > 3) {
    await DesignStudio.ui.showNotification('Inconsistent spacing detected: ' + msg + '. Consider standardizing.', 'warning');
  } else {
    await DesignStudio.ui.showNotification('Spacing looks consistent: ' + msg, 'success');
  }
})();
    `,
  },
];
