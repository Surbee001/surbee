'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatMessage, { type ChatMessageProps } from './chat-message';
import { useBuilder } from './builder-context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PromptBox } from '../ui/chatgpt-prompt-input';
import LatestChange from './latest-change';
import ThoughtProcess from './thought-process';
import AssistantMessage from './assistant-message';
import SpinnerAnimation from './spinner-animation';

interface AIResponse extends ChatMessageProps {
  role: 'assistant';
  thoughtProcess: string[];
  phase?: 'thinking' | 'streaming' | 'answered';
  changes?: Record<string, any>; // For history
  agentUsed?: string;
  spinnerStates?: string[];
  currentSpinnerIndex?: number;
}

export default function SurveyChat({
  className,
  onFirstMessageSent,
}: {
  className?: string;
  onFirstMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState<(ChatMessageProps | AIResponse)[]>(
    [],
  );
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousSurvey, setPreviousSurvey] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [spinnerStates, setSpinnerStates] = useState<string[]>([]);
  const [currentSpinnerIndex, setCurrentSpinnerIndex] = useState(0);

  // integrate builder context
  const {
    survey,
    updateSurvey,
    setIsGenerating: setBuilderIsGenerating,
  } = useBuilder();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        setIsScrolled(chatContainerRef.current.scrollTop > 10);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const sendMessage = async (value: string) => {
    if (!value.trim()) return;
    if (messages.length === 0 && onFirstMessageSent) {
      onFirstMessageSent();
    }

    // Store the current survey before making changes
    setPreviousSurvey(JSON.parse(JSON.stringify(survey)));

    setIsGenerating(true);
    setBuilderIsGenerating(true);

    const userMsg: ChatMessageProps = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
    };

    const aiThinking: AIResponse = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      thoughtProcess: [], // Will be populated via streaming
      phase: 'thinking',
    };

    setMessages((prev) => [...prev, userMsg, aiThinking]);
    setInput('');

    try {
      const requestBody: any = {
        messages: [{ role: 'user', content: value }],
        survey,
        stream: true, // Enable streaming
      };

      const res = await fetch('/api/survey-builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  // Update spinner states if available
                  if (data.spinnerStates && data.spinnerStates.length > 0) {
                    setSpinnerStates(data.spinnerStates);
                  }

                  // Update current spinner index if available
                  if (typeof data.currentSpinnerIndex === 'number') {
                    setCurrentSpinnerIndex(data.currentSpinnerIndex);
                  }

                  // Update the thinking message based on stream type
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiThinking.id
                        ? {
                            ...msg,
                            ...data,
                            phase: data.phase || 'thinking',
                          }
                        : msg,
                    ),
                  );

                  if (data.phase === 'answered' && data.survey) {
                    updateSurvey(data.survey);
                  }
                } catch (e) {
                  console.error('Error parsing stream:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Fallback to regular JSON response
        const json = await res.json();
        console.log('AI Response:', json);

        if (json.survey) {
          updateSurvey(json.survey);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiThinking.id
              ? {
                  ...aiThinking,
                  content:
                    json.assistantMessage ||
                    "I've created your survey! Here are some suggestions for next steps.",
                  thoughtProcess: json.thoughtProcess || [
                    'Generated survey structure',
                    'Applied design principles',
                  ],
                  changes: json.changes,
                  phase: 'answered',
                  agentUsed: json.agentUsed,
                }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error('Survey chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiThinking.id
            ? {
                ...aiThinking,
                content:
                  'Sorry, I encountered an error while creating your survey. Please try again.',
                thoughtProcess: ['Error occurred during processing'],
                phase: 'answered',
              }
            : msg,
        ),
      );
    } finally {
      setIsGenerating(false);
      setBuilderIsGenerating(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col min-w-0 h-full w-full bg-[#191A1A] font-dmsans text-gray-100',
        className,
      )}
    >
      <div
        className={cn(
          'flex-1 p-4 overflow-y-auto relative bg-[#1a1a1a]',
          isScrolled &&
            "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-6 after:bg-gradient-to-b after:from-[#1a1a1a] after:to-transparent after:pointer-events-none after:z-10",
        )}
        ref={chatContainerRef}
      >
        {messages.map((msg) => {
          if (msg.role === 'assistant') {
            const assistantMsg = msg as AIResponse;
            return (
              <AssistantMessage
                key={assistantMsg.id}
                id={assistantMsg.id}
                role="assistant"
                content={assistantMsg.content}
                thoughtProcess={assistantMsg.thoughtProcess ?? []}
                phase={assistantMsg.phase}
                changes={(assistantMsg as AIResponse).changes}
                agentUsed={assistantMsg.agentUsed}
                previousSurvey={previousSurvey}
              />
            );
          }
          return <ChatMessage key={msg.id} {...msg} />;
        })}
      </div>

      <div className="border-t border-zinc-800">
        <motion.div
          key="bottom-chatbox"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex mx-auto px-8 pb-8 md:pb-10 gap-2 w-full md:max-w-5xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="w-full"
          >
            <PromptBox
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
              className="w-full border border-zinc-700 rounded-xl shadow-lg text-lg font-headline"
              disabled={isGenerating}
              placeholder="What do you want to do next?"
            />
          </form>
        </motion.div>
      </div>
    </div>
  );
}
