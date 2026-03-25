'use client';

import { getPresenceColor } from '@design-studio/collab';

// Simulated presence for demo (real Yjs awareness would provide this)
const DEMO_USERS = [
  { id: '1', name: 'You', initials: 'Y' },
];

export function PresenceBar() {
  return (
    <div className="flex items-center gap-1">
      {DEMO_USERS.map((user, i) => (
        <div
          key={user.id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
          style={{ backgroundColor: getPresenceColor(i) }}
          title={user.name}
        >
          {user.initials}
        </div>
      ))}
      <button className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:border-gray-400">
        +
      </button>
    </div>
  );
}
