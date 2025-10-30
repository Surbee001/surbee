"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

type Lang = {
  code: string;
  label: string;
};

// Keep labels un-translated and stable via unicode escapes where needed
const LANGUAGES: Lang[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Esp\u00F1ol" },
  { code: "fr", label: "Fran\u00E7ais" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "hi", label: "\u0939\u093F\u0902\u0926\u0940" },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    __gt_loaded?: boolean;
  }
}

function setCookie(name: string, value: string) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export default function TranslateSwitcher() {
  const [current, setCurrent] = React.useState<string>("en");

  // Load Google Translate script once and initialize hidden element
  React.useEffect(() => {
    // Determine current language from cookie if present
    const cookie = getCookie("googtrans");
    if (cookie && cookie.includes("/")) {
      const parts = cookie.split("/");
      const lang = parts[parts.length - 1] || "en";
      setCurrent(lang);
    }

    if (typeof window === "undefined") return;
    if (window.__gt_loaded) return; // already loaded

    window.googleTranslateElementInit = function () {
      try {
        // Initialize the hidden element that wires up Google Translate
        // Limit to our selected languages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google: any = (window as any).google;
        if (google && google.translate && document.getElementById("google_translate_element")) {
          // eslint-disable-next-line no-new
          new google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: LANGUAGES.map((l) => l.code).join(","),
              autoDisplay: false,
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        }
      } catch (e) {
        // no-op
      }
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onload = () => {
      window.__gt_loaded = true;
    };
    document.body.appendChild(script);
  }, []);

  const applyLanguage = (code: string) => {
    setCurrent(code);
    // Method 1: if the combo exists, change it directly (no reload)
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
      // Also set cookie to persist on next visit
      setCookie("googtrans", `/en/${code}`);
      return;
    }
    // Fallback: set cookie and reload to let Google apply translation
    setCookie("googtrans", `/en/${code}`);
    window.location.reload();
  };

  return (
    <>
      {/* Hidden Google Translate wiring node */}
      <div id="google_translate_element" className="hidden" />

      {/* Style overrides to hide Google banner/frame and keep layout steady */}
      <style
        // We scope only essential overrides to avoid leaking styles
        dangerouslySetInnerHTML={{
          __html: `
            .goog-te-banner-frame.skiptranslate { display: none !important; }
            .goog-te-banner-frame { display: none !important; }
            #goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip { display: none !important; }
            .goog-logo-link { display: none !important; }
            .goog-te-gadget span { display: none !important; }
            .goog-te-gadget { height: 0 !important; overflow: hidden !important; }
            body { top: 0 !important; }
          `,
        }}
      />

      {/* Floating trigger + popover (not translated) */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 notranslate" translate="no">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="black"
              size="icon"
              aria-label="Change language"
              title="Change language"
              className="shadow-md border border-white/10 size-10"
            >
              <Languages className="w-4 h-4 text-neutral-200" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-2 bg-neutral-950 text-neutral-200 border-white/10 notranslate"
            translate="no"
          >
            <div className="text-xs font-medium text-neutral-400 px-2 pb-2">Translate</div>
            <div className="space-y-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => applyLanguage(lang.code)}
                  className={`w-full text-left px-2 py-2 rounded-md transition-colors hover:bg-neutral-800 ${
                    current === lang.code ? "bg-neutral-900" : ""
                  }`}
                >
                  <span className="text-sm">{lang.label}</span>
                </button>
              ))}
              <div className="border-t border-white/10 my-1" />
              <button
                onClick={() => {
                  // Reset to default site language (English)
                  setCookie("googtrans", "/en/en");
                  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
                  if (combo) {
                    combo.value = "en";
                    combo.dispatchEvent(new Event("change"));
                  } else {
                    window.location.reload();
                  }
                  setCurrent("en");
                }}
                className="w-full text-left px-2 py-2 rounded-md text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              >
                Default (English)
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

