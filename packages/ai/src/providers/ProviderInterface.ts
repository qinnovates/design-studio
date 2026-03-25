// ─── Model Info ──────────────────────────────────────────────
export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  supportsTools: boolean;
  supportsVision: boolean;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

// ─── Messages ────────────────────────────────────────────────
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string;
  toolCallId?: string;
}

// ─── Tool Definitions ────────────────────────────────────────
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

// ─── Streaming Chunks ────────────────────────────────────────
export type ChatChunkType = 'text' | 'tool_call' | 'tool_result' | 'done' | 'error';

export interface ChatChunk {
  type: ChatChunkType;
  content?: string;
  toolCall?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  };
  error?: string;
}

// ─── Request Params ──────────────────────────────────────────
export interface ChatParams {
  model: string;
  messages: Message[];
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stream: boolean;
}

// ─── Cost Estimate ───────────────────────────────────────────
export interface CostEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
  currency: 'USD';
}

// ─── Provider Interface ──────────────────────────────────────
export interface AIProvider {
  id: string;
  name: string;
  models: ModelInfo[];

  /** Stream a chat completion */
  chat(params: ChatParams): AsyncIterable<ChatChunk>;

  /** Stream a chat completion with function/tool calling */
  functionCall(params: ChatParams): AsyncIterable<ChatChunk>;

  /** Validate that an API key works */
  validateKey(apiKey: string): Promise<boolean>;

  /** Estimate cost for a request (null if provider doesn't support) */
  estimateCost(params: ChatParams): CostEstimate | null;
}

// ─── Provider Config ─────────────────────────────────────────
export interface ProviderConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  modelId?: string;
}
