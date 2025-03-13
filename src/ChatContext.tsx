import React, {useEffect, useState} from 'react';
import {generateRandomHash} from "./utils.ts";
import {Chat, CompletionModel} from "./types.ts";
import {ChatContext} from './UseChat.ts';


const getChats = (): Chat[] => {
  const savedChats = localStorage.getItem('chats');
  return savedChats ? JSON.parse(savedChats) : [];
};

const appendChat = (newChat: Chat) => {
  if (newChat.messages.length === 0) {
    return;
  }
  const chats = getChats();
  chats.push(newChat);
  localStorage.setItem('chats', JSON.stringify(chats));
};

const setChats = (newChats: Chat[]) => {
  localStorage.setItem(
    'chats',
    JSON.stringify(newChats.filter((c) => c.messages.length !== 0))
  );
};

const getCurrentChatID = (): string | undefined => {
  const CurrentChatID = localStorage.getItem('CurrentChatID');
  return CurrentChatID || undefined;
};

const setCurrentChatID = (chatId: string) => {
  localStorage.setItem('CurrentChatID', chatId);
};

const getLastUsedModelID = (): string | undefined => {
  const lastUsedModelID = localStorage.getItem('lastUsedModelID');
  return lastUsedModelID || undefined;
};

const setlastUsedModelID = (model: string) => {
  localStorage.setItem('lastUsedModelID', model);
}

const getEndpointURL = (): string => {
  const endpointURL = localStorage.getItem('endpointURL');
  return endpointURL || '';
};

const setEndpointURL = (url: string) => {
  localStorage.setItem('endpointURL', url);
}

const getEndpointAPIKey = (): string => {
  const EndpointAPIKey = localStorage.getItem('EndpointAPIKey');
  return EndpointAPIKey || '';
};

const setEndpointAPIKey = (key: string) => {
  localStorage.setItem('EndpointAPIKey', key);
};

const getSidebarOpen = (): boolean => {
  return JSON.parse(localStorage.getItem('sidebarOpen') || 'true');
}

const setSidebarOpen = (isOpen: boolean): void => {
  localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
}


export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, _setChats] = useState<Chat[]>(() => {
    return getChats().length > 0 ? getChats() : [{ id: generateRandomHash(), name: '', messages: [] }];
  });
  const [currentChatID, _setCurrentChatID] = useState<string>(getCurrentChatID() || generateRandomHash());
  const [lastUsedModelID, _setlastUsedModelID] = useState<string | undefined>(getLastUsedModelID());
  const [endpointURL, _setEndpointURL] = useState<string | undefined>(getEndpointURL());
  const [endpointAPIKey, _setEndpointAPIKey] = useState<string | undefined>(getEndpointAPIKey());
  const [sidebarOpen, _setSidebarOpen] = useState<boolean>(getSidebarOpen());
  const [models, _setModels] = useState<CompletionModel[]>([]);
  const [tools, _setTools] = useState<any[]>([]);

  useEffect(() => {
    setChats(chats);
  }, [chats]);

  const updateChats = (newChat: Chat) => {
    _setChats(prevChats => {
      const updatedChats = [...prevChats, newChat];
      appendChat(newChat);
      return updatedChats;
    });
  };

  const updateChat = (updChat: Chat) => {
    _setChats(chats => {
      const chatIndex = chats.findIndex(chat => chat.id === updChat.id);
      if (chatIndex !== -1) {
        const updatedChats = [...chats];
        updatedChats[chatIndex] = updChat; // Update the chat at the found index
        return updatedChats; // Return the updated chats array
      }
      return chats; // Return the original chats if no update was made
    });
  };

  const updateCurrentChatId = (newChatId: string) => {
    _setCurrentChatID(newChatId);
    setCurrentChatID(newChatId);
  };

  const updateLastUsedModelID = (newModel: string) => {
    _setlastUsedModelID(newModel);
    setlastUsedModelID(newModel);
  };
  
  const updateEndpointURL = (newURL: string) => {
    _setEndpointURL(newURL);
    setEndpointURL(newURL);
  };
  
  const updateEndpointAPIKey = (newKey: string) => {
    _setEndpointAPIKey(newKey);
    setEndpointAPIKey(newKey);    
  }

  const updateSidebarOpen = (newValue: boolean) => {
    _setSidebarOpen(newValue);
    setSidebarOpen(newValue);
  }

  const updateModels = (newModels: CompletionModel[]) => {
    _setModels(newModels);
  }

  const updateTools = (newTools: any[]) => {
    _setTools(newTools);
  }

  useEffect(() => {
    if (!chats.some(chat => chat.id === currentChatID) && chats.length > 0) {
      updateCurrentChatId(chats[chats.length - 1].id);
    }
  }, [chats, currentChatID]);

  return (
    <ChatContext.Provider value={{
      chats: chats,
      setChats: updateChats,
      updateChat: updateChat,

      currentChatID: currentChatID,
      setCurrentChatID: updateCurrentChatId,

      lastUsedModelID: lastUsedModelID,
      setlastUsedModelID: updateLastUsedModelID,
      
      endpointURL: endpointURL,
      setEndpointURL: updateEndpointURL,
      
      endpointAPIKey: endpointAPIKey,
      setEndpointAPIKey: updateEndpointAPIKey,

      sidebarOpen: sidebarOpen,
      setSidebarOpen: updateSidebarOpen,

      models: models,
      setModels: updateModels,

      tools: tools,
      setTools: updateTools,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
