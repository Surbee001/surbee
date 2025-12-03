"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Copy, ThumbsUp, ThumbsDown, Search, ChevronRight, CheckCircle2 } from "lucide-react";
import ChatInputLight from "@/components/ui/chat-input-light";
import { AIModel } from "@/components/ui/model-selector";
import { Response } from "@/components/ai-elements/response";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { SearchModal } from "./SearchModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DashboardChatContainerProps {
  userId: string;
  greeting: string;
}

// Mock responses for testing
const MOCK_RESPONSES = [
  "I found **3 surveys** in your account:\n\n1. **Customer Satisfaction Survey** - 127 responses\n2. **Product Feedback Form** - 89 responses\n3. **Employee Engagement Survey** - 45 responses\n\nWould you like me to analyze any of these?",
  "Here's a quick summary of your **Customer Satisfaction Survey**:\n\n- **Average rating**: 4.2/5 ⭐\n- **Response rate**: 68%\n- **Top feedback theme**: Users love the new dashboard design\n- **Area for improvement**: Mobile experience\n\nWould you like more detailed insights?",
  "Based on your surveys, here are some trends I noticed:\n\n📈 **Positive trends**:\n- Customer satisfaction up 12% this quarter\n- NPS score improved from 42 to 58\n\n📉 **Areas to watch**:\n- Response rates declining on longer surveys\n- Mobile users have lower completion rates\n\nWant me to create a detailed report?",
];

