/**
 * Streaming utilities for real-time survey generation
 * Provides SSE (Server-Sent Events) support for progress updates
 */

export type StreamEvent =
  | { type: "reasoning"; content: string }
  | { type: "code"; content: string; partial: boolean }
  | { type: "progress"; stage: string; percentage: number }
  | { type: "complete"; result: any }
  | { type: "error"; error: string };

/**
 * Create a streaming response handler
 */
export async function* streamResponse(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        // Parse SSE format
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          try {
            const event = JSON.parse(data) as StreamEvent;
            yield event;
          } catch (error) {
            console.warn("Failed to parse stream event:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Create a text streaming generator
 */
export async function* streamText(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const text = decoder.decode(value, { stream: true });
      yield text;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Convert async generator to ReadableStream
 */
export function createStreamFromGenerator(
  generator: AsyncGenerator<string>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Create SSE event string
 */
export function createSSEEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Stream handler for progress tracking
 */
export class StreamProgressTracker {
  private stages = [
    { name: "planning", weight: 0.2 },
    { name: "generating", weight: 0.6 },
    { name: "validating", weight: 0.1 },
    { name: "finalizing", weight: 0.1 },
  ];

  private currentStage = 0;
  private stageProgress = 0;

  getCurrentProgress(): { stage: string; percentage: number } {
    const completedWeight = this.stages
      .slice(0, this.currentStage)
      .reduce((sum, s) => sum + s.weight, 0);

    const currentStageWeight = this.stages[this.currentStage].weight;
    const percentage = Math.round(
      (completedWeight + currentStageWeight * this.stageProgress) * 100
    );

    return {
      stage: this.stages[this.currentStage].name,
      percentage: Math.min(100, percentage),
    };
  }

  nextStage(): void {
    if (this.currentStage < this.stages.length - 1) {
      this.currentStage++;
      this.stageProgress = 0;
    }
  }

  updateStageProgress(progress: number): void {
    this.stageProgress = Math.max(0, Math.min(1, progress));
  }

  complete(): void {
    this.currentStage = this.stages.length - 1;
    this.stageProgress = 1;
  }
}

/**
 * Combine multiple streams
 */
export async function* mergeStreams<T>(
  ...streams: AsyncGenerator<T>[]
): AsyncGenerator<T> {
  const promises = streams.map(async (stream) => {
    const results: T[] = [];
    for await (const item of stream) {
      results.push(item);
    }
    return results;
  });

  const results = await Promise.all(promises);

  for (const result of results) {
    for (const item of result) {
      yield item;
    }
  }
}
