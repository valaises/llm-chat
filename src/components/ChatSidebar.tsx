import React, { useState } from 'react';
import './ChatSidebar.css';
import SettingsModalWindow from './SettingsModalWindow.tsx';
import {ChatContextType} from "../types.ts";


interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  ctx: ChatContextType;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({isOpen, onToggle, ctx,}) => {
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
                {[...ctx.chats]
                  .filter((c) => c.messages.length !== 0)
                  .reverse().map(chat => (
                  <div 
                    key={chat.id}
                    className={`history-item ${chat.id === ctx.currentChatID ? 'active' : ''}`}
                    onClick={() => ctx.setCurrentChatID(chat.id)}
                  >
                    <div className="history-item-text">{chat.name || "New Chat"}</div>
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

      <SettingsModalWindow isOpen={isModalOpen} onClose={handleCloseModal} ctx={ctx}>
        <h2>Settings</h2>
        {/* Modal content will be added later */}
      </SettingsModalWindow>
    </>
  );
};