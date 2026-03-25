'use client';

import { useState } from 'react';
import { useProjectStore, type ProjectNote } from '@/stores/projectStore';

interface NotesPanelProps {
  onClose: () => void;
}

const CATEGORY_LABELS: Record<ProjectNote['category'], { label: string; color: string }> = {
  'design-decision': { label: 'Decision', color: 'bg-blue-100 text-blue-700' },
  'requirement': { label: 'Requirement', color: 'bg-green-100 text-green-700' },
  'todo': { label: 'To-Do', color: 'bg-yellow-100 text-yellow-700' },
  'bug': { label: 'Bug', color: 'bg-red-100 text-red-700' },
  'research': { label: 'Research', color: 'bg-purple-100 text-purple-700' },
  'meeting-note': { label: 'Meeting', color: 'bg-gray-100 text-gray-700' },
};

export function NotesPanel({ onClose }: NotesPanelProps) {
  const {
    notes,
    activeNoteId,
    activeScreenId,
    addNote,
    updateNote,
    removeNote,
    togglePinNote,
    setActiveNote,
    searchNotes,
  } = useProjectStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProjectNote['category'] | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectNote['category']>('design-decision');

  const allNotes = Object.values(notes);
  const filteredNotes = search
    ? searchNotes(search)
    : filter === 'all'
      ? allNotes
      : allNotes.filter((n) => n.category === filter);

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const activeNote = activeNoteId ? notes[activeNoteId] : null;

  const handleAddNote = () => {
    if (!newTitle.trim()) return;
    addNote({
      title: newTitle,
      content: newContent,
      scope: activeScreenId ?? 'global',
      category: newCategory,
      tags: [],
      author: 'You',
      pinned: false,
    });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium">
          Notes & Docs
          <span className="text-gray-400 font-normal ml-1.5">({allNotes.length})</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            + Add
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close panel">
            &times;
          </button>
        </div>
      </div>

      {/* Add new note form */}
      {isAdding && (
        <div className="p-3 border-b bg-gray-50 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-sm px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Details, rationale, context..."
            className="w-full text-sm px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
          />
          <div className="flex items-center gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ProjectNote['category'])}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddNote}
              disabled={!newTitle.trim()}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="px-3 py-2 border-b space-y-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full text-xs px-2 py-1.5 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setFilter(key as ProjectNote['category'])}
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                filter === key ? color : 'bg-gray-100 text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            {search ? 'No matching notes' : 'No notes yet — add one above'}
          </div>
        ) : (
          <div className="divide-y">
            {sortedNotes.map((note) => {
              const catInfo = CATEGORY_LABELS[note.category];
              const isActive = note.id === activeNoteId;

              return (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {note.pinned && <span className="text-[10px]">📌</span>}
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {note.title}
                      </span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-gray-300">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-gray-300">{note.scope}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active note detail */}
      {activeNote && (
        <div className="border-t p-3 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">{activeNote.title}</h4>
            <div className="flex gap-1">
              <button
                onClick={() => togglePinNote(activeNote.id)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300"
              >
                {activeNote.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => {
                  removeNote(activeNote.id);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{activeNote.content}</p>
        </div>
      )}
    </div>
  );
}
