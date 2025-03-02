
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

  // Add other properties as needed
}

export interface Message {
  text: string;
  isUser: boolean;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}
