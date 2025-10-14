"use client";

import { ArrowUp, Plus, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface AIInputProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (value: string, images?: string[]) => void
  className?: string
  fixedHeight?: boolean // New prop to control fixed vs auto-resize behavior
}

export function AIInput({
  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 60,
  maxHeight = 200,
  onSubmit,
  className,
  fixedHeight = true // Default to fixed height behavior
}: AIInputProps) {
  const { textareaRef, adjustHeight, checkContentOverflow } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
    fixedHeight,
  });
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const uploadInputRef = useRef<HTMLInputElement>(null);

	// Static placeholder for AIInput; rotation is handled in ChatInputLight

  const handleReset = () => {
    if (!inputValue.trim() && files.length === 0) return;
    onSubmit?.(inputValue, Object.values(filePreviews).slice(0, 10));
    setInputValue("");
    setFiles([]);
    setFilePreviews({});
    adjustHeight(true);
  };

	// No placeholder rotation here; keep behavior simple for AIInput

  // Check for content overflow when input changes
  useEffect(() => {
    if (fixedHeight) {
      checkContentOverflow();
    }
  }, [inputValue, fixedHeight, checkContentOverflow]);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)");
      return;
    }
    setFiles(prev => (prev.length >= 10 ? prev : [...prev, file].slice(0, 10)));
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles);
    if (fileToRemove && filePreviews[fileToRemove.name]) {
      const next = { ...filePreviews }
      delete next[fileToRemove.name]
      setFilePreviews(next)
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) => isImageFile(file));
    imageFiles.slice(0, 10).forEach(processFile);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const images: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) images.push(file)
      }
    }
    if (images.length) {
      e.preventDefault();
      images.slice(0, 10).forEach(processFile)
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div 
        className="relative flex flex-col justify-between max-h-[40rem] h-[122px] z-10 gap-4 rounded-full theme-card border border-zinc-900"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-1">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith("image/") && filePreviews[file.name] && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300">
                    <img
                      src={filePreviews[file.name]}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden px-3.5 pt-3">
				<Textarea
              id={id}
					placeholder={placeholder}
              className={cn(
						"bg-transparent border-none rounded-full",
						// Requested placeholder style additions
						"placeholder:text-primary-60 !text-base",
                "text-theme-primary text-wrap",
                "overflow-y-auto resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "transition-[height] duration-100 ease-out",
                "leading-[1.2]",
                `min-h-[60px]`,
                !fixedHeight ? `max-h-[${maxHeight}px]` : "",
                "[&::-webkit-resizer]:hidden"
              )}
					style={{
						position: "relative",
						whiteSpace: "break-spaces",
						overflowWrap: "break-word",
						fontVariantLigatures: "none",
						fontFeatureSettings: '"liga" 0',
						minHeight: "60px",
						outline: "transparent solid 2px",
						outlineOffset: "2px",
						color: "rgb(255, 255, 255)",
						caretColor: "rgb(255, 255, 255)",
						fontFamily: "Segoe UI, sans-serif",
						// Keep AIInput styles minimal; ChatInputLight mirrors the provided snippet
					}}
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value.length === 0) {
                  adjustHeight(true);
                } else if (!fixedHeight) {
                  adjustHeight();
                } else {
                  checkContentOverflow();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReset();
                }
              }}
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-3 pb-3">
          <div className="flex flex-row items-center justify-between w-full gap-2 relative">
            <div className="flex flex-row gap-1 items-center min-w-0 flex-1">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center relative gap-2 font-semibold justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-7 w-7 cursor-pointer"
                type="button"
              >
                <Plus className="h-4 w-4 text-white" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      Array.from(e.target.files).slice(0, 10).forEach(processFile)
                    }
                    if (e.target) e.target.value = "";
                  }}
                  accept="image/*"
                />
              </button>
            </div>
            <div className="flex flex-row gap-1 flex-shrink-0">
              <button
                onClick={handleReset}
                type="button"
                className={`flex justify-center items-center rounded-full p-1.5 ease-in transition-all duration-150 cursor-pointer ${
                  (inputValue.trim() || files.length > 0) ? 'bg-white text-black' : 'bg-gray-600 text-gray-400'
                }`}
                disabled={!(inputValue.trim() || files.length > 0)}
                style={{
                  margin: "0px",
                  cursor: (inputValue.trim() || files.length > 0) ? "pointer" : "not-allowed",
                  opacity: (inputValue.trim() || files.length > 0) ? 1 : 0.5,
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
