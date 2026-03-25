import type { AIProvider, ChatParams, ChatChunk, ModelInfo, CostEstimate, ProviderConfig } from './ProviderInterface';

const ANTHROPIC_MODELS: ModelInfo[] = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', contextWindow: 200000, supportsTools: true, supportsVision: true, costPer1kInput: 0.003, costPer1kOutput: 0.015 },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', contextWindow: 1000000, supportsTools: true, supportsVision: true, costPer1kInput: 0.015, costPer1kOutput: 0.075 },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000, supportsTools: true, supportsVision: true, costPer1kInput: 0.0008, costPer1kOutput: 0.004 },
];

export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic';
  models = ANTHROPIC_MODELS;

  private apiKey: string;
  private baseUrl: string;
  private modelId: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com';
    this.modelId = config.modelId ?? 'claude-sonnet-4-6';
  }

  async *chat(params: ChatParams): AsyncIterable<ChatChunk> {
    const model = params.model || this.modelId;
    const systemMsg = params.messages.find((m) => m.role === 'system');
    const userMsgs = params.messages.filter((m) => m.role !== 'system');

    const body: Record<string, unknown> = {
      model,
      max_tokens: params.maxTokens ?? 4096,
      stream: params.stream,
      messages: userMsgs.map((m) => ({ role: m.role === 'tool' ? 'user' : m.role, content: m.content })),
    };

    if (systemMsg) body.system = systemMsg.content;
    if (params.temperature !== undefined) body.temperature = params.temperature;

    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: {
          type: 'object',
          properties: Object.fromEntries(
            t.parameters.map((p) => [p.name, { type: p.type, description: p.description, ...(p.enum ? { enum: p.enum } : {}) }]),
          ),
          required: t.parameters.filter((p) => p.required).map((p) => p.name),
        },
      }));
    }

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      yield { type: 'error', error: `Anthropic API error: ${response.status} ${response.statusText}` };
      return;
    }

    if (!params.stream) {
      const data = await response.json();
      for (const block of data.content ?? []) {
        if (block.type === 'text') yield { type: 'text', content: block.text };
        if (block.type === 'tool_use') {
          yield { type: 'tool_call', toolCall: { id: block.id, name: block.name, arguments: block.input } };
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
    let currentToolId = '';
    let currentToolName = '';
    let toolInputBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const event = JSON.parse(trimmed.slice(6));

          if (event.type === 'content_block_start') {
            if (event.content_block?.type === 'tool_use') {
              currentToolId = event.content_block.id;
              currentToolName = event.content_block.name;
              toolInputBuffer = '';
            }
          }

          if (event.type === 'content_block_delta') {
            if (event.delta?.type === 'text_delta') {
              yield { type: 'text', content: event.delta.text };
            }
            if (event.delta?.type === 'input_json_delta') {
              toolInputBuffer += event.delta.partial_json;
            }
          }

          if (event.type === 'content_block_stop' && currentToolId) {
            try {
              yield {
                type: 'tool_call',
                toolCall: { id: currentToolId, name: currentToolName, arguments: JSON.parse(toolInputBuffer) },
              };
            } catch { /* partial JSON */ }
            currentToolId = '';
            currentToolName = '';
            toolInputBuffer = '';
          }

          if (event.type === 'message_stop') {
            yield { type: 'done' };
            return;
          }
        } catch { /* skip */ }
      }
    }

    yield { type: 'done' };
  }

  async *functionCall(params: ChatParams): AsyncIterable<ChatChunk> {
    yield* this.chat(params);
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  estimateCost(params: ChatParams): CostEstimate | null {
    const model = ANTHROPIC_MODELS.find((m) => m.id === (params.model || this.modelId));
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

export function createAnthropicProvider(config: ProviderConfig): AIProvider {
  return new AnthropicProvider(config);
}
