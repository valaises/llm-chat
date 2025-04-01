
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

  tools: any[];
  setTools: (newTools: any[]) => void;

  files: FileItem[];
  setFiles: (newFiles: FileItem[]) => void;

  ongoings: OngoingStatus[];
  setOngoings: (newOngoings: OngoingStatus[]) => void;

  mcplServers: MCPLServerCfg[];
  setMcplServers: (newServers: MCPLServerCfg[]) => void;
}

export interface Message {
  role: string;
  content: string; // todo: content may not be not only string
  tool_calls?: any[]
  tool_call_id?: string;
}

export interface MessageRender {
  type: string,
  content: string,
  tool_name?: string,
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
  tools?: any[];
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

  tool_res_messages?: Message[];
}

export interface CompletionModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ChatToolResponse{
  tools: any[];
}

export interface FileItem {
  file_name: string;
  file_name_orig: string;
  file_ext: string;
  file_role: string;
  file_size: number;
  user_id: number;
  created_at: Date;
  file_type?: string;
  processing_status?: string;
}

export interface OngoingStatus {
  id: string;
  name: string;
  status: string;
  show_scope: string;
  error_text?: string;
  percent?: number;
  created_at?: Date;
}

export interface MCPLServerCfg {
  address: string;
  isActive: boolean;
}
