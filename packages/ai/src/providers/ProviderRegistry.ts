import type { AIProvider, ProviderConfig } from './ProviderInterface';

type ProviderFactory = (config: ProviderConfig) => AIProvider;

class ProviderRegistryImpl {
  private factories = new Map<string, ProviderFactory>();

  register(providerId: string, factory: ProviderFactory): void {
    this.factories.set(providerId, factory);
  }

  create(config: ProviderConfig): AIProvider {
    const factory = this.factories.get(config.provider);
    if (!factory) {
      throw new Error(
        `AI provider "${config.provider}" not registered. Available: ${Array.from(this.factories.keys()).join(', ')}`,
      );
    }
    return factory(config);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.factories.keys());
  }

  has(providerId: string): boolean {
    return this.factories.has(providerId);
  }
}

export const ProviderRegistry = new ProviderRegistryImpl();
