"use client"

import React, { useState } from "react";

export default function HeroSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Add your email so we can reach out.");
      return;
    }

    if (!consent) {
      setError("Please confirm you agree to the privacy policy.");
      return;
    }

    setError(null);
    setStatus("submitting");

    // Placeholder async flow – swap with real waitlist API when ready.
    setTimeout(() => {
      setStatus("success");
    }, 600);
  };

  return (
    <hgroup className="h-full flex max-w-[425px] flex-col flex-shrink-0 z-1 justify-center">
      <div style={{ opacity: 1, transform: "none" }}>
        <h1
          className="text-title-secondary md:text-title-primary max-w-[335px] md:max-w-[820px] mb-[15px] md:mb-[24px]"
          style={{ textAlign: "left" }}
        >
          Join the Surbee closed beta
        </h1>
      </div>
      <div style={{ opacity: 1, transform: "none" }}>
        <p className="text-subtitle max-w-[335px] md:max-w-[540px] text-grey-4 text-left">
          We’re inviting a small group of researchers, operators, and students
          to help shape the first release. Tell us where to send the invite and
          we’ll reach out as we open new seats.
        </p>
      </div>
      <form
        className="mt-[30px] flex flex-col gap-4"
        style={{ opacity: 1, transform: "none" }}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-neutral-700 text-left">
            Email for your beta invite
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => {
              if (error) {
                setError(null);
              }
              setEmail(event.target.value);
            }}
            className="h-11 w-full rounded-[12px] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            placeholder="you@example.com"
            aria-invalid={Boolean(error) && !email.trim()}
            aria-describedby="waitlist-feedback"
            disabled={status === "success"}
          />
        </div>
        <label className="flex items-start gap-3 text-left text-xs text-neutral-600">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => {
              if (error) {
                setError(null);
              }
              setConsent(event.target.checked);
            }}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[6px] border border-neutral-300 accent-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
            aria-invalid={Boolean(error) && !consent}
            disabled={status === "success"}
          />
          <span>
            I agree to receive beta updates and accept the{" "}
            <a
              href="/privacy"
              className="underline transition hover:text-neutral-900"
            >
              privacy policy
            </a>
            .
          </span>
        </label>
        {error && status !== "success" && (
          <p
            id="waitlist-feedback"
            className="text-sm font-medium text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {status === "success" ? (
          <div
            className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
            id="waitlist-feedback"
          >
            Thanks! We’ll be in touch as soon as the next beta cohort opens.
          </div>
        ) : (
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-500"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Saving..." : "Request beta access"}
          </button>
        )}
      </form>
    </hgroup>
  );
}
