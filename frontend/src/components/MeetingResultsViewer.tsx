import React, { useState, useEffect } from 'react';
import { FileText, Mail, CheckCircle, Video, Download, RefreshCw, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Modal } from './Modal';
import { meetingIntelligenceService, MeetingResults } from '../services/meetingIntelligence';

interface MeetingResultsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingTitle: string;
}

export const MeetingResultsViewer: React.FC<MeetingResultsViewerProps> = ({
  isOpen,
  onClose,
  meetingId,
  meetingTitle
}) => {
  const [results, setResults] = useState<MeetingResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && meetingId) {
      loadResults();
    }
  }, [isOpen, meetingId]);

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const meetingResults = await meetingIntelligenceService.getMeetingResults(meetingId);
      setResults(meetingResults);
    } catch (error: any) {
      console.error('Error loading meeting results:', error);
      setError(error.message || 'Failed to load meeting results');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    });
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading Meeting Results" size="lg">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading AI-generated meeting results...
          </p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Meeting Results" size="lg">
        <div className="text-center py-12">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <Button onClick={loadResults} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Try Again
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Meeting Results: ${meetingTitle}`} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                AI-Generated Content
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Meeting ID: {meetingId}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadResults}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {results ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meeting Summary */}
            {results.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Meeting Summary
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(results.summary!, 'Summary')}
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {results.summary}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Items */}
            {results.action_items && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Action Items
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(results.action_items!, 'Action Items')}
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {results.action_items}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Follow-up Email */}
            {results.follow_up_email && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Follow-up Email
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(results.follow_up_email!, 'Follow-up Email')}
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {results.follow_up_email}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                No Results Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This meeting hasn't been processed yet or the results are not available.
              </p>
              <Button onClick={loadResults} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Check Again
              </Button>
            </div>
          </div>
        )}

        {/* Media Downloads */}
        {results && (results.video_url || results.audio_url) && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Meeting Media
            </h4>
            <div className="flex gap-4">
              {results.video_url && (
                <Button
                  variant="outline"
                  leftIcon={<Video className="h-4 w-4" />}
                  onClick={() => window.open(results.video_url, '_blank')}
                >
                  Download Video
                </Button>
              )}
              {results.audio_url && (
                <Button
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => window.open(results.audio_url, '_blank')}
                >
                  Download Audio
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Debug Information
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
              <p><strong>Meeting ID:</strong> {meetingId}</p>
              <p><strong>Transcript Available:</strong> {results?.transcript_available ? 'Yes' : 'No'}</p>
              <p><strong>Results Loaded:</strong> {results ? 'Yes' : 'No'}</p>
              <p><strong>Summary:</strong> {results?.summary ? 'Available' : 'Not available'}</p>
              <p><strong>Action Items:</strong> {results?.action_items ? 'Available' : 'Not available'}</p>
              <p><strong>Follow-up Email:</strong> {results?.follow_up_email ? 'Available' : 'Not available'}</p>
            </div>
          </details>
        </div>
      </div>
    </Modal>
  );
};
