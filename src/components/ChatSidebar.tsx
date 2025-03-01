import React, { useState } from 'react';
import './ChatSidebar.css';
import SettingsModalWindow from './SettingsModalWindow.tsx';

interface Chat {
  id: number;
  name: string;
  messages: Array<{ id: number; text: string; isUser: boolean; }>;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  currentChatId: number;
  onSelectChat: (id: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onToggle,
  chats,
  currentChatId,
  onSelectChat
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`chat-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-inner">
          <div className="toggle-button-container">
            <button 
              className="toggle-button"
              onClick={onToggle}
              aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={isOpen}
              type="button"
            >
              <span aria-hidden="true">
                {isOpen ? '◀' : '▶'}
              </span>
            </button>
          </div>
          
          <div className="sidebar-content">
            <div className="sidebar-section">
              <h2>History</h2>
              <div className="history-list">
                {chats.map(chat => (
                  <div 
                    key={chat.id}
                    className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <div className="history-item-text">{chat.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button 
              className="settings-button"
              type="button"
              aria-label="Settings"
              onClick={handleOpenModal}
            >
              {isOpen ? (
                '⚙️ Settings'
              ) : (
                '⚙️'
              )}
            </button>
          </div>
        </div>
      </div>

      <SettingsModalWindow isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2>Settings</h2>
        {/* Modal content will be added later */}
      </SettingsModalWindow>
    </>
  );
};