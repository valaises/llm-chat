import { useState } from 'react'
import { ChatSidebar } from './components/ChatSidebar'
import { NewChatButton } from './components/NewChatButton'
import { ChatComponent } from './components/Chat'
import { ChatProvider} from './ChatContext'
import {generateRandomHash} from "./utils.ts";
import {Chat} from "./types.ts";
import {useChat} from "./UseChat.ts";

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
  console.log("AppContent: ctx is invoked!", ctx);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: generateRandomHash(),
      name: '',
      messages: []
    };
    ctx.setChats(newChat);
    ctx.setCurrentChatID(newChat.id);
    console.log("handleNewChat: new chat is created", newChat);
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