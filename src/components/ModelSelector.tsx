import React, { useState, useRef, useEffect } from 'react';
import './ModelSelector.css';

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

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

  const currentModel = models.find(model => model.id === selectedModel)?.name || 'Select Model';

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button className="model-selector-button" onClick={() => setIsOpen(!isOpen)}>
        {currentModel}
      </button>
      {isOpen && (
        <div className="model-dropdown">
          {models.map(model => (
            <div
              key={model.id}
              className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              {model.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};