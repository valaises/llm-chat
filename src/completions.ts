import { CompletionRequest, CompletionResponse, CompletionResponseChunk } from './types';


export async function *completionResponseChunkCollector(chunks: AsyncGenerator<CompletionResponseChunk, void, unknown>) {
  let currentToolCall: any = null;

  for await (const chunk of chunks) {
    if (chunk.object === "tool_res_messages") {
      yield {
        type: "tool_res_messages",
        content: chunk.tool_res_messages!
      }
      continue;
    }

    if (!chunk.choices) {
      continue;
    }

    for (const choice of chunk.choices) {
      const delta = choice.delta || {};

      // Handle content deltas
      if (delta.content !== undefined && delta.content !== null) {
        yield {
          type: "content_delta",
          content: delta.content
        };
      }

      // Handle tool calls
      if (delta.tool_calls !== undefined && Array.isArray(delta.tool_calls)) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.index !== undefined) {
            // New tool call started
            if (currentToolCall === null) {
              currentToolCall = {
                id: toolCall.id,
                type: toolCall.type,
                function: {
                  name: toolCall.function?.name,
                  arguments: ''
                }
              };
            }
          }

          // Append arguments if present
          if (toolCall.function?.arguments !== undefined) {
            currentToolCall.function.arguments += toolCall.function.arguments;
          }

          // Update other fields if present
          if (toolCall.id) {
            currentToolCall.id = toolCall.id;
          }
          if (toolCall.type) {
            currentToolCall.type = toolCall.type;
          }
          if (toolCall.function?.name) {
            currentToolCall.function.name = toolCall.function.name;
          }
        }
      }

      // Yield tool call when complete
      if (choice.finish_reason === 'tool_calls' && currentToolCall !== null) {
        yield {
          type: "tool_call",
          content: currentToolCall
        };
        currentToolCall = null;
      }
    }
  }
}

export class CompletionsHandler {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl + '/chat/completions';
    this.apiKey = apiKey;
  }

  async handleCompletion(
    requestData: CompletionRequest,
    signal?: AbortSignal
  ): Promise<CompletionResponse | AsyncGenerator<any, void, unknown>> {
    const streaming = requestData.stream ?? false;

    if (!streaming) {
      return this.nonStreamingCompletion(requestData, signal);
    } else {
      return completionResponseChunkCollector(this.streamingCompletion(requestData, signal));
    }
  }

  private async nonStreamingCompletion(
    requestData: CompletionRequest,
    signal?: AbortSignal
  ): Promise<CompletionResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData),
      signal
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json() as CompletionResponse;
  }


  private async* streamingCompletion(
    requestData: CompletionRequest,
    signal?: AbortSignal
  ): AsyncGenerator<CompletionResponseChunk, void, unknown> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({...requestData, stream: true}),
      signal
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        // Append new chunk to existing buffer
        buffer += decoder.decode(value, {stream: true});

        // Process complete lines from the buffer
        let lineEnd = buffer.indexOf('\n');
        while (lineEnd !== -1) {
          const line = buffer.substring(0, lineEnd).trim();
          buffer = buffer.substring(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const jsonData = line.slice(6);
            if (jsonData === '[DONE]') {
              return;
            }

            try {
              yield JSON.parse(jsonData) as CompletionResponseChunk;
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Data:', jsonData);
            }
          }

          lineEnd = buffer.indexOf('\n');
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim() !== '') {
        const remaining = buffer.trim();
        if (remaining.startsWith('data: ')) {
          const jsonData = remaining.slice(6);
          if (jsonData !== '[DONE]') {
            try {
              yield JSON.parse(jsonData) as CompletionResponseChunk;
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Data:', jsonData);
            }
          }
        }
      }

      // Final decoder flush
      const remaining = decoder.decode();
      if (remaining.trim() !== '') {
        console.log('Remaining data after stream end:', remaining);
      }
    } finally {
      reader.cancel();
    }
  }
}
