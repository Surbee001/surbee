import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onSearch?: () => void; // Ctrl/Cmd + F
  onUpload?: () => void; // Ctrl/Cmd + U
  disabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onSpace,
  onSearch,
  onUpload,
  disabled = false,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Check if we're in an input or textarea
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      case 'ArrowUp':
        if (!isInputFocused) {
          event.preventDefault();
          onArrowUp?.();
        }
        break;

      case 'ArrowDown':
        if (!isInputFocused) {
          event.preventDefault();
          onArrowDown?.();
        }
        break;

      case 'ArrowLeft':
        if (!isInputFocused) {
          event.preventDefault();
          onArrowLeft?.();
        }
        break;

      case 'ArrowRight':
        if (!isInputFocused) {
          event.preventDefault();
          onArrowRight?.();
        }
        break;

      case 'Enter':
        if (!isInputFocused) {
          event.preventDefault();
          onEnter?.();
        }
        break;

      case ' ':
        if (!isInputFocused) {
          event.preventDefault();
          onSpace?.();
        }
        break;

      case 'f':
        if ((event.ctrlKey || event.metaKey) && !isInputFocused) {
          event.preventDefault();
          onSearch?.();
        }
        break;

      case 'u':
        if ((event.ctrlKey || event.metaKey) && !isInputFocused) {
          event.preventDefault();
          onUpload?.();
        }
        break;
    }
  }, [
    disabled,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onSpace,
    onSearch,
    onUpload,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isEnabled: !disabled,
  };
}