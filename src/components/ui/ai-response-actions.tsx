import React from "react";
import { Maximize2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

interface Props {
  message?: string;
  onCopy?: (content: string) => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onRetry?: () => void;
  onCreateSurvey?: () => void;
}

export default function AIResponseActions({ message = "", onCopy, onThumbsUp, onThumbsDown, onRetry, onCreateSurvey }: Props) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden min-h-[22px]">
      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto pt-2">
        <div className="w-full flex flex-row items-start justify-between">
          {/* Left: action icons */}
          <div className="flex flex-row gap-1 text-zinc-400 px-1 min-h-[22px]">
            <button
              className="inline-flex items-center justify-center hover:bg-[#212121] px-1 py-1 h-[22px] text-xs gap-1 rounded-[6px]"
              onClick={() => onCopy?.(message)}
            >
              <Copy className="w-[15px] h-[15px]" />
            </button>
            <button
              className="inline-flex items-center justify-center hover:bg-[#212121] px-1 py-1 h-[22px] text-xs gap-1 rounded-[6px]"
              onClick={onThumbsUp}
            >
              <ThumbsUp className="w-[15px] h-[15px]" />
            </button>
            <button
              className="inline-flex items-center justify-center hover:bg-[#212121] px-1 py-1 h-[22px] text-xs gap-1 rounded-[6px]"
              onClick={onThumbsDown}
            >
              <ThumbsDown className="w-[15px] h-[15px]" />
            </button>
            <button
              className="inline-flex items-center justify-center hover:bg-[#212121] px-1 py-1 h-[22px] text-xs gap-1 rounded-[6px]"
              onClick={onRetry}
            >
              <RotateCcw className="w-[15px] h-[15px]" />
            </button>
          </div>

          {/* Right: create as survey */}
          <button
            onClick={onCreateSurvey}
            className="inline-flex items-center justify-center whitespace-nowrap text-xs px-2 py-1 !h-[22px] gap-1 font-medium rounded-[6px] transition-all duration-150 bg-[#212121] hover:bg-[#1a1a1a] text-zinc-300"
          >
            <Maximize2 className="w-[14px] h-[14px]" />
            <span>Create as Survey</span>
          </button>
        </div>
      </div>
    </div>
  );
} 