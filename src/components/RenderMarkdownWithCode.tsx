import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import ReactMarkdown from 'markdown-to-jsx';
import {CodeBlock} from "./CodeBlock.tsx";
import '@wooorm/starry-night/style/both';
import {MessageRender} from "../types.ts";
import {useState} from "react";
import './ToolMessage.css';


const ToolMessage: React.FC<{ message: MessageRender }> = ({ message }) => {
  const [isContentVisible, setIsContentVisible] = useState(false);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  if (message.type === "tool_call") {
    return (
      <div className="tool-message">
        <div onClick={toggleContentVisibility} className="tool-message-title">
          <span className="tool-message-icon">🔭 TOOL</span>
          <span>{message.tool_name}</span>
        </div>
        <div className={`tool-message-content ${isContentVisible ? 'visible' : 'hidden'}`}>
          <pre>{message.content}</pre>
        </div>
      </div>
    );
  }

  if (message.type === "tool") {
    return (
      <div className="tool-message">
        <div onClick={toggleContentVisibility} className="tool-message-title">
          <span className="tool-message-icon">🔗 TOOL</span>
          <span>{message.tool_name}</span>
        </div>
        <div className={`tool-message-content ${isContentVisible ? 'visible' : 'hidden'}`}>
          <pre>{message.content}</pre>
        </div>
      </div>
    );
  }

};


export const renderMessageInChat = (message: MessageRender, starryNight) => {
  if (!starryNight) return message.content;

  if (message.type === "tool_call" || message.type === "tool") {
    return <ToolMessage message={message} />;
  }

  const parts = [];
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

  const processedContent = preprocessContent(message.content);
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
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
          <CodeBlock key={match.index} language={lang} text={code}>
            <div className="code-header">{lang}</div>
            <pre className={`highlight highlight-${scope.replace(/^source\./, '').replace(/\./g, '-')}`}>
              <code>{highlighted}</code>
            </pre>
          </CodeBlock>
        );
      } else {
        parts.push(
          <CodeBlock key={match.index} language={lang} text={code}>
            {code}
          </CodeBlock>
        );
      }
    } else {
      parts.push(
        <CodeBlock key={match.index} text={code}>
          {code}
        </CodeBlock>
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
