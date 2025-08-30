'use client';

import React from 'react';
import { PlateEditor } from '@/components/plate-editor';
import { Toaster } from 'sonner';

export function NotebookContent() {
  return (
    <div className="h-full w-full overflow-auto hide-scrollbar bg-[#232324] text-[#F3F3F3]">
      <PlateEditor />
      <Toaster />
    </div>
  );
}
