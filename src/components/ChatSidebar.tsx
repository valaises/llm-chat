import React, { useState } from 'react';
import './ChatSidebar.css';
import SettingsModalWindow from './SettingsModalWindow.tsx';
import {ChatContextType} from "../types.ts";
import KnowledgeModalWindow from "./KnowledgeModalWindow.tsx";


interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  ctx: ChatContextType;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({isOpen, onToggle, ctx,}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const handleSettingsOpenModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleSettingsCloseModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleKnowledgeOpenModal = () => {
    setIsKnowledgeModalOpen(true);
  }

  const handleKnowledgeCloseModal = () => {
    setIsKnowledgeModalOpen(false);
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
          
          <div className="sidebar-knowledge">
            <button
              className="sidebar-button"
              type="button"
              aria-label="Knowledge"
              onClick={handleKnowledgeOpenModal}
            >
              {isOpen ? ('📒 Knowledge') : ('📒')}
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
              className="sidebar-button"
              type="button"
              aria-label="Settings"
              onClick={handleSettingsOpenModal}
            > {isOpen ? ('⚙️ Settings') : ('⚙️')} </button>
          </div>
        </div>
      </div>

      <KnowledgeModalWindow isOpen={isKnowledgeModalOpen} onClose={handleKnowledgeCloseModal} ctx={ctx}>
      </KnowledgeModalWindow>

      <SettingsModalWindow isOpen={isSettingsModalOpen} onClose={handleSettingsCloseModal} ctx={ctx}>
      </SettingsModalWindow>
    </>
  );
};