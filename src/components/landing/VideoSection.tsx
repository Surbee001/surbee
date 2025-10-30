import React from "react";

export default function VideoSection() {
  return (
    <div className="relative w-full mx-auto mt-0 mb-0">
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black mx-[5px]">
        <button
          className="absolute cursor-pointer text-white h-full w-full inset-0 z-10"
          type="button"
          style={{
            outline: "none",
            color: "#fff",
            transition: "transform 0.675s cubic-bezier(0.19, 1, 0.22, 1)",
          }}
        >
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black px-6 py-2.5 rounded-md hover:bg-black/90 transition-all duration-300">
              <span className="text-white font-medium text-lg" style={{ fontFamily: 'var(--font-diatype), sans-serif' }}>Watch Now</span>
            </div>
          </div>

          {/* Video overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        </button>

        {/* Video thumbnail image */}
        <img
          src="https://ik.imagekit.io/on0moldgr/Surbee%20Art/u7411232448_a_microsoft_surface_landscape_with_fog_between_moun_7248ec53-74c0-489d-9580-13e39aab9048.png?updatedAt=1761421534598"
          alt="Surbee Product Preview"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

    </div>
  );
}
