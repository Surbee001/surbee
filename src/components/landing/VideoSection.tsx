import React from "react";

export default function VideoSection() {
  return (
    <div className="relative w-full mx-auto mt-16 mb-12 px-10">
      <div className="relative aspect-video w-full max-w-6xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl">
        <button
          className="absolute cursor-pointer text-white h-full w-full inset-0 z-10"
          type="button"
          style={{
            outline: "none",
            color: "#fff",
            transition: "transform 0.675s cubic-bezier(0.19, 1, 0.22, 1)",
          }}
        >
          {/* Watch Now button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-sm rounded-xl px-8 py-4 hover:bg-black/90 transition-all duration-300 border border-white/20">
              <span className="text-white font-medium text-lg tracking-wide">
                Watch Now
              </span>
            </div>
          </div>

          {/* Video overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
        </button>

        {/* Video thumbnail placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/80">
              <svg
                className="w-20 h-20 mx-auto mb-6 opacity-60"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
              </svg>
              <p className="text-lg font-medium mb-2">Surbee Product Demo</p>
              <p className="text-sm text-white/60">See how Surbee transforms survey creation in real-time</p>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
