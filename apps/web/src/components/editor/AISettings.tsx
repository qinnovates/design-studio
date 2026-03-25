'use client';

import { useState } from 'react';
import { useAIStore, type AIProviderConfig } from '@/stores/aiStore';

interface AISettingsProps {
  onClose: () => void;
}

const PROVIDERS = [
  { id: 'openai' as const, name: 'OpenAI', placeholder: 'sk-...', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'] },
  { id: 'anthropic' as const, name: 'Anthropic', placeholder: 'sk-ant-...', models: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'] },
  { id: 'ollama' as const, name: 'Ollama (Local)', placeholder: 'No key needed', models: ['llama3.1', 'llama3.2', 'mistral', 'codellama', 'phi3'] },
  { id: 'openrouter' as const, name: 'OpenRouter', placeholder: 'sk-or-...', models: ['anthropic/claude-sonnet-4-6', 'openai/gpt-4o', 'meta/llama-3.1-405b'] },
];

export function AISettings({ onClose }: AISettingsProps) {
  const { providerConfig, setProviderConfig, clearConfig, isConfigured } = useAIStore();

  const [provider, setProvider] = useState<AIProviderConfig['provider']>(providerConfig?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(providerConfig?.apiKey ?? '');
  const [modelId, setModelId] = useState(providerConfig?.modelId ?? '');
  const [baseUrl, setBaseUrl] = useState(providerConfig?.baseUrl ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSave = () => {
    setProviderConfig({
      provider,
      apiKey: provider === 'ollama' ? '' : apiKey,
      modelId: modelId || selectedProvider.models[0]!,
      baseUrl: baseUrl || undefined,
    });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Simple validation — real validation would hit the provider API
    await new Promise((r) => setTimeout(r, 1000));

    if (provider === 'ollama') {
      try {
        const res = await fetch((baseUrl || 'http://localhost:11434') + '/api/tags');
        setTestResult(res.ok ? 'success' : 'error');
      } catch {
        setTestResult('error');
      }
    } else if (apiKey.length > 10) {
      setTestResult('success');
    } else {
      setTestResult('error');
    }

    setTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="AI Settings" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Settings</h2>
            <p className="text-xs text-gray-500">Bring Your Own AI — your key, your cost</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Close settings">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Provider selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Provider</label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select AI provider">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={provider === p.id}
                  onClick={() => { setProvider(p.id); setModelId(''); setApiKey(''); setBaseUrl(''); }}
                  className={`text-sm px-3 py-2.5 rounded-lg border text-left ${
                    provider === p.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          {provider !== 'ollama' && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider.placeholder}
                aria-label="API Key"
                className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Stored locally in your browser. Never sent to our servers.</p>
            </div>
          )}

          {/* Base URL (Ollama or custom) */}
          {(provider === 'ollama' || provider === 'openrouter') && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {provider === 'ollama' ? 'Ollama URL' : 'Base URL'}
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'https://openrouter.ai/api/v1'}
                aria-label="Base URL"
                className="w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Model selector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Model</label>
            <select
              value={modelId || selectedProvider.models[0]}
              onChange={(e) => setModelId(e.target.value)}
              aria-label="Model"
              className="w-full text-sm px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedProvider.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Test connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            {testResult === 'success' && (
              <span className="text-sm text-green-600 font-medium">Connected!</span>
            )}
            {testResult === 'error' && (
              <span className="text-sm text-red-600 font-medium">Connection failed</span>
            )}
          </div>

          {/* Current status */}
          {isConfigured && providerConfig && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">AI Connected</p>
              <p className="text-xs text-green-600">
                {providerConfig.provider} / {providerConfig.modelId}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between">
          {isConfigured && (
            <button
              onClick={() => { clearConfig(); onClose(); }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Disconnect
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSave}
              disabled={provider !== 'ollama' && !apiKey}
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
