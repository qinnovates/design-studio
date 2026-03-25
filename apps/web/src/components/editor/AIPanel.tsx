'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAIStore, createMessageId, type AIMessage } from '@/stores/aiStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import {
  ProviderRegistry,
  createOpenAIProvider,
  createAnthropicProvider,
  createOllamaProvider,
  DESIGN_TOOLS,
  buildSystemPrompt,
  serializeSceneForAI,
} from '@design-studio/ai';
import type { AIProvider, ChatChunk, Message } from '@design-studio/ai';
import {
  createComponentNode,
  createTextNode,
  createFrameNode,
  removeNode,
} from '@design-studio/canvas';
import { AISettings } from './AISettings';
import { validateToolCall } from '@/lib/toolValidation';

interface AIPanelProps {
  onClose: () => void;
}

const SUGGESTIONS = [
  'Add a login form',
  'Create a navigation bar',
  'Make the colors warmer',
  'Suggest a layout for a dashboard',
];

function getOrCreateProvider(): AIProvider | null {
  const config = useAIStore.getState().providerConfig;
  if (!config) return null;

  if (!ProviderRegistry.has(config.provider)) {
    if (config.provider === 'openai') ProviderRegistry.register('openai', createOpenAIProvider);
    if (config.provider === 'anthropic') ProviderRegistry.register('anthropic', createAnthropicProvider);
    if (config.provider === 'ollama') ProviderRegistry.register('ollama', createOllamaProvider);
  }

  return ProviderRegistry.create(config);
}

