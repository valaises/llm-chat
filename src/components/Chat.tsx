import React, { useState, useEffect } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message } from '../types';
import './Chat.css';
import {ChatContextType} from "../ChatContext.tsx";


interface ChatProps {
  sidebarOpen: boolean;
  ctx: ChatContextType;
}

export const ChatComponent: React.FC<ChatProps> = ({ sidebarOpen, ctx }) => {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
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

    const userMessage: Message = {
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
        text: `This is a sample response from the ${selectedModel} model.`,
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
      <div className="model-selector-container">
        <ModelSelector
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
      </div>
      <div className="chat-container">
        <div className="scrollable-content" ref={chatWindowRef}>
          <div className="chat-window">
            {currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
              >
                {message.text}
              </div>
            ))}
          </div>
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
