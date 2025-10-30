'use client';

import { DefaultChatTransport } from '@/lib/ai/mock';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { PromptBox } from './ui/chatgpt-prompt-input';
import { Greeting } from './greeting';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const showGreeting = messages.length === 0;

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-[#191A1A] font-dmsans border-zinc-700">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        {/* Only show Messages if there are messages, otherwise show greeting and chatbox */}
        <AnimatePresence mode="wait">
          {showGreeting ? (
            <motion.div
              key="centered-chatbox"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: -30, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center w-full h-screen absolute top-0 left-0 z-10 pointer-events-none"
            >
              <div className="pointer-events-auto w-full flex flex-col items-center">
                <Greeting />
                <motion.form
                  layout
                  className="w-full max-w-5xl mt-4 font-headline"
                >
                  {!isReadonly && (
                    <PromptBox
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          const textarea =
                            event.currentTarget as HTMLTextAreaElement;
                          const value = textarea.value;
                          if (status !== 'ready') {
                            toast({
                              type: 'error',
                              description:
                                'Please wait for the model to finish its response!',
                            });
                          } else if (value.trim().length > 0) {
                            sendMessage({
                              role: 'user',
                              parts: [{ type: 'text', text: value }],
                            });
                            textarea.value = '';
                          }
                        }
                      }}
                      className="w-full text-lg"
                    />
                  )}
                </motion.form>
              </div>
            </motion.div>
          ) : (
            <>
              <Messages
                chatId={id}
                status={status}
                votes={votes}
                messages={messages}
                setMessages={setMessages}
                regenerate={regenerate}
                isReadonly={isReadonly}
                isArtifactVisible={isArtifactVisible}
              />
              <motion.form
                key="bottom-chatbox"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex mx-auto px-8 pb-8 md:pb-10 gap-2 w-full md:max-w-5xl font-headline"
              >
                {!isReadonly && (
                  <PromptBox
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        const textarea =
                          event.currentTarget as HTMLTextAreaElement;
                        const value = textarea.value;
                        if (status !== 'ready') {
                          toast({
                            type: 'error',
                            description:
                              'Please wait for the model to finish its response!',
                          });
                        } else if (value.trim().length > 0) {
                          sendMessage({
                            role: 'user',
                            parts: [{ type: 'text', text: value }],
                          });
                          textarea.value = '';
                        }
                      }
                    }}
                    className="w-full text-lg"
                  />
                )}
              </motion.form>
            </>
          )}
        </AnimatePresence>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