function processToolCall(name: string, args: Record<string, unknown>): string {
  const validation = validateToolCall(name, args);
  if (!validation.valid) {
    return `Tool call rejected: ${validation.error}`;
  }
  const validArgs = validation.data;

  const canvas = useCanvasStore.getState();
  const tokens = useTokenStore.getState();

  switch (name) {
    case 'add_component': {
      const node = createComponentNode(
        validArgs.componentId,
        validArgs.name || 'Component',
        {
          x: validArgs.x || 0,
          y: validArgs.y || 0,
          width: validArgs.width || 200,
          height: validArgs.height || 48,
          variant: validArgs.variant || 'default',
          props: validArgs.props || {},
        },
      );
      canvas.addNodeToScene(node);
      return `Added ${validArgs.componentId} "${validArgs.name}" at (${validArgs.x}, ${validArgs.y})`;
    }
    case 'add_text': {
      const node = createTextNode(
        validArgs.content || 'Text',
        {
          x: validArgs.x || 0,
          y: validArgs.y || 0,
          width: validArgs.width || 200,
          height: 32,
          fontSize: validArgs.fontSize || 16,
          fontWeight: validArgs.fontWeight || 400,
          textAlign: validArgs.textAlign || 'left',
        },
      );
      canvas.addNodeToScene(node);
      return `Added text "${validArgs.content?.slice(0, 30)}" at (${validArgs.x}, ${validArgs.y})`;
    }
    case 'add_frame': {
      const node = createFrameNode(
        validArgs.name || 'Frame',
        {
          x: validArgs.x || 0,
          y: validArgs.y || 0,
          width: validArgs.width || 400,
          height: validArgs.height || 300,
          fill: validArgs.fill || null,
        },
      );
      canvas.addNodeToScene(node);
      return `Added frame "${validArgs.name}" at (${validArgs.x}, ${validArgs.y}) ${validArgs.width}x${validArgs.height}`;
    }
    case 'modify_element': {
      canvas.updateNodeProps(validArgs.nodeId, validArgs.updates);
      return `Modified element ${validArgs.nodeId}`;
    }
    case 'remove_element': {
      canvas.selectNodes([validArgs.nodeId]);
      canvas.removeSelectedNodes();
      return `Removed element ${validArgs.nodeId}`;
    }
    case 'update_token': {
      tokens.updateToken(validArgs.tokenName, validArgs.value);
      return `Updated token ${validArgs.tokenName} = ${validArgs.value}`;
    }
    case 'suggest_layout': {
      return `Suggestion: ${validArgs.suggestion}\nReason: ${validArgs.reason}`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

export function AIPanel({ onClose }: AIPanelProps) {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    streamingContent,
    isConfigured,
    error,
    estimatedCostUsd,
    addMessage,
    setStreaming,
    appendStreamContent,
    clearStreamContent,
    setError,
    clearMessages,
    addTokenUsage,
  } = useAIStore();

  const sceneGraph = useCanvasStore((s) => s.sceneGraph);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const provider = getOrCreateProvider();
    if (!provider) {
      setShowSettings(true);
      return;
    }

    // Add user message
    const userMsg: AIMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput('');
    setError(null);
    setStreaming(true);
    clearStreamContent();

    try {
      // Build context
      const sceneContext = serializeSceneForAI(sceneGraph);
      const systemPrompt = buildSystemPrompt(sceneContext);
      const config = useAIStore.getState().providerConfig!;

      // Build message history
      const chatMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as Message['role'], content: m.content })),
        { role: 'user' as const, content: text },
      ];

      // Stream response
      let fullContent = '';
      const toolCalls: AIMessage['toolCalls'] = [];

      const stream = provider.functionCall({
        model: config.modelId,
        messages: chatMessages,
        tools: DESIGN_TOOLS,
        stream: true,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'text' && chunk.content) {
          fullContent += chunk.content;
          appendStreamContent(chunk.content);
        } else if (chunk.type === 'tool_call' && chunk.toolCall) {
          const result = processToolCall(chunk.toolCall.name, chunk.toolCall.arguments);
          toolCalls.push({
            id: chunk.toolCall.id,
            name: chunk.toolCall.name,
            arguments: chunk.toolCall.arguments,
            result,
          });
        } else if (chunk.type === 'error') {
          setError(chunk.error || 'Unknown error');
          break;
        }
      }

      // Estimate tokens (rough: 4 chars per token)
      const estimatedTokens = Math.ceil((systemPrompt.length + fullContent.length) / 4);
      const costPerToken = 0.000003; // rough average
      addTokenUsage(estimatedTokens, estimatedTokens * costPerToken);

      // Add assistant message
      const assistantMsg: AIMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: fullContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setStreaming(false);
      clearStreamContent();
    }
  }, [isStreaming, sceneGraph, messages, addMessage, setError, setStreaming, appendStreamContent, clearStreamContent, addTokenUsage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Render ──────────────────────────────────────────
  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <span className="text-sm font-medium">AI Assistant</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="AI Settings"
            aria-label="AI settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear chat"
              aria-label="Clear conversation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close panel">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" role="log" aria-label="AI conversation" aria-live="polite">
        {!isConfigured && messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm font-medium mb-1">Design with AI</p>
            <p className="text-xs text-gray-400 mb-4">Connect your AI provider to get started</p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Configure AI
            </button>
          </div>
        )}

        {isConfigured && messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm font-medium mb-1">Design with AI</p>
            <p className="text-xs text-gray-400 mb-4">Describe what you want in plain English</p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs px-3 py-2 border rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {msg.toolCalls.map((tc) => (
                    <div key={tc.id} className="text-[10px] bg-white/10 rounded px-2 py-1 font-mono">
                      <span className="opacity-70">{tc.name}</span>
                      {tc.result && <span className="block text-green-300">{tc.result}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs bg-gray-100 text-gray-800 leading-relaxed">
              {streamingContent ? (
                <p className="whitespace-pre-wrap">{streamingContent}<span className="animate-pulse">|</span></p>
              ) : (
                <span className="text-gray-400 animate-pulse">Thinking...</span>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Cost tracker */}
      {estimatedCostUsd > 0 && (
        <div className="px-3 py-1 border-t bg-gray-50 text-[10px] text-gray-400 text-center">
          ~${estimatedCostUsd.toFixed(4)} estimated cost
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConfigured ? 'Describe what you want...' : 'Configure AI first...'}
            disabled={isStreaming || !isConfigured}
            aria-label="Message to AI assistant"
            className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            disabled={!input.trim() || isStreaming || !isConfigured}
            aria-label="Send message"
          >
            {isStreaming ? '...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Settings modal */}
      {showSettings && <AISettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
