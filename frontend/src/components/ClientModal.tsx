import React, { useState, useEffect } from 'react';
import { X, Upload, File, Trash2, Plus, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { useClientStore } from '../stores/clientStore';
import { cn } from '../utils/cn';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  client?: any; // For editing existing clients
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client
}) => {
  const { uploadFile, clientFiles, isLoading } = useClientStore();

  const [formData, setFormData] = useState({
    name: client?.name || '',
    description: client?.description || ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [clientId, setClientId] = useState(client?.id || null);

  // Update form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        description: client.description || ''
      });
      setClientId(client.id);
    } else {
      setFormData({
        name: '',
        description: ''
      });
      setClientId(null);
    }
  }, [client]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || !clientId) {
      // If no client ID yet, we need to create the client first
      if (!clientId && formData.name.trim()) {
        try {
          // Create client first, then upload files
          const clientData = {
            name: formData.name,
            description: formData.description
          };
          onSave(clientData);
          // Files will be uploaded after client creation
          return;
        } catch (error) {
          console.error('Failed to create client:', error);
          return;
        }
      }
      return;
    }

    setUploadingFiles(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        await uploadFile(clientId, uploadedFiles[i]);
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const clientData = {
      name: formData.name,
      description: formData.description
    };
    onSave(clientData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {client ? 'Edit Client' : 'Add New Client'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {client ? 'Update client information and files' : 'Create a new client profile with contacts and files'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                  Client Information
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Client Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter client organization name"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the client organization..."
                      rows={3}
                      className="input w-full resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              {clientId && (
                <div>
                  <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Knowledge Base Files
                  </h3>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload documents to build the knowledge base for this client.
                    Supported formats: PDF, DOC, DOCX, TXT, MD
                  </div>

                  {/* Upload Area */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                      dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600",
                      uploadingFiles && "opacity-50 pointer-events-none"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadingFiles ? (
                      <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                          Uploading and processing files...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Drop files here or click to upload
                        </p>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          PDF, DOC, DOCX, TXT, MD files supported
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          id="file-upload"
                          disabled={uploadingFiles}
                        />
                        <label htmlFor="file-upload">
                          <Button as="span" variant="outline" disabled={uploadingFiles}>
                            Choose Files
                          </Button>
                        </label>
                      </>
                    )}
                  </div>

                  {/* Existing Files */}
                  {clientId && clientFiles[clientId] && clientFiles[clientId].length > 0 && (
                    <div className="mt-6 space-y-2">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Existing Files ({clientFiles[clientId].length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {clientFiles[clientId].map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                            style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-secondary)' }}
                          >
                            <File className="h-5 w-5 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {file.original_filename}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {(file.file_size / 1024).toFixed(1)} KB •
                                {file.processed ? ' Processed' : ' Processing...'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!clientId && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    💡 Create the client first, then you can upload files to build their knowledge base.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {client ? 'Update Client' : 'Create Client'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
