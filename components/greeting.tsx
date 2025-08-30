'use client';

import { useSession } from 'next-auth/react';

const greetingMessages = [
  'Ready to create something',
  "Let's design your next survey",
  'Time to brainstorm innovative ideas',
  'Ready to craft your next project',
  "Let's build something amazing",
  'Time to transform your ideas into reality',
  'Ready to gather valuable feedback',
  "Let's create an engaging experience",
  'Time to design your perfect survey flow',
  'Ready to make something incredible',
];

// Deterministic pseudo-random number generator (mulberry32)
const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function getDaySeed() {
  const now = new Date();
  // YYYY-MM-DD as seed
  const dateStr = now.toISOString().slice(0, 10);
  // Simple hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const Greeting = ({ children }: { children?: React.ReactNode }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] || '';
  const seed = getDaySeed();
  const rand = mulberry32(seed);
  const index = Math.floor(rand * greetingMessages.length);
  const greetingMessage = `${greetingMessages[index]}${userName ? `, ${userName}` : ''}`;

  return (
    <div className="flex flex-col items-center w-full font-dmsans px-4 pt-20">
      <img
        src="https://raw.githubusercontent.com/Surbee001/webimg/bc4b38fc836ccbfacffea43e33bf6cc88d45aaf1/BEE%20Logo%20Surbee.svg"
        alt="Surbee Logo"
        className="h-14 w-auto mb-4 brightness-0 invert"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <div className="text-3xl md:text-4xl font-headline text-gray-100 text-center mb-4">
        {greetingMessage}
      </div>
      <div className="w-full max-w-2xl flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
