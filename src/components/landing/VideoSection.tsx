import React from "react";

export default function VideoSection() {
  return (
    <div className="relative w-full mx-auto mt-48 mb-8">
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl mx-[5px]">
        <button
          className="absolute cursor-pointer text-white h-full w-full inset-0 z-10"
          type="button"
          style={{
            outline: "none",
            color: "#fff",
            transition: "transform 0.675s cubic-bezier(0.19, 1, 0.22, 1)",
          }}
        >
          {/* Play button icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          {/* Video overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        </button>

        {/* Video thumbnail placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
              </svg>
              <p className="text-sm font-medium">Surbee Product Demo</p>
              <p className="text-xs text-white/50 mt-1">Watch how Surbee transforms survey creation</p>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

    </div>
  );
}
