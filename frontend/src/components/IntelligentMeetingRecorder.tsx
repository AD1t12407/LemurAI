import React, { useState, useEffect } from 'react';
import { X, Video, Bot, AlertCircle, CheckCircle, Brain, Users, FileText, Loader, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { meetingIntelligenceService, MeetingRecording } from '../services/meetingIntelligence';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';

interface IntelligentMeetingRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  meetingUrl?: string;
  meetingTitle?: string;
  onRecordingCreated?: (recording: MeetingRecording) => void;
}

interface Client {
  id: string;
  name: string;
  description?: string;
}

interface SubClient {
  id: string;
  name: string;
  client_id: string;
}

export const IntelligentMeetingRecorder: React.FC<IntelligentMeetingRecorderProps> = ({
  isOpen,
  onClose,
  meetingUrl: initialMeetingUrl = '',
  meetingTitle: initialMeetingTitle = '',
  onRecordingCreated,
}) => {
  const { user } = useAuthStore();
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl);
  const [meetingTitle, setMeetingTitle] = useState(initialMeetingTitle);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSubClientId, setSelectedSubClientId] = useState('');
  const [attendees, setAttendees] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [subClients, setSubClients] = useState<SubClient[]>([]);
  const [activeRecordings, setActiveRecordings] = useState<MeetingRecording[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMeetingUrl(initialMeetingUrl);
      setMeetingTitle(initialMeetingTitle);
      loadClients();
      loadActiveRecordings();

      // Check authentication status
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    }
  }, [isOpen, initialMeetingUrl, initialMeetingTitle]);

  useEffect(() => {
    if (selectedClientId) {
      loadSubClients(selectedClientId);
    } else {
      setSubClients([]);
      setSelectedSubClientId('');
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      // This would be replaced with actual API call
      // const response = await ApiService.get('/clients');
      // setClients(response);
      
      // Mock data for now
      setClients([
        { id: 'client-1', name: 'Syntech Solutions', description: 'Main client' },
        { id: 'client-2', name: 'TechCorp Inc', description: 'Enterprise client' }
      ]);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadSubClients = async (clientId: string) => {
    try {
      // This would be replaced with actual API call
      // const response = await ApiService.get(`/clients/${clientId}/sub-clients`);
      // setSubClients(response);
      
      // Mock data for now
      setSubClients([
        { id: 'sub-1', name: 'Development Team', client_id: clientId },
        { id: 'sub-2', name: 'Marketing Team', client_id: clientId }
      ]);
    } catch (error) {
      console.error('Error loading sub-clients:', error);
    }
  };

  const loadActiveRecordings = () => {
    const recordings = meetingIntelligenceService.getAllLocalRecordings();
    setActiveRecordings(recordings);
  };

  const handleCreateRecording = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingUrl || !meetingTitle || !selectedClientId) {
      const toast = useToastStore.getState();
      toast.error('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const attendeeList = attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Auth check - Token exists:', !!token);
      console.log('🔍 Auth check - Token value:', token ? token.substring(0, 20) + '...' : 'null');

      // Force debug mode for now to test
      const forceDebugMode = true;

      if (!token || forceDebugMode) {
        // Use debug mode if not authenticated
        const toast = useToastStore.getState();
        toast.warning(
          'Using Debug Mode',
          'Not authenticated - using debug endpoint for testing'
        );

        const result = await meetingIntelligenceService.debugStartMeetingRecording({
          meeting_url: meetingUrl,
          meeting_title: meetingTitle,
          client_id: selectedClientId,
          sub_client_id: selectedSubClientId || undefined,
          attendees: attendeeList.length > 0 ? attendeeList : undefined
        });

        console.log('Debug recording result:', result);

        if (result.success) {
          toast.success('Debug Recording Started', result.message || 'Bot is joining the meeting');

          // Create a mock recording for the UI
          const mockRecording: MeetingRecording = {
            meeting_id: result.meeting_id,
            bot_id: result.bot_id,
            status: 'recording',
            meeting_title: meetingTitle,
            client_id: selectedClientId,
            processed: false,
            started_at: new Date().toISOString()
          };

          setActiveRecordings(prev => [...prev, mockRecording]);
          onRecordingCreated?.(mockRecording);

          // Reset form
          setMeetingUrl('');
          setMeetingTitle('');
          setSelectedClientId('');
          setSelectedSubClientId('');
          setAttendees('');
        } else {
          toast.error('Debug Recording Failed', result.error || 'Unknown error');
        }

        return;
      }

      // Normal authenticated flow
      const recording = await meetingIntelligenceService.startMeetingRecording({
        meeting_url: meetingUrl,
        meeting_title: meetingTitle,
        client_id: selectedClientId,
        sub_client_id: selectedSubClientId || undefined,
        attendees: attendeeList.length > 0 ? attendeeList : undefined
      });

      setActiveRecordings(prev => [...prev, recording]);
      onRecordingCreated?.(recording);

      // Reset form
      setMeetingUrl('');
      setMeetingTitle('');
      setSelectedClientId('');
      setSelectedSubClientId('');
      setAttendees('');

    } catch (error) {
      console.error('Failed to create intelligent recording:', error);
      const toast = useToastStore.getState();
      toast.error('Recording Failed', error.message || 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'starting':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case 'recording':
        return <Video className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'processing':
        return <Brain className="h-4 w-4 animate-pulse text-purple-500" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'starting':
        return 'Bot is joining meeting...';
      case 'recording':
        return 'Recording in progress';
      case 'processing':
        return 'AI processing meeting content...';
      case 'done':
        return 'AI processing complete';
      case 'failed':
        return 'Recording failed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'starting':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'recording':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'processing':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      case 'done':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'failed':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Intelligent Meeting Recorder" size="lg">
      <div className="space-y-6">
        {/* Authentication Status Banner */}
        {!isAuthenticated && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Debug Mode - Not Authenticated</h3>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              You're not logged in. The system will use debug mode for testing. Please login for full functionality.
            </p>
          </div>
        )}

        {/* AI Features Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered Meeting Intelligence</h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Automatically generates summaries, action items, and follow-up emails using your client's knowledge base for context.
          </p>
        </div>

        {/* Create New Recording */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Start Intelligent Recording
          </h3>
          
          <form onSubmit={handleCreateRecording} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Meeting URL"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                required
              />
              
              <Input
                label="Meeting Title"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Tech Stand Up"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Organization *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sub-Client (Optional)
                </label>
                <select
                  value={selectedSubClientId}
                  onChange={(e) => setSelectedSubClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={!selectedClientId}
                >
                  <option value="">Select sub-client...</option>
                  {subClients.map((subClient) => (
                    <option key={subClient.id} value={subClient.id}>
                      {subClient.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Input
              label="Attendees (Optional)"
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              helperText="Comma-separated email addresses"
            />
            
            <Button
              type="submit"
              className="w-full"
              isLoading={isCreating}
              leftIcon={<Brain className="h-5 w-5" />}
            >
              {isAuthenticated ? 'Start AI Recording' : 'Start Debug Recording'}
            </Button>
          </form>
        </div>

        {/* Active Recordings */}
        {activeRecordings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Recordings
            </h3>
            
            <div className="space-y-3">
              {activeRecordings.map((recording) => (
                <motion.div
                  key={recording.meeting_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${getStatusColor(recording.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(recording.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {recording.meeting_title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getStatusText(recording.status)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {recording.processed && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FileText className="h-4 w-4" />}
                          onClick={() => {
                            // Navigate to meeting results
                            window.location.href = `/meetings/${recording.meeting_id}`;
                          }}
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Started: {new Date(recording.started_at).toLocaleString()}
                    {recording.processed_at && (
                      <span className="ml-4">
                        Processed: {new Date(recording.processed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IntelligentMeetingRecorder;
