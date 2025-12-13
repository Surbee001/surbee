"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp, Plus, X, Settings2, Crosshair, Eye, Lightbulb, Square, Hammer } from "lucide-react";
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

// Reference item for surveys/chats
export interface ReferenceItem {
  id: string;
  type: 'survey' | 'chat';
  title: string;
}

interface ChatInputLightProps {
  onSendMessage: (message: string, files?: FileUIPart[], references?: ReferenceItem[]) => void;
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
  showBuildToggle?: boolean; // optional, shows build mode toggle
  isBuildMode?: boolean; // optional, whether build mode is active
  onToggleBuildMode?: () => void; // optional, callback to toggle build mode
  hideAttachButton?: boolean; // optional, hides the attach/plus button
  compact?: boolean; // optional, makes the chatbox thinner in height
  references?: ReferenceItem[]; // optional, referenced surveys/chats
  onRemoveReference?: (id: string) => void; // optional, callback to remove a reference
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
  showBuildToggle = false,
  isBuildMode = false,
  onToggleBuildMode,
  hideAttachButton = false,
  compact = false,
  references = [],
  onRemoveReference,
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
      setPlaceholderIndex((idx) => (idx + 1) % placeholderList.length);
    }, 3000);

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
    console.log('📷 ChatInputLight: files array has', files.length, 'files');
    console.log('📷 ChatInputLight: filePreviews has', Object.keys(filePreviews).length, 'previews');

    const fileUIParts: FileUIPart[] = files
      .filter(file => {
        const hasPreview = !!filePreviews[file.name];
        console.log(`📷 File "${file.name}" has preview: ${hasPreview}`);
        return hasPreview;
      })
      .slice(0, 5)
      .map(file => ({
        type: 'file' as const,
        filename: file.name,
        mediaType: file.type,
        url: filePreviews[file.name] // This is the data URL
      }));

    console.log('📷 ChatInputLight: Sending', fileUIParts.length, 'files as FileUIPart format');
    if (fileUIParts.length > 0) {
      console.log('📷 FileUIParts:', fileUIParts.map(f => ({
        type: f.type,
        filename: f.filename,
        mediaType: f.mediaType,
        urlPrefix: f.url?.substring(0, 50),
        urlLength: f.url?.length
      })));
    }

    onSendMessage(
      chatText.trim(), 
      fileUIParts.length > 0 ? fileUIParts : undefined,
      references.length > 0 ? references : undefined
    );
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

  // Compress image to fit within maxSizeBytes (default 4.5MB to stay under 5MB API limit)
  const compressImage = (dataUrl: string, maxSizeBytes: number = 4.5 * 1024 * 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Start with original size, progressively reduce if needed
        let quality = 0.9;
        let scale = 1;

        const compress = () => {
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', quality);

          // Check size (base64 is ~33% larger than binary)
          const sizeEstimate = (compressed.length - 'data:image/jpeg;base64,'.length) * 0.75;

          if (sizeEstimate <= maxSizeBytes) {
            console.log(`📷 Compressed image to ${(sizeEstimate / 1024 / 1024).toFixed(2)}MB (quality: ${quality}, scale: ${scale})`);
            resolve(compressed);
          } else if (quality > 0.3) {
            // Reduce quality first
            quality -= 0.1;
            compress();
          } else if (scale > 0.3) {
            // Then reduce dimensions
            quality = 0.8;
            scale -= 0.1;
            compress();
          } else {
            // Give up and return what we have
            console.log(`📷 Could not compress below ${(sizeEstimate / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressed);
          }
        };

        compress();
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const processFile = async (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)");
      return;
    }

    // Max 5 images
    setFiles(prev => (prev.length >= 5 ? prev : [...prev, file].slice(0, 5)));

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      // Compress if larger than 4MB (to stay under 5MB API limit)
      const sizeEstimate = (dataUrl.length - dataUrl.indexOf(',')) * 0.75;
      let finalDataUrl = dataUrl;

      if (sizeEstimate > 4 * 1024 * 1024) {
        console.log(`📷 Image ${file.name} is ${(sizeEstimate / 1024 / 1024).toFixed(2)}MB, compressing...`);
        finalDataUrl = await compressImage(dataUrl);
      }

      setFilePreviews(prev => ({ ...prev, [file.name]: finalDataUrl }));
    };
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
    imageFiles.slice(0, 5).forEach(processFile);
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
      images.slice(0, 5).forEach(processFile)
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
  const idleActiveClass = detectedTheme === 'white' ? 'bg-black text-white p-1.5 rounded-full' : 'bg-[#E8E8E8] text-black p-1.5 rounded-full';
  const idleInactiveClass = detectedTheme === 'white' ? 'text-gray-500 hover:text-gray-600 p-1.5 rounded-full' : 'text-gray-400 hover:text-gray-300 p-1.5 rounded-full';
  const busyClass = idleActiveClass;

  return (
    <div className={`w-full mx-auto ${className}`}>
      <div 
        ref={chatboxContainerRef}
        className={`relative flex flex-col max-h-[40rem] ${compact ? 'min-h-[70px]' : 'min-h-[122px]'} z-10 transition-all duration-500`}
        style={{
          borderRadius: borderRadius,
          border: shouldGlow
            ? '1px solid rgba(255, 255, 255, 0.8)'
            : detectedTheme === 'white'
              ? '1px solid rgba(0, 0, 0, 0.1)'
              : 'none',
          backgroundColor: detectedTheme === 'white' ? '#F8F8F8' : '#1E1E1F',
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

        {/* Reference Pills - for surveys and chats */}
        {references.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {references.map((ref) => (
              <div
                key={`${ref.type}-${ref.id}`}
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: 'rgba(2, 133, 255, 0.15)',
                }}
              >
                {ref.type === 'survey' ? (
                  <svg height="12" width="12" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0285ff' }}>
                    <path d="M6.08 5.5h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77H7.9a.3.3 0 0 0 .31-.3.3.3 0 0 0-.31-.32H6.08a.3.3 0 0 0-.32.32c0 .17.13.3.32.3m-2.35 2.81c0 1.07.52 1.6 1.57 1.6h5.4c1.05 0 1.57-.53 1.57-1.6v-7.7c0-1.06-.52-1.6-1.57-1.6H5.3c-1.05 0-1.57.54-1.57 1.6zm.82-.01V4.17c0-.51.27-.8.8-.8h5.3c.53 0 .8.29.8.8v7.67c0 .5-.27.79-.8.79h-5.3c-.53 0-.8-.28-.8-.8Z" />
                  </svg>
                ) : (
                  <svg height="12" width="12" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0285ff' }}>
                    <path d="M8 1C4.134 1 1 3.582 1 6.8c0 1.67.85 3.16 2.2 4.22v2.78a.8.8 0 001.3.62l2.08-1.67c.47.05.94.05 1.42.05 3.866 0 7-2.582 7-5.8S11.866 1 8 1z" />
                  </svg>
                )}
                <span 
                  className="text-xs font-medium max-w-[100px] truncate"
                  style={{ color: '#0285ff' }}
                >
                  {ref.title}
                </span>
                {onRemoveReference && (
                  <button
                    onClick={() => onRemoveReference(ref.id)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:opacity-70"
                    style={{ color: '#0285ff' }}
                  >
                    <X size={10} />
                  </button>
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
          <div className="flex-1 min-h-0 px-6" style={{ paddingTop: (files.length > 0 || selectedElement || references.length > 0) ? '0.75rem' : '1rem' }}>
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
                    height: "1.5rem",
                  }}
                >
                  {/* Single placeholder with fade transition and staggered word appearance */}
                  <div
                    key={placeholderIndex}
                    className="overflow-hidden text-ellipsis whitespace-nowrap animate-fade-in-placeholder"
                    style={{
                      height: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25em",
                    }}
                  >
                    {(placeholderList[placeholderIndex % placeholderList.length] || "").split(" ").map((word, wordIdx) => (
                      <span
                        key={`${word}-${wordIdx}`}
                        className="inline-block animate-word-fade-in"
                        style={{
                          animationDelay: `${wordIdx * 60}ms`,
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        {word}
                      </span>
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
                    color: detectedTheme === 'white' ? "rgb(0, 0, 0)" : "#E8E8E8",
                    opacity: isInputDisabled ? 0.5 : 1,
                    pointerEvents: isInputDisabled ? "none" : "auto",
                    caretColor: detectedTheme === 'white' ? "rgb(0, 0, 0)" : "#E8E8E8",
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
              {!hideAttachButton && (
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
                        Array.from(e.target.files).slice(0, 5).forEach(processFile)
                      }
                      if (e.target) e.target.value = "";
                    }}
                    accept="image/*"
                  />
                </button>
              )}
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
              {showBuildToggle && onToggleBuildMode && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isBuildMode ? 'text-blue-400' : (detectedTheme === 'white' ? 'text-gray-500' : 'text-zinc-500')}`}>
                    Build
                  </span>
                  <button
                    onClick={onToggleBuildMode}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      isBuildMode ? 'bg-blue-500' : (detectedTheme === 'white' ? 'bg-gray-300' : 'bg-zinc-600')
                    }`}
                    type="button"
                    title={isBuildMode ? "Build mode on - click to switch to chat" : "Chat mode - click to switch to build"}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                        isBuildMode ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )}
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


