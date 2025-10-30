"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollerProps {
	children: React.ReactNode;
	className?: string;
	/** Optional aria-label for accessibility */
	ariaLabel?: string;
}

export default function HorizontalScroller({ children, className, ariaLabel }: HorizontalScrollerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	const handleNext = () => {
		const el = containerRef.current;
		if (!el) return;
		const scrollAmount = Math.max(240, Math.floor(el.clientWidth * 0.85));
		el.scrollBy({ left: scrollAmount, behavior: "smooth" });
		setHasInteracted(true);
	};

	const handlePrev = () => {
		const el = containerRef.current;
		if (!el) return;
		const scrollAmount = Math.max(240, Math.floor(el.clientWidth * 0.85));
		el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
	};

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const update = () => {
			const { scrollLeft, clientWidth, scrollWidth } = el;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
		};
		update();
		el.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			el.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, []);

	return (
		<div className={`relative group ${className || ""}`} aria-label={ariaLabel}>
			<div
				ref={containerRef}
				className="overflow-x-auto overflow-y-hidden scrollbar-hide"
				style={{ scrollBehavior: "smooth" }}
			>
				<div className="flex gap-5 pr-16">
					{children}
				</div>
			</div>

			{/* Right fade overlay */}
			{canScrollRight && (
				<div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--surbee-bg-primary)] to-transparent" />
			)}
			{hasInteracted && canScrollLeft && (
				<div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--surbee-bg-primary)] to-transparent" />
			)}

			{/* Prev/Next buttons */}
			{hasInteracted && canScrollLeft && (
				<button
					type="button"
					onClick={handlePrev}
					className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
					aria-label="Previous"
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
			)}
			{canScrollRight && (
				<button
					type="button"
					onClick={handleNext}
					className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
					aria-label="Next"
				>
					<ChevronRight className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}

// Hide scrollbar utility (if not already globally present)
// This relies on Tailwind's preflight; if custom styles exist, they will coexist.
// Consumers should ensure sufficient padding-right to avoid overlaying the last item.

