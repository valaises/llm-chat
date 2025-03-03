import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../UseChat';
import './ModelSelector.css';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ctx = useChat();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
  };

  const currentModel = ctx.models.find(model => model.id === selectedModel)?.id || 'Select Model';

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button className="model-selector-button" onClick={() => setIsOpen(!isOpen)}>
        {currentModel}
      </button>
      {isOpen && (
        <div className="model-dropdown">
          {ctx.models.map(model => (
            <div
              key={model.id}
              className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              {model.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
