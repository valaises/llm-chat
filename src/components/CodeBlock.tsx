import React from "react";
import {CopyButton} from "./CopyButton.tsx";


interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  text: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  return (
    <div className="relative group">
      <pre className="relative rounded-lg bg-gray-800 p-4">
        <CopyButton text={props.text}/>
        <code>{props.children}</code>
      </pre>
    </div>
  );
};
