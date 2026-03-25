'use client';

import { useState } from 'react';
import { useGuardrailStore, type Guardrail, type Preference } from '@/stores/guardrailStore';

interface GuardrailsPanelProps {
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  color: '🎨', typography: '🔤', layout: '📐', component: '🧩',
  spacing: '↔️', style: '✨', content: '📝', pattern: '🔄',
};

export function GuardrailsPanel({ onClose }: GuardrailsPanelProps) {
  const {
    getActiveGuardrails, getActivePreferences,
    guardrails, preferences,
    addGuardrail, addPreference,
    removeGuardrail, removePreference,
    toggleGuardrail, togglePreference,
    toFullPromptSection,
  } = useGuardrailStore();

  const [tab, setTab] = useState<'guardrails' | 'preferences' | 'prompt'>('guardrails');
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [newCategory, setNewCategory] = useState<Guardrail['category']>('style');

  const allGuardrails = Object.values(guardrails);
  const allPreferences = Object.values(preferences);
  const promptSection = toFullPromptSection();

  const handleAdd = () => {
    if (!newRule.trim()) return;
    if (tab === 'guardrails') {
      addGuardrail({ rule: newRule, category: newCategory, source: 'manual', sourceRefId: null, avoidValue: null, strength: 7, active: true });
    } else {
      addPreference({ rule: newRule, category: newCategory, source: 'manual', sourceRefId: null, preferValue: null, strength: 7, active: true });
    }
    setNewRule('');
    setShowAdd(false);
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Guardrails & Preferences</span>
          <span className="text-[10px] text-gray-400 block">
            {allGuardrails.filter((g) => g.active).length} guardrails · {allPreferences.filter((p) => p.active).length} preferences
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded" aria-label="Add rule">+ Add</button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">&times;</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'guardrails' as const, label: 'Don\'t Do', count: allGuardrails.length, color: 'text-red-600' },
          { id: 'preferences' as const, label: 'Do More', count: allPreferences.length, color: 'text-green-600' },
          { id: 'prompt' as const, label: 'AI Prompt', count: 0, color: 'text-blue-600' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-2.5 font-medium ${tab === t.id ? `${t.color} border-b-2 border-current` : 'text-gray-400'}`}
            aria-pressed={tab === t.id}
          >
            {t.label} {t.count > 0 && `(${t.count})`}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && tab !== 'prompt' && (
        <div className="p-3 border-b bg-gray-50 space-y-2">
          <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)}
            placeholder={tab === 'guardrails' ? 'What to avoid...' : 'What to do more of...'}
            className="w-full text-sm px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" autoFocus aria-label="Rule" />
          <div className="flex gap-2">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}
              className="text-xs border rounded px-2 py-1 bg-white" aria-label="Category">
              {Object.entries(CATEGORY_ICONS).map(([k, v]) => (
                <option key={k} value={k}>{v} {k}</option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={!newRule.trim()} className="text-xs bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'guardrails' && (
          <div className="divide-y">
            {allGuardrails.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <p className="mb-1">No guardrails yet</p>
                <p className="text-[10px]">Dislike a design element to auto-create a guardrail, or add one manually</p>
              </div>
            ) : (
              allGuardrails.map((g) => (
                <div key={g.id} className={`p-3 ${!g.active ? 'opacity-40' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[g.category] ?? '🚫'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-red-700">{g.rule}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded">{g.source}</span>
                        <span className="text-[9px] text-gray-400">{g.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => toggleGuardrail(g.id)} className="text-[9px] text-gray-400 hover:text-gray-600" aria-label={g.active ? 'Disable' : 'Enable'}>
                        {g.active ? 'on' : 'off'}
                      </button>
                      <button onClick={() => removeGuardrail(g.id)} className="text-[9px] text-gray-400 hover:text-red-500" aria-label="Remove">&times;</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'preferences' && (
          <div className="divide-y">
            {allPreferences.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                <p className="mb-1">No preferences yet</p>
                <p className="text-[10px]">Like a design element to auto-create a preference, or add one manually</p>
              </div>
            ) : (
              allPreferences.map((p) => (
                <div key={p.id} className={`p-3 ${!p.active ? 'opacity-40' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[p.category] ?? '✅'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700">{p.rule}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-green-50 text-green-500 px-1.5 py-0.5 rounded">{p.source}</span>
                        <span className="text-[9px] text-gray-400">{p.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => togglePreference(p.id)} className="text-[9px] text-gray-400 hover:text-gray-600" aria-label={p.active ? 'Disable' : 'Enable'}>
                        {p.active ? 'on' : 'off'}
                      </button>
                      <button onClick={() => removePreference(p.id)} className="text-[9px] text-gray-400 hover:text-red-500" aria-label="Remove">&times;</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'prompt' && (
          <div className="p-4">
            <p className="text-[10px] text-gray-500 mb-2">This text is injected into every AI prompt:</p>
            {promptSection ? (
              <pre className="text-[10px] bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {promptSection}
              </pre>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No guardrails or preferences set yet. Like and dislike design elements to build your prompt.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-[10px] text-gray-400">
        Likes build preferences. Dislikes create guardrails.
      </div>
    </div>
  );
}
