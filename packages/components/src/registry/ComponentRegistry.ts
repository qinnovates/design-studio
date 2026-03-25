import type { ComponentDefinition } from './ComponentDefinition';

class ComponentRegistryImpl {
  private components = new Map<string, ComponentDefinition>();

  register(definition: ComponentDefinition): void {
    if (this.components.has(definition.id)) {
      console.warn(`Component "${definition.id}" is already registered. Overwriting.`);
    }
    this.components.set(definition.id, definition);
  }

  get(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }

  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  getByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.getAll().filter((c) => c.category === category);
  }

  search(query: string): ComponentDefinition[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }

  has(id: string): boolean {
    return this.components.has(id);
  }

  get size(): number {
    return this.components.size;
  }
}

export const ComponentRegistry = new ComponentRegistryImpl();
