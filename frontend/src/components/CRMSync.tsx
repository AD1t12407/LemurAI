import React, { useState } from 'react';
import { RefreshCw, Database, CheckCircle, AlertCircle, Settings, Zap, Users, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

interface CRMConnection {
  id: string;
  name: string;
  type: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  recordsCount: number;
  icon: string;
}

interface SyncData {
  contacts: { synced: number; total: number; errors: number };
  companies: { synced: number; total: number; errors: number };
  deals: { synced: number; total: number; errors: number };
  activities: { synced: number; total: number; errors: number };
}

interface CRMSyncProps {
  meetingId?: string;
  className?: string;
}

export const CRMSync: React.FC<CRMSyncProps> = ({ meetingId, className }) => {
  const [connections, setConnections] = useState<CRMConnection[]>([
    {
      id: '1',
      name: 'Salesforce Production',
      type: 'salesforce',
      status: 'connected',
      lastSync: '2 minutes ago',
      recordsCount: 1247,
      icon: '🔵'
    },
    {
      id: '2',
      name: 'HubSpot Marketing',
      type: 'hubspot',
      status: 'connected',
      lastSync: '5 minutes ago',
      recordsCount: 892,
      icon: '🟠'
    },
    {
      id: '3',
      name: 'Pipedrive Sales',
      type: 'pipedrive',
      status: 'disconnected',
      lastSync: '2 hours ago',
      recordsCount: 0,
      icon: '🟢'
    }
  ]);

  const [syncData] = useState<SyncData>({
    contacts: { synced: 245, total: 250, errors: 5 },
    companies: { synced: 89, total: 92, errors: 3 },
    deals: { synced: 156, total: 160, errors: 4 },
    activities: { synced: 1247, total: 1250, errors: 3 }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const { success, error, info } = useToastStore();

  const syncCRM = async (connectionId: string) => {
    setIsSyncing(true);
    const connection = connections.find(c => c.id === connectionId);
    
    info('CRM Sync', `Starting sync with ${connection?.name}...`);

    // Update connection status
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'syncing' as const }
        : conn
    ));

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update connection with success
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { 
            ...conn, 
            status: 'connected' as const, 
            lastSync: 'Just now',
            recordsCount: conn.recordsCount + Math.floor(Math.random() * 10)
          }
        : conn
    ));

    setIsSyncing(false);
    success('Sync Complete', `Successfully synced meeting data with ${connection?.name}`);
  };

  const syncAllCRMs = async () => {
    setIsSyncing(true);
    info('CRM Sync', 'Starting sync with all connected CRMs...');

    const connectedCRMs = connections.filter(c => c.status === 'connected');
    
    for (const crm of connectedCRMs) {
      setConnections(prev => prev.map(conn => 
        conn.id === crm.id 
          ? { ...conn, status: 'syncing' as const }
          : conn
      ));
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnections(prev => prev.map(conn => 
        conn.id === crm.id 
          ? { 
              ...conn, 
              status: 'connected' as const, 
              lastSync: 'Just now',
              recordsCount: conn.recordsCount + Math.floor(Math.random() * 5)
            }
          : conn
      ));
    }

    setIsSyncing(false);
    success('Bulk Sync Complete', `Meeting data synced with ${connectedCRMs.length} CRM systems`);
  };

  const getStatusIcon = (status: CRMConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-primary-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-dark-400" />;
    }
  };

  const getStatusColor = (status: CRMConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'text-success-600 dark:text-success-400';
      case 'syncing':
        return 'text-primary-600 dark:text-primary-400';
      case 'error':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-dark-500 dark:text-dark-400';
    }
  };

  return (
    <div className={cn('bg-white rounded-xl border border-dark-200 shadow-sm dark:bg-dark-900 dark:border-dark-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Database className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-900 dark:text-dark-50">CRM Integration</h3>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Auto-sync meeting data with your CRM systems
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Settings className="h-4 w-4" />}
          >
            Configure
          </Button>
          <Button
            size="sm"
            onClick={syncAllCRMs}
            disabled={isSyncing}
            leftIcon={<Zap className="h-4 w-4" />}
          >
            Sync All
          </Button>
        </div>
      </div>

      {/* CRM Connections */}
      <div className="p-6">
        <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Connected CRMs</h4>
        <div className="space-y-3">
          {connections.map((connection) => (
            <motion.div
              key={connection.id}
              className="flex items-center justify-between p-4 border border-dark-200 rounded-lg dark:border-dark-700"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{connection.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-dark-900 dark:text-dark-50">{connection.name}</h5>
                    {getStatusIcon(connection.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-dark-600 dark:text-dark-400">
                    <span className={getStatusColor(connection.status)}>
                      {connection.status ? (connection.status.charAt(0).toUpperCase() + connection.status.slice(1)) : 'Unknown'}
                    </span>
                    <span>•</span>
                    <span>Last sync: {connection.lastSync}</span>
                    <span>•</span>
                    <span>{connection.recordsCount} records</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncCRM(connection.id)}
                disabled={isSyncing || connection.status === 'disconnected'}
                leftIcon={<RefreshCw className={cn('h-4 w-4', connection.status === 'syncing' && 'animate-spin')} />}
              >
                {connection.status === 'syncing' ? 'Syncing...' : 'Sync'}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Sync Statistics */}
        <div className="mt-6">
          <h4 className="font-medium text-dark-900 dark:text-dark-50 mb-4">Sync Statistics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg dark:bg-primary-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-dark-900 dark:text-dark-50">Contacts</span>
              </div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {syncData.contacts.synced}
              </div>
              <div className="text-xs text-dark-600 dark:text-dark-400">
                of {syncData.contacts.total} • {syncData.contacts.errors} errors
              </div>
            </div>

            <div className="p-4 bg-success-50 rounded-lg dark:bg-success-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-success-600 dark:text-success-400" />
                <span className="text-sm font-medium text-dark-900 dark:text-dark-50">Companies</span>
              </div>
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                {syncData.companies.synced}
              </div>
              <div className="text-xs text-dark-600 dark:text-dark-400">
                of {syncData.companies.total} • {syncData.companies.errors} errors
              </div>
            </div>

            <div className="p-4 bg-accent-50 rounded-lg dark:bg-accent-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                <span className="text-sm font-medium text-dark-900 dark:text-dark-50">Deals</span>
              </div>
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {syncData.deals.synced}
              </div>
              <div className="text-xs text-dark-600 dark:text-dark-400">
                of {syncData.deals.total} • {syncData.deals.errors} errors
              </div>
            </div>

            <div className="p-4 bg-warning-50 rounded-lg dark:bg-warning-900/20">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                <span className="text-sm font-medium text-dark-900 dark:text-dark-50">Activities</span>
              </div>
              <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {syncData.activities.synced}
              </div>
              <div className="text-xs text-dark-600 dark:text-dark-400">
                of {syncData.activities.total} • {syncData.activities.errors} errors
              </div>
            </div>
          </div>
        </div>

        {/* Auto-sync Settings */}
        <div className="mt-6 p-4 bg-dark-50 rounded-lg dark:bg-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-dark-900 dark:text-dark-50">Auto-sync Enabled</h5>
              <p className="text-sm text-dark-600 dark:text-dark-400">
                Meeting data will be automatically synced to all connected CRMs after each meeting
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