export function DashboardChatContainer({
  userId,
  greeting,
}: DashboardChatContainerProps) {
  const router = useRouter();
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("claude-haiku");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});
  const [isBuildMode, setIsBuildMode] = useState(false); // Default to chat mode
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const mockResponseIndex = useRef(0);
  const [effectfulMessages, setEffectfulMessages] = useState<Record<string, boolean>>({});
  const effectTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [searchWebEnabled, setSearchWebEnabled] = useState(true);
  const [selectedCreateType, setSelectedCreateType] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isModelExplicitlySelected, setIsModelExplicitlySelected] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerResponseEffect = useCallback((messageId: string) => {
    setEffectfulMessages((prev) => ({ ...prev, [messageId]: true }));
    const timeout = setTimeout(() => {
      setEffectfulMessages((prev) => {
        const { [messageId]: _, ...rest } = prev;
        return rest;
      });
      delete effectTimeoutsRef.current[messageId];
    }, 1400);
    effectTimeoutsRef.current[messageId] = timeout;
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      Object.values(effectTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleSendMessage = useCallback(
    (message: string, files?: any[]) => {
      if (!message.trim()) return;

      // If build mode is on, go straight to builder
      if (isBuildMode) {
        const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          sessionStorage.setItem('surbee_initial_prompt', message.trim());
          sessionStorage.setItem('surbee_selected_model', selectedModel);
          if (files && files.length > 0) {
            sessionStorage.setItem('surbee_initial_files', JSON.stringify(files));
          }
        } catch {}
        router.push(`/project/${projectId}`);
        return;
      }

      // Chat mode - add user message and mock response
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message.trim(),
      };

      setMessages(prev => [...prev, userMessage]);
      setHasStartedChat(true);
      setIsLoading(true);

      // Simulate AI response with delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: MOCK_RESPONSES[mockResponseIndex.current % MOCK_RESPONSES.length],
        };
        mockResponseIndex.current++;
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        triggerResponseEffect(assistantMessage.id);
      }, 1500);
    },
    [selectedModel, isBuildMode, router, triggerResponseEffect]
  );

  const handleModelChange = useCallback((model: AIModel) => {
    setSelectedModel(model);
  }, []);

  const handleCopyMessage = useCallback((messageId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }, []);

  const handleFeedback = useCallback((messageId: string, type: "up" | "down") => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: type }));
  }, []);

  const chatPanelMaxWidth = hasStartedChat && !isBuildMode ? 960 : 720;

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Greeting - positioned above the chatbox, fades out when chat starts */}
      <AnimatePresence mode="wait">
        {!hasStartedChat && (
          <motion.div
            className="absolute left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ bottom: 'calc(50% + 110px)' }}
          >
            <h1
              style={{
                fontFamily: "Kalice-Trial-Regular, sans-serif",
                fontSize: "42px",
                color: "var(--surbee-fg-primary)",
                lineHeight: "1.1",
                textAlign: "center",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0 0.3em",
              }}
            >
              {greeting.split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area - appears when chat starts */}
      <AnimatePresence>
        {hasStartedChat && !isBuildMode && (
          <motion.div
            ref={chatAreaRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              paddingTop: '0px',
              paddingBottom: '160px',
            }}
          >
            <motion.div
              className="mx-auto px-4 space-y-4"
              initial={{ maxWidth: '672px' }}
              animate={{ maxWidth: '820px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {messages.map((msg, idx) => (
                <div key={msg.id} className="space-y-2">
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 inline-block"
                        style={{
                          backgroundColor: "rgb(38, 38, 38)",
                          color: "#ffffff",
                          borderRadius: "18px",
                          maxWidth: "min(75%, 600px)",
                          wordBreak: "break-word",
                        }}
                      >
                        <p
                          className="whitespace-pre-wrap"
                          style={{ fontSize: "14px", lineHeight: "1.5" }}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-w-none ai-response-markdown text-sm leading-relaxed text-white">
                        {effectfulMessages[msg.id] ? (
                          <TextGenerateEffect
                            words={msg.content}
                            className="text-white"
                            textClassName="text-base leading-relaxed text-white break-words whitespace-pre-wrap"
                            duration={0.45}
                          />
                        ) : (
                          <Response>{msg.content}</Response>
                        )}
                      </div>

                      {/* Action buttons for last message */}
                      {idx === messages.length - 1 && !isLoading && (
                        <div className="flex items-center gap-0.5 pt-2">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                            title={copiedMessageId === msg.id ? "Copied!" : "Copy to clipboard"}
                          >
                            {copiedMessageId === msg.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, "up")}
                            className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                              feedbackGiven[msg.id] === "up" ? "bg-white/10" : ""
                            }`}
                            title="Good response"
                            disabled={!!feedbackGiven[msg.id]}
                          >
                            <ThumbsUp
                              className={`w-4 h-4 ${
                                feedbackGiven[msg.id] === "up"
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade overlay behind chatbox - only shows after chat starts */}
      {hasStartedChat && (
        <div
          className="absolute left-0 pointer-events-none"
          style={{
            bottom: '-18px',
            right: '8px',
            height: '220px',
            background: 'linear-gradient(to bottom, transparent 0%, #131314 35%, #131314 100%)',
            zIndex: 4,
          }}
        />
      )}

      {/* Chat Input Container - centered initially, animates to bottom after chat starts */}
      <div
        className="absolute left-0 right-0 px-4"
        style={{
          zIndex: 5,
          top: hasStartedChat ? 'calc(100% + 18px)' : '50%',
          transform: hasStartedChat ? 'translateY(-100%)' : 'translateY(-50%)',
          transition: 'top 0.5s cubic-bezier(0.32, 0.72, 0, 1), transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          style={{
            margin: '0 auto',
            width: '100%',
            maxWidth: hasStartedChat ? '820px' : '672px',
            transition: 'max-width 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <ChatInputLight
            onSendMessage={handleSendMessage}
            isInputDisabled={isLoading}
            placeholder={isBuildMode ? "What survey do you want to create today?" : "Ask about your surveys..."}
            showModelSelector={false}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            isBusy={isLoading}
            onStop={() => setIsLoading(false)}
            showBuildToggle={false}
            isBuildMode={isBuildMode}
            onToggleBuildMode={() => setIsBuildMode(!isBuildMode)}
            disableRotatingPlaceholders={hasStartedChat && !isBuildMode}
            hideAttachButton={true}
            compact={hasStartedChat}
          />
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // TODO: Handle file upload
                console.log('Files selected:', Array.from(e.target.files).map(f => f.name));
              }
              e.target.value = '';
            }}
          />

          {/* Action buttons below chatbox */}
          <div className="flex flex-wrap gap-1 sm:gap-2 items-center mt-2 w-full">
            {/* Create button with dropdown */}
            <div className="flex items-center">
              <DropdownMenu open={isCreateOpen} onOpenChange={(open) => {
                if (!selectedCreateType) setIsCreateOpen(open);
              }}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex flex-row justify-center items-center py-1.5 h-9 text-sm leading-5 whitespace-nowrap transition-all duration-200 relative gap-1.5 cursor-pointer rounded-full border border-transparent px-4 pl-3 font-normal ${
                      selectedCreateType
                        ? 'bg-[#0285ff11] hover:!bg-[#0285ff11] focus:!bg-[#0285ff11] active:!bg-[#0285ff11] data-[state=open]:!bg-[#0285ff11]'
                        : 'bg-transparent hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                    type="button"
                    style={{ color: selectedCreateType ? '#0285ff' : 'var(--surbee-fg-primary)' }}
                    onClick={() => {
                      if (!selectedCreateType) setIsCreateOpen(true);
                    }}
                  >
                    <svg
                      height="16"
                      width="16"
                      fill="none"
                      viewBox="0 0 16 16"
                      style={{ color: selectedCreateType ? '#0285ff' : 'rgba(232, 232, 232, 0.4)' }}
                    >
                      <path
                        d="M8.476 11.699v1.684a.45.45 0 0 1-.142.334.46.46 0 0 1-.34.142.46.46 0 0 1-.333-.142.45.45 0 0 1-.142-.334V11.7q0-.196.142-.34a.46.46 0 0 1 .334-.141q.196 0 .339.142a.46.46 0 0 1 .142.339m-4.588-.24 1.192-1.182a.46.46 0 0 1 .339-.137q.203 0 .333.137a.46.46 0 0 1 .137.339q0 .196-.137.328L4.56 12.136a.44.44 0 0 1-.339.132.46.46 0 0 1-.47-.47.46.46 0 0 1 .137-.34M2.646 7.553h1.695q.193 0 .334.142a.46.46 0 0 1 .142.333.46.46 0 0 1-.142.34.47.47 0 0 1-.334.136H2.646a.47.47 0 0 1-.333-.137.46.46 0 0 1-.143-.339q0-.191.143-.333a.46.46 0 0 1 .333-.142m2.434-1.76L3.893 4.595a.45.45 0 0 1-.137-.334.46.46 0 0 1 .476-.47q.196 0 .334.137L5.752 5.12a.46.46 0 0 1 .137.339.45.45 0 0 1-.137.334.46.46 0 0 1-.339.136.45.45 0 0 1-.333-.136M8.476 2.68v1.684a.46.46 0 0 1-.142.34.46.46 0 0 1-.34.141.46.46 0 0 1-.333-.142.46.46 0 0 1-.142-.339V2.681q0-.197.142-.334a.46.46 0 0 1 .334-.142q.196 0 .339.142a.45.45 0 0 1 .142.334m1.76 2.439 1.198-1.198a.45.45 0 0 1 .334-.136q.196 0 .334.136a.46.46 0 0 1 .136.34.46.46 0 0 1-.136.338l-1.187 1.193a.48.48 0 0 1-.345.136.45.45 0 0 1-.333-.136.45.45 0 0 1-.137-.334.46.46 0 0 1 .137-.34m3.107 3.385H11.66a.47.47 0 0 1-.334-.137.46.46 0 0 1-.142-.339q0-.191.142-.333a.46.46 0 0 1 .334-.142h1.684q.196 0 .339.142a.46.46 0 0 1 .142.333.47.47 0 0 1-.481.476m-.082 4.84a.53.53 0 0 1-.416.175.58.58 0 0 1-.426-.175L7.223 8.133a.604.604 0 0 1 0-.847.55.55 0 0 1 .416-.175q.257 0 .427.175l5.195 5.217q.17.175.17.415a.57.57 0 0 1-.17.427m-.345-.334q.072-.07.055-.153a.26.26 0 0 0-.082-.148L9.515 9.325l-.274.268 3.38 3.386a.27.27 0 0 0 .153.082.16.16 0 0 0 .142-.05"
                        fill="currentColor"
                      />
                    </svg>
                    <div
                      className="flex flex-row items-center overflow-hidden transition-all duration-300 ease-out"
                      style={{ width: selectedCreateType ? 'auto' : 'auto' }}
                    >
                      <div className="whitespace-nowrap">
                        <div className="flex flex-row items-center gap-1.5">
                          <span className="flex flex-row items-center truncate" style={{ color: selectedCreateType ? '#0285ff' : 'inherit' }}>
                            {selectedCreateType || 'Create'}
                          </span>
                          <div
                            className="flex-shrink-0 p-0.5 -mr-1 cursor-pointer hover:opacity-70 transition-all duration-300 ease-out"
                            style={{
                              opacity: selectedCreateType ? 1 : 0,
                              width: selectedCreateType ? '20px' : '0px',
                              transform: selectedCreateType ? 'scale(1)' : 'scale(0.5)',
                              pointerEvents: selectedCreateType ? 'auto' : 'none',
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedCreateType(null);
                              setIsBuildMode(false);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0285ff' }}>
                              <path d="M3.6 12.18a.61.61 0 0 0 .85 0l3.428-3.435 3.435 3.435a.6.6 0 0 0 .844-.85L8.73 7.893l3.428-3.428a.596.596 0 0 0 0-.85.6.6 0 0 0-.844 0L7.878 7.05 4.45 3.615a.61.61 0 0 0-.85 0 .61.61 0 0 0 0 .85l3.434 3.43L3.6 11.328a.61.61 0 0 0 0 .85Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{
                  borderRadius: '24px',
                  padding: '8px',
                  border: '1px solid rgba(232, 232, 232, 0.08)',
                  backgroundColor: 'rgb(19, 19, 20)',
                  boxShadow: 'rgba(0, 0, 0, 0.04) 0px 7px 16px',
                  width: '280px',
                }}
              >
                {/* Survey option */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => { setSelectedCreateType('Survey'); setIsBuildMode(true); setIsCreateOpen(false); }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 16 16" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="M6.08 5.5h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77H7.9a.3.3 0 0 0 .31-.3.3.3 0 0 0-.31-.32H6.08a.3.3 0 0 0-.32.32c0 .17.13.3.32.3m-2.35 2.81c0 1.07.52 1.6 1.57 1.6h5.4c1.05 0 1.57-.53 1.57-1.6v-7.7c0-1.06-.52-1.6-1.57-1.6H5.3c-1.05 0-1.57.54-1.57 1.6zm.82-.01V4.17c0-.51.27-.8.8-.8h5.3c.53 0 .8.29.8.8v7.67c0 .5-.27.79-.8.79h-5.3c-.53 0-.8-.28-.8-.8Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm mb-0.5">Survey</p>
                      <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>Build and publish surveys</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                {/* Charts option (disabled) */}
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '0' }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="M2.5 13.5v-11h1v10h10v1h-11zm2-2v-4h2v4h-2zm3 0v-7h2v7h-2zm3 0v-5h2v5h-2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-sm mb-0.5">Charts</p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(232, 232, 232, 0.1)',
                            color: 'rgba(232, 232, 232, 0.5)',
                            fontSize: '10px',
                          }}
                        >
                          Coming soon
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Sources button with dropdown */}
            <DropdownMenu open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 items-center rounded-full pr-3.5 pl-3 font-normal text-sm transition-all duration-200 cursor-pointer bg-transparent hover:bg-[rgba(255,255,255,0.05)]"
                  type="button"
                  style={{ color: 'var(--surbee-fg-primary)' }}
                >
                  <div className="flex items-center gap-2">
                    <svg height="16" width="16" viewBox="0 0 16 16" style={{ color: 'rgba(232, 232, 232, 0.4)' }}>
                      <path d="M3.085 7.81c0 .328.275.596.596.596h3.533v3.533c0 .321.268.596.596.596s.602-.275.602-.596V8.406h3.526a.6.6 0 0 0 .596-.596.607.607 0 0 0-.596-.602H8.412V3.682a.61.61 0 0 0-.602-.596.6.6 0 0 0-.596.596v3.526H3.68a.61.61 0 0 0-.596.602" fill="currentColor" />
                    </svg>
                    <span>Sources</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{
                  borderRadius: '24px',
                  padding: '8px',
                  border: '1px solid rgba(232, 232, 232, 0.08)',
                  backgroundColor: 'rgb(19, 19, 20)',
                  boxShadow: 'rgba(0, 0, 0, 0.04) 0px 7px 16px',
                  width: '280px',
                }}
              >
                {/* Search for surveys or templates */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => {
                    setIsSearchModalOpen(true);
                    setIsSourcesOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                      <path d="M1.719 6.484a5.35 5.35 0 0 0 5.344 5.344 5.3 5.3 0 0 0 3.107-1.004l3.294 3.301a.8.8 0 0 0 .57.228c.455 0 .77-.342.77-.79a.77.77 0 0 0-.221-.55L11.308 9.72a5.28 5.28 0 0 0 1.098-3.235 5.35 5.35 0 0 0-5.344-5.343A5.35 5.35 0 0 0 1.72 6.484m1.145 0a4.2 4.2 0 0 1 4.199-4.198 4.2 4.2 0 0 1 4.198 4.198 4.2 4.2 0 0 1-4.198 4.199 4.2 4.2 0 0 1-4.2-4.199" />
                    </svg>
                    <span className="text-sm">Search surveys or templates</span>
                  </div>
                </DropdownMenuItem>

                {/* Folders */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <svg height="20" width="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                      <path d="M4.782 16.187q-.996 0-1.498-.495-.495-.489-.495-1.473V6.481q0-.958.457-1.434t1.295-.476h1.81q.31 0 .539.044.234.045.425.146.197.102.406.28l.387.317q.242.203.464.292.222.082.546.082h6.093q.99 0 1.492.496.502.494.502 1.472v6.52q-.001.983-.476 1.472-.477.495-1.327.495zm.013-1.022h10.397q.47 0 .73-.247.26-.255.26-.743V7.757q0-.495-.26-.749t-.73-.254h-6.34q-.312 0-.547-.044-.234-.045-.431-.146a2.2 2.2 0 0 1-.4-.273l-.388-.324a1.7 1.7 0 0 0-.463-.292 1.4 1.4 0 0 0-.533-.089H4.75q-.456 0-.698.242-.24.24-.241.71v7.63q0 .495.254.75.255.247.73.247M3.41 9.078v-.959h13.165v.959z" />
                    </svg>
                    <span className="text-sm">Folders</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color: 'rgba(232, 232, 232, 0.4)' }} />
                  </div>
                </DropdownMenuItem>

                {/* Upload files */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => {
                    fileInputRef.current?.click();
                    setIsSourcesOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                      <path d="M12.405 8.789 8.17 13.024c-1.43 1.436-3.352 1.294-4.579.052-1.234-1.227-1.377-3.135.052-4.571l5.608-5.6c.86-.861 2.125-.98 2.948-.165.816.83.696 2.087-.157 2.948l-5.436 5.435c-.366.382-.815.27-1.07.015-.254-.261-.359-.695.008-1.077l3.86-3.846c.225-.232.24-.561.023-.778-.217-.21-.546-.194-.77.03L4.78 9.343c-.763.763-.734 1.93-.06 2.603.733.734 1.84.719 2.61-.052l5.467-5.466c1.399-1.399 1.339-3.24.12-4.459-1.19-1.19-3.06-1.28-4.46.12L2.813 7.742C.965 9.59 1.107 12.23 2.776 13.899c1.668 1.661 4.309 1.803 6.157-.037l4.272-4.273c.217-.217.217-.613-.007-.815-.217-.232-.569-.202-.793.015" />
                    </svg>
                    <span className="text-sm">Upload files</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator style={{ borderColor: 'rgba(232, 232, 232, 0.08)', margin: '4px 0' }} />

                {/* Search web toggle */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)' }}
                  onSelect={(e) => {
                    e.preventDefault();
                    setSearchWebEnabled(!searchWebEnabled);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Search size={16} style={{ color: 'rgba(232, 232, 232, 0.6)' }} />
                    <span className="text-sm">Search web</span>
                    <div
                      className="ml-auto w-8 h-5 rounded-full relative transition-colors duration-200"
                      style={{ backgroundColor: searchWebEnabled ? '#0285ff' : 'rgba(232, 232, 232, 0.2)' }}
                    >
                      <div
                        className="absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all duration-200"
                        style={{ left: searchWebEnabled ? '14px' : '2px' }}
                      />
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Model selector button */}
            <div className="flex items-center">
              <DropdownMenu open={isModelOpen} onOpenChange={(open) => {
                // Only allow opening if not clicking the reset button (handled by logic below)
                if (!isModelExplicitlySelected || open) setIsModelOpen(open);
              }}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex flex-row justify-center items-center py-1.5 h-9 text-sm leading-5 whitespace-nowrap transition-all duration-200 relative gap-1.5 cursor-pointer rounded-full border border-transparent px-4 pl-3 font-normal ${
                      isModelExplicitlySelected
                        ? 'bg-[#0285ff11] hover:!bg-[#0285ff11] focus:!bg-[#0285ff11] active:!bg-[#0285ff11] data-[state=open]:!bg-[#0285ff11]'
                        : 'bg-transparent hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                    type="button"
                    style={{ color: isModelExplicitlySelected ? '#0285ff' : 'var(--surbee-fg-primary)' }}
                    onClick={(e) => {
                      if (!isModelExplicitlySelected) setIsModelOpen(true);
                    }}
                  >
                    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: isModelExplicitlySelected ? '#0285ff' : 'rgba(232, 232, 232, 0.6)' }}>
                      <path d="M1.43 12.628c0 .402.268.678.67.678h.862v2.78c0 .401.268.66.67.66h2.77v.863c0 .401.276.67.678.67s.67-.268.67-.67v-.862h1.43v.862c0 .401.268.67.67.67s.678-.268.678-.67v-.862h1.423v.862c0 .401.268.67.67.67.41 0 .678-.268.678-.67v-.862h2.77c.402 0 .67-.26.67-.662v-2.787h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862v-1.43h.862c.402 0 .67-.268.67-.67 0-.401-.268-.678-.67-.678h-.862V7.748h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862V3.639c0-.401-.268-.67-.67-.67H13.3v-.853c0-.402-.268-.678-.678-.678-.402 0-.67.276-.67.678v.854h-1.423v-.854c0-.402-.276-.678-.678-.678s-.67.276-.67.678v.854H7.75v-.854c0-.402-.268-.678-.67-.678s-.678.276-.678.678v.854h-2.77c-.402 0-.67.268-.67.67v2.77H2.1c-.402 0-.67.268-.67.67 0 .401.268.678.67.678h.862V9.18H2.1c-.402 0-.67.276-.67.678 0 .401.268.67.67.67h.862v1.43H2.1c-.402 0-.67.268-.67.67m2.88 2.528V4.567c0-.184.067-.25.242-.25H15.15c.175 0 .242.066.242.25v10.59c0 .183-.067.242-.242.242H4.551c-.175 0-.242-.059-.242-.243m2.435-1.548h6.228c.427 0 .628-.201.628-.645v-6.21c0-.436-.201-.637-.628-.637H6.745c-.426 0-.636.2-.636.636v6.211c0 .444.21.645.636.645m.46-1.298V7.413c0-.125.085-.2.202-.2h4.897c.125 0 .2.075.2.2v4.897c0 .117-.075.201-.2.201H7.406a.193.193 0 0 1-.201-.2" />
                    </svg>
                    <div
                      className="flex flex-row items-center overflow-hidden transition-all duration-300 ease-out"
                    >
                      <div className="whitespace-nowrap">
                        <div className="flex flex-row items-center gap-1.5">
                          <span className="flex flex-row items-center truncate" style={{ color: isModelExplicitlySelected ? '#0285ff' : 'inherit' }}>
                            {!isModelExplicitlySelected ? 'Default' : selectedModel === 'claude-haiku' ? 'Claude Haiku 4.5' : selectedModel === 'gpt-5' ? 'GPT-5' : selectedModel === 'mistral' ? 'Lema 0.1' : selectedModel}
                          </span>
                          <div
                            className="flex-shrink-0 p-0.5 -mr-1 cursor-pointer hover:opacity-70 transition-all duration-300 ease-out"
                            style={{
                              opacity: isModelExplicitlySelected ? 1 : 0,
                              width: isModelExplicitlySelected ? '20px' : '0px',
                              transform: isModelExplicitlySelected ? 'scale(1)' : 'scale(0.5)',
                              pointerEvents: isModelExplicitlySelected ? 'auto' : 'none',
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsModelExplicitlySelected(false);
                              setSelectedModel('claude-haiku');
                              setIsModelOpen(false);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0285ff' }}>
                              <path d="M3.6 12.18a.61.61 0 0 0 .85 0l3.428-3.435 3.435 3.435a.6.6 0 0 0 .844-.85L8.73 7.893l3.428-3.428a.596.596 0 0 0 0-.85.6.6 0 0 0-.844 0L7.878 7.05 4.45 3.615a.61.61 0 0 0-.85 0 .61.61 0 0 0 0 .85l3.434 3.43L3.6 11.328a.61.61 0 0 0 0 .85Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                style={{
                  borderRadius: '24px',
                  padding: '8px',
                  border: '1px solid rgba(232, 232, 232, 0.08)',
                  backgroundColor: 'rgb(19, 19, 20)',
                  boxShadow: 'rgba(0, 0, 0, 0.04) 0px 7px 16px',
                  width: '300px',
                  maxHeight: '315px',
                  overflowY: 'auto',
                }}
              >
                {/* Default option */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => { handleModelChange('claude-haiku'); setIsModelExplicitlySelected(false); setIsModelOpen(false); }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="M1.43 12.628c0 .402.268.678.67.678h.862v2.78c0 .401.268.66.67.66h2.77v.863c0 .401.276.67.678.67s.67-.268.67-.67v-.862h1.43v.862c0 .401.268.67.67.67s.678-.268.678-.67v-.862h1.423v.862c0 .401.268.67.67.67.41 0 .678-.268.678-.67v-.862h2.77c.402 0 .67-.26.67-.662v-2.787h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862v-1.43h.862c.402 0 .67-.268.67-.67 0-.401-.268-.678-.67-.678h-.862V7.748h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862V3.639c0-.401-.268-.67-.67-.67H13.3v-.853c0-.402-.268-.678-.678-.678-.402 0-.67.276-.67.678v.854h-1.423v-.854c0-.402-.276-.678-.678-.678s-.67.276-.67.678v.854H7.75v-.854c0-.402-.268-.678-.67-.678s-.678.276-.678.678v.854h-2.77c-.402 0-.67.268-.67.67v2.77H2.1c-.402 0-.67.268-.67.67 0 .401.268.678.67.678h.862V9.18H2.1c-.402 0-.67.276-.67.678 0 .401.268.67.67.67h.862v1.43H2.1c-.402 0-.67.268-.67.67m2.88 2.528V4.567c0-.184.067-.25.242-.25H15.15c.175 0 .242.066.242.25v10.59c0 .183-.067.242-.242.242H4.551c-.175 0-.242-.059-.242-.243m2.435-1.548h6.228c.427 0 .628-.201.628-.645v-6.21c0-.436-.201-.637-.628-.637H6.745c-.426 0-.636.2-.636.636v6.211c0 .444.21.645.636.645m.46-1.298V7.413c0-.125.085-.2.202-.2h4.897c.125 0 .2.075.2.2v4.897c0 .117-.075.201-.2.201H7.406a.193.193 0 0 1-.201-.2" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm">Default</p>
                    </div>
                    {!isModelExplicitlySelected && (
                      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="M7.23 11.72c.22 0 .41-.1.55-.3l4.2-5.97c.07-.13.16-.28.16-.43 0-.3-.27-.5-.55-.5-.17 0-.33.12-.46.31l-3.92 5.6-1.9-2.28c-.15-.21-.3-.26-.49-.26a.52.52 0 0 0-.52.53c0 .14.07.28.16.41l2.2 2.58c.17.22.35.32.57.32Z" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>

                {/* GPT-5 */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => { handleModelChange('gpt-5'); setIsModelExplicitlySelected(true); setIsModelOpen(false); }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="M20.247 10.277a4.68 4.68 0 0 0-.412-3.888c-1.05-1.805-3.163-2.734-5.226-2.297A4.83 4.83 0 0 0 10.991 2.5c-2.108-.005-3.98 1.335-4.628 3.314a4.8 4.8 0 0 0-3.208 2.297 4.74 4.74 0 0 0 .597 5.613 4.68 4.68 0 0 0 .412 3.888c1.051 1.805 3.163 2.734 5.226 2.297a4.82 4.82 0 0 0 3.618 1.59c2.11.006 3.981-1.334 4.63-3.316a4.8 4.8 0 0 0 3.208-2.296 4.74 4.74 0 0 0-.598-5.612v.002Zm-7.238 9.981a3.63 3.63 0 0 1-2.31-.824c.03-.015.08-.043.114-.063l3.834-2.185a.61.61 0 0 0 .316-.539v-5.334l1.62.924a.06.06 0 0 1 .031.043v4.418c-.002 1.964-1.614 3.556-3.605 3.56m-7.752-3.267a3.5 3.5 0 0 1-.43-2.386l.113.067 3.834 2.185a.63.63 0 0 0 .63 0l4.681-2.667v1.847a.06.06 0 0 1-.023.049l-3.875 2.208c-1.727.981-3.932.398-4.93-1.303m-1.01-8.259a3.6 3.6 0 0 1 1.878-1.56l-.001.13v4.37a.61.61 0 0 0 .314.538l4.681 2.667-1.62.923a.06.06 0 0 1-.055.005l-3.876-2.21a3.54 3.54 0 0 1-1.321-4.862Zm13.314 3.058-4.68-2.668L14.5 8.2a.06.06 0 0 1 .055-.005l3.876 2.208a3.536 3.536 0 0 1 1.32 4.865 3.6 3.6 0 0 1-1.877 1.56v-4.5a.61.61 0 0 0-.313-.538m1.613-2.396-.113-.067-3.835-2.185a.63.63 0 0 0-.63 0L9.916 9.81V7.963a.06.06 0 0 1 .022-.05l3.876-2.206c1.726-.983 3.933-.398 4.929 1.306.42.72.573 1.562.43 2.381zm-10.14 3.291-1.62-.923a.06.06 0 0 1-.032-.044V7.301C7.383 5.335 9 3.741 10.993 3.742c.843 0 1.659.292 2.307.824l-.114.064-3.834 2.185a.61.61 0 0 0-.315.538zv.002Zm.88-1.872L12 9.625l2.085 1.187v2.376L12 14.375l-2.085-1.187z" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm mb-0.5">GPT-5</p>
                      <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>Flagship GPT model for complex tasks</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                {/* Claude Haiku 4.5 */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '1px' }}
                  onSelect={() => { handleModelChange('claude-haiku'); setIsModelExplicitlySelected(true); setIsModelOpen(false); }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path d="m4.35 9.87 2.37-1.33.03-.11-.03-.07H6.6l-.4-.02-1.35-.04-1.16-.05-1.14-.06-.28-.06L2 7.78l.03-.18.24-.16.34.03.76.06 1.14.07.82.05 1.23.13h.2l.02-.08-.06-.05-.06-.05-1.18-.8-1.27-.84-.67-.49-.36-.24L3 5l-.08-.5.33-.37.44.03.1.03.45.35.96.74 1.24.91.18.15.08-.05v-.03l-.08-.14-.67-1.22-.72-1.25-.32-.52-.09-.3a1.4 1.4 0 0 1-.05-.37l.37-.5.2-.07.5.06.21.18.32.71.5 1.12.77 1.51.23.46.12.41.05.13h.08v-.08l.06-.85.12-1.05.11-1.35.04-.37.2-.46.37-.25.29.14.24.34-.03.23-.15.92-.27 1.45-.19.98h.1l.13-.13.5-.65.82-1.03.36-.41.43-.45.27-.22h.52l.38.56-.17.59-.53.67-.44.57-.64.85-.39.68.04.06h.09l1.43-.32.77-.13.92-.16.42.2.04.2-.16.4-.99.23-1.15.24-1.72.4-.02.02.02.03.78.07.33.02h.8l1.52.12.4.25.23.32-.04.25-.6.3-.83-.19-1.91-.45-.65-.17h-.1v.06l.55.53 1 .9 1.26 1.17.06.3-.16.22-.17-.02-1.1-.83-.43-.38-.96-.8h-.07v.08l.23.32 1.17 1.76.06.55-.09.17-.3.1-.33-.05-.7-.97-.7-1.08-.57-.98-.07.04-.34 3.63-.16.19-.36.14-.3-.23-.17-.37.16-.74.2-.97.15-.76.15-.95.08-.32v-.02l-.07.01-.72.98L6.08 12l-.86.92L5 13l-.36-.18.04-.34.2-.29 1.19-1.52.72-.94.46-.54V9.1h-.03l-3.17 2.06-.56.08-.25-.23.03-.38.12-.12.95-.65Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm mb-0.5">Claude Haiku 4.5</p>
                      <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>Fast responses with near-frontier intelligence</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                {/* Lema 0.1 */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-fg-primary)', marginBottom: '0' }}
                  onSelect={() => { handleModelChange('mistral'); setIsModelExplicitlySelected(true); setIsModelOpen(false); }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.6)' }}>
                        <path clipRule="evenodd" d="M11.2 18.1q.8 1.825.8 3.9a9.9 9.9 0 0 1 .775-3.9 10.3 10.3 0 0 1 2.15-3.175A9.9 9.9 0 0 1 18.1 12.8 9.6 9.6 0 0 1 22 12a9.9 9.9 0 0 1-3.9-.775 10.3 10.3 0 0 1-3.175-2.15q-1.35-1.35-2.15-3.175A9.9 9.9 0 0 1 12 2a9.6 9.6 0 0 1-.8 3.9 9.9 9.9 0 0 1-2.125 3.175q-1.35 1.35-3.175 2.15A9.9 9.9 0 0 1 2 12q2.075 0 3.9.8a9.9 9.9 0 0 1 3.175 2.125q1.35 1.35 2.125 3.175" fillRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm mb-0.5">Lema 0.1</p>
                      <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>Surbee's survey-optimized model</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {/* Disclaimer text - only shows after chat starts */}
          {hasStartedChat && (
            <p
              className="text-center mt-2"
              style={{
                fontSize: '11px',
                color: 'rgba(232, 232, 232, 0.4)',
              }}
            >
              Surbee can make mistakes. Double check important info.
            </p>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
