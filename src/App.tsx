import { useState } from 'react'
import { ChatSidebar } from './components/ChatSidebar'
import { NewChatButton } from './components/NewChatButton'
import { ChatComponent } from './components/Chat'
import { ChatProvider, useChat } from './ChatContext'
import {generateRandomHash} from "./utils.ts";
import {Chat} from "./types.ts";

import './App.css'


function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

function AppContent() {
  const ctx = useChat(); // Use the context
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: generateRandomHash(),
      name: '',
      messages: []
    };
    ctx.setChats(newChat);
    ctx.setCurrentChatID(newChat.id);
  };

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        ctx={ctx}
      />
      <NewChatButton 
        onClick={handleNewChat}
        sidebarOpen={sidebarOpen}
      />
      <ChatComponent
        sidebarOpen={sidebarOpen}
        ctx={ctx}
      />
    </div>
  )
}

export default App