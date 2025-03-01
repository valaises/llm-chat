import React from 'react';
import './NewChatButton.css';

interface NewChatButtonProps {
  onClick: () => void;
  sidebarOpen: boolean;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick, sidebarOpen }) => {
  return (
    <div className={`new-chat-button-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <button
        className="new-chat-button"
        onClick={onClick}
        type="button"
      >
        New Chat
      </button>
    </div>
  );
};