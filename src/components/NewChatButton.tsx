import React from 'react';
import './NewChatButton.css';

interface NewChatButtonProps {
  onClick: () => void;
  sidebarOpen: boolean;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick, sidebarOpen }) => {
  return (
    <button 
      className={`new-chat-button ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      onClick={onClick}
      type="button"
    >
      New Chat
    </button>
  );
};