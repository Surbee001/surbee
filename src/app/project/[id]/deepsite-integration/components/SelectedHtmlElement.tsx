import React from 'react';
import { Code, XCircle } from "lucide-react";
import { htmlTagToText } from '../lib/html-utils';

interface SelectedHtmlElementProps {
  element: HTMLElement | null;
  isAiWorking: boolean;
  onDelete?: () => void;
}

export const SelectedHtmlElement: React.FC<SelectedHtmlElementProps> = ({
  element,
  isAiWorking = false,
  onDelete,
}) => {
  if (!element) return null;

  const tagName = element.tagName.toLowerCase();
  
  return (
    <div
      className={`border border-zinc-700 rounded-xl p-1.5 pr-3 max-w-max hover:brightness-110 transition-all duration-200 ease-in-out cursor-pointer ${
        isAiWorking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (!isAiWorking && onDelete) {
          onDelete();
        }
      }}
    >
      <div className="flex items-center justify-start gap-2 cursor-pointer">
        <div className="rounded-lg bg-zinc-700 size-6 flex items-center justify-center">
          <Code className="text-zinc-300 size-3.5" />
        </div>
        <p className="text-sm font-semibold text-zinc-300">
          {element.textContent?.trim().split(/\s+/)[0]} {htmlTagToText(tagName)}
        </p>
        <XCircle className="text-zinc-300 size-4" />
      </div>
    </div>
  );
};
