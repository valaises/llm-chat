import { CompletionRequest, CompletionResponse, CompletionResponseChunk } from './types';


export class CompletionsHandler {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl + '/chat/completions';
    this.apiKey = apiKey;
  }

  async handleCompletion(requestData: CompletionRequest): Promise<CompletionResponse | AsyncGenerator<CompletionResponseChunk, void, unknown>> {
    const streaming = requestData.stream ?? false;

    if (!streaming) {
      return this.nonStreamingCompletion(requestData);
    } else {
      return this.streamingCompletion(requestData);
    }
  }

  private async nonStreamingCompletion(requestData: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json() as CompletionResponse;
  }

  private async *streamingCompletion(requestData: CompletionRequest): AsyncGenerator<CompletionResponseChunk, void, unknown> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ ...requestData, stream: true })
    });
    console.log(`URL: ${this.apiUrl}; KEY: ${this.apiKey}; data: ${JSON.stringify({ ...requestData, stream: true })}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.slice(6);
          if (jsonData === '[DONE]') {
            break;
          }
          yield JSON.parse(jsonData) as CompletionResponseChunk;
        }
      }
    }
  }
}
