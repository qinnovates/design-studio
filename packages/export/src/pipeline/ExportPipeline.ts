import type { ASTNode } from '../ast/ASTNode';

export interface GeneratorOutput {
  filename: string;
  content: string;
  language: string;
}

export interface Generator {
  name: string;
  platform: string;
  generate(ast: ASTNode): GeneratorOutput[];
}

export class ExportPipeline {
  private generators = new Map<string, Generator>();

  registerGenerator(generator: Generator): void {
    this.generators.set(generator.platform, generator);
  }

  getAvailablePlatforms(): string[] {
    return Array.from(this.generators.keys());
  }

  export(ast: ASTNode, platform: string): GeneratorOutput[] {
    const generator = this.generators.get(platform);
    if (!generator) {
      throw new Error(`No generator registered for platform "${platform}"`);
    }
    return generator.generate(ast);
  }

  exportAll(ast: ASTNode): Record<string, GeneratorOutput[]> {
    const results: Record<string, GeneratorOutput[]> = {};
    for (const [platform, generator] of this.generators) {
      results[platform] = generator.generate(ast);
    }
    return results;
  }
}
