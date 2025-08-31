import React, { useRef, useEffect, useState, useMemo } from 'react';

interface DeepSiteRendererProps {
  html: string;
  className?: string;
  title?: string;
  deviceType?: 'desktop' | 'tablet' | 'phone';
  onLoad?: () => void;
  onError?: (error: string) => void;
  isEditableModeEnabled?: boolean;
  onClickElement?: (element: HTMLElement) => void;
  currentPath?: string;
}

const getDeviceStyles = (deviceType: 'desktop' | 'tablet' | 'phone') => {
  switch (deviceType) {
    case 'phone':
      return 'w-[375px] h-full';
    case 'tablet':
      return 'w-[820px] h-full';
    default:
      return 'w-full h-full';
  }
};

export const DeepSiteRenderer: React.FC<DeepSiteRendererProps> = ({
  html,
  className = '',
  title = 'Preview',
  deviceType = 'desktop',
  onLoad,
  onError,
  isEditableModeEnabled = false,
  onClickElement,
  currentPath = '/'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  // Handle mouse events for element selection
  const handleMouseOver = (event: MouseEvent) => {
    if (!isEditableModeEnabled) return;
    
    const iframeDocument = iframeRef.current?.contentDocument;
    if (iframeDocument) {
      const targetElement = event.target as HTMLElement;
      if (
        hoveredElement !== targetElement &&
        targetElement !== iframeDocument.body &&
        targetElement.tagName.toLowerCase() !== 'html' &&
        targetElement !== selectedElement // Don't hover over already selected element
      ) {
        // Remove any existing hover highlights to prevent clutter
        const existingHovered = iframeDocument.querySelectorAll('.deepsite-hovered-element');
        existingHovered.forEach(el => {
          if (el !== selectedElement) {
            el.classList.remove('deepsite-hovered-element');
            el.removeAttribute('data-element-name');
          }
        });
        
        setHoveredElement(targetElement);
        targetElement.classList.add('deepsite-hovered-element');
        
        // Add element name for tooltip
        targetElement.setAttribute('data-element-name', targetElement.tagName.toLowerCase());
      }
    }
  };

  const handleMouseOut = (event: MouseEvent) => {
    if (!isEditableModeEnabled) return;
    
    const targetElement = event.target as HTMLElement;
    
    // Only remove hover effect if we're not hovering over a child element
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!targetElement.contains(relatedTarget)) {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const existingHovered = doc.querySelectorAll('.deepsite-hovered-element');
        existingHovered.forEach(el => {
          if (el !== selectedElement) {
            el.classList.remove('deepsite-hovered-element');
            el.removeAttribute('data-element-name');
          }
        });
      }
      if (hoveredElement && hoveredElement !== selectedElement) {
        hoveredElement.classList.remove('deepsite-hovered-element');
        hoveredElement.removeAttribute('data-element-name');
      }
      setHoveredElement(null);
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (!isEditableModeEnabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const iframeDocument = iframeRef.current?.contentDocument;
    if (iframeDocument) {
      const targetElement = event.target as HTMLElement;
      if (
        targetElement !== iframeDocument.body &&
        targetElement.tagName.toLowerCase() !== 'html'
      ) {
        // Remove previous selection
        if (selectedElement) {
          selectedElement.classList.remove('deepsite-selected-element');
        }
        
        // Remove hover effect and add selected effect
        if (hoveredElement) {
          hoveredElement.classList.remove('deepsite-hovered-element');
        }
        
        targetElement.classList.add('deepsite-selected-element');
        setSelectedElement(targetElement);
        onClickElement?.(targetElement);
      }
    }
  };

  useEffect(() => {
    if (iframeRef.current && html) {
      try {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          doc.open();
          
          // Add <base> for relative links and custom CSS for hover/selection
          const baseHref = (currentPath || '/').endsWith('/') ? (currentPath || '/') : (currentPath + '/');
          const htmlWithStyles = html.replace(
            '</head>',
            `<base href="${baseHref}"><style>
              .deepsite-hovered-element {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
                cursor: pointer !important;
                position: relative !important;
                transition: all 0.2s ease !important;
              }
              .deepsite-hovered-element::after {
                content: attr(data-element-name) !important;
                position: absolute !important;
                top: -28px !important;
                left: 0 !important;
                background: #3b82f6 !important;
                color: white !important;
                padding: 4px 8px !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                border-radius: 4px !important;
                white-space: nowrap !important;
                z-index: 9999 !important;
                pointer-events: none !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
              }
              .deepsite-selected-element {
                outline: 2px solid #10b981 !important;
                outline-offset: 2px !important;
                background-color: rgba(16, 185, 129, 0.05) !important;
                position: relative !important;
              }
              .deepsite-selected-element::after {
                content: "SELECTED" !important;
                position: absolute !important;
                top: -28px !important;
                left: 0 !important;
                background: #10b981 !important;
                color: white !important;
                padding: 4px 8px !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                border-radius: 4px !important;
                white-space: nowrap !important;
                z-index: 9999 !important;
                pointer-events: none !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
              }
              .deepsite-hovered-element:hover {
                outline-color: #1d4ed8 !important;
              }
            </style></head>`
          );
          
          doc.write(htmlWithStyles);
          doc.close();

          // Safety shim: if the generated HTML includes a multi-step wizard structure
          // add minimal Next/Back handling so navigation works even if authoring omitted it.
          try {
            const sections = Array.from(doc.querySelectorAll('section[data-step]')) as HTMLElement[];
            if (sections.length >= 2) {
              let current = 1;
              const byStep = (n: number) => sections.filter(s => parseInt(s.getAttribute('data-step') || '0', 10) === n);
              const getTotal = () => sections.length;
              const showStep = (n: number) => {
                current = Math.min(Math.max(1, n), getTotal());
                sections.forEach(s => {
                  const stepNum = parseInt(s.getAttribute('data-step') || '0', 10);
                  if (!stepNum) return;
                  if (stepNum === current) {
                    s.style.removeProperty('display');
                    s.classList.remove('hidden');
                  } else {
                    s.style.display = 'none';
                    s.classList.add('hidden');
                  }
                });
                // Basic progress update if an element has data-progress
                const progEl = doc.querySelector('[data-progress]') as HTMLElement | null;
                if (progEl) {
                  const total = getTotal();
                  const pct = total > 1 ? Math.round(((current - 1) / (total - 1)) * 100) : 0;
                  progEl.textContent = `${pct}%`;
                }
              };

              const wireButtons = () => {
                const nextSelectors = '[data-next], [data-start], [data-continue], button[data-action="next"], .next, button[id*="next" i], button[name*="next" i], a[id*="next" i], a[name*="next" i]';
                const backSelectors = '[data-prev], [data-back], button[data-action="back"], .prev, button[id*="prev" i], button[name*="prev" i], a[id*="prev" i], a[name*="prev" i]';
                const nextButtons = Array.from(doc.querySelectorAll<HTMLElement>(nextSelectors));
                const backButtons = Array.from(doc.querySelectorAll<HTMLElement>(backSelectors));

                const isNextText = (el: HTMLElement) => /^(start|next|continue)$/i.test((el.textContent || '').trim());
                const isBackText = (el: HTMLElement) => /^(back|previous|prev)$/i.test((el.textContent || '').trim());

                // Also include plain buttons/anchors with label text
                Array.from(doc.querySelectorAll<HTMLElement>('button, a')).forEach(el => {
                  if (isNextText(el) && !nextButtons.includes(el)) nextButtons.push(el);
                  if (isBackText(el) && !backButtons.includes(el)) backButtons.push(el);
                });

                nextButtons.forEach((btn: any) => {
                  if (btn.getAttribute('data-ds-wired') === '1') return;
                  btn.setAttribute('data-ds-wired', '1');
                  try { if (btn.tagName.toLowerCase() === 'button' && btn.type !== 'button') btn.type = 'button'; } catch {}
                  btn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    const currentSection = byStep(current)[0];
                    if (currentSection) {
                      const required = Array.from(currentSection.querySelectorAll<HTMLElement>('[required]')) as any[];
                      const invalid = required.find((el: any) => {
                        if (el.type === 'checkbox' || el.type === 'radio') return !el.checked;
                        return !el.value;
                      });
                      if (invalid && typeof (invalid as any).focus === 'function') {
                        (invalid as any).focus();
                        return;
                      }
                    }
                    showStep(current + 1);
                  });
                });
                backButtons.forEach((btn: any) => {
                  if (btn.getAttribute('data-ds-wired') === '1') return;
                  btn.setAttribute('data-ds-wired', '1');
                  try { if (btn.tagName.toLowerCase() === 'button' && btn.type !== 'button') btn.type = 'button'; } catch {}
                  btn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    showStep(current - 1);
                  });
                });
              };

              showStep(1);
              wireButtons();

              // Observe DOM changes (e.g., AI updates HTML) and rewire controls
              const observer = new MutationObserver(() => {
                try { wireButtons(); } catch {}
              });
              observer.observe(doc.body, { childList: true, subtree: true, attributes: true });
            }
          } catch (shimErr) {
            // Non-fatal; only a best-effort fallback
            console.debug('Wizard shim skipped:', shimErr);
          }
          
          // Set up event listeners for interactive editing
          if (isEditableModeEnabled) {
            doc.addEventListener('mouseover', handleMouseOver, true);
            doc.addEventListener('mouseout', handleMouseOut, true);
            doc.addEventListener('click', handleClick, true);
          }

          // Intercept absolute app routes to avoid loading host pages inside iframe
          try {
            doc.addEventListener('click', (e: any) => {
              const target = e.target as HTMLElement;
              const anchor = target?.closest?.('a');
              if (!anchor) return;
              const href = anchor.getAttribute('href') || '';
              if (href.startsWith('/')) {
                e.preventDefault();
                const win = iframeRef.current?.contentWindow as any;
                try { win?.history?.replaceState?.({}, '', href); } catch {}
                try { (iframeRef.current?.contentWindow as any)?.parent?.postMessage?.({ type: 'deepsite:navigate', path: href }, '*'); } catch {}
              }
            }, true);
          } catch {}

          // Reflect selected route in iframe history (best-effort for relative links)
          try {
            const win = iframeRef.current?.contentWindow as any;
            if (win && typeof win.history?.replaceState === 'function') {
              win.history.replaceState({}, '', currentPath || '/');
              try { win?.parent?.postMessage?.({ type: 'deepsite:navigate', path: currentPath || '/' }, '*'); } catch {}
            }
          } catch {}

          // Bubble up runtime errors from inside the iframe to parent renderer
          try {
            const win = iframeRef.current?.contentWindow as any;
            if (win) {
              const origError = win.console?.error?.bind(win.console);
              win.console.error = (...args: any[]) => {
                try { onError?.(String(args?.[0] ?? 'Frame error')); } catch {}
                try { origError?.(...args); } catch {}
              };
              win.addEventListener('error', (ev: any) => {
                try { onError?.(ev?.message || 'Iframe script error'); } catch {}
              });
            }
          } catch {}

          onLoad?.();
        } else {
          onError?.('Failed to access iframe document');
        }
      } catch (error) {
        console.error('Error rendering HTML:', error);
        onError?.('Failed to render HTML content');
      }
    }
  }, [html, isEditableModeEnabled, onLoad, onError, currentPath]);

  // Clean up event listeners when editable mode changes
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const cleanup = () => {
      doc.removeEventListener('mouseover', handleMouseOver, true);
      doc.removeEventListener('mouseout', handleMouseOut, true);
      doc.removeEventListener('click', handleClick, true);
      
      // Remove any existing hover and selection effects
      const hoveredElements = doc.querySelectorAll('.deepsite-hovered-element');
      hoveredElements.forEach(el => {
        el.classList.remove('deepsite-hovered-element');
        el.removeAttribute('data-element-name');
      });
      
      const selectedElements = doc.querySelectorAll('.deepsite-selected-element');
      selectedElements.forEach(el => el.classList.remove('deepsite-selected-element'));
    };

    if (isEditableModeEnabled) {
      cleanup(); // Clean up first
      doc.addEventListener('mouseover', handleMouseOver, true);
      doc.addEventListener('mouseout', handleMouseOut, true);
      doc.addEventListener('click', handleClick, true);
    } else {
      cleanup();
      setHoveredElement(null);
      setSelectedElement(null);
    }

    return cleanup;
  }, [isEditableModeEnabled]);

  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className} ${isEditableModeEnabled ? 'cursor-crosshair' : ''}`}>
      <div className={`bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${getDeviceStyles(deviceType)}`}>
        <iframe
          ref={iframeRef}
          className={`w-full h-full border-0 rounded-lg ${isEditableModeEnabled ? 'pointer-events-auto' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title={title}
        />
      </div>
    </div>
  );
};
