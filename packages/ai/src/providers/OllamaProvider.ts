import type { AIProvider, ChatParams, ChatChunk, ModelInfo, CostEstimate, ProviderConfig } from './ProviderInterface';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama (Local)';
  models: ModelInfo[] = [];

  private baseUrl: string;
  private modelId: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl ?? 'http://localhost:11434';
    this.modelId = config.modelId ?? 'llama3.1';
  }

  async *chat(params: ChatParams): AsyncIterable<ChatChunk> {
    const model = params.model || this.modelId;
    const body: Record<string, unknown> = {
      model,
      messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: params.stream,
      options: { temperature: params.temperature ?? 0.7 },
    };

    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: {
            type: 'object',
            properties: Object.fromEntries(
              t.parameters.map((p) => [p.name, { type: p.type, description: p.description }]),
            ),
            required: t.parameters.filter((p) => p.required).map((p) => p.name),
          },
        },
      }));
    }

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      yield { type: 'error', error: `Ollama error: ${response.status}. Is Ollama running?` };
      return;
    }

    if (!params.stream) {
      const data = await response.json();
      if (data.message?.content) yield { type: 'text', content: data.message.content };
      if (data.message?.tool_calls) {
        for (const tc of data.message.tool_calls) {
          yield {
            type: 'tool_call',
            toolCall: { id: `ollama-${Date.now()}`, name: tc.function.name, arguments: tc.function.arguments },
          };
        }
      }
      yield { type: 'done' };
      return;
    }

    // Streaming
    const reader = response.body?.getReader();
    if (!reader) { yield { type: 'done' }; return; }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) yield { type: 'text', content: data.message.content };
          if (data.done) { yield { type: 'done' }; return; }
        } catch { /* skip */ }
      }
    }

    yield { type: 'done' };
  }

  async *functionCall(params: ChatParams): AsyncIterable<ChatChunk> {
    yield* this.chat(params);
  }

  async validateKey(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        this.models = (data.models ?? []).map((m: any) => ({
          id: m.name,
          name: m.name,
          contextWindow: 8192,
          supportsTools: true,
          supportsVision: false,
        }));
      }
      return res.ok;
    } catch {
      return false;
    }
  }

  estimateCost(): CostEstimate | null {
    return null; // Local = free
  }
}

export function createOllamaProvider(config: ProviderConfig): AIProvider {
  return new OllamaProvider(config);
}
