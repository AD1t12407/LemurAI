import React, { useEffect, useState } from 'react';
import { useClientStore } from '../stores/clientStore';
import { useBotStore } from '../stores/botStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  Building2, 
  Users, 
  FileText, 
  Bot, 
  Plus, 
  Search, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface ProductionDashboardProps {
  className?: string;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { 
    apiClients, 
    subClients, 
    clientFiles, 
    isLoading: clientLoading, 
    error: clientError,
    fetchAPIClients,
    createAPIClient,
    fetchSubClients,
    searchKnowledge
  } = useClientStore();
  
  const {
    activeBots,
    isLoading: botLoading,
    error: botError,
    listActiveBots,
    createBot,
    cleanupOldBots
  } = useBotStore();

  // State for modals and forms
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const [newBotMeetingUrl, setNewBotMeetingUrl] = useState('');
  const [newBotName, setNewBotName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      fetchAPIClients();
      listActiveBots();
    }
  }, [user]);

  // Auto-refresh active bots every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        listActiveBots();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    
    try {
      await createAPIClient(newClientName, newClientDescription);
      setNewClientName('');
      setNewClientDescription('');
      setShowCreateClient(false);
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleCreateBot = async () => {
    if (!newBotMeetingUrl.trim() || !newBotName.trim()) return;
    
    try {
      await createBot(newBotMeetingUrl, newBotName);
      setNewBotMeetingUrl('');
      setNewBotName('');
      setShowCreateBot(false);
    } catch (error) {
      console.error('Failed to create bot:', error);
    }
  };

  const handleKnowledgeSearch = async () => {
    if (!searchQuery.trim() || apiClients.length === 0) return;
    
    try {
      // Search across all clients
      const allResults = await Promise.all(
        apiClients.map(async (client) => {
          try {
            const result = await searchKnowledge(client.id, searchQuery);
            return {
              clientName: client.name,
              clientId: client.id,
              results: result.results || []
            };
          } catch (error) {
            return { clientName: client.name, clientId: client.id, results: [] };
          }
        })
      );
      
      setSearchResults(allResults.filter(r => r.results.length > 0));
    } catch (error) {
      console.error('Knowledge search failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_call':
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed':
      case 'fatal':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const totalSubClients = Object.values(subClients).reduce((sum, subs) => sum + subs.length, 0);
  const totalFiles = Object.values(clientFiles).reduce((sum, files) => sum + files.length, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Production Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}! Manage your clients and AI-powered workflows.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowKnowledgeSearch(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Knowledge
          </Button>
          <Button
            onClick={() => setShowCreateBot(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Create Bot
          </Button>
          <Button
            onClick={() => setShowCreateClient(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{apiClients.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sub-Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubClients}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Knowledge Files</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFiles}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Bots</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBots.length}</p>
            </div>
            <Bot className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Active Bots Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Meeting Bots</h2>
          <Button
            onClick={cleanupOldBots}
            variant="outline"
            size="sm"
            disabled={botLoading}
          >
            {botLoading ? <LoadingSpinner size="sm" /> : 'Cleanup Old Bots'}
          </Button>
        </div>
        
        {activeBots.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active bots. Create one to start recording meetings!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBots.map((bot) => (
              <div
                key={bot.bot_id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(bot.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{bot.bot_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {bot.status} • Created: {new Date(bot.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bot.video_url && (
                    <Button
                      onClick={() => window.open(bot.video_url, '_blank')}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Video
                    </Button>
                  )}
                  {bot.transcript_url && (
                    <Button
                      onClick={() => window.open(bot.transcript_url, '_blank')}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Transcript
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Clients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Clients</h2>
        
        {clientLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : apiClients.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No clients yet. Create your first client to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiClients.slice(0, 6).map((client) => (
              <div
                key={client.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{client.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {client.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{subClients[client.id]?.length || 0} sub-clients</span>
                  <span>{clientFiles[client.id]?.length || 0} files</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Client Modal */}
      <Modal
        isOpen={showCreateClient}
        onClose={() => setShowCreateClient(false)}
        title="Create New Client"
      >
        <div className="space-y-4">
          <Input
            label="Client Name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Enter client name"
            required
          />
          <Input
            label="Description (Optional)"
            value={newClientDescription}
            onChange={(e) => setNewClientDescription(e.target.value)}
            placeholder="Brief description of the client"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateClient(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!newClientName.trim() || clientLoading}
            >
              {clientLoading ? <LoadingSpinner size="sm" /> : 'Create Client'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Bot Modal */}
      <Modal
        isOpen={showCreateBot}
        onClose={() => setShowCreateBot(false)}
        title="Create Meeting Bot"
      >
        <div className="space-y-4">
          <Input
            label="Meeting URL"
            value={newBotMeetingUrl}
            onChange={(e) => setNewBotMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            required
          />
          <Input
            label="Bot Name"
            value={newBotName}
            onChange={(e) => setNewBotName(e.target.value)}
            placeholder="Meeting Recording Bot"
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateBot(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBot}
              disabled={!newBotMeetingUrl.trim() || !newBotName.trim() || botLoading}
            >
              {botLoading ? <LoadingSpinner size="sm" /> : 'Create Bot'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Knowledge Search Modal */}
      <Modal
        isOpen={showKnowledgeSearch}
        onClose={() => setShowKnowledgeSearch(false)}
        title="Search Company Knowledge"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all client knowledge..."
              className="flex-1"
            />
            <Button
              onClick={handleKnowledgeSearch}
              disabled={!searchQuery.trim() || clientLoading}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {searchResults.map((clientResult) => (
                <div key={clientResult.clientId} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {clientResult.clientName}
                  </h4>
                  <div className="space-y-2">
                    {clientResult.results.slice(0, 3).map((result: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          {result.content.substring(0, 200)}...
                        </p>
                        {result.score && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Relevance: {(result.score * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Error Display */}
      {(clientError || botError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">
              {clientError || botError}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
