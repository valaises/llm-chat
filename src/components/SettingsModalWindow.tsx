import React, { useEffect, useRef, useState } from 'react';
import './SettingsModalWindow.css';
import { ChatContextType, MCPLServerCfg } from "../types.ts";
import { MCPLHandler } from '../mcpl';

interface SettingsModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  ctx: ChatContextType;
}

const SettingsModalWindow: React.FC<SettingsModalWindowProps> = ({ isOpen, onClose, ctx }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('connections');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Fetch MCPL servers when modal opens
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, ctx.endpointURL, ctx.endpointAPIKey]);

  const handleAddServer = async () => {
    if (!newServerUrl.trim()) return;

    if (!ctx.endpointURL || !ctx.endpointAPIKey) {
      setErrorMessage('API endpoint URL and API key are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create a new server config
      const newServer: MCPLServerCfg = {
        address: newServerUrl,
        is_active: true
      };

      const updatedServers = [...ctx.mcplServers, newServer];

      // Update servers via API
      const mcplHandler = new MCPLHandler(ctx.endpointURL, ctx.endpointAPIKey);
      await mcplHandler.updateServers(updatedServers);

      // Refresh the server list
      const servers = await mcplHandler.listServers();
      ctx.setMcplServers(servers);

      // Clear input
      setNewServerUrl('');
    } catch (error) {
      console.error('Failed to add MCPL server:', error);
      setErrorMessage('Failed to add server. Please check your API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleServer = async (index: number) => {
    if (!ctx.endpointURL || !ctx.endpointAPIKey) {
      setErrorMessage('API endpoint URL and API key are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const updatedServers = [...ctx.mcplServers];
      updatedServers[index] = {
        ...updatedServers[index],
        is_active: !updatedServers[index].is_active
      };

      // Update servers via API
      const mcplHandler = new MCPLHandler(ctx.endpointURL, ctx.endpointAPIKey);
      const servers = await mcplHandler.updateServers(updatedServers);

      ctx.setMcplServers(servers);
    } catch (error) {
      console.error('Failed to toggle MCPL server:', error);
      setErrorMessage('Failed to update server. Please check your API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveServer = async (index: number) => {
    if (!ctx.endpointURL || !ctx.endpointAPIKey) {
      setErrorMessage('API endpoint URL and API key are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const updatedServers = [...ctx.mcplServers];
      updatedServers.splice(index, 1);

      // Update servers via API
      const mcplHandler = new MCPLHandler(ctx.endpointURL, ctx.endpointAPIKey);
      await mcplHandler.updateServers(updatedServers);

      // Refresh the server list
      const servers = await mcplHandler.listServers();
      ctx.setMcplServers(servers);
    } catch (error) {
      console.error('Failed to remove MCPL server:', error);
      setErrorMessage('Failed to remove server. Please check your API credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const navigationItems = [
    { id: 'connections', icon: '☁️', label: 'Connections' },
    { id: 'mcpl-servers', icon: '🧰', label: 'MCPL Servers' },
  ];

  return (
    <div className="settings-modal-overlay">
      <div className="  settings-modal-content" ref={modalRef}>
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

            {activeSection === 'mcpl-servers' && (
              <>
                <h2 className="section-title">MCPL Servers</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="mcpl-servers-container">
                  <div className="form-group">
                    <label>Add Server</label>
                    <div className="add-server-input-group">
                      <input
                        type="text"
                        className="input-field"
                        value={newServerUrl}
                        onChange={(e) => setNewServerUrl(e.target.value)}
                        placeholder="https://llmtools.valerii.cc/v1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newServerUrl.trim()) {
                            handleAddServer();
                          }
                        }}
                        disabled={isLoading}
                      />
                      <button
                        className="add-server-btn-inline"
                        onClick={handleAddServer}
                        disabled={isLoading || !newServerUrl.trim()}
                      >
                        Add Server
                      </button>
                    </div>
                  </div>

                  {ctx.mcplServers.length > 0 ? (
                    <div className="mcpl-servers-list">
                      <h3 className="servers-list-title">Server List</h3>
                      {ctx.mcplServers.map((server, index) => (
                        <div key={index} className="mcpl-server-item">
                          <div className="mcpl-server-info">
                            <span>{server.address}</span>
                            <div className="toggle-switch">
                              <input
                                type="checkbox"
                                id={`server-toggle-${index}`}
                                checked={server.is_active}
                                onChange={() => handleToggleServer(index)}
                                disabled={isLoading}
                              />
                              <label
                                className="toggle-slider"
                                htmlFor={`server-toggle-${index}`}
                              ></label>
                            </div>
                          </div>
                          <button
                            className="remove-server-btn"
                            onClick={() => handleRemoveServer(index)}
                            disabled={isLoading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-servers-message">
                      {isLoading ? 'Loading servers...' : 'No servers added yet'}
                    </p>
                  )}
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