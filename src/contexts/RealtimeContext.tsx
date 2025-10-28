"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase'; // Removed - no database
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeContextType {
  onlineUsers: number;
  projectUpdates: Array<{
    id: string;
    type: 'created' | 'updated' | 'deleted';
    project: any;
    timestamp: Date;
  }>;
  chatMessages: Array<{
    id: string;
    project_id: string;
    content: string;
    is_user: boolean;
    timestamp: Date;
  }>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribeToProject: (projectId: string) => () => void;
  subscribeToUserProjects: () => () => void;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Mock realtime - no database operations
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(1); // Mock online user
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connected');
  const [projectUpdates, setProjectUpdates] = useState<Array<{
    id: string;
    type: 'created' | 'updated' | 'deleted';
    project: any;
    timestamp: Date;
  }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    project_id: string;
    content: string;
    is_user: boolean;
    timestamp: Date;
  }>>([]);

  // Mock realtime - no database operations
  useEffect(() => {
    if (!user) return;

    // Mock connected status
    setConnectionStatus('connected');

    // Mock cleanup
    return () => {
      // No cleanup needed
    };
  }, [user]);

  const subscribeToProject = (projectId: string) => {
    // Mock subscription - no database operations
    return () => {
      // No cleanup needed
    };
  };

  const subscribeToUserProjects = () => {
    // Mock subscription - no database operations
    return () => {
      // No cleanup needed
    };
  };


  const reconnect = () => {
    // Mock reconnect - no actual reconnection needed
    setConnectionStatus('connected');
  };

  const value = {
    onlineUsers,
    projectUpdates,
    chatMessages,
    connectionStatus,
    subscribeToProject,
    subscribeToUserProjects,
    reconnect,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}