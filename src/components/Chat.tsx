import React, { useState, useEffect } from 'react';
import './Chat.css';

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

interface ChatProps {
  sidebarOpen: boolean;
  currentChat: Chat;
  currentChatId: number;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export const Chat: React.FC<ChatProps> = ({ sidebarOpen, currentChat, currentChatId, chats, setChats }) => {
  const [inputText, setInputText] = useState('');
  const chatWindowRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [currentChat.messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    // Add mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: "This is a sample response from the AI model.",
        isUser: false,
      };
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ));
    }, 500);

    setInputText('');
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '56px'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 56) {
        const newHeight = Math.min(scrollHeight, 200); // Max height: 200px
        textarea.style.height = `${newHeight}px`;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {currentChat.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message and press Enter to send..."
            rows={1}
          />
        </div>
      </div>
    </div>
  );
};