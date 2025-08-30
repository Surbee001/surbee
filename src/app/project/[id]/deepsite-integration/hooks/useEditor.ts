import { useState, useCallback, useEffect } from "react";
import { HtmlHistory, DeepSiteState } from "../types";
import { DEFAULT_HTML } from "../lib/constants";
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/lib/deepsite/providers";

const STORAGE_KEY_HTML = 'surbee:deepsite:html';
const STORAGE_KEY_PREV_PROMPT = 'surbee:deepsite:prevPrompt';

export const useEditor = (defaultHtml?: string) => {
  /**
   * State to manage the HTML content of the editor.
   * This will be the main content that users edit.
   */
  const [html, setHtml] = useState(defaultHtml || DEFAULT_HTML);
  
  /**
   * State to manage the history of HTML edits.
   * This will store previous versions of the HTML content along with metadata.
   */
  const [htmlHistory, setHtmlHistory] = useState<HtmlHistory[]>([]);

  /**
   * State to manage the prompts used for generating HTML content.
   * This can be used to track what prompts were used in the editor.
   */
  const [prompts, setPrompts] = useState<string[]>([]);

  /**
   * AI working state management
   */
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [controller, setController] = useState<AbortController | null>(null);
  const [previousPrompt, setPreviousPrompt] = useState("");
  const [progress, setProgress] = useState<{ id: string; label: string; status: 'pending' | 'done' | 'error' }[]>([]);
  const [checkpoints, setCheckpoints] = useState<{ id: string; html: string; prompt: string; createdAt: Date }[]>([]);

  /**
   * Add a new entry to the HTML history
   */
  const addToHistory = useCallback((newHtml: string, prompt: string) => {
    const historyEntry: HtmlHistory = {
      html: newHtml,
      createdAt: new Date(),
      prompt
    };
    setHtmlHistory(prev => [historyEntry, ...prev]);
  }, []);

  /**
   * Update HTML and add to history
   */
  const updateHtml = useCallback((newHtml: string, prompt?: string) => {
    setHtml(newHtml);
    if (prompt) {
      addToHistory(newHtml, prompt);
      setPrompts(prev => [...prev, prompt]);
      // Create checkpoint for revert functionality
      setCheckpoints(prev => [{ id: Date.now().toString(), html: newHtml, prompt, createdAt: new Date() }, ...prev]);
    }
  }, [addToHistory]);

  /**
   * Reset editor to default state
   */
  const resetEditor = useCallback(() => {
    setHtml(DEFAULT_HTML);
    setHtmlHistory([]);
    setPrompts([]);
    setPreviousPrompt("");
  }, []);

  /**
   * Stop AI generation
   */
  const stopGeneration = useCallback(() => {
    if (controller) {
      controller.abort();
      setController(null);
    }
    setIsAiWorking(false);
    setIsThinking(false);
  }, [controller]);

  /**
   * Start AI generation with abort controller
   */
  const startGeneration = useCallback(() => {
    const abortController = new AbortController();
    setController(abortController);
    setIsAiWorking(true);
    setIsThinking(true);
    setProgress([]);
    return abortController;
  }, []);

  const resetProgress = useCallback(() => setProgress([]), []);
  const pushProgress = useCallback((step: { id: string; label: string; status: 'pending' | 'done' | 'error' }) => {
    setProgress(prev => {
      const existingIndex = prev.findIndex(s => s.id === step.id);
      if (existingIndex !== -1) {
        const copy = [...prev];
        copy[existingIndex] = step;
        return copy;
      }
      return [...prev, step];
    });
  }, []);

  const revertToCheckpoint = useCallback((checkpointId: string) => {
    const cp = checkpoints.find(c => c.id === checkpointId);
    if (!cp) return false;
    setHtml(cp.html);
    setPreviousPrompt(cp.prompt);
    return true;
  }, [checkpoints]);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedHtml = localStorage.getItem(STORAGE_KEY_HTML);
        if (savedHtml && savedHtml.trim().length > 0) {
          setHtml(savedHtml);
        }
        const savedPrev = localStorage.getItem(STORAGE_KEY_PREV_PROMPT);
        if (savedPrev) setPreviousPrompt(savedPrev);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage when html or previousPrompt changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_HTML, html || '');
        localStorage.setItem(STORAGE_KEY_PREV_PROMPT, previousPrompt || '');
      }
    } catch {}
  }, [html, previousPrompt]);

  return {
    // HTML state
    html,
    setHtml,
    updateHtml,
    
    // History
    htmlHistory,
    setHtmlHistory,
    addToHistory,
    
    // Prompts
    prompts,
    setPrompts,
    previousPrompt,
    setPreviousPrompt,
    
    // AI state
    isAiWorking,
    setIsAiWorking,
    isThinking,
    setIsThinking,
    provider,
    setProvider,
    model,
    setModel,
    controller,
    progress,
    checkpoints,
    
    // Methods
    resetEditor,
    stopGeneration,
    startGeneration,
    resetProgress,
    pushProgress,
    revertToCheckpoint,
  };
};
