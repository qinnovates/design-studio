'use client';

import { useState } from 'react';
import { useFeatureStore, type Feature, type FeatureStatus, type FeaturePriority } from '@/stores/featureStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFeedbackStore } from '@/stores/feedbackStore';

interface FeatureTrackerProps {
  onClose: () => void;
}

const STATUS_CONFIG: Record<FeatureStatus, { label: string; color: string; bg: string }> = {
  proposed: { label: 'Proposed', color: 'text-gray-600', bg: 'bg-gray-100' },
  approved: { label: 'Approved', color: 'text-blue-600', bg: 'bg-blue-100' },
  'in-design': { label: 'In Design', color: 'text-purple-600', bg: 'bg-purple-100' },
  'in-review': { label: 'In Review', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  shipped: { label: 'Shipped', color: 'text-green-600', bg: 'bg-green-100' },
  cut: { label: 'Cut', color: 'text-red-600', bg: 'bg-red-100' },
};

const PRIORITY_CONFIG: Record<FeaturePriority, { label: string; color: string }> = {
  'p0-critical': { label: 'P0', color: 'bg-red-500 text-white' },
  'p1-high': { label: 'P1', color: 'bg-orange-500 text-white' },
  'p2-medium': { label: 'P2', color: 'bg-yellow-500 text-white' },
  'p3-low': { label: 'P3', color: 'bg-gray-400 text-white' },
};

export function FeatureTracker({ onClose }: FeatureTrackerProps) {
  const { features, addFeature, moveFeature, removeFeature, getStats, approveFeature } = useFeatureStore();
  const screens = useProjectStore((s) => s.getScreenList)();
  const getSummary = useFeedbackStore((s) => s.getSummary);
  const stats = getStats();

  const [filter, setFilter] = useState<FeatureStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<FeaturePriority>('p2-medium');

  const allFeatures = Object.values(features);
  const filtered = filter === 'all' ? allFeatures : allFeatures.filter((f) => f.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<FeaturePriority, number> = { 'p0-critical': 0, 'p1-high': 1, 'p2-medium': 2, 'p3-low': 3 };
    return order[a.priority] - order[b.priority];
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addFeature({
      title: newTitle,
      description: newDesc,
      status: 'proposed',
      priority: newPriority,
      screenIds: [],
      taskIds: [],
      proposedBy: 'You',
      approvedBy: [],
      tags: [],
      milestoneId: null,
      notes: '',
    });
    setNewTitle('');
    setNewDesc('');
    setShowAdd(false);
  };

  // Calculate feedback score for a feature from its linked screens
  const getFeatureFeedback = (feat: Feature): number => {
    return feat.screenIds.reduce((sum, sid) => {
      const summary = getSummary(`screen-${sid}`);
      return sum + (summary?.score ?? 0);
    }, 0);
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Features</span>
          <span className="text-[10px] text-gray-400 block">{stats.total} total, {stats.shippedThisMonth} shipped this month</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" aria-label="Add feature">+ Add</button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">&times;</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 border-b bg-gray-50 flex gap-2 text-[10px]">
        {(Object.entries(STATUS_CONFIG) as [FeatureStatus, typeof STATUS_CONFIG[FeatureStatus]][]).map(([status, cfg]) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            className={`px-1.5 py-0.5 rounded ${filter === status ? cfg.bg + ' ' + cfg.color + ' font-medium' : 'text-gray-400 hover:text-gray-600'}`}
            aria-pressed={filter === status}
          >
            {cfg.label} {stats.byStatus[status] > 0 && `(${stats.byStatus[status]})`}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-3 border-b bg-gray-50 space-y-2">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Feature title..." className="w-full text-sm px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" autoFocus aria-label="Feature title" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description..." className="w-full text-sm px-2 py-1.5 border rounded h-16 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Feature description" />
          <div className="flex items-center gap-2">
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as FeaturePriority)}
              className="text-xs border rounded px-2 py-1 bg-white" aria-label="Priority">
              {(Object.entries(PRIORITY_CONFIG) as [FeaturePriority, typeof PRIORITY_CONFIG[FeaturePriority]][]).map(([p, cfg]) => (
                <option key={p} value={p}>{cfg.label} — {p.split('-')[1]}</option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={!newTitle.trim()} className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-xs text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Feature list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            {filter === 'all' ? 'No features yet' : `No ${STATUS_CONFIG[filter].label.toLowerCase()} features`}
          </div>
        ) : (
          <div className="divide-y">
            {sorted.map((feat) => {
              const statusCfg = STATUS_CONFIG[feat.status];
              const priorityCfg = PRIORITY_CONFIG[feat.priority];
              const feedback = getFeatureFeedback(feat);

              return (
                <div key={feat.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${priorityCfg.color}`}>{priorityCfg.label}</span>
                      <span className="text-sm font-medium truncate max-w-[160px]">{feat.title}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>

                  {feat.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{feat.description}</p>
                  )}

                  {/* Linked screens */}
                  {feat.screenIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {feat.screenIds.map((sid) => {
                        const screen = screens.find((s) => s.id === sid);
                        return screen ? (
                          <span key={sid} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{screen.name}</span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Feedback + actions row */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      {feedback !== 0 && (
                        <span className={feedback > 0 ? 'text-green-500' : 'text-red-500'}>
                          {feedback > 0 ? '+' : ''}{feedback} feedback
                        </span>
                      )}
                      {feat.approvedBy.length > 0 && (
                        <span className="text-blue-500">{feat.approvedBy.length} approvals</span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {feat.status === 'proposed' && (
                        <button onClick={() => approveFeature(feat.id, 'You')}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200" aria-label="Approve feature">
                          Approve
                        </button>
                      )}
                      {feat.status !== 'shipped' && feat.status !== 'cut' && (
                        <select
                          value={feat.status}
                          onChange={(e) => moveFeature(feat.id, e.target.value as FeatureStatus)}
                          className="text-[9px] border rounded px-1 py-0.5 bg-white"
                          aria-label="Change status"
                        >
                          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                            <option key={s} value={s}>{cfg.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="border-t p-3 text-[10px] text-gray-400 flex justify-between">
        <span>Features linked to screens feed pipeline gates</span>
        <span>{stats.byPriority['p0-critical']} P0 · {stats.byPriority['p1-high']} P1</span>
      </div>
    </div>
  );
}
