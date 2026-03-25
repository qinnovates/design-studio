'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import {
  CATEGORY_BENCHMARKS,
  generateMockAnalysis,
  getScoreLabel,
  getScoreColor,
  type MarketIntelReport,
  type MarketAnalysisRequest,
  type DimensionScore,
} from '@design-studio/ai';

interface MarketIntelProps {
  onClose: () => void;
}

export function MarketIntel({ onClose }: MarketIntelProps) {
  const manifest = useProjectStore((s) => s.manifest);
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const resolvedTokens = useTokenStore((s) => s.resolvedTokens);
  const screens = useProjectStore((s) => s.getScreenList)();

  const [report, setReport] = useState<MarketIntelReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState(manifest?.category ?? 'saas');
  const [audience, setAudience] = useState('');

  const categories = Object.entries(CATEGORY_BENCHMARKS).map(([id, b]) => ({
    id,
    label: b.displayName,
  }));

  const handleAnalyze = () => {
    setIsAnalyzing(true);

    const request: MarketAnalysisRequest = {
      category,
      targetAudience: audience || 'General users',
      appDescription: manifest?.description ?? 'App built with Design Studio',
      designTokens: resolvedTokens,
      components: Object.values(sceneGraph.nodes).map((n) => ({
        type: n.type === 'component' ? (n as any).componentId ?? n.type : n.type,
        name: n.name,
        variant: n.type === 'component' ? (n as any).variant ?? 'default' : 'default',
      })),
      screens: screens.map((s) => ({ name: s.name, type: s.type, route: s.route })),
      elementCount: Object.keys(sceneGraph.nodes).length,
    };

    // Simulate AI analysis (real impl calls BYOAI provider)
    setTimeout(() => {
      const result = generateMockAnalysis(request);
      setReport(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Market Intelligence</span>
          <span className="text-[10px] text-gray-400 block">Competitive analysis + readiness</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">&times;</button>
      </div>

      {/* Config */}
      {!report && (
        <div className="p-4 space-y-3 border-b">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">App Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="App category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Young professionals, 25-35, tech-savvy"
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Target audience"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            aria-label="Run market analysis"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Market Readiness'}
          </button>
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Analyzing competitive landscape...</p>
            <p className="text-[10px] text-gray-400 mt-1">Comparing against top {CATEGORY_BENCHMARKS[category]?.displayName} apps</p>
          </div>
        </div>
      )}

      {/* Report */}
      {report && !isAnalyzing && (
        <div className="flex-1 overflow-y-auto">
          {/* Overall score */}
          <div className="p-4 border-b" style={{ backgroundColor: `${getScoreColor(report.marketReadyScore)}10` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold" style={{ color: getScoreColor(report.marketReadyScore) }}>
                  {report.marketReadyScore}
                </p>
                <p className="text-xs text-gray-500">Market Ready Score</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: getScoreColor(report.marketReadyScore) }}>
                  {getScoreLabel(report.marketReadyScore)}
                </p>
                <p className="text-[10px] text-gray-400">
                  Confidence: {report.confidence}
                </p>
              </div>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="p-4 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dimensions</h4>
            <div className="space-y-2.5">
              {Object.entries(report.scores).map(([key, dim]) => (
                <ScoreDimension key={key} name={formatDimensionName(key)} dim={dim} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assessment</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
          </div>

          {/* Competitive landscape */}
          <div className="p-4 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Competitive Insights</h4>
            <div className="space-y-2">
              {report.competitiveLandscape.map((insight, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{insight.reference}</span>
                    <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                      {insight.source.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{insight.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top improvements */}
          <div className="p-4 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Improvements</h4>
            <div className="space-y-2">
              {report.improvements.map((imp) => (
                <div key={imp.id} className="border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{imp.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        imp.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        imp.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        imp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {imp.priority}
                      </span>
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        +{imp.scoreImpact}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600">{imp.description}</p>
                  <span className="text-[9px] text-gray-400 mt-1 inline-block">{imp.effort.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market signals */}
          <div className="p-4 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Market Signals</h4>
            <div className="space-y-1.5">
              {report.marketSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className={`mt-0.5 ${
                    signal.sentiment === 'positive' ? 'text-green-500' :
                    signal.sentiment === 'negative' ? 'text-red-500' :
                    'text-gray-400'
                  }`}>
                    {signal.sentiment === 'positive' ? '\u25B2' : signal.sentiment === 'negative' ? '\u25BC' : '\u25CF'}
                  </span>
                  <div>
                    <p className="text-gray-700">{signal.signal}</p>
                    <p className="text-gray-400">{signal.implication}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UX recommendations */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">UX Patterns</h4>
            <div className="space-y-2">
              {report.uxRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className={`mt-0.5 flex-shrink-0 ${rec.currentlyFollowing ? 'text-green-500' : 'text-yellow-500'}`}>
                    {rec.currentlyFollowing ? '\u2713' : '\u25CB'}
                  </span>
                  <div>
                    <p className="text-gray-700 font-medium">{rec.pattern}</p>
                    <p className="text-gray-400">{rec.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Re-analyze button */}
          <div className="p-4 border-t">
            <button
              onClick={() => setReport(null)}
              className="w-full py-2 text-sm border rounded-lg hover:bg-gray-50"
              aria-label="Run new analysis"
            >
              Run New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreDimension({ name, dim }: { name: string; dim: DimensionScore }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-600">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: getScoreColor(dim.score) }}>
            {dim.score}
          </span>
          {dim.gap > 0 && (
            <span className="text-[9px] text-gray-400">
              ({dim.gap} below benchmark)
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
        {/* Benchmark marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400 z-10"
          style={{ left: `${dim.benchmark}%` }}
          title={`Benchmark: ${dim.benchmark}`}
        />
        {/* Score bar */}
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }}
        />
      </div>
    </div>
  );
}

function formatDimensionName(key: string): string {
  const map: Record<string, string> = {
    categoryFit: 'Category Fit',
    intuitivenessScore: 'User Intuitiveness',
    professionalismScore: 'Professionalism',
    visualCompetitiveness: 'Visual Quality',
    uxPatternAdherence: 'UX Patterns',
    informationArchitecture: 'Info Architecture',
    conversionReadiness: 'Conversion Ready',
  };
  return map[key] ?? key;
}
