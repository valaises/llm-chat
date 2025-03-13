import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ModelSelector } from './ModelSelector';
import { Message, MessageRender, ChatContextType, CompletionRequest } from '../types';
import './Chat.css';
import { getCurrentChat } from '../utils';
import { CompletionsHandler } from '../completions';
import { common, createStarryNight } from '@wooorm/starry-night';
import {renderMessageInChat} from "./RenderMarkdownWithCode.tsx";
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
      handleSend("user");
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const scrollToLastUserMessage = useCallback(() => {
    if (chatWindowRef.current) {
      const scrollElement = chatWindowRef.current;
      const messages = scrollElement.querySelectorAll('.message.user-message');
      const lastUserMessage = messages[messages.length - 1];

      if (lastUserMessage) {
        // Calculate the scroll position that will place the last user message at the top
        const messageTop = lastUserMessage.getBoundingClientRect().top;
        const containerTop = scrollElement.getBoundingClientRect().top;
        const scrollTop = messageTop - containerTop + scrollElement.scrollTop;

        scrollElement.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const handleSend = async (caller: string) => {
    let scrolls_before_stop = 10;

    if (caller === "user") {
      if (inputText.trim() === '' || isStreaming) return;

      const userMessage: Message = {
        role: "user",
        content: inputText,
      };

      currentChat.messages.push(userMessage);
      ctx.updateChat(currentChat);
      setInputText('');

      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }

    }

    scrollToBottom(); // Scroll after user message
    setIsStreaming(true);

    const message: Message = {
      role: 'assistant',
      content: '',
    };
    let assistant_message_pushed = false;

    scrollToLastUserMessage();

    try {
      const completionRequest: CompletionRequest = {
        model: ctx.lastUsedModelID || "",
        messages: currentChat.messages,
        max_tokens: 4196,
        stream: true,
      };
      if (ctx.tools.length) {
        completionRequest.tools = ctx.tools;
      }

      abortControllerRef.current = new AbortController();
      const stream = await completionsHandler.handleCompletion(
        completionRequest,
        abortControllerRef.current.signal
      );

      if (stream && Symbol.asyncIterator in stream) {
        try {
          for await (const chunk of stream) {
            if (scrolls_before_stop) {
              scrollToBottom();
              scrolls_before_stop -= 1;
            }
            if (chunk.type === "content_delta") {
              if (!assistant_message_pushed) {
                currentChat.messages.push(message);
                assistant_message_pushed = true;
              }
              message.content += chunk.content;
              currentChat.messages[currentChat.messages.length - 1] = { ...message };
            }
            if (chunk.type === "tool_call") {
              if (!assistant_message_pushed) {
                currentChat.messages.push(message);
                assistant_message_pushed = true;
              }
              if (!message.tool_calls) {
                message.tool_calls = [];
              }
              message.tool_calls.push(chunk.content);
              currentChat.messages[currentChat.messages.length - 1] = { ...message };
            }
            if (chunk.type === "tool_res_messages") {
              console.log(`received tool_res_messages: ${chunk.content}`)
              currentChat.messages = currentChat.messages.concat(chunk.content)
            }

            ctx.updateChat(currentChat);
          }

          if (currentChat.messages[currentChat.messages.length -1].tool_calls?.length) {
            console.log("repeating handleSend due to tool calls");
            await handleSend("assistant");
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

  const handleSendUser = () => {
    handleSend("user")
  }
  
  const messageTypeToClassName = (role: string) => {
    const hm: { [key: string]: string } = {
      user: "message user-message",
      assistant: "message ai-message",
      tool: "message tool-message",
      tool_call: "message tool-message",
    };
    return hm[role] || 'ai-message';
  }

  const toolCallId2ToolName = (messages: Message[]) => {
    const results: { [key: string]: string | undefined } = {};

    for (const message of messages) {
      if (message.tool_calls?.length) {
        for (const tool_call of message.tool_calls) {
          results[tool_call.id] = tool_call.function?.name;
        }
      }
    }

    return results;
  }

  const transformMessage2MessagesRender = (
    message: Message,
    id2ToolName: { [key: string]: string | undefined }
  ) => {
    const results: MessageRender[] = [];
    if (message.tool_calls?.length) {
      for (const tool_call of message.tool_calls) {
        const msg: MessageRender = {
          type: "tool_call",
          content: JSON.stringify(tool_call),
          tool_name: id2ToolName[tool_call.id] || "tool",
        };
        results.push(msg);
      }
    }

    if (message.content.length) {
      const msg: MessageRender = {
        type: message.role,
        content: message.content
      };

      if (message.role === "tool") {
        msg.tool_name = id2ToolName[message.tool_call_id || ""] || "tool";
      }
      results.push(msg);
    }
    return results;
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
            {
              currentChat?.messages
              .flatMap(message => transformMessage2MessagesRender(
                message, toolCallId2ToolName(currentChat.messages))
              )
              .map((message, index) => (
                <div key={index} className={`${messageTypeToClassName(message.type)}`}>
                  {renderMessageInChat(message, starryNight)}
                  {isStreaming && index === currentChat.messages.length - 1 && message.type === 'assistant' && (
                    <span className="pulsing-circle"></span>
                  )}
                </div>
              ))
            }
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
                style={{outline: 'none'}}
              />
            <button
              onClick={isStreaming ? handleStop : handleSendUser}
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
