import {ChatContextType, FileItem} from './types';

export interface FileListResponse {
  files: FileItem[];
}

export interface FileDeleteRequest {
  file_name: string;
}

export const updateFilesList = async (ctx: ChatContextType)=> {
  const filesHandler = new FilesHandler(ctx.endpointURL || "", ctx.endpointAPIKey || "");

  try {
      const files = await filesHandler.listFiles();
      ctx.setFiles(files.files);
    } catch (error) {
      console.error('Failed to fetch files: ', error);
  }
}

export const deleteFilePost = async (ctx: ChatContextType, fileName: string) => {
  const filesHandler = new FilesHandler(ctx.endpointURL || "", ctx.endpointAPIKey || "");

  try {
    await filesHandler.deleteFile(fileName);
    await updateFilesList(ctx);
  } catch (error) {
    console.error('Failed to delete file: ', error);
  }
}

export class FilesHandler {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async listFiles(): Promise<FileListResponse> {
    const response = await fetch(`${this.apiUrl}/files/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Filed to list files: ${response.statusText}`);
    }

    const data = await response.json();
    return data as FileListResponse;
  }

  async deleteFile(fileName: string): Promise<void> {
    const deleteRequest: FileDeleteRequest = {
      file_name: fileName
    };

    const response = await fetch(`${this.apiUrl}/files/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deleteRequest)
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  }
}
