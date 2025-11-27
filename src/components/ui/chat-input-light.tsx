"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp, Plus, X, Settings2, Crosshair, Eye, Lightbulb, Square } from "lucide-react";
import ChatSettingsMenu from "@/components/ui/chat-settings-menu";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import ModelSelector, { AIModel } from "@/components/ui/model-selector";

// FileUIPart format expected by AI SDK
export interface FileUIPart {
  type: 'file';
  filename: string;
  mediaType: string;
  url: string; // data URL or regular URL
}

interface ChatInputLightProps {
  onSendMessage: (message: string, files?: FileUIPart[]) => void;
  isInputDisabled?: boolean;
  placeholder?: string;
  className?: string;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  isAskMode?: boolean;
  onToggleAskMode?: () => void;
  selectedElement?: HTMLElement | null;
  onClearSelection?: () => void;
  theme?: 'dark' | 'white';
  showSettings?: boolean;
  tokenPercent?: number; // optional, shows token usage next to send
  shouldGlow?: boolean; // optional, adds glow effect to border
  disableRotatingPlaceholders?: boolean; // optional, disables rotating placeholders
  isBusy?: boolean;
  onStop?: () => void;
  borderRadius?: string; // optional, custom border radius (default: 32px)
  showModelSelector?: boolean; // optional, shows model selector dropdown
  selectedModel?: AIModel; // optional, currently selected AI model
  onModelChange?: (model: AIModel) => void; // optional, callback when model changes
}

