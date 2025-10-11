"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Plus, X, Settings2, Crosshair, Eye, Lightbulb } from "lucide-react";
import ChatSettingsMenu from "@/components/ui/chat-settings-menu";

interface ChatInputLightProps {
  onSendMessage: (message: string, images?: string[]) => void;
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
  shouldGlow = false
}: ChatInputLightProps) {
  const [chatText, setChatText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const chatboxContainerRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    setChatText(text);
  };

  const handleSendMessage = () => {
    if (!chatText.trim() && files.length === 0) return;
    if (isInputDisabled) return;

    onSendMessage(chatText.trim(), Object.values(filePreviews).slice(0, 10));
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

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <div 
        ref={chatboxContainerRef}
        className={`relative flex flex-col max-h-[40rem] min-h-[122px] z-10 transition-all duration-500`}
        style={{ 
          borderRadius: '32px',
          border: shouldGlow ? '1px solid rgba(255, 255, 255, 0.8)' : '1px solid var(--surbee-border-accent)',
          backgroundColor: theme === 'white' ? '#FFFFFF' : '#2C2C2C',
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
                  <div className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer h-9 w-9 rounded-full border transition-all duration-300">
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
            <div className={`w-full leading-[22px] text-sm max-sm:text-[14px] resize-none bg-transparent focus:outline-none border-none ${theme === 'white' ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}>
              <div className={
                `[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60px] [&_.ProseMirror.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.ProseMirror.is-editor-empty]:before:float-left [&_.ProseMirror.is-editor-empty]:before:pointer-events-none [&_.ProseMirror.is-editor-empty]:before:h-0 [&_.ProseMirror.is-editor-empty]:before:absolute [&_.ProseMirror.is-editor-empty]:before:top-0 [&_.ProseMirror.is-editor-empty]:before:left-0` + 
                (theme === 'white' 
                  ? ' [&_.ProseMirror.is-editor-empty]:before:text-gray-500' 
                  : ' [&_.ProseMirror.is-editor-empty]:before:text-gray-400')
              }>
                <div
                  className="tiptap ProseMirror ProseMirror-focused"
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
                    color: theme === 'white' ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
                    opacity: isInputDisabled ? 0.5 : 1,
                    pointerEvents: isInputDisabled ? "none" : "auto",
                    caretColor: theme === 'white' ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
                    fontFamily: "var(--font-epilogue), sans-serif",
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
                className={`inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer h-[28px] w-7 ${theme === 'white' ? 'text-gray-700 hover:text-black hover:bg-black/5' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
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
              {onToggleEditMode && (
                <button
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border ${
                    isEditMode 
                      ? (theme === 'white' ? 'border-gray-300 bg-black text-white' : 'border-zinc-700/40 bg-white text-black') 
                      : (theme === 'white' ? 'border-gray-300 text-gray-700 hover:text-black hover:bg-black/5' : 'border-zinc-700/40 text-gray-300 hover:text-white hover:bg-white/5')
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
              {onToggleAskMode && (
                <button
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border ${
                    isAskMode 
                      ? (theme === 'white' ? 'border-gray-300 bg-black text-white' : 'border-zinc-700/40 bg-white text-black') 
                      : (theme === 'white' ? 'border-gray-300 text-gray-700 hover:text-black hover:bg-black/5' : 'border-zinc-700/40 text-gray-300 hover:text-white hover:bg-white/5')
                  }`}
                  type="button"
                  disabled={isInputDisabled}
                  onClick={onToggleAskMode}
                  title={isAskMode ? 'Ask mode: on' : 'Ask mode: off'}
                >
                  <Lightbulb className="h-3 w-3" />
                  <span>Ask</span>
                </button>
              )}
            </div>
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              {typeof tokenPercent === 'number' && !isNaN(tokenPercent) && (
                <div className={`${theme === 'white' ? 'bg-black/5 border-gray-300 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'} flex items-center gap-2 px-2 py-1 rounded-md border`}
                  title="Approximate context usage"
                >
                  <span className="text-xs" style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}>{tokenPercent.toFixed(1)}%</span>
                  <div className="relative w-4 h-4">
                    <div className={`${theme === 'white' ? 'border-gray-300/60' : 'border-white/20'} absolute inset-0 rounded-full border`} />
                    <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#9ca3af ${Math.max(0, Math.min(100, tokenPercent)) * 3.6}deg, transparent 0deg)` }} />
                  </div>
                </div>
              )}
              <button
                className={`flex justify-center items-center ease-in transition-all duration-150 cursor-pointer rounded-full ${
                  chatText.trim() && !isInputDisabled 
                    ? (theme === 'white' ? 'bg-black text-white p-1.5' : 'bg-white text-black p-1.5')
                    : (theme === 'white' ? 'text-gray-500 hover:text-gray-600 p-1.5' : 'text-gray-400 hover:text-gray-300 p-1.5')
                }`}
                disabled={!chatText.trim() || isInputDisabled}
                onClick={handleSendMessage}
                style={{
                  margin: "0px",
                  cursor: chatText.trim() ? "pointer" : "not-allowed",
                  opacity: chatText.trim() ? 1 : 0.7,
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}






