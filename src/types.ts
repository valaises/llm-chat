
export interface ChatContextType {
  chats: Chat[];
  setChats: (newChat: Chat) => void;
  updateChat: (chat: Chat) => void;

  currentChatID: string;
  setCurrentChatID: (newChatId: string) => void;

  lastUsedModelID: string | undefined;
  setlastUsedModelID: (newModel: string) => void;

  endpointURL: string | undefined;
  setEndpointURL: (newURL: string) => void;

  endpointAPIKey: string | undefined;
  setEndpointAPIKey: (newKey: string) => void;

  sidebarOpen: boolean,
  setSidebarOpen: (newState: boolean) => void;
}

export interface Message {
  role: string;
  content: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

export interface CompletionRequest {
  model: string;
  messages: Message[];
  max_tokens?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: any | null;
    finish_reason: string | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CompletionResponseChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string | null;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    logprobs: any | null;
    finish_reason: string | null;
  }[];
}
