'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShimmer } from '@/components/ui/text-shimmer';
// Fallback simple input while ai-prompt-box is unavailable
function PromptInputBox({ onSend, isLoading, placeholder, className, value, onValueChange }: { onSend: (v: string) => void; isLoading?: boolean; placeholder?: string; className?: string; value: string; onValueChange: (v: string) => void }) {
  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(value) }}
          placeholder={placeholder}
          className="w-full bg-[#1f2121] text-[#e8e8e6] px-3 py-2 rounded-md border border-[#2d2f2f]"
        />
        <button onClick={() => onSend(value)} disabled={isLoading} className="px-4 py-2 bg-[#FF5F0B] text-black rounded-md disabled:opacity-50">Send</button>
      </div>
    </div>
  )
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  thinkingProcess?: string; // Streamed thinking text
  sources?: Source[];
  isComplete?: boolean;
  checkpoint?: string;
  isThinkingActive?: boolean; // To control thinking section visibility
  isSearchingActive?: boolean; // To control search queries visibility
  isReadingSourcesActive?: boolean; // To control reading sources visibility
  thinkingDuration?: number; // Duration of thinking in seconds
}

interface Source {
  id: string;
  title: string;
  domain: string;
  url: string; // Added URL for redirection
  status: 'searching' | 'reading' | 'completed';
}

interface Conversation {
  id: string;
  messages: Message[];
  title: string;
  timestamp: Date;
}

const mockThinkingSteps = [
  'Identifying the most influential academic papers related to gravity to provide the most significant contributions in the field.',
  'Analyzing historical significance and citation patterns of gravitational physics papers.',
  "Evaluating the foundational impact of Newton's and Einstein's contributions to gravity theory.",
  'Synthesizing findings to present the two most famous and influential papers.',
];

const mockSearchQueries = [
  'most famous papers on gravity',
  'classic papers on gravity',
  'seminal gravity research papers',
];

const mockSources: Source[] = [
  {
    id: '1',
    title: "Mach's Principle: From Newton's Bucket to Quantum Gravity",
    domain: 'iopscience.iop',
    url: 'https://iopscience.iop.org/article/10.1088/1361-6382/aa51f2',
    status: 'searching',
  },
  {
    id: '2',
    title: 'Approaches to Quantum Gravity',
    domain: 'iopscience.iop',
    url: 'https://iopscience.iop.org/book/978-0-7503-1070-2',
    status: 'searching',
  },
  {
    id: '3',
    title:
      'Probability Around the Quantum Gravity Part III.1: Planar Pure Gravity',
    domain: 'semanticscholar',
    url: 'https://www.semanticscholar.org/paper/Probability-Around-the-Quantum-Gravity-Part-III.1%3A-Ambj%C3%B8rn-Jurkiewicz/1234567890abcdef',
    status: 'searching',
  },
  {
    id: '4',
    title:
      'Focus issue on gravity, supergravity, and fundamental physics: the Richard Arno...',
    domain: 'iopscience.iop',
    url: 'https://iopscience.iop.org/journal/1361-6382/page/Focus_issue_on_gravity',
    status: 'searching',
  },
  {
    id: '5',
    title:
      'Is Fractality : The Electrical Mechanism of Gravity , ( and Perception and Color ...',
    domain: 'semanticscholar',
    url: 'https://www.semanticscholar.org/paper/Is-Fractality-%3A-The-Electrical-Mechanism-of-Gravity-Perception-and-Color-El-Naschie/abcdef1234567890',
    status: 'searching',
  },
  {
    id: '6',
    title: 'Quantum Gravity (Cambridge Monographs on Mathematical Physics)',
    domain: 'iopscience.iop',
    url: 'https://iopscience.iop.org/book/978-0-521-82960-0',
    status: 'searching',
  },
  {
    id: '7',
    title: 'Moral dilemma: To operate or not to operate',
    domain: 'archpedneurosurg.com',
    url: 'https://www.archpedneurosurg.com/article/S2214-7519(14)00002-X/fulltext',
    status: 'searching',
  },
];

