import type { AIProvider, ChatParams, ChatChunk, ModelInfo, CostEstimate, ProviderConfig } from './ProviderInterface';
import { validateBaseUrl } from './urlValidation';

const OPENAI_MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, supportsTools: true, supportsVision: true, costPer1kInput: 0.0025, costPer1kOutput: 0.01 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, supportsTools: true, supportsVision: true, costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
  { id: 'gpt-4.1', name: 'GPT-4.1', contextWindow: 1000000, supportsTools: true, supportsVision: true, costPer1kInput: 0.002, costPer1kOutput: 0.008 },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', contextWindow: 1000000, supportsTools: true, supportsVision: true, costPer1kInput: 0.0004, costPer1kOutput: 0.0016 },
];

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  models = OPENAI_MODELS;

  private apiKey: string;
  private baseUrl: string;
  private modelId: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    this.modelId = config.modelId ?? 'gpt-4o-mini';

    const validation = validateBaseUrl(this.baseUrl);
    if (!validation.valid) throw new Error(validation.warning ?? 'Invalid base URL');
  }

  async *chat(params: ChatParams): AsyncIterable<ChatChunk> {
    const model = params.model || this.modelId;
    const body: Record<string, unknown> = {
      model,
      messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: params.stream,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4096,
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
              t.parameters.map((p) => [p.name, { type: p.type, description: p.description, ...(p.enum ? { enum: p.enum } : {}) }]),
            ),
            required: t.parameters.filter((p) => p.required).map((p) => p.name),
          },
        },
      }));
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      yield { type: 'error', error: `OpenAI API error: ${response.status} ${response.statusText}` };
      return;
    }

    if (!params.stream) {
      const data = await response.json();
      const choice = data.choices?.[0];
      if (!choice) { yield { type: 'done' }; return; }

      if (choice.message?.tool_calls) {
        for (const tc of choice.message.tool_calls) {
          yield {
            type: 'tool_call',
            toolCall: {
              id: tc.id,
              name: tc.function.name,
              arguments: (() => { try { return JSON.parse(tc.function.arguments); } catch { return {}; } })(),
            },
          };
        }
      }
      if (choice.message?.content) {
        yield { type: 'text', content: choice.message.content };
      }
      yield { type: 'done' };
      return;
    }

    // Streaming
    const reader = response.body?.getReader();
    if (!reader) { yield { type: 'done' }; return; }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentToolCall: { id: string; name: string; args: string } | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          if (currentToolCall) {
            try {
              yield {
                type: 'tool_call',
                toolCall: { id: currentToolCall.id, name: currentToolCall.name, arguments: JSON.parse(currentToolCall.args) },
              };
            } catch { /* invalid JSON */ }
          }
          yield { type: 'done' };
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            yield { type: 'text', content: delta.content };
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.id) {
                // Flush previous tool call
                if (currentToolCall) {
                  try {
                    yield {
                      type: 'tool_call',
                      toolCall: { id: currentToolCall.id, name: currentToolCall.name, arguments: JSON.parse(currentToolCall.args) },
                    };
                  } catch { /* partial */ }
                }
                currentToolCall = { id: tc.id, name: tc.function?.name ?? '', args: '' };
              }
              if (tc.function?.arguments && currentToolCall) {
                currentToolCall.args += tc.function.arguments;
              }
            }
          }
        } catch { /* skip invalid JSON */ }
      }
    }

    yield { type: 'done' };
  }

  async *functionCall(params: ChatParams): AsyncIterable<ChatChunk> {
    yield* this.chat(params);
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  estimateCost(params: ChatParams): CostEstimate | null {
    const model = OPENAI_MODELS.find((m) => m.id === (params.model || this.modelId));
    if (!model || !model.costPer1kInput || !model.costPer1kOutput) return null;
    const inputTokens = params.messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    const outputTokens = params.maxTokens ?? 2000;
    return {
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
      estimatedCostUsd: (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput,
      currency: 'USD',
    };
  }
}

export function createOpenAIProvider(config: ProviderConfig): AIProvider {
  return new OpenAIProvider(config);
}
