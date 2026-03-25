import { create } from 'zustand';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: { id: string; name: string; arguments: Record<string, unknown>; result?: string }[];
  timestamp: string;
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter';
  apiKey: string;
  baseUrl?: string;
  modelId: string;
}

interface AIState {
  // Config
  providerConfig: AIProviderConfig | null;
  isConfigured: boolean;

  // Chat
  messages: AIMessage[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  // Cost tracking
  totalTokensUsed: number;
  estimatedCostUsd: number;

  // Actions
  setProviderConfig: (config: AIProviderConfig) => void;
  clearConfig: () => void;
  addMessage: (message: AIMessage) => void;
  setStreaming: (isStreaming: boolean) => void;
  appendStreamContent: (content: string) => void;
  clearStreamContent: () => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  addTokenUsage: (tokens: number, costUsd: number) => void;
}

let msgCounter = 0;

export function createMessageId(): string {
  return `msg-${Date.now().toString(36)}-${msgCounter++}`;
}

export const useAIStore = create<AIState>()((set) => ({
  providerConfig: null,
  isConfigured: false,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  error: null,
  totalTokensUsed: 0,
  estimatedCostUsd: 0,

  setProviderConfig: (config) =>
    set({ providerConfig: config, isConfigured: true, error: null }),

  clearConfig: () =>
    set({ providerConfig: null, isConfigured: false }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setStreaming: (isStreaming) =>
    set({ isStreaming }),

  appendStreamContent: (content) =>
    set((state) => ({ streamingContent: state.streamingContent + content })),

  clearStreamContent: () =>
    set({ streamingContent: '' }),

  setError: (error) =>
    set({ error, isStreaming: false }),

  clearMessages: () =>
    set({ messages: [], streamingContent: '', error: null }),

  addTokenUsage: (tokens, costUsd) =>
    set((state) => ({
      totalTokensUsed: state.totalTokensUsed + tokens,
      estimatedCostUsd: state.estimatedCostUsd + costUsd,
    })),
}));
