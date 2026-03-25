'use client';

import { useState } from 'react';
import { useBrandStore } from '@/stores/brandStore';
import {
  BRAND_PERSONAS,
  generateMockBrandTest,
  getNameScoreLabel,
  getNameScoreColor,
  type BrandTestReport,
  type BrandTestRequest,
  type NameConflict,
  type TaglineAnalysis,
  type GeneratedName,
  type GeneratedTagline,
} from '@design-studio/ai';

interface BrandIntelPanelProps {
  onClose: () => void;
}

export function BrandIntelPanel({ onClose }: BrandIntelPanelProps) {
  const brief = useBrandStore((s) => s.brief);
  const [report, setReport] = useState<BrandTestReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customName, setCustomName] = useState(brief.appName);
  const [customTaglines, setCustomTaglines] = useState(brief.tagline ? [brief.tagline] : []);
  const [newTagline, setNewTagline] = useState('');
  const [activeTab, setActiveTab] = useState<'name' | 'taglines' | 'alternatives'>('name');

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    const request: BrandTestRequest = {
      name: customName || brief.appName || 'Untitled',
      taglines: customTaglines,
      category: brief.category || 'saas',
      audience: brief.targetAudience || 'General',
      competitors: brief.competitors,
      description: brief.description || brief.elevatorPitch || '',
    };

    setTimeout(() => {
      const result = generateMockBrandTest(request);
      setReport(result);
      setIsAnalyzing(false);
    }, 1800);
  };

  const addTagline = () => {
    if (newTagline.trim() && !customTaglines.includes(newTagline.trim())) {
      setCustomTaglines([...customTaglines, newTagline.trim()]);
      setNewTagline('');
    }
  };

  return (
    <div className="w-96 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Brand Intelligence</span>
          <span className="text-[10px] text-gray-400 block">Name + tagline testing</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">&times;</button>
      </div>

      {/* Input section */}
      {!report && (
        <div className="p-4 space-y-3 border-b">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">App Name</label>
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your app name..." className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="App name to test" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Tagline Candidates</label>
            <div className="space-y-1 mb-2">
              {customTaglines.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded px-2 py-1">
                  <span className="text-xs text-gray-700 flex-1 truncate">{t}</span>
                  <button onClick={() => setCustomTaglines(customTaglines.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 text-xs" aria-label="Remove tagline">&times;</button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input type="text" value={newTagline} onChange={(e) => setNewTagline(e.target.value)}
                placeholder="Add a tagline candidate..." className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTagline())} aria-label="New tagline" />
              <button onClick={addTagline} className="text-xs bg-gray-100 px-2 py-1.5 rounded hover:bg-gray-200">+</button>
            </div>
          </div>

          {/* Persona preview */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1.5">Evaluated by {BRAND_PERSONAS.length} AI personas:</p>
            <div className="flex gap-1.5">
              {BRAND_PERSONAS.map((p) => (
                <div key={p.id} className="text-center" title={`${p.name}: ${p.evaluationFocus}`}>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{p.avatar}</div>
                  <span className="text-[8px] text-gray-400">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={isAnalyzing || !customName.trim()}
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50" aria-label="Run brand analysis">
            {isAnalyzing ? 'Analyzing...' : 'Test Brand'}
          </button>
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-1.5 mb-3 justify-center">
              {BRAND_PERSONAS.map((p, i) => (
                <div key={p.id} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}>{p.avatar}</div>
              ))}
            </div>
            <p className="text-sm text-gray-500">AI personas evaluating "{customName}"...</p>
          </div>
        </div>
      )}

      {/* Report */}
      {report && !isAnalyzing && (
        <>
          {/* Overall score */}
          <div className="p-4 border-b" style={{ backgroundColor: `${getNameScoreColor(report.brandStrength)}10` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold" style={{ color: getNameScoreColor(report.brandStrength) }}>{report.brandStrength}</p>
                <p className="text-[10px] text-gray-500">Brand Strength</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: getNameScoreColor(report.brandStrength) }}>
                  {getNameScoreLabel(report.brandStrength)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {report.nameAnalysis.conflicts.filter((c) => c.severity !== 'info').length} conflicts
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{report.recommendation}</p>
          </div>

          {/* Preview Mode */}
          <div className="mx-4 mt-3 px-2 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-700 flex items-center gap-1.5">
            Preview Mode — connect AI provider for real trademark research
          </div>

          {/* Tabs */}
          <div className="flex border-b mt-2">
            {[
              { id: 'name' as const, label: 'Name Analysis' },
              { id: 'taglines' as const, label: `Taglines (${report.taglineAnalyses.length})` },
              { id: 'alternatives' as const, label: 'Alternatives' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-xs py-2 font-medium ${activeTab === tab.id ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
                aria-pressed={activeTab === tab.id}>{tab.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'name' && (
              <div className="p-4 space-y-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">"{report.nameAnalysis.name}" Scores</h4>
                <div className="space-y-2">
                  {Object.entries(report.nameAnalysis.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[11px] text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-[11px] font-mono" style={{ color: getNameScoreColor(value) }}>{value}/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${value * 10}%`, backgroundColor: getNameScoreColor(value) }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conflicts */}
                {report.nameAnalysis.conflicts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conflicts Found</h4>
                    <div className="space-y-1.5">
                      {report.nameAnalysis.conflicts.map((c, i) => (
                        <div key={i} className={`p-2 rounded text-xs ${
                          c.severity === 'blocking' ? 'bg-red-50 text-red-700 border border-red-200' :
                          c.severity === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          <span className="font-medium capitalize">{c.severity}:</span> {c.description}
                          <span className="text-[9px] block mt-0.5 opacity-70">Source: {c.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {report.nameAnalysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                      {report.nameAnalysis.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-blue-500 mt-0.5 flex-shrink-0">-</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'taglines' && (
              <div className="p-4 space-y-3">
                {report.taglineAnalyses.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No taglines to analyze. Add some above.</p>
                ) : (
                  report.taglineAnalyses.map((ta, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-800 flex-1">"{ta.tagline}"</p>
                        <span className="text-xs font-mono ml-2" style={{ color: getNameScoreColor(ta.overall) }}>{ta.overall}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(ta.scores).map(([k, v]) => (
                          <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded ${v >= 7 ? 'bg-green-50 text-green-600' : v >= 5 ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'}`}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                      {ta.weaknesses.length > 0 && (
                        <p className="text-[10px] text-gray-400 mb-1">Weaknesses: {ta.weaknesses.join(', ')}</p>
                      )}
                      <div className="bg-blue-50 rounded p-1.5 mt-1">
                        <p className="text-[10px] text-blue-700">Improved: "{ta.improvedVersion}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'alternatives' && (
              <div className="p-4 space-y-4">
                {/* Alternative names */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alternative Names</h4>
                  <div className="space-y-2">
                    {report.alternativeNames.map((alt, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50">
                        <span className="text-sm font-bold text-gray-800 min-w-[80px]">{alt.name}</span>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500">{alt.rationale}</p>
                          <div className="flex gap-1.5 mt-1">
                            <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{alt.style}</span>
                            <span className="text-[9px] font-mono" style={{ color: getNameScoreColor(alt.score) }}>{alt.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative taglines */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alternative Taglines</h4>
                  <div className="space-y-2">
                    {report.alternativeTaglines.map((alt, i) => (
                      <div key={i} className="p-2 border rounded-lg hover:bg-gray-50">
                        <p className="text-xs font-medium text-gray-800">"{alt.tagline}"</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{alt.rationale}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{alt.style}</span>
                          <span className="text-[9px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded">{alt.personaFit}</span>
                          <span className="text-[9px] font-mono" style={{ color: getNameScoreColor(alt.score) }}>{alt.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 flex justify-between">
            <button onClick={() => setReport(null)} className="text-xs text-gray-500 hover:text-gray-700" aria-label="Run new test">
              Test Another Name
            </button>
            <button onClick={() => {
              if (report.alternativeTaglines[0]) {
                setCustomTaglines([...customTaglines, report.alternativeTaglines[0].tagline]);
              }
              setReport(null);
            }} className="text-xs text-purple-600 hover:text-purple-700 font-medium" aria-label="Use top suggestion">
              Use Top Suggestion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
