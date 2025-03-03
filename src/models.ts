import { CompletionModel } from './types';

export class ModelsHandler {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl + '/models';
    this.apiKey = apiKey;
  }

  async listModels(): Promise<CompletionModel[]> {
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
    return data.data as CompletionModel[];
  }

  async retrieveModel(modelId: string): Promise<CompletionModel> {
    const response = await fetch(`${this.apiUrl}/${modelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json() as CompletionModel;
  }
}
