import { useState } from 'react'
import './App.css'
import { ChatSidebar } from './components/ChatSidebar'
import { NewChatButton } from './components/NewChatButton'
import { Chat } from './components/Chat'
import { ChatProvider, useChat } from './ChatContext' // Import the ChatProvider


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

  const currentChat = ctx.chats.find(chat => chat.id === ctx.currentChatId) || ctx.chats[0];

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      name: 'New Chat',
      messages: []
    };
    ctx.setChats(prev => [...prev, newChat]);
    ctx.setCurrentChatId(newChat.id);
  };

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={ctx.chats}
        currentChatId={ctx.currentChatId}
        onSelectChat={ctx.setCurrentChatId}
      />
      <NewChatButton 
        onClick={handleNewChat}
        sidebarOpen={sidebarOpen}
      />
      <Chat
        sidebarOpen={sidebarOpen}
        currentChat={currentChat}
        currentChatId={ctx.currentChatId}
        chats={ctx.chats}
        setChats={ctx.setChats}
      />
    </div>
  )
}

export default App