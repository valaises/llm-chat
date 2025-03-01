import React, { createContext, useContext, useState } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface Chat {
  id: number;
  name: string;
  messages: Message[];
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: number;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setCurrentChatId: React.Dispatch<React.SetStateAction<number>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([{ id: 1, name: 'New Chat', messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);

  return (
    <ChatContext.Provider value={{ chats, currentChatId, setChats, setCurrentChatId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};