export default function Component() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedThinkingId, setExpandedThinkingId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});
  const [currentSourcesState, setCurrentSourcesState] = useState<Source[]>([]);
  const [currentInput, setCurrentInput] = useState(''); // State for the input field
  const [isInitialState, setIsInitialState] = useState(true); // New state to manage initial vs chat view

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thinkingStartTimeRef = useRef<number | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages.length, isProcessing]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lyra-conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(
        parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        })),
      );
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('lyra-conversations', JSON.stringify(convs));
    setConversations(convs);
  };

  const processMessage = async (inputMessage: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
    };

    let conversation = currentConversation;
    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        messages: [],
        title:
          inputMessage.trim().slice(0, 50) +
          (inputMessage.length > 50 ? '...' : ''),
        timestamp: new Date(),
      };
      setCurrentConversation(conversation);
    }

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
    };
    setCurrentConversation(updatedConversation);
    setIsProcessing(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      thinkingProcess: '',
      sources: [],
      isComplete: false,
      isThinkingActive: true, // Thinking starts active
      isSearchingActive: false,
      isReadingSourcesActive: false,
      thinkingDuration: 0,
    };

    setMessagesForConversation(updatedConversation.id, [
      ...updatedConversation.messages,
      initialAssistantMessage,
    ]);
    setExpandedThinkingId(assistantMessageId); // Auto-expand thinking process
    setActiveTab((prev) => ({ ...prev, [assistantMessageId]: 'answer' })); // Default to answer tab

    thinkingStartTimeRef.current = Date.now();

    // Simulate thinking process (streaming)
    await streamThinkingProcess(assistantMessageId, updatedConversation.id);

    // Simulate finding sources
    await simulateFindingSources(assistantMessageId, updatedConversation.id);

    const thinkingEndTime = Date.now();
    const duration = Math.floor(
      (thinkingEndTime - thinkingStartTimeRef.current!) / 1000,
    );

    // Generate AI response (streaming)
    await streamAIResponse(
      assistantMessageId,
      updatedConversation.messages,
      updatedConversation.id,
    );

    // Finalize message state
    setMessagesForConversation(updatedConversation.id, (prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              isComplete: true,
              isThinkingActive: false, // Thinking process is now complete and can be collapsed
              thinkingDuration: duration,
              checkpoint: `Response generated for your query.`,
            }
          : msg,
      ),
    );

    setExpandedThinkingId(null); // Auto-collapse thinking process
    setIsProcessing(false);

    // Save to conversations
    const finalConversation = {
      ...updatedConversation,
      messages: [
        ...updatedConversation.messages,
        {
          ...initialAssistantMessage,
          content: (
            updatedConversation.messages.find(
              (m) => m.id === assistantMessageId,
            ) || initialAssistantMessage
          ).content, // Get final streamed content
          sources: currentSourcesState,
          isComplete: true,
          isThinkingActive: false,
          thinkingDuration: duration,
          checkpoint: `Response generated for your query.`,
        },
      ],
    };
    const existingIndex = conversations.findIndex(
      (c) => c.id === finalConversation.id,
    );
    if (existingIndex >= 0) {
      const updated = [...conversations];
      updated[existingIndex] = finalConversation;
      saveConversations(updated);
    } else {
      saveConversations([finalConversation, ...conversations]);
    }
  };

  const handleSubmit = async (inputMessage: string) => {
    if (!inputMessage.trim() || isProcessing) return;

    // Clear input immediately
    setCurrentInput('');

    // If it's the first message, transition to chat view
    if (isInitialState) {
      setIsInitialState(false);
      // The processMessage will be called immediately, and the UI transition
      // will be handled by framer-motion.
      processMessage(inputMessage);
    } else {
      processMessage(inputMessage);
    }
  };

  const setMessagesForConversation = (
    convId: string,
    newMessages: Message[] | ((prev: Message[]) => Message[]),
  ) => {
    setCurrentConversation((prevConv) => {
      if (!prevConv || prevConv.id !== convId) return prevConv;
      const updatedMessages =
        typeof newMessages === 'function'
          ? newMessages(prevConv.messages)
          : newMessages;
      return { ...prevConv, messages: updatedMessages };
    });
  };

  const streamThinkingProcess = async (messageId: string, convId: string) => {
    let streamedText = '';
    for (let i = 0; i < mockThinkingSteps.length; i++) {
      const step = mockThinkingSteps[i];
      for (let j = 0; j < step.length; j++) {
        streamedText += step[j];
        setMessagesForConversation(convId, (prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, thinkingProcess: streamedText }
              : msg,
          ),
        );
        await new Promise((resolve) => setTimeout(resolve, 10)); // Adjust speed
      }
      streamedText += '\n\n'; // Add line breaks between steps
      await new Promise((resolve) => setTimeout(resolve, 500)); // Pause between steps
    }

    // After thinking process, activate searching
    setMessagesForConversation(convId, (prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isSearchingActive: true } : msg,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause before sources

    // After searching, activate reading sources
    setMessagesForConversation(convId, (prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isReadingSourcesActive: true } : msg,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const simulateFindingSources = async (messageId: string, convId: string) => {
    setCurrentSourcesState([]);
    for (let i = 0; i < mockSources.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCurrentSourcesState((prev) => [
        ...prev,
        { ...mockSources[i], status: 'completed' },
      ]);
      setMessagesForConversation(convId, (prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                sources: [
                  ...(prevMessages.find((m) => m.id === messageId)?.sources ||
                    []),
                  { ...mockSources[i], status: 'completed' },
                ],
              }
            : msg,
        ),
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const streamAIResponse = async (
    messageId: string,
    conversationMessages: Message[],
    convId: string,
  ): Promise<void> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages.map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to generate response or response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        setMessagesForConversation(convId, (prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content: streamedContent } : msg,
          ),
        );
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setMessagesForConversation(convId, (prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: `Error generating response: ${(error as Error).message}. Here's a mock response instead:

**1. Isaac Newton's "Philosophiæ Naturalis Principia Mathematica" (Mathematical Principles of Natural Philosophy, 1687)**

This revolutionary work formulated the law of universal gravitation and unified terrestrial and celestial mechanics under a single set of principles, transforming the understanding of motion and force.

**2. Albert Einstein's "The Foundation of the General Theory of Relativity" (1916)**

In this seminal paper, Einstein presented the general theory of relativity, describing gravity as the curvature of spacetime and fundamentally changing how scientists understand gravity at all scales.

These foundational papers remain the most influential in the history of gravitational physics.`,
              }
            : msg,
        ),
      );
    }
  };

  const restoreToCheckpoint = (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(
      (m) => m.id === messageId,
    );
    if (messageIndex === -1) return;

    const restoredConversation = {
      ...currentConversation,
      messages: currentConversation.messages.slice(0, messageIndex + 1),
    };

    setCurrentConversation(restoredConversation);

    const existingIndex = conversations.findIndex(
      (c) => c.id === restoredConversation.id,
    );
    if (existingIndex >= 0) {
      const updated = [...conversations];
      updated[existingIndex] = restoredConversation;
      saveConversations(updated);
    }
  };

  const getSourceIcon = (status: string) => {
    switch (status) {
      case 'searching':
        return (
          <Clock className="w-4 h-4 text-[#3d3d3b] mt-0.5 flex-shrink-0 animate-pulse" />
        );
      case 'reading':
        return (
          <FileText className="w-4 h-4 text-[#FF5F0B] mt-0.5 flex-shrink-0" />
        );
      case 'completed':
        return (
          <CheckCircle className="w-4 h-4 text-[#FF5F0B] mt-0.5 flex-shrink-0" />
        );
      default:
        return (
          <Clock className="w-4 h-4 text-[#3d3d3b] mt-0.5 flex-shrink-0" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#e8e8e6] flex flex-col relative">
      {/* Initial State */}
      <AnimatePresence>
        {isInitialState && (
          <motion.div
            key="initial-state"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center mb-12">
              <h1
                className="text-4xl font-bold text-[#e8e8e6] mb-4"
                style={{ fontFamily: 'Gambarino, serif' }}
              >
                Hello, I'm Lyra
              </h1>
            </div>
            <div className="w-full max-w-2xl">
              <PromptInputBox
                onSend={handleSubmit}
                isLoading={isProcessing}
                placeholder="What papers are on gravity, give me the two most famous ones"
                className="mx-auto"
                value={currentInput}
                onValueChange={setCurrentInput}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat State */}
      <AnimatePresence>
        {!isInitialState && (
          <motion.div
            key="chat-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Invisible Scroll Container - Cuts off before chatbox */}
            <div className="h-full overflow-y-auto custom-scrollbar pb-32">
              {/* Main Content Area */}
              <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {currentConversation?.messages.map((message, index) => (
                  <div key={message.id} className="space-y-6">
                    {message.type === 'user' ? (
                      <div className="text-left">
                        <h1
                          className="text-4xl font-bold text-[#e8e8e6]"
                          style={{ fontFamily: 'Gambarino, serif' }}
                        >
                          {message.content}
                        </h1>
                        <div className="border-b border-zinc-700 my-6" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex items-center space-x-6 mb-6">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTab((prev) => ({
                                ...prev,
                                [message.id]: 'answer',
                              }))
                            }
                            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                              activeTab[message.id] === 'answer'
                                ? 'text-[#e8e8e6] border-[#FF5F0B]'
                                : 'text-[#666] border-transparent hover:text-[#e8e8e6]'
                            }`}
                            style={{ fontFamily: 'DM Sans' }}
                          >
                            <span className="w-4 h-4 bg-[#FF5F0B] rounded-sm"></span>
                            <span>Answer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTab((prev) => ({
                                ...prev,
                                [message.id]: 'sources',
                              }))
                            }
                            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                              activeTab[message.id] === 'sources'
                                ? 'text-[#e8e8e6] border-[#FF5F0B]'
                                : 'text-[#666] border-transparent hover:text-[#e8e8e6]'
                            }`}
                            style={{ fontFamily: 'DM Sans' }}
                          >
                            <span className="w-4 h-4 bg-[#FF5F0B] rounded-sm"></span>
                            <span>Sources</span>
                            <Badge
                              variant="secondary"
                              className="bg-[#2d2f2f] text-[#e8e8e6] text-xs ml-2"
                            >
                              {message.sources?.length || 0}
                            </Badge>
                          </button>
                        </div>

                        {/* Thinking Process */}
                        <AnimatePresence>
                          {(message.isThinkingActive ||
                            (message.thinkingProcess &&
                              message.thinkingProcess.length > 0)) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-l-2 border-[#3d3d3b] pl-4 space-y-3 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedThinkingId(
                                    expandedThinkingId === message.id
                                      ? null
                                      : message.id,
                                  )
                                }
                                className="flex items-center justify-between w-full text-left"
                              >
                                {message.isThinkingActive ? (
                                  <TextShimmer
                                    className="text-[#e8e8e6] font-medium"
                                    duration={1.5}
                                  >
                                    Thinking
                                  </TextShimmer>
                                ) : (
                                  <span
                                    className="text-[#e8e8e6] font-medium"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    Thought for {message.thinkingDuration}s
                                  </span>
                                )}
                                {expandedThinkingId === message.id ? (
                                  <ChevronUp className="w-5 h-5 text-[#888]" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-[#888]" />
                                )}
                              </button>

                              {expandedThinkingId === message.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 space-y-3"
                                >
                                  <div
                                    className="text-[#888] text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    {message.thinkingProcess}
                                  </div>

                                  {/* Searching Queries */}
                                  {message.isSearchingActive && (
                                    <div className="space-y-2">
                                      <div
                                        className="text-[#e8e8e6] font-medium text-sm"
                                        style={{ fontFamily: 'DM Sans' }}
                                      >
                                        Searching
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {mockSearchQueries.map(
                                          (query, qIndex) => (
                                            <Badge
                                              key={qIndex}
                                              variant="secondary"
                                              className="bg-[#1f2121] text-[#e8e8e6] text-sm px-3 py-1 rounded-full flex items-center space-x-1"
                                            >
                                              <Search className="w-3 h-3 text-[#FF5F0B]" />
                                              <span
                                                style={{
                                                  fontFamily: 'DM Sans',
                                                }}
                                              >
                                                {query}
                                              </span>
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Reading Sources */}
                                  {message.isReadingSourcesActive &&
                                    message.sources &&
                                    message.sources.length > 0 && (
                                      <div className="space-y-2">
                                        <div
                                          className="text-[#e8e8e6] font-medium text-sm"
                                          style={{ fontFamily: 'DM Sans' }}
                                        >
                                          Reading sources •{' '}
                                          {message.sources.length}
                                        </div>
                                        <div className="bg-[#1f2121] rounded-lg p-4 space-y-3">
                                          {message.sources.map((source) => (
                                            <a
                                              key={source.id}
                                              href={source.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-start space-x-3 py-2 hover:bg-[#2d2f2f] rounded-md transition-colors cursor-pointer"
                                            >
                                              {getSourceIcon(source.status)}
                                              <div className="flex-1">
                                                <div
                                                  className="text-[#e8e8e6] mb-1"
                                                  style={{
                                                    fontFamily: 'DM Sans',
                                                  }}
                                                >
                                                  {source.title}
                                                </div>
                                                <div
                                                  className="text-[#3d3d3b] text-sm"
                                                  style={{
                                                    fontFamily: 'DM Sans',
                                                  }}
                                                >
                                                  {source.domain}
                                                </div>
                                              </div>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Tab Content */}
                        {activeTab[message.id] === 'answer' && (
                          <div
                            className="prose prose-invert max-w-none text-[#e8e8e6] leading-relaxed"
                            style={{ fontFamily: 'DM Sans' }}
                          >
                            <div className="whitespace-pre-wrap">
                              {message.content
                                .split('**')
                                .map((part, index) => {
                                  if (index % 2 === 1) {
                                    return <strong key={index}>{part}</strong>;
                                  }
                                  return part;
                                })}
                            </div>

                            {/* Quick Suggestions */}
                            {message.isComplete && (
                              <div className="mt-6 space-y-3">
                                <div
                                  className="text-[#888] text-sm"
                                  style={{ fontFamily: 'DM Sans' }}
                                >
                                  Quick actions
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="px-4 py-2 border border-[#444444] rounded-lg text-[#e8e8e6] text-sm hover:bg-[#2d2f2f] transition-colors"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    Build this survey
                                  </button>
                                  <button
                                    type="button"
                                    className="px-4 py-2 border border-[#444444] rounded-lg text-[#e8e8e6] text-sm hover:bg-[#2d2f2f] transition-colors"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    Add this page
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab[message.id] === 'sources' && (
                          <div className="space-y-4">
                            {message.sources?.map((source) => (
                              <a
                                key={source.id}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start space-x-3 hover:bg-[#1f2121] p-3 rounded-lg transition-colors"
                              >
                                <FileText className="w-5 h-5 text-[#FF5F0B] mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4
                                    className="text-[#e8e8e6] font-medium mb-1"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    {source.title}
                                  </h4>
                                  <p
                                    className="text-[#888] text-sm"
                                    style={{ fontFamily: 'DM Sans' }}
                                  >
                                    {source.domain}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Checkpoint Box */}
                        {message.isComplete && message.checkpoint && (
                          <div className="bg-[#1f2121] border border-[#2d2f2f] rounded-lg p-3 flex items-center justify-between">
                            <div
                              className="text-[#888] text-sm"
                              style={{ fontFamily: 'DM Sans' }}
                            >
                              {message.checkpoint}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-[#3d3d3b] hover:text-[#e8e8e6] hover:bg-[#2d2f2f]"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-[#3d3d3b] hover:text-[#e8e8e6] hover:bg-[#2d2f2f]"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-[#3d3d3b] hover:text-[#e8e8e6] hover:bg-[#2d2f2f]"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => restoreToCheckpoint(message.id)}
                                variant="ghost"
                                size="sm"
                                className="text-[#FF5F0B] hover:text-[#FF5F0B]/80 hover:bg-[#2a2a2a]"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chatbox at bottom - Fixed */}
            <div className="absolute bottom-0 left-0 right-0 py-4 px-6 flex justify-center">
              <PromptInputBox
                onSend={handleSubmit}
                isLoading={isProcessing}
                placeholder="Ask a follow-up question..."
                className="max-w-4xl"
                value={currentInput}
                onValueChange={setCurrentInput}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #121212;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d2f2f;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3d3d3b;
        }
      `}</style>
    </div>
  );
}
