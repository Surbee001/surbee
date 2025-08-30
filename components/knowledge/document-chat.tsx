'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  Copy,
  MessageSquare,
  User,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentChatProps {
  document: {
    id: string;
    title: string;
    authors: string;
    summary: string;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DocumentChat({ document }: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock suggested questions
  const suggestedQuestions = [
    "What are the main findings?",
    "How does this relate to other research?",
    "What are the practical implications?",
    "What questions does this raise?"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: `Based on the document "${document.title}", I can help you understand the key concepts and findings. The research presents important insights about aging and inflammation mechanisms.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">
          Chronic Inflammatio...
        </h3>
      </div>

      {/* Summary Section */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="mb-3">
          <h4 className="text-xs font-medium text-zinc-400 mb-2">SUMMARY</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            This review explores the interplay between chronic inflammation and aging, highlighting key mechanisms and therapeutic targets.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Cite
          </Button>
        </div>

        {/* Suggested Questions */}
        <div>
          <h5 className="text-xs font-medium text-zinc-400 mb-2">SUGGESTED</h5>
          <div className="space-y-1">
            {suggestedQuestions.map((question, index) => (
              <button
                type="button"
                key={`suggestion-${index}-${question.slice(0, 10)}`}
                onClick={() => handleSuggestedQuestion(question)}
                className="block w-full text-left text-xs text-zinc-400 hover:text-zinc-300 py-1 px-2 rounded hover:bg-zinc-800/50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Ask me anything about this document</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex gap-2 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                  {message.type === 'user' ? (
                    <User className="w-3 h-3 text-zinc-400" />
                  ) : (
                    <Bot className="w-3 h-3 text-blue-400" />
                  )}
                </div>
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}>
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3 h-3 text-blue-400" />
            </div>
            <div className="bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about this document..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-zinc-600 text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
