"use client"

import React, { useState, useEffect } from "react";

interface Card {
  id: number;
  src: string;
  x: number;
  y: number;
  zIndex: number;
  isSelected: boolean;
}

export default function CreatedWithSurbee() {
  const [cards, setCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Card positioning data - same as original layout
  const cardPositions = [
    { marginLeft: "3.88889%", marginTop: "17%" },
    { marginLeft: "8.88889%", marginTop: "5.85714%" },
    { marginLeft: "16.6667%", marginTop: "2.64286%" },
    { marginLeft: "11.25%", marginTop: "21.0714%" },
    { marginLeft: "25%", marginTop: "3.92857%" },
    { marginLeft: "19.375%", marginTop: "25.9286%" },
    { marginLeft: "30.4861%", marginTop: "7.92857%" },
    { marginLeft: "26.1806%", marginTop: "19.2143%" },
    { marginLeft: "20.1389%", marginTop: "14.4286%" },
    { marginLeft: "32.5%", marginTop: "29.2857%" },
    { marginLeft: "36.9444%", marginTop: "19.9286%" },
    { marginLeft: "38.4028%", marginTop: "1.35714%" },
    { marginLeft: "42.6389%", marginTop: "13.3571%" },
    { marginLeft: "45.5556%", marginTop: "4.85714%" },
    { marginLeft: "43.9583%", marginTop: "27.7857%" },
    { marginLeft: "48.6111%", marginTop: "34.3571%" },
    { marginLeft: "51.4583%", marginTop: "22.7857%" },
    { marginLeft: "52.5694%", marginTop: "2.92857%" },
    { marginLeft: "61.1111%", marginTop: "4.85714%" },
    { marginLeft: "55.2778%", marginTop: "13.7857%" },
    { marginLeft: "58.4722%", marginTop: "30.1429%" },
    { marginLeft: "62.5694%", marginTop: "12.2857%" },
    { marginLeft: "63.6111%", marginTop: "23.5714%" },
    { marginLeft: "68.6111%", marginTop: "6.64286%" },
    { marginLeft: "73.4028%", marginTop: "4%" },
    { marginLeft: "68.6111%", marginTop: "14.5%" },
    { marginLeft: "70.9028%", marginTop: "33.3571%" },
    { marginLeft: "74.0972%", marginTop: "22.2857%" },
    { marginLeft: "80%", marginTop: "16.6429%" },
    { marginLeft: "80.0694%", marginTop: "8%" },
    { marginLeft: "80.625%", marginTop: "25.2143%" },
    { marginLeft: "87.1528%", marginTop: "13.3571%" }
  ];

  const imageSources = [
    "https://endlesstools.io/examples/car.jpg",
    "https://endlesstools.io/examples/greenDays.jpg",
    "https://endlesstools.io/examples/plant.jpg",
    "https://endlesstools.io/examples/flowers.jpg",
    "https://endlesstools.io/examples/smile.jpg",
    "https://endlesstools.io/examples/fullMellowJacket.jpg",
    "https://endlesstools.io/examples/typography.jpg",
    "https://endlesstools.io/examples/bullet.jpg",
    "https://endlesstools.io/examples/anime.jpg",
    "https://endlesstools.io/examples/poster.jpg",
    "https://endlesstools.io/examples/halftone.jpg",
    "https://endlesstools.io/examples/girl.jpg",
    "https://endlesstools.io/examples/pixelFlower.jpg",
    "https://endlesstools.io/examples/blueTree.jpg",
    "https://endlesstools.io/examples/ancient.jpg",
    "https://endlesstools.io/examples/a.jpg",
    "https://endlesstools.io/examples/makeGreat.jpg",
    "https://endlesstools.io/examples/hand.jpg",
    "https://endlesstools.io/examples/nerd.jpg",
    "https://endlesstools.io/examples/girlOnChair.jpg",
    "https://endlesstools.io/examples/greenBoy.jpg",
    "https://endlesstools.io/examples/hammer.jpg",
    "https://endlesstools.io/examples/squaredGirl.jpg",
    "https://endlesstools.io/examples/eyes.jpg",
    "https://endlesstools.io/examples/sign.jpg",
    "https://endlesstools.io/examples/paintedFlowers.jpg",
    "https://endlesstools.io/examples/hola.jpg",
    "https://endlesstools.io/examples/lolypop.jpg",
    "https://endlesstools.io/examples/comeWithMe.jpg",
    "https://endlesstools.io/examples/bling.jpg",
    "https://endlesstools.io/examples/rabbit.jpg",
    "https://endlesstools.io/examples/cap.jpg"
  ];

  // Initialize cards with original positions
  useEffect(() => {
    const initialCards: Card[] = imageSources.map((src, index) => {
      const position = cardPositions[index] || { marginLeft: "0%", marginTop: "0%" };

      return {
        id: index,
        src,
        x: 0, // Will be calculated from marginLeft
        y: 0, // Will be calculated from marginTop
        zIndex: index + 1,
        isSelected: false
      };
    });

    setCards(initialCards);
  }, []);

  // Animation effect for cards appearing
  useEffect(() => {
    const totalCards = 32;
    const delays = Array.from({ length: totalCards }, (_, i) => i).sort(() => Math.random() - 0.5);

    delays.forEach((cardIndex, delayIndex) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, cardIndex]);
      }, delayIndex * 30);
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent, cardId: number) => {
    e.preventDefault();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    setDraggedCard(cardId);
    setDragOffset({
      x: e.clientX - card.x,
      y: e.clientY - card.y
    });

    // Bring card to front when selected
    setCards(prev => prev.map(c =>
      c.id === cardId
        ? { ...c, zIndex: Math.max(...prev.map(card => card.zIndex)) + 1, isSelected: true }
        : { ...c, isSelected: false }
    ));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedCard === null) return;

    // Update card position immediately
    setCards(prev => prev.map(card =>
      card.id === draggedCard
        ? { ...card, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
        : card
    ));
  };

  const handleMouseUp = () => {
    setDraggedCard(null);
  };

  useEffect(() => {
    if (draggedCard !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedCard, dragOffset]);

  // Calculate actual pixel positions from percentages
  const getCardStyle = (card: Card) => {
    const containerWidth = 1400; // max-w-[1400px]
    const containerHeight = 692; // aspect-[1440/692]

    const x = card.x || (parseFloat(cardPositions[card.id]?.marginLeft || "0%") / 100) * containerWidth;
    const y = card.y || (parseFloat(cardPositions[card.id]?.marginTop || "0%") / 100) * containerHeight;

    return {
      left: x,
      top: y,
      position: 'absolute' as const,
      zIndex: card.zIndex,
      opacity: visibleCards.includes(card.id) ? 1 : 0,
      transform: draggedCard === card.id ? 'scale(1.05)' : 'scale(1)',
      transition: draggedCard === card.id ? 'none' : 'opacity 0.6s ease-in-out, transform 0.2s ease-out',
      cursor: draggedCard === card.id ? 'grabbing' : 'grab'
    };
  };

  return (
    <section className="w-full mb-[84px]">
      <h1 className="text-title-secondary md:text-title-primary max-w-[335px] md:max-w-[820px] mx-auto mb-[66px]" style={{ textAlign: "center" }}>
        Created with Surbee
      </h1>
      <div className="max-w-[1400px] aspect-[1440/692] mx-auto relative overflow-hidden">
        <div className="h-full">
          <div className="relative h-full mx-auto">
            {cards.map((card) => (
              <div
                key={card.id}
                style={getCardStyle(card)}
                onMouseDown={(e) => handleMouseDown(e, card.id)}
              >
                <img
                  className="overflow-hidden object-cover transition-shadow duration-200"
                  src={card.src}
                  style={{
                    width: "128px",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: draggedCard === card.id ? '0 8px 25px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseEnter={(e) => {
                    if (draggedCard !== card.id) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedCard !== card.id) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }
                  }}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
