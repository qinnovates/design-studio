'use client';

export function Canvas() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-[375px] h-[667px] bg-white rounded-xl shadow-lg border mx-auto flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Drag components here to start designing
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-4">iPhone 14 — 375 x 667</p>
      </div>
    </div>
  );
}
