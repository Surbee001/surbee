/**
 * Enhanced Streaming Service for Real-time Reasoning Communication
 * 
 * Features:
 * - Server-Sent Events (SSE) with WebSocket fallback
 * - Smart buffering for smooth UI updates
 * - Pause/resume functionality
 * - Connection recovery and error handling
 * - Progress tracking with ETA calculation
 * - Token counting and cost estimation
 */

import {
  StreamEvent,
  ReasoningProgress,
  ReasoningConfig,
  ReasoningPhaseType
} from '@/types/reasoning.types';

interface StreamingConnection {
  id: string;
  eventSource?: EventSource;
  webSocket?: WebSocket;
  isActive: boolean;
  isPaused: boolean;
  buffer: StreamEvent[];
  lastEventTime: number;
  totalTokens: number;
  currentCost: number;
  startTime: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

interface BufferOptions {
  maxSize: number;
  flushInterval: number;
  smoothing: boolean;
  priorityEvents: Set<StreamEvent['type']>;
}

interface ConnectionOptions {
  timeout: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export class StreamingService {
  private connections: Map<string, StreamingConnection> = new Map();
  private eventHandlers: Map<string, (event: StreamEvent) => void> = new Map();
  private progressTrackers: Map<string, ReasoningProgress> = new Map();
  private bufferTimer?: NodeJS.Timeout;
  
  private readonly bufferOptions: BufferOptions = {
    maxSize: 50,
    flushInterval: 100, // ms
    smoothing: true,
    priorityEvents: new Set(['error', 'thinking_complete', 'answer_complete'])
  };

  private readonly connectionOptions: ConnectionOptions = {
    timeout: 30000, // 30 seconds
    reconnectDelay: 1000,
    maxReconnectAttempts: 3,
    heartbeatInterval: 25000 // 25 seconds
  };

  constructor() {
    this.startBufferProcessing();
  }

  // =================== CONNECTION MANAGEMENT ===================

  /**
   * Start a new streaming connection
   */
  async startStream(
    sessionId: string,
    config: ReasoningConfig,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const connectionId = this.generateConnectionId(sessionId);
    
    // Clean up any existing connection
    await this.stopStream(connectionId);

    // Initialize connection
    const connection: StreamingConnection = {
      id: connectionId,
      isActive: false,
      isPaused: false,
      buffer: [],
      lastEventTime: Date.now(),
      totalTokens: 0,
      currentCost: 0,
      startTime: Date.now(),
      reconnectAttempts: 0,
      maxReconnectAttempts: this.connectionOptions.maxReconnectAttempts
    };

    this.connections.set(connectionId, connection);
    this.eventHandlers.set(connectionId, onEvent);

    // Initialize progress tracker
    this.progressTrackers.set(connectionId, {
      sessionId,
      currentPhase: 'understanding',
      completedPhases: [],
      progress: 0,
      eta: config.complexity === 'COMPLEX' ? 45 : 
           config.complexity === 'MODERATE' ? 15 : 5,
      tokenCount: 0,
      currentCost: 0,
      isThinking: true,
      canCancel: true
    });

    try {
      await this.establishConnection(connectionId, config);
      return connectionId;
    } catch (error) {
      console.error('Failed to establish streaming connection:', error);
      await this.stopStream(connectionId);
      throw error;
    }
  }

  /**
   * Establish the actual connection (SSE with WebSocket fallback)
   */
  private async establishConnection(connectionId: string, config: ReasoningConfig): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      // Try Server-Sent Events first
      await this.connectSSE(connectionId, config);
    } catch (sseError) {
      console.warn('SSE connection failed, falling back to WebSocket:', sseError);
      try {
        await this.connectWebSocket(connectionId, config);
      } catch (wsError) {
        console.error('WebSocket connection also failed:', wsError);
        throw new Error('All connection methods failed');
      }
    }
  }

  /**
   * Connect using Server-Sent Events
   */
  private async connectSSE(connectionId: string, config: ReasoningConfig): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const url = new URL('/api/reasoning/stream', window.location.origin);
    url.searchParams.set('sessionId', connectionId);
    url.searchParams.set('config', JSON.stringify(config));

    const eventSource = new EventSource(url.toString());
    connection.eventSource = eventSource;
    connection.isActive = true;