export default function ChatInputLight({
  onSendMessage,
  isInputDisabled = false,
  placeholder = "Type your message...",
  className = "",
  isEditMode = false,
  onToggleEditMode,
  isAskMode = false,
  onToggleAskMode,
  selectedElement,
  onClearSelection,
  theme = 'dark',
  showSettings = true,
  tokenPercent,
  shouldGlow = false,
  disableRotatingPlaceholders = false,
  isBusy = false,
  onStop,
  borderRadius = '19px',
  showModelSelector = false,
  selectedModel = 'gpt-5',
  onModelChange,
}: ChatInputLightProps) {
  const [chatText, setChatText] = useState("");
  // Initialize theme by checking DOM immediately
  const [detectedTheme, setDetectedTheme] = useState<'dark' | 'white'>(() => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? 'dark' : 'white';
    }
    return theme;
  });
  const [files, setFiles] = useState<File[]>([]);

  // Watch for theme changes
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDetectedTheme(isDark ? 'dark' : 'white');
    };

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const chatboxContainerRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Rotating placeholders for empty editor state
  const rotatingPlaceholders = useRef<string[]>([
    "Ask Surbee to draft a product survey…",
    "Paste context and generate customer interview questions…",
    "Upload screenshots and request UX feedback survey…",
    "Summarize responses and propose next actions…",
    "Create a churn analysis survey for Pro users…",
  ]);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const placeholderList = useMemo(() => {
    const fromProp = (placeholder || '').trim();
    const base = rotatingPlaceholders.current;
    if (fromProp && !base.includes(fromProp)) {
      return [fromProp, ...base];
    }
    return base;
  }, [placeholder]);

  // Keep the data-placeholder up to date and rotate while empty
  useEffect(() => {
    const node = contentEditableRef.current;
    if (!node) return;

    // If rotating placeholders are disabled, just use the static placeholder
    if (disableRotatingPlaceholders) {
      node.setAttribute("data-placeholder", placeholder);
      return;
    }

    // Compute active placeholder from the rotating list (first item may be prop)
    const activePlaceholder = placeholderList[placeholderIndex % placeholderList.length] || "";
    node.setAttribute("data-placeholder", activePlaceholder);

    if (chatText.trim().length > 0) return; // do not rotate while typing

    const interval = setInterval(() => {
      setPlaceholderIndex((idx) => {
        const next = (idx + 1) % (placeholderList.length + 1); // +1 for the duplicate
        // Update attribute immediately for snappy UX
        const nextText = placeholderList[next % placeholderList.length] || "";
        if (contentEditableRef.current) {
          contentEditableRef.current.setAttribute("data-placeholder", nextText);
        }
        
        // When we reach the duplicate (end), reset to 0 without animation
        if (next === placeholderList.length) {
          // Reset immediately without transition to create seamless loop
          setTimeout(() => {
            setPlaceholderIndex(0);
          }, 0);
          return placeholderList.length; // Show the duplicate item
        }
        
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [chatText, placeholderList, placeholderIndex, disableRotatingPlaceholders, placeholder]);

  // Update is-editor-empty class based on content
  useEffect(() => {
    const node = contentEditableRef.current;
    if (!node) return;

    if (chatText.trim().length === 0 && files.length === 0) {
      node.classList.add('is-editor-empty');
    } else {
      node.classList.remove('is-editor-empty');
    }
  }, [chatText, files]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    setChatText(text);
  };

  const handleSendMessage = () => {
    if (!chatText.trim() && files.length === 0) return;
    if (isInputDisabled) return;

    // Convert files to FileUIPart format for AI SDK
    const fileUIParts: FileUIPart[] = files
      .filter(file => filePreviews[file.name]) // Only include files with previews
      .slice(0, 10)
      .map(file => ({
        type: 'file' as const,
        filename: file.name,
        mediaType: file.type,
        url: filePreviews[file.name] // This is the data URL
      }));

    console.log('📷 Sending', fileUIParts.length, 'files as FileUIPart format');

    onSendMessage(chatText.trim(), fileUIParts.length > 0 ? fileUIParts : undefined);
    setChatText("");
    setFiles([]);
    setFilePreviews({});

    // Clear the contentEditable div
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = '';
      contentEditableRef.current.classList.add('is-editor-empty');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const handleImageIndexChange = (index: number) => {
    setCurrentImageIndex(index);
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
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => isImageFile(file));
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

  // Close settings menu on outside click
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(target)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen]);

  useEffect(() => {
    if (contentEditableRef.current) {
      const isEmpty = !contentEditableRef.current.textContent || contentEditableRef.current.textContent.trim() === '';
      if (isEmpty) {
        contentEditableRef.current.classList.add('is-editor-empty');
      } else {
        contentEditableRef.current.classList.remove('is-editor-empty');
      }
    }
  }, [chatText]);

  const hasMessage = chatText.trim().length > 0;
  const buttonDisabled = isBusy ? false : (!hasMessage || isInputDisabled);
  const buttonBaseClass = "flex justify-center items-center ease-in transition-all duration-150 cursor-pointer";
  const idleActiveClass = detectedTheme === 'white' ? 'bg-black text-white p-1.5 rounded-full' : 'bg-white text-black p-1.5 rounded-full';
  const idleInactiveClass = detectedTheme === 'white' ? 'text-gray-500 hover:text-gray-600 p-1.5 rounded-full' : 'text-gray-400 hover:text-gray-300 p-1.5 rounded-full';
  const busyClass = idleActiveClass;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div 
        ref={chatboxContainerRef}
        className={`relative flex flex-col max-h-[40rem] min-h-[122px] z-10 transition-all duration-500`}
        style={{
          borderRadius: borderRadius,
          border: shouldGlow
            ? '1px solid rgba(255, 255, 255, 0.8)'
            : detectedTheme === 'white'
              ? '1px solid rgba(0, 0, 0, 0.1)'
              : '1px solid var(--surbee-border-accent)',
          backgroundColor: detectedTheme === 'white' ? '#F8F8F8' : '#242424',
          boxShadow: shouldGlow ? '0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)' : 'none'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File Previews - positioned at top with auto height */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith("image/") && filePreviews[file.name] && (
                  <div 
                    className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 hover:scale-105"
                    onClick={() => handleImageClick(index)}
                  >
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
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity hover:bg-black/90"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Selected Element Pill */}
        {selectedElement && (
          <div className="mx-3 flex items-center gap-2" style={{ marginTop: files.length > 0 ? '0.5rem' : '0.75rem' }}>
            <div 
              className="relative px-3 py-1.5 text-white font-medium text-sm transition-all duration-150 rounded-[0.38rem] bg-white/10 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-epilogue), sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem'
              }}
            >
              <span>
                {selectedElement.tagName.toLowerCase()}
                {selectedElement.id && `#${selectedElement.id}`}
                {selectedElement.className && `.${selectedElement.className.split(' ')[0]}`}
              </span>
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Clear selection"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Main content area with consistent height */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 px-6" style={{ paddingTop: (files.length > 0 || selectedElement) ? '0.75rem' : '1rem' }}>
          <form id="prompt">
            <div className={`relative w-full leading-[22px] text-sm max-sm:text-[14px] resize-none bg-transparent focus:outline-none border-none`}>
              {/* Animated rotating placeholder overlay (shown only when empty and rotating enabled) */}
              {chatText.trim().length === 0 && !disableRotatingPlaceholders && (
                <div
                  className={`pointer-events-none absolute left-0 top-0 w-full select-none px-0 pt-0 overflow-hidden ${detectedTheme === 'white' ? 'text-gray-500' : 'text-gray-400'}`}
                  style={{
                    letterSpacing: "-0.01em",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    height: "1.5rem", // Fixed height to contain one line
                  }}
                >
                  <div
                    className={`transition-transform ease-in-out duration-500 ${
                      placeholderIndex === placeholderList.length ? 'transition-none' : ''
                    }`}
                    style={{
                      transform: `translateY(calc(-${placeholderIndex} * 1.5rem))`,
                    }}
                  >
                    {/* Render all placeholders plus one extra at the end for seamless loop */}
                    {[...placeholderList, placeholderList[0]].map((text, i) => (
                      <div
                        key={`${text}-${i}`}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{ 
                          height: "1.5rem",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60px]`}>
                <div
                  className={`tiptap ProseMirror ProseMirror-focused ${disableRotatingPlaceholders ? '[&.is-editor-empty]:before:content-[attr(data-placeholder)] [&.is-editor-empty]:before:text-gray-400 [&.is-editor-empty]:before:float-left [&.is-editor-empty]:before:pointer-events-none [&.is-editor-empty]:before:h-0 [&.is-editor-empty]:before:absolute [&.is-editor-empty]:before:top-0 [&.is-editor-empty]:before:left-0' : ''}`}
                  contentEditable={!isInputDisabled}
                  suppressContentEditableWarning
                  role="textbox"
                  tabIndex={0}
                  data-placeholder={placeholder}
                  style={{
                    position: "relative",
                    whiteSpace: "break-spaces",
                    overflowWrap: "break-word",
                    fontVariantLigatures: "none",
                    fontFeatureSettings: '"liga" 0',
                    minHeight: "60px",
                    maxHeight: "180px",
                    overflowY: "auto",
                    outline: "transparent solid 2px",
                    outlineOffset: "2px",
                    color: detectedTheme === 'white' ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
                    opacity: isInputDisabled ? 0.5 : 1,
                    pointerEvents: isInputDisabled ? "none" : "auto",
                    caretColor: detectedTheme === 'white' ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
                    fontFamily: "var(--font-epilogue), sans-serif",
                    // Additional subtle refinements to mirror provided textarea styles
                    letterSpacing: "-0.01em",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                  }}
                  ref={contentEditableRef}
                  onInput={handleInput}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
          </form>
          </div>
          <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex flex-row items-center justify-between w-full gap-2 relative">
            <div className="flex flex-row gap-1 items-center min-w-0 flex-1">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className={`inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer h-[28px] w-7 ${detectedTheme === 'white' ? 'text-gray-700 hover:text-black hover:bg-black/5' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                type="button"
                disabled={isInputDisabled}
                title="Add"
              >
                <Plus className="h-3 w-3" />
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
              {showModelSelector && onModelChange && (
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  theme={detectedTheme}
                  disabled={isInputDisabled}
                />
              )}
              {onToggleEditMode && (
                <button
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border ${
                    isEditMode
                      ? (detectedTheme === 'white' ? 'border-gray-300 bg-black text-white' : 'border-zinc-700/40 bg-white text-black')
                      : (detectedTheme === 'white' ? 'border-gray-300 text-gray-700 hover:text-black hover:bg-black/5' : 'border-zinc-700/40 text-gray-300 hover:text-white hover:bg-white/5')
                  }`}
                  type="button"
                  disabled={isInputDisabled}
                  onClick={onToggleEditMode}
                  title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-3 w-3" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              <button
                className={`${buttonBaseClass} ${isBusy ? busyClass : (hasMessage && !isInputDisabled ? idleActiveClass : idleInactiveClass)}`}
                disabled={buttonDisabled}
                onClick={isBusy ? () => onStop?.() : handleSendMessage}
                style={{
                  margin: "0px",
                  cursor: buttonDisabled ? "not-allowed" : "pointer",
                  opacity: buttonDisabled && !isBusy ? 0.7 : 1,
                }}
              >
                {isBusy ? <Square className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth={1.5} /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={handleCloseImageViewer}
        images={Object.values(filePreviews)}
        currentIndex={currentImageIndex}
        onIndexChange={handleImageIndexChange}
      />
    </div>
  );
}


