"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Settings2, Plus, X, Search } from "lucide-react";
import ChatSettingsMenu from "@/components/ui/chat-settings-menu";
import MentionMenu from "@/components/ui/mention-menu";

interface KnowledgeBaseFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  description?: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, images?: string[]) => void;
  isInputDisabled?: boolean;
  placeholder?: string;
  className?: string;
  onCreateModeChange?: (isCreateMode: boolean) => void;
  contextHtml?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  isInputDisabled = false, 
  placeholder = "Type your message...",
  className = "",
  onCreateModeChange,
  contextHtml,
}: ChatInputProps) {
  const [chatText, setChatText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = useState(false);
  const [mentionAnchorRect, setMentionAnchorRect] = useState({ left: 0, top: 0, width: 260 });
  const [mentionSearchTerm, setMentionSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const chatboxContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle @ mention detection
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    setChatText(text);
    
    // Check for @ mentions
    const cursorPos = getCaretPosition(e.currentTarget);
    setCursorPosition(cursorPos);
    
    const beforeCursor = text.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && atIndex < cursorPos) {
      const searchTerm = beforeCursor.substring(atIndex + 1);
      setMentionSearchTerm(searchTerm);
      
      // Just open the menu - positioning will be handled by absolute positioning in the menu
      setIsMentionMenuOpen(true);
    } else {
      setIsMentionMenuOpen(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 120);
    setIsFocused(false);
  };

  // Get cursor position in contentEditable
  const getCaretPosition = (element: HTMLDivElement): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  };

  // Handle file selection from mention menu
  const handleFileSelect = (file: KnowledgeBaseFile) => {
    if (!contentEditableRef.current) return;
    
    // Replace the @ mention with the file reference
    const text = chatText;
    const beforeCursor = text.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterCursor = text.substring(cursorPosition);
      const token = `@${file.name}`;
      const newText = beforeCursor.substring(0, atIndex) + token + afterCursor;
      setChatText(newText);

      // Render a bordered pill for the mention
      const escaped = file.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const rx = new RegExp(`@${escaped}`, 'g');
      contentEditableRef.current.innerHTML = newText.replace(
        rx,
        `<span class=\"inline-block align-baseline px-1.5 py-0.5 rounded-md border border-zinc-900 bg-[#1a1a1a] text-zinc-300\">@${file.name}</span>`
      );

      // Place cursor after the pill with a space so typing continues outside
      const range = document.createRange();
      const selection = window.getSelection();
      if (selection && contentEditableRef.current.lastChild) {
        // Append a space node if not present
        if (contentEditableRef.current.lastChild.nodeType === Node.ELEMENT_NODE) {
          contentEditableRef.current.appendChild(document.createTextNode(" "));
        }
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    setIsMentionMenuOpen(false);
  };

  // Close mention menu
  const closeMentionMenu = () => {
    setIsMentionMenuOpen(false);
  };

  const handleSendMessage = () => {
    if (!chatText.trim() && files.length === 0) return;
    if (isInputDisabled) return;

    onSendMessage(chatText.trim(), Object.values(filePreviews).slice(0, 10));
    setChatText("");
    setFiles([]);
    setFilePreviews({});

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
    if (!contentEditableRef.current) return;
    const isEmpty = !contentEditableRef.current.textContent || contentEditableRef.current.textContent.trim() === '';
    if (isEmpty) {
      contentEditableRef.current.classList.add('is-editor-empty');
    } else {
      contentEditableRef.current.classList.remove('is-editor-empty');
    }
  }, [chatText]);

  // Quick suggestions loader (context-aware)
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const html =
          contextHtml ??
          (typeof document !== 'undefined' ? (document.querySelector('main')?.innerHTML || document.body.innerHTML || '') : '');
        const res = await fetch('/api/website-builder/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: String(html).slice(0, 50000) }),
        });
        if (!res.ok) throw new Error('suggestions');
        const data = await res.json();
        if (!ignore) setSuggestions(data?.suggestions ?? []);
      } catch {
        if (!ignore) setSuggestions(["Summarize this page", "Find related docs", "Explain this section", "Suggest improvements"]);
      }
    };
    if (isFocused) load();
    return () => {
      ignore = true;
    };
  }, [isFocused, contextHtml]);

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={chatboxContainerRef}
        className={`relative flex flex-col justify-between border shadow-md max-h-[40rem] z-10 gap-3 rounded-2xl ${
          (isFocused || files.length > 0) ? 'min-h-[150px]' : 'min-h-[80px]'
        } bg-white text-zinc-800 dark:bg-[#1e1e1e] dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 transition-all duration-300`}
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
        {showSuggestions && suggestions.length > 0 && (
          <div className="px-3 pt-3">
            <div className="flex flex-col gap-1">
              {suggestions.slice(0, 6).map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setChatText(s);
                    if (contentEditableRef.current) {
                      contentEditableRef.current.textContent = s;
                      contentEditableRef.current.focus();
                    }
                  }}
                  className="group inline-flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
                >
                  <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="truncate text-left">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 pt-3">
          <form id="prompt">
            <div className="w-full leading-[22px] text-sm max-sm:text-[14px] truncate resize-none bg-transparent disabled:text-textGray2 focus:outline-none placeholder:text-textGray2 scrollbar-hide border-none">
              <div className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[22px] [&_.ProseMirror.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.ProseMirror.is-editor-empty]:before:text-gray-400 [&_.ProseMirror.is-editor-empty]:before:float-left [&_.ProseMirror.is-editor-empty]:before:pointer-events-none [&_.ProseMirror.is-editor-empty]:before:h-0 [&_.ProseMirror.is-editor-empty]:before:absolute [&_.ProseMirror.is-editor-empty]:before:top-0 [&_.ProseMirror.is-editor-empty]:before:left-0">
                <div
                  className="tiptap ProseMirror ProseMirror-focused"
                  contentEditable={!isInputDisabled}
                  suppressContentEditableWarning
                  role="textbox"
                  tabIndex={0}
                  data-placeholder={placeholder}
                  ref={contentEditableRef}
                  style={{
                    position: "relative",
                    whiteSpace: "break-spaces",
                    overflowWrap: "break-word",
                    fontVariantLigatures: "none",
                    fontFeatureSettings: '"liga" 0',
                    minHeight: "22px",
                    outline: "transparent solid 2px",
                    outlineOffset: "2px",
                    color: "rgb(235, 235, 235)",
                    opacity: isInputDisabled ? 0.5 : 1,
                    pointerEvents: isInputDisabled ? "none" : "auto",
                    caretColor: "rgb(235, 235, 235)",
                  }}
                  onInput={handleInput}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="flex-shrink-0 px-3 pb-3">
            <div className="flex flex-row items-center justify-between w-full gap-2 relative">
            <div className="flex flex-row gap-1 items-center min-w-0 flex-1">
              <button
                className={`relative justify-center whitespace-nowrap ring-offset-background focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 data-[state=open]:bg-muted focus-visible:outline-none group inline-flex gap-1 items-center px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer w-fit focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  isCreateMode 
                    ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50' 
                    : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-transparent'
                }`}
                type="button"
                aria-expanded="false"
                aria-haspopup="menu"
                disabled={isInputDisabled}
                onClick={() => {
                  const newCreateMode = !isCreateMode;
                  setIsCreateMode(newCreateMode);
                  onCreateModeChange?.(newCreateMode);
                }}
                style={{
                  margin: "0px",
                  padding: "0px",
                  fontFeatureSettings: "inherit",
                  fontVariationSettings: "inherit",
                  fontFamily: "inherit",
                  letterSpacing: "inherit",
                  textTransform: "none",
                  appearance: "button",
                  backgroundImage: "none",
                  position: "relative",
                  display: "inline-flex",
                  height: "1.75rem",
                  width: "fit-content",
                  cursor: "pointer",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  whiteSpace: "nowrap",
                  borderRadius: "0.5rem",
                  backgroundColor: isCreateMode ? "rgba(255, 140, 0, 0.3)" : "rgba(255, 140, 0, 0.1)",
                  borderColor: isCreateMode ? "rgba(255, 140, 0, 0.5)" : "transparent",
                  paddingLeft: "0.625rem",
                  paddingRight: "0.625rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: 500,
                  color: "rgba(255, 140, 0, 0.9)",
                  transitionProperty: "all",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDuration: "0.2s",
                  animationDuration: "0.2s",
                }}
              >
                <span className="text-sm font-medium">Create</span>
              </button>
              <button
                className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm disabled:pointer-events-none disabled:opacity-50 h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative"
                type="button"
                aria-controls="radix-_r_75_"
                aria-expanded="false"
                aria-haspopup="dialog"
                disabled={isInputDisabled}
                ref={settingsButtonRef}
                onClick={() => setIsSettingsOpen((v) => !v)}
                style={{
                  margin: "0px",
                  padding: "0px",
                  fontFeatureSettings: "inherit",
                  fontVariationSettings: "inherit",
                  fontFamily: "inherit",
                  letterSpacing: "inherit",
                  color: "inherit",
                  textTransform: "none",
                  appearance: "button",
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-flex",
                  height: "1.75rem",
                  width: "1.75rem",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: 600,
                  transitionProperty:
                    "color, background-color, border-color, -webkit-text-decoration-color, text-decoration-color, fill, stroke",
                  transitionDuration: "0.15s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Settings2 className="h-[14px] w-[14px] -rotate-90 transform text-zinc-900 dark:text-white transition-transform" />
                <span className="absolute top-1 right-0.5 h-[5px] w-[5px] rounded-full bg-blue-500" />
              </button>
              {isSettingsOpen && (
                <ChatSettingsMenu
                  ref={settingsMenuRef}
                  className="absolute bottom-full left-0 mb-1 z-50"
                  onClose={() => setIsSettingsOpen(false)}
                />
              )}
              {isMentionMenuOpen && (
                <MentionMenu
                  isOpen={isMentionMenuOpen}
                  anchorRect={mentionAnchorRect}
                  searchTerm={mentionSearchTerm}
                  onSelectFile={handleFileSelect}
                  onClose={closeMentionMenu}
                  className="absolute bottom-full left-0 mb-2 z-50"
                />
              )}
            </div>
            <div className="flex flex-row gap-1 flex-shrink-0">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center relative gap-2 justify-center whitespace-nowrap rounded-md text-sm disabled:pointer-events-none disabled:opacity-50 h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                type="button"
                disabled={isInputDisabled}
                style={{
                  margin: "0px",
                  padding: "0px",
                  fontFeatureSettings: "inherit",
                  fontVariationSettings: "inherit",
                  fontFamily: "inherit",
                  letterSpacing: "inherit",
                  color: "inherit",
                  textTransform: "none",
                  appearance: "button",
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-flex",
                  height: "1.75rem",
                  width: "1.75rem",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  fontWeight: 600,
                  transitionProperty:
                    "color, background-color, border-color, -webkit-text-decoration-color, text-decoration-color, fill, stroke",
                  transitionDuration: "0.15s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Plus className="h-4 w-4 text-zinc-900 dark:text-white" />
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
              <button
                className={`flex justify-center items-center rounded-full p-1.5 ease-in transition-all duration-150 cursor-pointer ${
                  chatText.trim() && !isInputDisabled ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'
                }`}
                disabled={!chatText.trim() || isInputDisabled}
                onClick={handleSendMessage}
                style={{
                  margin: "0px",
                  fontFeatureSettings: "inherit",
                  fontVariationSettings: "inherit",
                  fontFamily: "inherit",
                  fontSize: "100%",
                  fontWeight: "inherit",
                  lineHeight: "inherit",
                  letterSpacing: "inherit",
                  textTransform: "none",
                  appearance: "button",
                  backgroundImage: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  padding: "0.375rem",
                  transitionProperty: "all",
                  transitionDuration: "0.15s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 1, 1)",
                  animationDuration: "0.15s",
                  animationTimingFunction: "cubic-bezier(0.4, 0, 1, 1)",
                  cursor: chatText.trim() ? "pointer" : "not-allowed",
                  opacity: chatText.trim() ? 1 : 0.5,
                  backgroundColor: chatText.trim() ? "white" : "hsl(0 0% 100%/5%)",
                  color: chatText.trim() ? "black" : "#8a8a8a",
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
} 