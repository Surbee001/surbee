import React from "react";
import localFont from "next/font/local";

const epilogue = localFont({
  src: [
    { path: "../../../public/fonts/Epilogue-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "../../../public/fonts/Epilogue-VariableItalic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export default function TestLoginPage() {
  return (
    <div className={`${epilogue.variable} min-h-screen w-full`} style={{ backgroundColor: "#0A0A0A", color: "#EEF1ED", fontFamily: "var(--font-epilogue)" }}>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left: form and copy */}
        <div className="relative flex items-center justify-center p-6 md:p-10">

          {/* Centered auth block */}
          <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
            {/* Logo above Automate Your Surveys */}
            <div className="mb-6">
              <img
                src="https://raw.githubusercontent.com/Surbee001/webimg/3f6411aa09c8946e2cd942244f90e52cffbac43b/New%20SVG.svg"
                alt="Surbee Logo"
                className="h-32 w-auto mx-auto"
                style={{
                  borderRadius: 8,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)' // Makes the SVG white to match #FEFFFC background
                }}
              />
            </div>

            <p className="mb-6 text-sm text-neutral-300">Automate your surveys.</p>

            {/* Flat buttons, compact width and centered vertically */}
            <div className="w-full space-y-3">
              <a href="/onboarding?step=1&mode=google" aria-label="Continue with Google" className="h-11 w-full rounded-full bg-zinc-900 text-zinc-100 px-5 text-sm font-medium hover:bg-zinc-800 transition inline-flex items-center justify-center">
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/><path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/><path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002l6.19 5.238C39.718 36.054 44 30.606 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/></svg>
                  <span>Sign up with Google</span>
                </span>
              </a>
              <div className="flex items-center gap-3 px-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-500">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <a href="/onboarding?step=1&mode=email" aria-label="Log in" className="h-11 w-full rounded-full bg-zinc-900 text-zinc-100 px-5 text-sm font-medium hover:bg-zinc-800 transition inline-flex items-center justify-center">
                Log in
              </a>
            </div>

            <p className="mt-8 text-[11px] text-zinc-500">
              By signing up you agree to our <a className="underline hover:text-zinc-300 transition-colors" href="#">Privacy Policy</a> and <a className="underline hover:text-zinc-300 transition-colors" href="#">Terms of Service</a>.
            </p>
          </div>
        </div>

        {/* Right: image - remove heavy border, keep subtle rounding */}
        <div className="hidden md:block p-6 md:p-10">
          <div className="h-full w-full overflow-hidden rounded-lg">
            <img
              src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__496a7873-dd10-4e60-a067-a2c0bc0ef982.png?raw=true"
              alt="login hero"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


