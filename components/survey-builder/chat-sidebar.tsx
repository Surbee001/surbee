import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import HistoryTimeline from './history-timeline';
import ChatMessage from './chat-message';
import type { ChatMessageProps } from './chat-message';
import { useBuilder } from './builder-context';
import {
  Loader2,
  ChevronsLeft,
  MessageSquarePlus,
  Sparkles,
} from 'lucide-react';

export default function ChatSidebar({
  className,
}: {
  className?: string;
}) {
  const { survey, updateSurvey, setIsGenerating, isGenerating } = useBuilder();
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessageProps = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Start generating
    setIsGenerating(true);

    try {
      const res = await fetch('/api/survey-builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(({ role, content }) => ({ role, content })),
          survey,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();

      const assistantMsg: ChatMessageProps = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Survey updated ✅',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.survey) {
        if (!survey) updateSurvey(data.survey);
        else updateSurvey(data.survey);
      }
    } catch (err: any) {
      const errorMsg: ChatMessageProps = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside
      className={cn('bg-sidebar h-full flex flex-col w-[500px]', className)}
    >
      {/* <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 flex items-center justify-center hover:bg-muted/20 rounded-full m-2 text-muted-foreground"
      >
        {open ? <ChevronsLeft size={18} /> : <MessageSquarePlus size={18} />}
      </button> */}

      <>
        {/* Header */}
        <header className="px-4 pb-2 pt-3">
          <h2 className="text-lg font-semibold">Smart Builder</h2>
        </header>

        {/* History */}
        <HistoryTimeline />

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="animate-spin size-4" /> Generating...
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {['Add rating', 'Shorten survey', 'Change color'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInput(chip)}
              className="px-2 py-1 text-xs rounded-full bg-muted/20 hover:bg-muted/30 text-muted-foreground"
            >
              <Sparkles size={12} className="inline mr-1" /> {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          className="p-3 border-t border-zinc-800 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-muted/20 outline-none text-sm"
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
            disabled={isGenerating || !input.trim()}
          >
            Send
          </button>
        </form>
      </>
    </aside>
  );
}
