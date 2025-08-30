"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
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

  useEffect(() => {
    if (!user) return;

    setConnectionStatus('connecting');

    // Subscribe to presence for online users count
    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const newState = channel.presenceState();
          setOnlineUsers(Object.keys(newState).length);
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Error handling presence sync:', error);
          setConnectionStatus('error');
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        try {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString(),
            });
            setConnectionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('error');
          }
        } catch (error) {
          console.error('Error tracking presence:', error);
          setConnectionStatus('error');
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
        setConnectionStatus('disconnected');
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    };
  }, [user]);

  const subscribeToProject = (projectId: string) => {
    const messagesChannel = supabase
      .channel(`project_messages:${projectId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          try {
            const newMessage = {
              id: payload.new.id,
              project_id: payload.new.project_id,
              content: payload.new.content,
              is_user: payload.new.is_user,
              timestamp: new Date(payload.new.created_at)
            };
            setChatMessages(prev => [...prev, newMessage]);
          } catch (error) {
            console.error('Error processing new chat message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(messagesChannel);
      } catch (error) {
        console.error('Error unsubscribing from project messages:', error);
      }
    };
  };

  const subscribeToUserProjects = () => {
    if (!user) return () => {};

    const projectsChannel = supabase
      .channel(`user_projects:${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const update = {
            id: payload.new.id,
            type: 'created' as const,
            project: payload.new,
            timestamp: new Date()
          };
          setProjectUpdates(prev => [...prev.slice(-9), update]);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const update = {
            id: payload.new.id,
            type: 'updated' as const,
            project: payload.new,
            timestamp: new Date()
          };
          setProjectUpdates(prev => [...prev.slice(-9), update]);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const update = {
            id: payload.old.id,
            type: 'deleted' as const,
            project: payload.old,
            timestamp: new Date()
          };
          setProjectUpdates(prev => [...prev.slice(-9), update]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
    };
  };

  const reconnect = () => {
    if (user) {
      setConnectionStatus('connecting');
      // Force re-render of useEffect to reconnect
      window.location.reload();
    }
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