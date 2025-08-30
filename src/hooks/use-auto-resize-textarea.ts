import { useEffect, useRef, useCallback } from "react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
    fixedHeight?: boolean; // New prop to control fixed vs auto-resize behavior
}

export function useAutoResizeTextarea({
    minHeight,
    maxHeight,
    fixedHeight = false,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean, forceAdjust?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // If fixed height mode, only adjust if explicitly forced
            if (fixedHeight && !forceAdjust) {
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight, fixedHeight]
    );

    // Check if content exceeds fixed height and force adjustment
    const checkContentOverflow = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea || !fixedHeight) return;

        // Reset to min height to measure scrollHeight
        textarea.style.height = `${minHeight}px`;

        // If content overflows, force height adjustment
        if (textarea.scrollHeight > minHeight) {
            adjustHeight(false, true);
        } else {
            // Reset to min height if content fits
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight, fixedHeight, adjustHeight]);

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight, checkContentOverflow };
}
