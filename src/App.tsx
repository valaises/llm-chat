import { ChatSidebar } from './components/ChatSidebar'
import { NewChatButton } from './components/NewChatButton'
import { ChatComponent } from './components/Chat'
import { ChatProvider} from './ChatContext'
import {generateRandomHash, getCurrentChat} from "./utils.ts";
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

  const handleNewChat = () => {
    if (getCurrentChat(ctx.chats, ctx.currentChatID)?.messages.length === 0) {
      return;
    }
    const newChat: Chat = {
      id: generateRandomHash(),
      name: '',
      messages: []
    };
    ctx.setChats(newChat);
    ctx.setCurrentChatID(newChat.id);
  };

  return (
    <div className={`app-container ${ctx.sidebarOpen ? '' : 'sidebar-closed'}`}>
      <ChatSidebar 
        isOpen={ctx.sidebarOpen}
        onToggle={() => ctx.setSidebarOpen(!ctx.sidebarOpen)}
        ctx={ctx}
      />
      <NewChatButton 
        onClick={handleNewChat}
        sidebarOpen={ctx.sidebarOpen}
      />
      <ChatComponent
        sidebarOpen={ctx.sidebarOpen}
        ctx={ctx}
      />
    </div>
  )
}

export default App