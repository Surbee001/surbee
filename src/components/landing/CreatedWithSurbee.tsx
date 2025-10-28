"use client";

import React, { useState, useRef, useEffect } from "react";
import localFont from "next/font/local";

type CardConfig = {
  src: string;
  left: string;
  top: string;
  baseZ: number;
};

const tobiasLight = localFont({
  src: "../../../Font/Tobiasfont/Tobias-TRIAL-Light.ttf",
  weight: "300",
  style: "normal",
  variable: "--font-tobias",
  display: "swap",
});

const CARD_CONFIGS: readonly CardConfig[] = [
  { src: "https://endlesstools.io/examples/car.jpg", left: "3.88889%", top: "17%", baseZ: 1 },
  { src: "https://endlesstools.io/examples/greenDays.jpg", left: "8.88889%", top: "5.85714%", baseZ: 2 },
  { src: "https://endlesstools.io/examples/plant.jpg", left: "16.6667%", top: "2.64286%", baseZ: 4 },
  { src: "https://endlesstools.io/examples/flowers.jpg", left: "11.25%", top: "21.0714%", baseZ: 3 },
  { src: "https://endlesstools.io/examples/smile.jpg", left: "25%", top: "3.92857%", baseZ: 5 },
  { src: "https://endlesstools.io/examples/fullMellowJacket.jpg", left: "19.375%", top: "25.9286%", baseZ: 6 },
  { src: "https://endlesstools.io/examples/typography.jpg", left: "30.4861%", top: "7.92857%", baseZ: 7 },
  { src: "https://endlesstools.io/examples/bullet.jpg", left: "26.1806%", top: "19.2143%", baseZ: 8 },
  { src: "https://endlesstools.io/examples/anime.jpg", left: "20.1389%", top: "14.4286%", baseZ: 9 },
  { src: "https://endlesstools.io/examples/poster.jpg", left: "32.5%", top: "29.2857%", baseZ: 10 },
  { src: "https://endlesstools.io/examples/halftone.jpg", left: "36.9444%", top: "19.9286%", baseZ: 13 },
  { src: "https://endlesstools.io/examples/girl.jpg", left: "38.4028%", top: "1.35714%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/pixelFlower.jpg", left: "42.6389%", top: "13.3571%", baseZ: 12 },
  { src: "https://endlesstools.io/examples/blueTree.jpg", left: "45.5556%", top: "4.85714%", baseZ: 10 },
  { src: "https://endlesstools.io/examples/ancient.jpg", left: "43.9583%", top: "27.7857%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/a.jpg", left: "48.6111%", top: "34.3571%", baseZ: 12 },
  { src: "https://endlesstools.io/examples/makeGreat.jpg", left: "51.4583%", top: "22.7857%", baseZ: 9 },
  { src: "https://endlesstools.io/examples/hand.jpg", left: "52.5694%", top: "2.92857%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/nerd.jpg", left: "61.1111%", top: "4.85714%", baseZ: 12 },
  { src: "https://endlesstools.io/examples/girlOnChair.jpg", left: "55.2778%", top: "13.7857%", baseZ: 8 },
  { src: "https://endlesstools.io/examples/greenBoy.jpg", left: "58.4722%", top: "30.1429%", baseZ: 13 },
  { src: "https://endlesstools.io/examples/hammer.jpg", left: "62.5694%", top: "12.2857%", baseZ: 12 },
  { src: "https://endlesstools.io/examples/squaredGirl.jpg", left: "63.6111%", top: "23.5714%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/eyes.jpg", left: "68.6111%", top: "6.64286%", baseZ: 9 },
  { src: "https://endlesstools.io/examples/sign.jpg", left: "73.4028%", top: "4%", baseZ: 10 },
  { src: "https://endlesstools.io/examples/paintedFlowers.jpg", left: "68.6111%", top: "14.5%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/hola.jpg", left: "70.9028%", top: "33.3571%", baseZ: 14 },
  { src: "https://endlesstools.io/examples/lolypop.jpg", left: "74.0972%", top: "22.2857%", baseZ: 13 },
  { src: "https://endlesstools.io/examples/comeWithMe.jpg", left: "80%", top: "16.6429%", baseZ: 11 },
  { src: "https://endlesstools.io/examples/bling.jpg", left: "80.0694%", top: "8%", baseZ: 8 },
  { src: "https://endlesstools.io/examples/rabbit.jpg", left: "80.625%", top: "25.2143%", baseZ: 12 },
  { src: "https://endlesstools.io/examples/cap.jpg", left: "87.1528%", top: "13.3571%", baseZ: 10 },
] as const;

const INITIAL_MAX_LAYER = CARD_CONFIGS.reduce(
  (max, card) => (card.baseZ > max ? card.baseZ : max),
  0
);

type CardOffset = {
  x: number;
  y: number;
};

const CARD_WIDTH = "10vw";
const CARD_MAX_WIDTH = "128px";
const APPEAR_DELAY_MS = 30;

