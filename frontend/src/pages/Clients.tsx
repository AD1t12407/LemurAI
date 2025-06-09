import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Building2, Users, Calendar, Mail, Phone, Plus, Search, Filter, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useClientStore } from '../stores/clientStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ClientModal } from '../components/ClientModal';
import { cn } from '../utils/cn';

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, initializeClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    document.title = 'Clients | Lemur AI';
    initializeClients();
  }, [initializeClients]);

  // Filter clients based on search and industry
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contacts?.some(contact => 
                           contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesIndustry = selectedIndustry === 'all' || client.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = ['all', ...Array.from(new Set(clients.map(c => c.industry).filter(Boolean)))];

  const handleSaveClient = (clientData: any) => {
    if (editingClient) {
      updateClient(editingClient.id, clientData);
    } else {
      addClient(clientData);
    }
    setEditingClient(null);
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
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
                  placeholder="Search clients, contacts, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="input w-auto min-w-[150px]"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                label: 'Total Clients',
                value: clients.length,
                icon: Building2,
                color: 'blue'
              },
              {
                label: 'Active Projects',
                value: clients.reduce((acc, client) => acc + (client.meetings?.length || 0), 0),
                icon: Calendar,
                color: 'green'
              },
              {
                label: 'Total Contacts',
                value: clients.reduce((acc, client) => acc + (client.contacts?.length || 0), 0),
                icon: Users,
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
          <motion.div
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                className="card hover-lift cursor-pointer"
                variants={fadeIn}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => handleEditClient(client)}
              >
                <div className="flex items-start gap-4">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {client.name}
                    </h3>
                    {client.industry && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {client.industry}
                      </p>
                    )}
                  </div>
                </div>

                {client.notes && (
                  <p className="mt-3 text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {client.notes}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Users className="h-4 w-4" />
                      {client.contacts?.length || 0} contacts
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar className="h-4 w-4" />
                      {client.meetings?.length || 0} meetings
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <FileText className="h-4 w-4" />
                      {client.files?.length || 0} files
                    </span>
                  </div>
                </div>

                {client.contacts && client.contacts.length > 0 && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {client.contacts.slice(0, 3).map((contact, index) => (
                          <div
                            key={contact.id}
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                            title={contact.name}
                          >
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        ))}
                      </div>
                      {client.contacts.length > 3 && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          +{client.contacts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {filteredClients.length === 0 && (
            <div className="mt-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                No clients found
              </h3>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                {searchTerm || selectedIndustry !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
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
    </div>
  );
};
