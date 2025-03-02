import React, {useEffect, useState} from 'react';
import {generateRandomHash} from "./utils.ts";
import {Chat} from "./types.ts";
import { ChatContext } from './UseChat.ts';


const getChats = (): Chat[] => {
  const savedChats = localStorage.getItem('chats');
  return savedChats ? JSON.parse(savedChats) : [];
};

const appendChat = (newChat: Chat) => {
  console.log('newChat: ', newChat);
  const chats = getChats();
  chats.push(newChat);
  localStorage.setItem('chats', JSON.stringify(chats));
};

const setChats = (newChats: Chat[]) => {
  localStorage.setItem('chats', JSON.stringify(newChats));
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

const getEndpointURL = (): string | undefined => {
  const endpointURL = localStorage.getItem('endpointURL');
  return endpointURL || undefined;
};

const setEndpointURL = (url: string) => {
  localStorage.setItem('endpointURL', url);
}

const getEndpointAPIKey = (): string | undefined => {
  const EndpointAPIKey = localStorage.getItem('EndpointAPIKey');
  return EndpointAPIKey || undefined;
};

const setEndpointAPIKey = (key: string) => {
  localStorage.setItem('EndpointAPIKey', key);
};


export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, _setChats] = useState<Chat[]>(() => {
    return getChats().length > 0 ? getChats() : [{ id: generateRandomHash(), name: '', messages: [] }];
  });
  const [currentChatID, _setCurrentChatID] = useState<string>(getCurrentChatID() || generateRandomHash());
  const [lastUsedModelID, _setlastUsedModelID] = useState<string | undefined>(getLastUsedModelID());
  const [endpointURL, _setEndpointURL] = useState<string | undefined>(getEndpointURL());
  const [endpointAPIKey, _setEndpointAPIKey] = useState<string | undefined>(getEndpointAPIKey());  

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

  useEffect(() => {
    if (!chats.some(chat => chat.id === currentChatID) && chats.length > 0) {
      updateCurrentChatId(chats[chats.length - 1].id);
    }
  }, [chats, currentChatID]);

  console.log('ChatContext init: currentChatID: ', currentChatID);

  return (
    <ChatContext.Provider value={{
      chats: chats,
      setChats: updateChats,
      updateChat: updateChat,

      currentChatID: currentChatID,
      setCurrentChatID: updateCurrentChatId,

      last_used_model: lastUsedModelID,
      setlastUsedModelID: updateLastUsedModelID,
      
      endpointURL: endpointURL,
      setEndpointURL: updateEndpointURL,
      
      endpointAPIKey: endpointAPIKey,
      setEndpointAPIKey: updateEndpointAPIKey,

    }}>
      {children}
    </ChatContext.Provider>
  );
};
