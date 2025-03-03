import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message, ChatContextType, CompletionRequest } from '../types';
import './Chat.css';
import { getCurrentChat } from '../utils';
import { CompletionsHandler } from '../completions';

interface ChatProps {
  sidebarOpen: boolean;
  ctx: ChatContextType;
}

export const ChatComponent: React.FC<ChatProps> = ({ sidebarOpen, ctx }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const currentChat = getCurrentChat(ctx.chats, ctx.currentChatID)!;
  const completionsHandler = new CompletionsHandler(
    ctx.endpointURL || "",
    ctx.endpointAPIKey || "",
  );

  const scrollToBottom = useCallback(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      observerRef.current = new MutationObserver(scrollToBottom);
      observerRef.current.observe(chatWindowRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
    };

    currentChat.messages.push(userMessage);
    ctx.updateChat(currentChat);
    setInputText('');
    setIsLoading(true);

    try {
      const completionRequest: CompletionRequest = {
        model: ctx.lastUsedModelID || "",
        messages: currentChat.messages,
        max_tokens: 150,
        stream: true,
      };

      const stream = await completionsHandler.handleCompletion(completionRequest);

      if (stream && Symbol.asyncIterator in stream) {
        const message: Message = {
          role: 'assistant',
          content: '',
        };
        currentChat.messages.push(message);

        for await (const chunk of stream) {
          if (chunk.choices && chunk.choices.length > 0) {
            const delta = chunk.choices[0].delta;
            if (delta.content) {
              message.content += delta.content;
              currentChat.messages[currentChat.messages.length - 1] = { ...message };
              ctx.updateChat(currentChat);
            }
          }
        }
      } else {
        throw new Error('Expected a stream, but received a non-stream response');
      }
    } catch (error) {
      console.error('Error in API call:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, there was an error processing your request: ${error}`,
      };
      currentChat.messages.push(errorMessage);
      ctx.updateChat(currentChat);
    } finally {
      setIsLoading(false);
    }

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
                className={`message ${message.role === "user" ? 'user-message' : 'ai-message'}`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
                <span className="loading-indicator">AI is typing...</span>
              </div>
            )}
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
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
