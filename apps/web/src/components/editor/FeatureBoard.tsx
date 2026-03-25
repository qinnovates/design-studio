'use client';

import { useState } from 'react';
import { useFeatureStore, type Feature, type FeatureStatus, type FeaturePriority } from '@/stores/featureStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useUIStore } from '@/stores/uiStore';

const COLUMNS: { id: FeatureStatus; label: string; color: string; bg: string }[] = [
  { id: 'proposed', label: 'Backlog', color: 'border-gray-300', bg: 'bg-gray-50' },
  { id: 'approved', label: 'Roadmap', color: 'border-blue-300', bg: 'bg-blue-50' },
  { id: 'in-design', label: 'In Design', color: 'border-purple-300', bg: 'bg-purple-50' },
  { id: 'in-review', label: 'In Review', color: 'border-yellow-300', bg: 'bg-yellow-50' },
  { id: 'shipped', label: 'Shipped', color: 'border-green-300', bg: 'bg-green-50' },
];

const PRIORITY_BADGE: Record<FeaturePriority, { label: string; color: string }> = {
  'p0-critical': { label: 'P0', color: 'bg-red-500 text-white' },
  'p1-high': { label: 'P1', color: 'bg-orange-500 text-white' },
  'p2-medium': { label: 'P2', color: 'bg-yellow-400 text-white' },
  'p3-low': { label: 'P3', color: 'bg-gray-400 text-white' },
};

export function FeatureBoard() {
  const { features, addFeature, moveFeature, removeFeature, getByStatus, getStats } = useFeatureStore();
  const screens = useProjectStore((s) => s.getScreenList)();
  const setActiveScreen = useProjectStore((s) => s.setActiveScreen);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const getSummary = useFeedbackStore((s) => s.getSummary);
  const stats = getStats();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<FeatureStatus | null>(null);
  const [addingTo, setAddingTo] = useState<FeatureStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<FeaturePriority>('p2-medium');

  const handleDragStart = (featureId: string) => {
    setDraggedId(featureId);
  };

  const handleDragOver = (e: React.DragEvent, column: FeatureStatus) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (column: FeatureStatus) => {
    if (draggedId) {
      moveFeature(draggedId, column);
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleAdd = (column: FeatureStatus) => {
    if (!newTitle.trim()) return;
    addFeature({
      title: newTitle,
      description: '',
      status: column,
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
    setAddingTo(null);
  };

  const getFeatureFeedback = (feat: Feature): number => {
    return feat.screenIds.reduce((sum, sid) => {
      const summary = getSummary(`screen-${sid}`);
      return sum + (summary?.score ?? 0);
    }, 0);
  };

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-12 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Feature Board</h2>
          <span className="text-[10px] text-gray-400">
            {stats.total} features · {stats.byStatus.shipped} shipped · {stats.byPriority['p0-critical']} critical
          </span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((column) => {
            const columnFeatures = getByStatus(column.id);
            const isDropTarget = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                className={`w-72 flex flex-col rounded-xl border-2 ${isDropTarget ? column.color + ' bg-opacity-50' : 'border-transparent'}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column header */}
                <div className={`px-3 py-2.5 rounded-t-xl ${column.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{column.label}</span>
                    <span className="text-[10px] bg-white/80 text-gray-500 px-1.5 py-0.5 rounded-full">{columnFeatures.length}</span>
                  </div>
                  <button
                    onClick={() => setAddingTo(addingTo === column.id ? null : column.id)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                    aria-label={`Add feature to ${column.label}`}
                  >
                    +
                  </button>
                </div>

                {/* Add inline form */}
                {addingTo === column.id && (
                  <div className="p-2 bg-white border-b space-y-1.5">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Feature title..."
                      className="w-full text-xs px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd(column.id)}
                      aria-label="Feature title"
                    />
                    <div className="flex gap-1.5">
                      <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as FeaturePriority)}
                        className="text-[10px] border rounded px-1.5 py-1 bg-white" aria-label="Priority">
                        <option value="p0-critical">P0</option>
                        <option value="p1-high">P1</option>
                        <option value="p2-medium">P2</option>
                        <option value="p3-low">P3</option>
                      </select>
                      <button onClick={() => handleAdd(column.id)} className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded">Add</button>
                      <button onClick={() => setAddingTo(null)} className="text-[10px] text-gray-400">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnFeatures.map((feat) => {
                    const priorityCfg = PRIORITY_BADGE[feat.priority];
                    const feedback = getFeatureFeedback(feat);
                    const isDragging = draggedId === feat.id;

                    return (
                      <div
                        key={feat.id}
                        draggable
                        onDragStart={() => handleDragStart(feat.id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverColumn(null); }}
                        className={`bg-white rounded-lg border shadow-sm p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                          isDragging ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Priority + title */}
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <span className={`text-[9px] px-1 py-0.5 rounded font-bold flex-shrink-0 ${priorityCfg.color}`}>{priorityCfg.label}</span>
                          <span className="text-xs font-medium leading-tight">{feat.title}</span>
                        </div>

                        {/* Description */}
                        {feat.description && (
                          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{feat.description}</p>
                        )}

                        {/* Linked screens */}
                        {feat.screenIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {feat.screenIds.map((sid) => {
                              const screen = screens.find((s) => s.id === sid);
                              return screen ? (
                                <button
                                  key={sid}
                                  onClick={() => { setActiveScreen(sid); setActiveView('canvas'); }}
                                  className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-100"
                                  aria-label={`Go to ${screen.name}`}
                                >
                                  {screen.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Footer: feedback + meta */}
                        <div className="flex items-center justify-between text-[9px] text-gray-400">
                          <div className="flex items-center gap-2">
                            {feedback !== 0 && (
                              <span className={feedback > 0 ? 'text-green-500' : 'text-red-500'}>
                                {feedback > 0 ? '+' : ''}{feedback}
                              </span>
                            )}
                            {feat.approvedBy.length > 0 && (
                              <span>Approved: {feat.approvedBy.length}</span>
                            )}
                          </div>
                          <button
                            onClick={() => removeFeature(feat.id)}
                            className="text-gray-300 hover:text-red-400"
                            aria-label="Remove feature"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty column hint */}
                  {columnFeatures.length === 0 && !addingTo && (
                    <div className="flex items-center justify-center h-24 text-[10px] text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      Drag features here or click +
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Cut column (collapsed) */}
          <div className="w-48 flex flex-col">
            <div className="px-3 py-2.5 rounded-t-xl bg-red-50 flex items-center gap-2">
              <span className="text-xs font-semibold text-red-700">Cut</span>
              <span className="text-[10px] bg-white/80 text-gray-500 px-1.5 py-0.5 rounded-full">
                {getByStatus('cut').length}
              </span>
            </div>
            <div
              className="flex-1 p-2 space-y-1 overflow-y-auto"
              onDragOver={(e) => { e.preventDefault(); setDragOverColumn('cut'); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => handleDrop('cut')}
            >
              {getByStatus('cut').map((feat) => (
                <div key={feat.id} className="bg-white/60 rounded border p-2 text-[10px] text-gray-400 line-through">
                  {feat.title}
                </div>
              ))}
              {getByStatus('cut').length === 0 && (
                <div className="text-[9px] text-gray-300 text-center py-4">Drop here to cut</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
