'use client';

import { useState, useMemo } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { sceneToAST } from '@design-studio/export';
import { ReactGenerator } from '@design-studio/export';
import { CSSGenerator } from '@design-studio/export';

interface ExportPanelProps {
  onClose: () => void;
}

type ExportTab = 'react' | 'css' | 'tokens';

export function ExportPanel({ onClose }: ExportPanelProps) {
  const [tab, setTab] = useState<ExportTab>('react');
  const [copied, setCopied] = useState(false);
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const { cssOutput, resolvedTokens } = useTokenStore();

  const reactOutput = useMemo(() => {
    const ast = sceneToAST(sceneGraph);
    const gen = new ReactGenerator();
    const files = gen.generate(ast);
    return files[0]?.content ?? '// No components on canvas';
  }, [sceneGraph]);

  const cssGeneratedOutput = useMemo(() => {
    const ast = sceneToAST(sceneGraph);
    const gen = new CSSGenerator();
    const files = gen.generate(ast);
    return files[0]?.content ?? '/* No styles */';
  }, [sceneGraph]);

  const tokensJson = useMemo(() => {
    return JSON.stringify(resolvedTokens, null, 2);
  }, [resolvedTokens]);

  const currentCode = tab === 'react' ? reactOutput : tab === 'css' ? cssGeneratedOutput : tokensJson;
  const currentLang = tab === 'react' ? 'tsx' : tab === 'css' ? 'css' : 'json';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = tab === 'react' ? 'Page.tsx' : tab === 'css' ? 'design-tokens.css' : 'tokens.json';
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">Export</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'react' as const, label: 'React' },
          { id: 'css' as const, label: 'CSS' },
          { id: 'tokens' as const, label: 'Tokens JSON' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-2.5 font-medium ${
              tab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Code preview */}
      <div className="flex-1 overflow-auto bg-gray-950 p-4">
        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
          {currentCode}
        </pre>
      </div>

      {/* Actions */}
      <div className="border-t p-3 flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 text-sm py-2 rounded-lg border font-medium ${
            copied ? 'bg-green-50 text-green-600 border-green-200' : 'hover:bg-gray-50'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 text-sm py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
        >
          Download
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-t text-[10px] text-gray-400">
        {Object.keys(sceneGraph.nodes).length} elements &middot;{' '}
        {Object.keys(resolvedTokens).length} tokens &middot;{' '}
        {currentCode.length} chars
      </div>
    </div>
  );
}
