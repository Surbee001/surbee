import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BotIcon, UserIcon } from '@/components/icons';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughtProcess?: string[];
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-4 my-4 w-full', { 'justify-end': isUser })}>
      <div className={cn('flex flex-col', { 'items-end': isUser })}>
        <div
          className="text-xl font-bold text-white font-[Gambarino-Regular]"
          style={{
            fontFamily: 'Gambarino-Regular, serif',
            fontWeight: 700,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
