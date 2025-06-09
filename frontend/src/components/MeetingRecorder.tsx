import React, { useState, useEffect } from 'react';
import { Video, Download, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { MeetingRecordingService, RecordingBot } from '../services/meetingRecording';
import { cn } from '../utils/cn';

interface MeetingRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  meetingUrl?: string;
  onRecordingCreated?: (bot: RecordingBot) => void;
}

export const MeetingRecorder: React.FC<MeetingRecorderProps> = ({
  isOpen,
  onClose,
  meetingUrl: initialMeetingUrl = '',
  onRecordingCreated,
}) => {
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl);
  const [botName, setBotName] = useState('Lemur AI Bot');
  const [apiKey, setApiKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeBots, setActiveBots] = useState<RecordingBot[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMeetingUrl(initialMeetingUrl);
      loadActiveBots();
    }
  }, [isOpen, initialMeetingUrl]);

  const loadActiveBots = () => {
    const bots = MeetingRecordingService.getAllBots();
    setActiveBots(bots);
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingUrl || !apiKey) {
      return;
    }

    setIsCreating(true);
    
    try {
      const bot = await MeetingRecordingService.createRecordingBot(
        meetingUrl,
        botName,
        apiKey
      );
      
      setActiveBots(prev => [...prev, bot]);
      onRecordingCreated?.(bot);
      
      // Reset form
      setMeetingUrl('');
      setBotName('Lemur AI Bot');
      setApiKey('');
      
    } catch (error) {
      console.error('Failed to create recording bot:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveBot = async (botId: string) => {
    try {
      await MeetingRecordingService.removeBot(botId);
      setActiveBots(prev => prev.filter(bot => bot.id !== botId));
    } catch (error) {
      console.error('Failed to remove bot:', error);
    }
  };

  const getStatusIcon = (status: RecordingBot['status']) => {
    switch (status) {
      case 'joining':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case 'recording':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fatal':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: RecordingBot['status']) => {
    switch (status) {
      case 'joining':
        return 'Joining meeting...';
      case 'recording':
        return 'Recording in progress';
      case 'done':
        return 'Recording complete';
      case 'fatal':
        return 'Recording failed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meeting Recorder">
      <div className="space-y-6">
        {/* Create New Recording */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Recording
          </h3>
          
          <form onSubmit={handleCreateBot} className="space-y-4">
            <Input
              label="Meeting URL"
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              required
            />
            
            <Input
              label="Bot Name"
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Lemur AI Bot"
              required
            />
            
            <Input
              label="Recall API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Recall AI API key"
              required
            />
            
            <Button
              type="submit"
              className="w-full"
              isLoading={isCreating}
              leftIcon={<Video className="h-5 w-5" />}
            >
              Start Recording
            </Button>
          </form>
        </div>

        {/* Active Recordings */}
        {activeBots.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Recordings
            </h3>
            
            <div className="space-y-3">
              {activeBots.map((bot) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(bot.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bot.botName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getStatusText(bot.status)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {bot.status === 'done' && (bot.videoUrl || bot.transcriptUrl) && (
                        <div className="flex space-x-1">
                          {bot.videoUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(bot.videoUrl, '_blank')}
                              leftIcon={<Download className="h-4 w-4" />}
                            >
                              Video
                            </Button>
                          )}
                          {bot.transcriptUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(bot.transcriptUrl, '_blank')}
                              leftIcon={<Download className="h-4 w-4" />}
                            >
                              Transcript
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveBot(bot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Created: {bot.createdAt.toLocaleString()}
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

export default MeetingRecorder;
