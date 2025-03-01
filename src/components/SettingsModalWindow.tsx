import React, { useEffect, useRef, useState } from 'react';
import './SettingsModalWindow.css';

interface SettingsModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModalWindow: React.FC<SettingsModalWindowProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('general');

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
    { id: 'general', icon: '⚙️', label: 'General' },
    { id: 'personalization', icon: '👤', label: 'Personalization' },
    { id: 'speech', icon: '🎤', label: 'Speech' },
    { id: 'data', icon: '📊', label: 'Data controls' },
    { id: 'builder', icon: '📱', label: 'Builder profile' },
    { id: 'connections', icon: '☁️', label: 'Connections' },
    { id: 'apps', icon: '🔌', label: 'Connected apps' },
    { id: 'security', icon: '🔒', label: 'Security' },
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
            {activeSection === 'general' && (
              <>
                <div className="settings-section">
                  <span>Theme</span>
                  <div className="select-wrapper">
                    <select>
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
                
                <div className="settings-section">
                  <span>Always show code when using data analyst</span>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-section">
                  <span>Show follow up suggestions in chats</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-section">
                  <span>Language</span>
                  <div className="select-wrapper">
                    <select>
                      <option value="auto">Auto-detect</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>

                <div className="settings-section">
                  <span>Archived chats</span>
                  <button className="button">Manage</button>
                </div>

                <div className="settings-section">
                  <span>Archive all chats</span>
                  <button className="button">Archive all</button>
                </div>

                <div className="settings-section">
                  <span>Delete all chats</span>
                  <button className="button button-danger">Delete all</button>
                </div>

                <div className="settings-section">
                  <span>Log out on this device</span>
                  <button className="button">Log out</button>
                </div>
              </>
            )}

            {activeSection === 'connections' && (
              <>
                <h2 className="section-title">OpenAI API</h2>
                <div className="form-group">
                  <label>API Endpoint</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div className="form-group">
                  <label>API Key</label>
                  <input 
                    type="password" 
                    className="input-field"
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