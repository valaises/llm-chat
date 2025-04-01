import { MCPLServerCfg } from './types';


export class MCPLHandler {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async listServers(): Promise<MCPLServerCfg[]> {
    const response = await fetch(`${this.apiUrl}/mcpl-servers-list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.servers as MCPLServerCfg[];
  }

  async updateServers(servers: MCPLServerCfg[]): Promise<MCPLServerCfg[]> {
    const response = await fetch(`${this.apiUrl}/mcpl-servers-update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({servers: servers})
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.servers as MCPLServerCfg[];
  }
}
