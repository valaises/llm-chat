import React, {useCallback, useEffect, useRef, useState} from 'react';
import './SettingsModalWindow.css';
import {ChatContextType} from "../types.ts";
import {streamUploadFile} from "../streamUploadFile.ts";
import {deleteFilePost, updateFilesList} from "../files.ts";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  ctx: ChatContextType;
}

const KnowledgeModalWindow: React.FC<Props> = ({ isOpen, onClose, ctx }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('documents');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllers = useRef<Map<string, () => void>>(new Map());

  const uploadFile = (file: File) => {
    streamUploadFile(
      ctx,
      file,
      ctx.endpointURL || "",
      ctx.endpointAPIKey || "",
      "document",
    );
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: File[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      console.log(file);
      if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.epub')) {
        // const fileWithStatus: FileWithStatus = Object.assign(file, {
        //   id: generateId(),
        //   progress: 0,
        //   status: 'pending'
        // });
        console.log(`File accepted: ${file.name}`);
        newFiles.push(file);
      }
    }

    // Start uploading each new file
    newFiles.forEach(file => {
      uploadFile(file);
    });
    updateFilesList(ctx);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    handleFileSelect(e.clipboardData.files);
  };

  // Handle file removal
  const handleRemoveFile = (file_name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    deleteFilePost(ctx, file_name);
  };

  // Add this to handle document keydown events for paste
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      // Paste event will be handled by the onPaste handler
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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

  // Clean up any ongoing uploads when component unmounts
  useEffect(() => {
    return () => {
      uploadAbortControllers.current.forEach(abortUpload => {
        if (abortUpload) abortUpload();
      });
    };
  }, []);

  if (!isOpen) return null;

  const navigationItems = [
    {id: 'documents', icon: '📄' ,label: 'Documents'},
  ];

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-content" ref={modalRef}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Knowledge</h2>
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
            {activeSection === 'documents' && (
              <div className="documents-section">
                <div
                  className="file-upload-area"
                  onClick={handleClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  tabIndex={0}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    accept=".pdf, .epub"
                    multiple={true}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <div className="upload-placeholder">
                    <div className="dashed-border">
                      <div className="upload-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 17L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 17"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="file-drop-description">Drop Files here, click to upload, or paste from
                          clipboard</p>
                        <p className="file-types">Supported file types: .pdf</p>
                      </div>
                    </div>
                  </div>
                </div>

                {ctx.files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files</h4>
                    <ul>
                      {ctx.files.map((file, index) => (
                        <li
                          key={file.file_name}
                          className={`file-item ${index % 2 === 1 ? 'alternate-row' : ''}`}
                          style={(index + 1) % 2 === 1 ? {backgroundColor: '#303030'} : {}}
                        >
                          <div className="file-info">
                            <span className="file-name">{file.file_name_orig}</span>
                          </div>
                          <button
                            className="remove-file"
                            onClick={(e) => handleRemoveFile(file.file_name, e)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="knowledge-documents-ongoings">
          <ul>
            {ctx.ongoings.filter(i => i.show_scope === "knowledge_documents").map((el) => (
              <li key={el.id} className="knowledge-documents-ongoing">
                {el.name} {el.status} {el.percent || 0}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeModalWindow;
