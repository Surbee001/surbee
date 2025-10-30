import React from 'react';

export default function BuilderControls() {
  return (
    <div className="fixed top-2 right-4 z-20 flex gap-2">
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm shadow hover:bg-green-600 transition-colors"
      >
        Publish
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm shadow hover:bg-purple-600 transition-colors hidden md:block"
      >
        Upgrade
      </button>
    </div>
  );
}
