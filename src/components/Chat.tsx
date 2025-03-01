import React, { useState, useEffect } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message, ChatContextType } from '../types';
import './Chat.css';
import { getCurrentChat } from '../utils';


interface ChatProps {
  sidebarOpen: boolean;
  ctx: ChatContextType;
}

export const ChatComponent: React.FC<ChatProps> = ({ sidebarOpen, ctx }) => {
  const [inputText, setInputText] = useState('');
  const chatWindowRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const currentChat = getCurrentChat(ctx.chats, ctx.currentChatID)!;

  // Auto-scroll to bottom when new messages appear
  // todo: broken
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

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

    currentChat.messages.push(userMessage);
    ctx.updateChat(currentChat);

    // Add mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        text: `This is a sample response from the ${ctx.lastUsedModelID || ""} model.`,
        isUser: false,
      };

      currentChat.messages.push(aiMessage);

      ctx.updateChat(currentChat);
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
          selectedModel={ctx.lastUsedModelID || ""}
          onModelSelect={ctx.setlastUsedModelID}
        />
      </div>
      <div className="chat-container">
        <div className="scrollable-content" ref={chatWindowRef}>
          <div className="chat-window">
            {currentChat?.messages.map((message, index) => (
              <div
                key={index}
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
