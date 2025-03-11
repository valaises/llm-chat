
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

  models: CompletionModel[];
  setModels: (newModels: CompletionModel[]) => void;
}

export interface Message {
  role: string;
  content: string;
  tool_calls?: any[]
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
      refusal?: any;
      function_call?: any;
      tool_calls?: any;
      audio?: any;
    };
    logprobs: any | null;
    finish_reason: string | null;
  }[];
  stream_options?: {
    include_usage: boolean;
  };
  citations?: any;
}

export interface CompletionModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelListResponse {
  object: string;
  data: CompletionModel[];
}

