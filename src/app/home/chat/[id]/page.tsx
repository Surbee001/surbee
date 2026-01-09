"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ImageKitProvider } from '@imagekit/next';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardChatContainer } from '@/components/dashboard/DashboardChatContainer';

function ChatContent() {
  const params = useParams();
  const chatId = params.id as string;
  const { user, userProfile, loading: authLoading } = useAuth();

  // Show loading state during initial auth loading
  if (authLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full max-w-2xl flex flex-col mx-auto flex-1 justify-center">
          <div className="text-center mb-4">
            <div className="skeleton-text mx-auto mb-6" style={{
              width: '350px',
              height: '3rem',
              borderRadius: '0.5rem',
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex flex-col h-full">
      <DashboardChatContainer
        userId={user.id}
        greeting=""
        initialChatId={chatId}
        isChatPage={true}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <Suspense fallback={
        <div className="flex flex-col h-full">
          <div className="w-full max-w-2xl flex flex-col mx-auto flex-1 justify-center">
            <div className="text-center mb-4">
              <div className="skeleton-text mx-auto mb-6" style={{
                width: '350px',
                height: '3rem',
                borderRadius: '0.5rem',
              }}></div>
            </div>
          </div>
        </div>
      }>
        <ChatContent />
      </Suspense>
    </ImageKitProvider>
  );
}
