import { useState } from 'react'
import './App.css'
import { ChatSidebar } from './components/ChatSidebar'
import { NewChatButton } from './components/NewChatButton'
import { Chat } from './components/Chat'

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
  const [chats, setChats] = useState<Chat[]>([{ id: 1, name: 'New Chat', messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0];

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      name: 'New Chat',
      messages: []
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  return (
    <div className={`app-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
      />
      <NewChatButton 
        onClick={handleNewChat}
        sidebarOpen={sidebarOpen}
      />
      <Chat
        sidebarOpen={sidebarOpen}
        currentChat={currentChat}
        currentChatId={currentChatId}
        chats={chats}
        setChats={setChats}
      />
    </div>
  )
}

export default App