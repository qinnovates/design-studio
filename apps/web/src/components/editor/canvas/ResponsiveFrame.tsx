'use client';

import { useUIStore } from '@/stores/uiStore';

interface ResponsiveFrameProps {
  children: React.ReactNode;
}

const DEVICE_FRAMES = {
  phone: { width: 375, height: 812, label: 'iPhone 14', radius: 40 },
  tablet: { width: 768, height: 1024, label: 'iPad', radius: 20 },
  desktop: { width: 1440, height: 900, label: 'Desktop', radius: 8 },
} as const;

export function ResponsiveFrame({ children }: ResponsiveFrameProps) {
  const previewMode = useUIStore((s) => s.previewMode);

  if (!previewMode) {
    return <>{children}</>;
  }

  const frame = DEVICE_FRAMES[previewMode];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 p-8 overflow-auto">
      {/* Device label */}
      <p className="text-xs text-gray-500 mb-3">
        {frame.label} — {frame.width} x {frame.height}
      </p>

      {/* Device frame */}
      <div
        className="bg-white shadow-2xl overflow-hidden relative flex-shrink-0"
        style={{
          width: frame.width,
          height: frame.height,
          borderRadius: frame.radius,
          border: '8px solid #1f2937',
        }}
      >
        {/* Status bar for phone */}
        {previewMode === 'phone' && (
          <div className="h-11 bg-white flex items-center justify-between px-6 text-xs">
            <span className="font-semibold">9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 border border-gray-800 rounded-sm relative">
                <div className="absolute inset-0.5 bg-gray-800 rounded-[1px]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Canvas content */}
        <div className="w-full" style={{ height: previewMode === 'phone' ? frame.height - 44 - 34 : frame.height }}>
          {children}
        </div>

        {/* Home indicator for phone */}
        {previewMode === 'phone' && (
          <div className="h-[34px] bg-white flex items-center justify-center">
            <div className="w-32 h-1 bg-gray-800 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
