import React from "react";
import localFont from "next/font/local";

const epilogue = localFont({
  src: [
    { path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-VariableItalic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export default function TestLoginPage() {
  return (
    <div className={`${epilogue.variable} min-h-screen w-full`} style={{ backgroundColor: "#0A0A0A", color: "#EEF1ED", fontFamily: "var(--font-epilogue)" }}>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left: form and copy */}
        <div className="flex flex-col justify-between p-6 md:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/Surbee001/webimg/c120f0dfd46532bb149db06425090559998d97d5/New%20SVG.svg"
              alt="SerbySVJ"
              className="h-8 w-auto"
            />
            <span className="text-sm text-neutral-300">SerbySVJ</span>
          </div>

          {/* Center copy */}
          <div className="mt-16">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Test Login</h1>
            <p className="mt-3 text-neutral-300">Automate your surveys</p>

            {/* Auth buttons */}
            <div className="mt-8 space-y-3">
              <button className="w-full rounded-md border border-neutral-700 bg-transparent px-4 py-2 text-left text-sm hover:bg-neutral-800/60 transition">
                Continue with Google
              </button>
              <button className="w-full rounded-md border border-neutral-700 bg-transparent px-4 py-2 text-left text-sm hover:bg-neutral-800/60 transition">
                Log in with email
              </button>
            </div>

            <p className="mt-6 text-[11px] text-neutral-500">
              by signing up you agree to our privacy policy and terms of service
            </p>
          </div>

          <div />
        </div>

        {/* Right: image with same bordered feel */}
        <div className="hidden md:block p-6 md:p-10">
          <div className="h-full w-full overflow-hidden rounded-md border border-neutral-800">
            <img
              src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__cbbf9473-785a-4dc6-a4d0-8eb684185fbc.png?raw=true"
              alt="login hero"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


