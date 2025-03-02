import React, { useEffect, useRef, useState } from 'react';
import './SettingsModalWindow.css';
import {ChatContextType} from "../types.ts";

interface SettingsModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  ctx: ChatContextType;
}

const SettingsModalWindow: React.FC<SettingsModalWindowProps> = ({ isOpen, onClose, ctx }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('connections');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    // { id: 'general', icon: '⚙️', label: 'General' },
    // { id: 'personalization', icon: '👤', label: 'Personalization' },
    // { id: 'speech', icon: '🎤', label: 'Speech' },
    // { id: 'data', icon: '📊', label: 'Data controls' },
    // { id: 'builder', icon: '📱', label: 'Builder profile' },
    { id: 'connections', icon: '☁️', label: 'Connections' },
    // { id: 'apps', icon: '🔌', label: 'Connected apps' },
    // { id: 'security', icon: '🔒', label: 'Security' },
  ];

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-content" ref={modalRef}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button className="settings-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="settings-modal-body">
          <nav className="settings-nav">
            {navigationItems.map(item => (
              <div
                key={item.id}
                className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="settings-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          
          <div className="settings-content">
            {activeSection === 'connections' && (
              <>
                <h2 className="section-title">OpenAI API</h2>
                <div className="form-group">
                  <label>API Endpoint</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={ctx.endpointURL}
                    onChange={(e) => ctx.setEndpointURL(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div className="form-group">
                  <label>API Key</label>
                  <input 
                    type={isApiKeyVisible ? "text" : "password"}
                    className="input-field"
                    value={ctx.endpointAPIKey}
                    onChange={(e) => ctx.setEndpointAPIKey(e.target.value)}
                    onFocus={() => setIsApiKeyVisible(true)}
                    onBlur={() => setIsApiKeyVisible(false)}
                    placeholder="sk-..."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModalWindow;