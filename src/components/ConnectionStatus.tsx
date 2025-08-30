"use client";

import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const { connectionStatus, reconnect } = useRealtime();
  const { error: authError, clearError } = useAuth();

  if (!connectionStatus && !authError) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Real-time Connection Status */}
      {connectionStatus && connectionStatus !== 'connected' && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          connectionStatus === 'connecting' && "bg-yellow-100 text-yellow-800 border border-yellow-200",
          connectionStatus === 'disconnected' && "bg-gray-100 text-gray-600 border border-gray-200",
          connectionStatus === 'error' && "bg-red-100 text-red-800 border border-red-200"
        )}>
          {connectionStatus === 'connecting' && <Clock className="w-4 h-4 animate-pulse" />}
          {connectionStatus === 'disconnected' && <WifiOff className="w-4 h-4" />}
          {connectionStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          
          <span className="capitalize">
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'disconnected' && 'Offline'}
            {connectionStatus === 'error' && 'Connection Error'}
          </span>
          
          {connectionStatus === 'error' && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={reconnect}
              className="h-6 px-2"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      {/* Connected Status (brief display) */}
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span>Connected</span>
          <Wifi className="w-4 h-4" />
        </div>
      )}

      {/* Authentication Error */}
      {authError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-4 h-4" />
          <span>{authError}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={clearError}
            className="h-6 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}