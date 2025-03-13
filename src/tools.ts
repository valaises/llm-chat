import { ChatToolResponse } from './types';


export class ToolsHandler {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl + '/tools';
    this.apiKey = apiKey;
  }

  async listTools(): Promise<ChatToolResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ChatToolResponse;
  }
}