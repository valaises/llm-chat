import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message, ChatContextType, CompletionRequest } from '../types';
import './Chat.css';
import { getCurrentChat } from '../utils';
import { CompletionsHandler } from '../completions';
import { common, createStarryNight } from '@wooorm/starry-night';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import ReactMarkdown from 'markdown-to-jsx';


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
  const observerRef = useRef<MutationObserver | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    createStarryNight(common).then(setStarryNight);
  }, []);

  const currentChat = getCurrentChat(ctx.chats, ctx.currentChatID)!;
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

  useEffect(() => {
    if (chatWindowRef.current) {
      observerRef.current = new MutationObserver((mutations) => {
        // Only scroll if content was added/changed
        if (mutations.some(m => m.type === 'childList' || m.type === 'characterData')) {
          scrollToBottom();
        }
      });
      observerRef.current.observe(chatWindowRef.current, {
        childList: true,
        subtree: true,
        characterData: true
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

    const message: Message = {
      role: 'assistant',
      content: '',
    };
    currentChat.messages.push(message);

    try {
      const completionRequest: CompletionRequest = {
        model: ctx.lastUsedModelID || "",
        messages: currentChat.messages,
        max_tokens: 256,
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

  const renderMarkdownWithCode = (content: string) => {
    if (!starryNight) return content;

    const preprocessContent = (text: string) => {
      const lines = text.split('\n');
      let backQuotesOpened = false;

      for (const line of lines) {
        if (line.includes('```')) {
          backQuotesOpened = !backQuotesOpened;
        }
      }

      if (backQuotesOpened) {
        return text + '\n```';
      }
      return text;
    };

    const processedContent = preprocessContent(content);
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = codeBlockRegex.exec(processedContent)) !== null) {
      // Add text before code block as markdown
      if (match.index > lastIndex) {
        const textContent = processedContent.slice(lastIndex, match.index);
        parts.push(
          <ReactMarkdown key={`md-${match.index}`}>
            {textContent}
          </ReactMarkdown>
        );
      }

      const [, lang, code] = match;
      if (lang) {
        const scope = starryNight.flagToScope(lang);
        if (scope) {
          const tree = starryNight.highlight(code.trim(), scope);
          const highlighted = toJsxRuntime(tree, { Fragment, jsx, jsxs });
          parts.push(
            <pre key={match.index} className="code-block">
              <div className="code-header">{lang}</div>
              <code>{highlighted}</code>
            </pre>
          );
        } else {
          parts.push(
            <pre key={match.index} className="code-block">
              <code>{code}</code>
            </pre>
          );
        }
      } else {
        parts.push(
          <pre key={match.index} className="code-block">
            <code>{code}</code>
          </pre>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text as markdown
    if (lastIndex < processedContent.length) {
      const remainingContent = processedContent.slice(lastIndex);
      parts.push(
        <ReactMarkdown key={`md-${lastIndex}`}>
          {remainingContent}
        </ReactMarkdown>
      );
    }

    return parts;
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
                {renderMarkdownWithCode(message.content)}
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
              />
              <button
                onClick={isStreaming ? handleStop : handleSend}
                // disabled={isStreaming || inputText.trim() === ''}
                className="send-button"
              >{isStreaming ? 'Stop' : 'Send'}</button>
            </div>
          </div>
        </div>
      </div>
      );
};