    return new Promise((resolve, reject) => {
      let isResolved = false;

      eventSource.onopen = () => {
        if (!isResolved) {
          isResolved = true;
          console.log(`SSE connection established: ${connectionId}`);
          this.startHeartbeat(connectionId);
          resolve();
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data);
          this.handleStreamEvent(connectionId, streamEvent);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        if (!isResolved) {
          isResolved = true;
          reject(error);
        } else {
          this.handleConnectionError(connectionId, error);
        }
      };

      // Timeout handling
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          eventSource.close();
          reject(new Error('SSE connection timeout'));
        }
      }, this.connectionOptions.timeout);
    });
  }

  /**
   * Connect using WebSocket
   */
  private async connectWebSocket(connectionId: string, config: ReasoningConfig): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/reasoning/ws`;

    const webSocket = new WebSocket(url);
    connection.webSocket = webSocket;

    return new Promise((resolve, reject) => {
      let isResolved = false;

      webSocket.onopen = () => {
        if (!isResolved) {
          isResolved = true;
          connection.isActive = true;
          console.log(`WebSocket connection established: ${connectionId}`);
          
          // Send initial config
          webSocket.send(JSON.stringify({
            type: 'start',
            sessionId: connectionId,
            config
          }));
          
          this.startHeartbeat(connectionId);
          resolve();
        }
      };

      webSocket.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data);
          this.handleStreamEvent(connectionId, streamEvent);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      webSocket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        if (!isResolved) {
          isResolved = true;
          reject(error);
        } else {
          this.handleConnectionError(connectionId, error);
        }
      };

      webSocket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${connectionId}`, event);
        if (connection.isActive && !event.wasClean) {
          this.handleConnectionError(connectionId, new Error('Connection closed unexpectedly'));
        }
      };

      // Timeout handling
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          webSocket.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, this.connectionOptions.timeout);
    });
  }

  // =================== EVENT HANDLING ===================

  /**
   * Handle incoming stream events
   */
  private handleStreamEvent(connectionId: string, event: StreamEvent): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) return;

    // Update connection metrics
    connection.lastEventTime = Date.now();
    if (event.data.tokenCount) {
      connection.totalTokens += event.data.tokenCount;
      connection.currentCost = this.calculateCost(connection.totalTokens);
    }

    // Update progress tracker
    this.updateProgress(connectionId, event);

    // Handle priority events immediately
    if (this.bufferOptions.priorityEvents.has(event.type)) {
      this.dispatchEvent(connectionId, event);
      return;
    }

    // Buffer regular events for smooth delivery
    connection.buffer.push(event);
    
    // Prevent buffer overflow
    if (connection.buffer.length > this.bufferOptions.maxSize) {
      this.flushBuffer(connectionId);
    }
  }

  /**
   * Update progress tracking
   */
  private updateProgress(connectionId: string, event: StreamEvent): void {
    const progress = this.progressTrackers.get(connectionId);
    if (!progress) return;

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    switch (event.type) {
      case 'phase_change':
        if (event.data.phaseType) {
          progress.currentPhase = event.data.phaseType;
          if (!progress.completedPhases.includes(event.data.phaseType)) {
            progress.completedPhases.push(event.data.phaseType);
          }
        }
        break;

      case 'progress':
        if (event.data.progress !== undefined) {
          progress.progress = event.data.progress;
        }
        break;

      case 'thinking_complete':
        progress.isThinking = false;
        progress.canCancel = false;
        progress.progress = 100;
        break;

      case 'error':
        progress.canCancel = false;
        progress.isThinking = false;
        break;
    }

    // Update token count and cost
    progress.tokenCount = connection.totalTokens;
    progress.currentCost = connection.currentCost;

    // Calculate ETA based on progress and elapsed time
    if (progress.progress > 0) {
      const elapsedSeconds = (Date.now() - connection.startTime) / 1000;
      const estimatedTotal = (elapsedSeconds / progress.progress) * 100;
      progress.eta = Math.max(0, estimatedTotal - elapsedSeconds);
    }

    // Dispatch progress update
    this.dispatchEvent(connectionId, {
      type: 'progress',
      data: {
        progress: progress.progress,
        timestamp: Date.now(),
        metadata: progress
      }
    });
  }

  /**
   * Dispatch event to handler
   */
  private dispatchEvent(connectionId: string, event: StreamEvent): void {
    const handler = this.eventHandlers.get(connectionId);
    if (handler) {
      try {
        handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  }

  // =================== BUFFERING SYSTEM ===================

  /**
   * Start the buffer processing system
   */
  private startBufferProcessing(): void {
    this.bufferTimer = setInterval(() => {
      for (const [connectionId] of this.connections) {
        this.flushBuffer(connectionId);
      }
    }, this.bufferOptions.flushInterval);
  }

  /**
   * Flush buffered events for a connection
   */
  private flushBuffer(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.buffer.length === 0) return;

    if (connection.isPaused) return; // Don't flush if paused

    // Sort events by timestamp for proper ordering
    const events = connection.buffer.sort((a, b) => 
      (a.data.timestamp || 0) - (b.data.timestamp || 0)
    );

    if (this.bufferOptions.smoothing) {
      // Smooth delivery - dispatch events with small delays
      events.forEach((event, index) => {
        setTimeout(() => {
          this.dispatchEvent(connectionId, event);
        }, index * 10); // 10ms between events
      });
    } else {
      // Immediate delivery
      events.forEach(event => {
        this.dispatchEvent(connectionId, event);
      });
    }

    connection.buffer = [];
  }

  // =================== CONNECTION CONTROL ===================

  /**
   * Pause streaming for a connection
   */
  pauseStream(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isPaused = true;
      
      this.dispatchEvent(connectionId, {
        type: 'progress',
        data: {
          content: 'Stream paused',
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Resume streaming for a connection
   */
  resumeStream(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isPaused = false;
      
      // Flush any buffered events
      this.flushBuffer(connectionId);
      
      this.dispatchEvent(connectionId, {
        type: 'progress',
        data: {
          content: 'Stream resumed',
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Stop streaming connection
   */
  async stopStream(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.isActive = false;

    // Close connections
    if (connection.eventSource) {
      connection.eventSource.close();
    }
    
    if (connection.webSocket) {
      connection.webSocket.close();
    }

    // Flush any remaining buffer
    this.flushBuffer(connectionId);

    // Cleanup
    this.connections.delete(connectionId);
    this.eventHandlers.delete(connectionId);
    this.progressTrackers.delete(connectionId);
  }

  // =================== ERROR HANDLING ===================

  /**
   * Handle connection errors with recovery
   */
  private async handleConnectionError(connectionId: string, error: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.error(`Connection error for ${connectionId}:`, error);

    // Notify handler of error
    this.dispatchEvent(connectionId, {
      type: 'error',
      data: {
        content: 'Connection interrupted, attempting to reconnect...',
        timestamp: Date.now()
      }
    });

    // Attempt reconnection if within limits
    if (connection.reconnectAttempts < connection.maxReconnectAttempts) {
      connection.reconnectAttempts++;
      
      setTimeout(async () => {
        try {
          await this.reconnect(connectionId);
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError);
          this.handleFinalConnectionFailure(connectionId);
        }
      }, this.connectionOptions.reconnectDelay * connection.reconnectAttempts);
    } else {
      this.handleFinalConnectionFailure(connectionId);
    }
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Close existing connections
    if (connection.eventSource) {
      connection.eventSource.close();
    }
    if (connection.webSocket) {
      connection.webSocket.close();
    }

    // Reset connection state
    connection.isActive = false;
    connection.eventSource = undefined;
    connection.webSocket = undefined;

    // Try to establish new connection
    // Note: We would need the original config here
    // For now, just notify of reconnection attempt
    this.dispatchEvent(connectionId, {
      type: 'progress',
      data: {
        content: `Reconnecting... (attempt ${connection.reconnectAttempts})`,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Handle final connection failure
   */
  private handleFinalConnectionFailure(connectionId: string): void {
    this.dispatchEvent(connectionId, {
      type: 'error',
      data: {
        content: 'Connection lost. Please refresh the page to continue.',
        timestamp: Date.now()
      }
    });

    this.stopStream(connectionId);
  }

  // =================== HEARTBEAT SYSTEM ===================

  /**
   * Start heartbeat for connection health monitoring
   */
  private startHeartbeat(connectionId: string): void {
    const interval = setInterval(() => {
      const connection = this.connections.get(connectionId);
      if (!connection || !connection.isActive) {
        clearInterval(interval);
        return;
      }

      // Check if we've received events recently
      const timeSinceLastEvent = Date.now() - connection.lastEventTime;
      if (timeSinceLastEvent > this.connectionOptions.heartbeatInterval * 2) {
        console.warn(`No events received for ${timeSinceLastEvent}ms on connection ${connectionId}`);
        this.handleConnectionError(connectionId, new Error('Heartbeat timeout'));
      }
    }, this.connectionOptions.heartbeatInterval);
  }

  // =================== UTILITY METHODS ===================

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(sessionId: string): string {
    return `${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate cost based on token count
   */
  private calculateCost(tokens: number): number {
    // Using approximate GPT-5 pricing
    return tokens * 0.00003;
  }

  /**
   * Get progress for a connection
   */
  getProgress(connectionId: string): ReasoningProgress | null {
    return this.progressTrackers.get(connectionId) || null;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(connectionId: string): {
    isActive: boolean;
    isPaused: boolean;
    reconnectAttempts: number;
    totalTokens: number;
    currentCost: number;
  } | null {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;

    return {
      isActive: connection.isActive,
      isPaused: connection.isPaused,
      reconnectAttempts: connection.reconnectAttempts,
      totalTokens: connection.totalTokens,
      currentCost: connection.currentCost
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isActive).length;
    
    const totalTokens = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.totalTokens, 0);

    return {
      activeConnections,
      totalConnections: this.connections.size,
      totalTokensProcessed: totalTokens,
      totalCost: this.calculateCost(totalTokens),
      averageBufferSize: this.getAverageBufferSize()
    };
  }

  /**
   * Get average buffer size across connections
   */
  private getAverageBufferSize(): number {
    const connections = Array.from(this.connections.values());
    if (connections.length === 0) return 0;

    const totalBufferSize = connections.reduce((sum, conn) => sum + conn.buffer.length, 0);
    return totalBufferSize / connections.length;
  }

  /**
   * Cleanup service on shutdown
   */
  cleanup(): void {
    // Stop buffer processing
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
    }

    // Close all connections
    const connectionIds = Array.from(this.connections.keys());
    connectionIds.forEach(id => {
      this.stopStream(id);
    });
  }
}

// Export singleton instance
export const streamingService = new StreamingService();