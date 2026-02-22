"use client";

// This page gets overwritten when sandbox content is written
// Shows a loading state until content is available
export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-white/40 text-sm">Loading preview...</p>
      </div>
    </div>
  );
}
