import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Building2, Users, Calendar, Mail, Phone, Plus, Search, Filter, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useClientStore } from '../stores/clientStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ClientModal } from '../components/ClientModal';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { cn } from '../utils/cn';

export const Clients: React.FC = () => {
  const { user } = useAuthStore();
  const {
    apiClients,
    subClients,
    clientFiles,
    isLoading,
    error,
    fetchAPIClients,
    createAPIClient,
    updateAPIClient,
    deleteAPIClient,
    fetchSubClients,
    uploadFile,
    fetchFiles
  } = useClientStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientForFiles, setSelectedClientForFiles] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    document.title = 'Clients | Lemur AI';
    if (user) {
      fetchAPIClients();
    }
  }, [user, fetchAPIClients]);

  // Filter clients based on search
  const filteredClients = apiClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.description && client.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleSaveClient = async (clientData: any) => {
    try {
      if (editingClient) {
        await updateAPIClient(editingClient.id, {
          name: clientData.name,
          description: clientData.description
        });
      } else {
        await createAPIClient(clientData.name, clientData.description);
      }
      setEditingClient(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const handleEditClient = async (client: any) => {
    setEditingClient(client);
    setIsModalOpen(true);
    // Load sub-clients and files for this client
    await fetchSubClients(client.id);
    await fetchFiles(client.id);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteAPIClient(clientId);
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleFileUpload = async (files: FileList, clientId: string) => {
    setUploadingFiles(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(clientId, files[i]);
      }
      // Refresh files for this client
      await fetchFiles(clientId);
      setIsFileModalOpen(false);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleOpenFileModal = (client: any) => {
    setSelectedClientForFiles(client);
    setIsFileModalOpen(true);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl" style={{ color: 'var(--text-primary)' }}>
                Clients
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Manage your client relationships and project history
              </p>
            </div>

            <Button
              leftIcon={<Plus className="h-5 w-5" />}
              size="lg"
              onClick={() => setIsModalOpen(true)}
            >
              Add Client
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search clients by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                label: 'Total Clients',
                value: apiClients.length,
                icon: Building2,
                color: 'blue'
              },
              {
                label: 'Sub-Clients',
                value: Object.values(subClients).reduce((acc, subs) => acc + subs.length, 0),
                icon: Users,
                color: 'green'
              },
              {
                label: 'Knowledge Files',
                value: Object.values(clientFiles).reduce((acc, files) => acc + files.length, 0),
                icon: FileText,
                color: 'purple'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="card hover-lift"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'rounded-xl p-3 shadow-sm',
                    stat.color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20',
                    stat.color === 'green' && 'bg-green-50 dark:bg-green-900/20',
                    stat.color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20'
                  )}>
                    <stat.icon className={cn(
                      'h-6 w-6',
                      stat.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                      stat.color === 'green' && 'text-green-600 dark:text-green-400',
                      stat.color === 'purple' && 'text-purple-600 dark:text-purple-400'
                    )} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Clients Grid */}
          {!isLoading && (
            <motion.div
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredClients.map((client) => (
                <motion.div
                  key={client.id}
                  className="card hover-lift"
                  variants={fadeIn}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {client.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Created: {new Date(client.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {client.description && (
                    <p className="mt-3 text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {client.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Users className="h-4 w-4" />
                        {subClients[client.id]?.length || 0} sub-clients
                      </span>
                      <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <FileText className="h-4 w-4" />
                        {clientFiles[client.id]?.length || 0} files
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: 'var(--border-secondary)' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClient(client);
                      }}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFileModal(client);
                      }}
                      leftIcon={<Upload className="h-4 w-4" />}
                    >
                      Upload Files
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredClients.length === 0 && (
            <div className="mt-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                No clients found
              </h3>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first client.'
                }
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        client={editingClient}
      />

      {/* File Upload Modal */}
      <Modal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        title={`Upload Files - ${selectedClientForFiles?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Upload documents to build the knowledge base for {selectedClientForFiles?.name}.
            Supported formats: PDF, DOC, DOCX, TXT, MD
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                if (e.target.files && selectedClientForFiles) {
                  handleFileUpload(e.target.files, selectedClientForFiles.id);
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Click to upload files
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or drag and drop files here
                </p>
              </div>
            </label>
          </div>

          {/* Existing Files */}
          {selectedClientForFiles && clientFiles[selectedClientForFiles.id] && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Existing Files ({clientFiles[selectedClientForFiles.id].length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {clientFiles[selectedClientForFiles.id].map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.file_size / 1024).toFixed(1)} KB •
                        {file.processed ? ' Processed' : ' Processing...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadingFiles && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-blue-700 dark:text-blue-400">
                Uploading and processing files...
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsFileModalOpen(false)}
              disabled={uploadingFiles}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
