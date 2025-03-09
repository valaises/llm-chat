import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message, ChatContextType, CompletionRequest } from '../types';
import './Chat.css';
import { getCurrentChat } from '../utils';
import { CompletionsHandler } from '../completions';
import { common, createStarryNight } from '@wooorm/starry-night';
import {renderMarkdownWithCode} from "./RenderMarkdownWithCode.tsx";
import {adjustTextareaHeight} from "./chatUtils.ts";


interface ChatProps {
  sidebarOpen: boolean;
  ctx: ChatContextType;
}

export const ChatComponent: React.FC<ChatProps> = ({ sidebarOpen, ctx }) => {
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [starryNight, setStarryNight] = useState<any>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isTitleGenerating, setIsTitleGenerating] = useState(false);

  const generateChatTitle = async () => {
    if (isTitleGenerating) return;

    const currentChat = getCurrentChat(ctx.chats, ctx.currentChatID)!;
    if (currentChat.name !== '' || currentChat.messages.length < 3) return;

    setIsTitleGenerating(true);
    try {
      const titlePrompt: Message = {
        role: "user",
        content: "Generate a very short (2-4 words) title for this conversation. Respond with just the title, no quotes or additional text."
      };

      const completionRequest: CompletionRequest = {
        model: ctx.lastUsedModelID || "",
        messages: [...currentChat.messages, titlePrompt],
        max_tokens: 20,
        stream: false
      };

      const response = await completionsHandler.handleCompletion(completionRequest);
      if (response && response.choices && response.choices.length > 0) {
        const title = response.choices[0].message.content;
        currentChat.name = title;
        ctx.updateChat(currentChat);
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    } finally {
      setIsTitleGenerating(false);
    }
  };

  useEffect(() => {
    createStarryNight(common).then(setStarryNight);
  }, []);

  const currentChat = getCurrentChat(ctx.chats, ctx.currentChatID)!;

  useEffect(() => {
    if (currentChat?.messages.length >= 3 && currentChat.name === '') {
      generateChatTitle();
    }
  }, [currentChat?.messages.length]);

  const completionsHandler = new CompletionsHandler(
    ctx.endpointURL || "",
    ctx.endpointAPIKey || "",
  );

  const scrollToBottom = useCallback(() => {
    if (chatWindowRef.current) {
      const scrollElement = chatWindowRef.current;
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      });
    }
  }, []);

  // useEffect(() => {
  //   if (chatWindowRef.current) {
  //     scrollToBottom();
  //   }
  // }, [currentChat?.messages, scrollToBottom]);
  //
  // useEffect(() => {
  //   scrollToBottom();
  // }, [currentChat?.messages, scrollToBottom]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      focusInput();
    }
  }, [isStreaming, focusInput]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
    };

    currentChat.messages.push(userMessage);
    ctx.updateChat(currentChat);
    setInputText('');
    setIsStreaming(true);
    scrollToBottom(); // Scroll after user message

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }

    const message: Message = {
      role: 'assistant',
      content: '',
    };
    currentChat.messages.push(message);
    scrollToBottom(); // Scroll after adding empty assistant message

    try {
      const completionRequest: CompletionRequest = {
        model: ctx.lastUsedModelID || "",
        messages: currentChat.messages,
        max_tokens: 4196,
        stream: true,
      };

      abortControllerRef.current = new AbortController();
      const stream = await completionsHandler.handleCompletion(
        completionRequest,
        abortControllerRef.current.signal
      );

      if (stream && Symbol.asyncIterator in stream) {
        try {
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
        } catch (error) {
          if (error.name === 'AbortError') { /* empty */ } else {
            throw error;
          }
        }
      } else {
        throw new Error('Expected a stream, but received a non-stream response');
      }
    } catch (error) {
      console.error('Error in API call:', error);
      currentChat.messages.pop();
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, there was an error processing your request: ${error}`,
      };
      currentChat.messages.push(errorMessage);
      ctx.updateChat(currentChat);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight(textareaRef);
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
              <div key={index} className={`message ${message.role === "user" ? 'user-message' : 'ai-message'}`}>
                {renderMarkdownWithCode(message.content, starryNight)}
                {isStreaming && index === currentChat.messages.length - 1 && message.role === 'assistant' && (
                  <span className="pulsing-circle"></span>
                )}
              </div>
            ))}
          </div>
        </div>
          <div className="input-container">
            <div className="textarea-wrapper">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message and press Enter to send..."
                rows={1}
                disabled={isStreaming}
                style={{ outline: 'none' }}
              />
              <button
                onClick={isStreaming ? handleStop : handleSend}
                className="send-button"
              >{isStreaming ? 'Stop' : 'Send'}</button>
            </div>
            <div className="chat-tools">
              <button
                className={`pill-button`}
                // className={`pill-button ${isPillActive ? 'active' : ''}`}
                // onClick={handlePillClick}
              >
                Deep Research
              </button>
              <button
                className={`pill-button`}
                // className={`pill-button ${isPillActive ? 'active' : ''}`}
                // onClick={handlePillClick}
              >
                Websearch
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};
