"use client";

import { Suspense } from "react";
import { AppEditor } from "@/components/editor";

export const dynamic = "force-dynamic";

export default function DashboardWebsiteBuilderPage() {
  return (
    <Suspense fallback={<div className="text-white/60 p-6">Loading editor…</div>}>
      <AppEditor />
    </Suspense>
  );
}