export default function CreatedWithSurbee() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [draggingCard, setDraggingCard] = useState<number | null>(null);
  const [offsets, setOffsets] = useState<Record<number, CardOffset>>({});
  const [layers, setLayers] = useState<number[]>(() =>
    CARD_CONFIGS.map((card) => card.baseZ)
  );
  const highestLayer = useRef(INITIAL_MAX_LAYER);
  const dragState = useRef<{
    cardIndex: number;
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  useEffect(() => {
    const order = Array.from(
      { length: CARD_CONFIGS.length },
      (_, index) => index
    ).sort(() => Math.random() - 0.5);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    order.forEach((cardIndex, delayIndex) => {
      const timeout = setTimeout(() => {
        setVisibleCards((prev) =>
          prev.includes(cardIndex) ? prev : [...prev, cardIndex]
        );
      }, delayIndex * APPEAR_DELAY_MS);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handlePointerDown =
    (cardIndex: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      const pointerId = event.pointerId;
      const currentOffset = offsets[cardIndex] ?? { x: 0, y: 0 };

      dragState.current = {
        cardIndex,
        pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX: currentOffset.x,
        baseY: currentOffset.y,
      };

      setDraggingCard(cardIndex);
      setHoveredCard(cardIndex);

      highestLayer.current += 1; // ensure selected card renders above others
      setLayers((prev) => {
        const next = [...prev];
        next[cardIndex] = highestLayer.current;
        return next;
      });

      if (event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(pointerId);
      }
    };

  const handlePointerMove =
    (cardIndex: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current || dragState.current.cardIndex !== cardIndex) {
        return;
      }

      const deltaX = event.clientX - dragState.current.startX;
      const deltaY = event.clientY - dragState.current.startY;
      const nextX = dragState.current.baseX + deltaX;
      const nextY = dragState.current.baseY + deltaY;

      setOffsets((prev) => {
        const previousOffset = prev[cardIndex];
        if (previousOffset && previousOffset.x === nextX && previousOffset.y === nextY) {
          return prev;
        }

        return {
          ...prev,
          [cardIndex]: { x: nextX, y: nextY },
        };
      });
    };

  const finishDrag = (
    cardIndex: number,
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (dragState.current?.cardIndex === cardIndex) {
      const pointerId = dragState.current.pointerId;
      if (event.currentTarget.hasPointerCapture?.(pointerId)) {
        event.currentTarget.releasePointerCapture(pointerId);
      }
      dragState.current = null;
    }

    setDraggingCard((current) => (current === cardIndex ? null : current));
  };

  const handlePointerUp =
    (cardIndex: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(cardIndex, event);
    };

  const handlePointerCancel =
    (cardIndex: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(cardIndex, event);
      setHoveredCard((current) => (current === cardIndex ? null : current));
    };


  return (
    <section className={`w-full mb-[84px] ${tobiasLight.variable}`}>
      <div className="relative w-full overflow-visible">
        <h2 className="select-none text-center" style={{ fontFamily: 'var(--font-diatype), sans-serif' }}>
          <span className="leading-none block" style={{ fontSize: '38px', fontWeight: 400, letterSpacing: '-2px', lineHeight: '46px', color: '#0A0A0A' }}>
            Created with Surbee
          </span>
        </h2>
      </div>
      <div className="max-w-[1400px] aspect-[1440/692] mx-auto relative mt-12">
        <div className="h-full">
          <div className="relative h-full mx-auto">
            {CARD_CONFIGS.map((card, index) => {
              const isVisible = visibleCards.includes(index);
              const isDragging = draggingCard === index;
              const isHovered = hoveredCard === index;
              const offset = offsets[index] ?? { x: 0, y: 0 };
              const scale = isDragging ? 1.06 : isHovered ? 1.03 : 1;
              const transition = `opacity 0.6s ease-in-out, transform ${
                isDragging ? "0s" : "0.2s ease-out"
              }`;

              return (
                <div
                  key={card.src}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    marginLeft: card.left,
                    marginTop: card.top,
                    opacity: isVisible ? 1 : 0,
                    zIndex: layers[index] ?? card.baseZ,
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transition,
                    touchAction: "none",
                    userSelect: "none",
                    cursor: isDragging ? "grabbing" : "grab",
                    willChange: "transform",
                  }}
                  onPointerDown={handlePointerDown(index)}
                  onPointerMove={handlePointerMove(index)}
                  onPointerUp={handlePointerUp(index)}
                  onPointerCancel={handlePointerCancel(index)}
                  onPointerLeave={() => {
                    if (dragState.current?.cardIndex === index) {
                      return;
                    }

                    setHoveredCard((current) =>
                      current === index ? null : current
                    );
                  }}
                  onPointerEnter={() => {
                    const activeIndex = dragState.current?.cardIndex;
                    if (activeIndex == null || activeIndex === index) {
                      setHoveredCard(index);
                    }
                  }}
                >
                  <img
                    src={card.src}
                    alt={`Created with Surbee example ${index + 1}`}
                    draggable={false}
                    className="block overflow-hidden object-cover"
                    style={{
                      borderRadius: "8px",
                      width: CARD_WIDTH,
                      maxWidth: CARD_MAX_WIDTH,
                      height: "auto",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.hero-text-tobias {
  font-family: var(--font-tobias), var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`,
        }}
      />
    </section>
  );
}
