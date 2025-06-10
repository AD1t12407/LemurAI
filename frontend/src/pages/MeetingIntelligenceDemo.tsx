import React, { useState, useEffect } from 'react';
import { Brain, Video, FileText, Mail, CheckCircle, Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { meetingIntelligenceService, MeetingRecording, MeetingResults } from '../services/meetingIntelligence';
import { MeetingResultsViewer } from '../components/MeetingResultsViewer';

export const MeetingIntelligenceDemo: React.FC = () => {
  const [activeRecordings, setActiveRecordings] = useState<MeetingRecording[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedMeetingTitle, setSelectedMeetingTitle] = useState<string>('');
  const [meetingResults, setMeetingResults] = useState<MeetingResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsViewerOpen, setIsResultsViewerOpen] = useState(false);
  const [manualMeetingId, setManualMeetingId] = useState('');

  useEffect(() => {
    document.title = 'Meeting Intelligence Demo | Lemur AI';
    loadActiveRecordings();
  }, []);

  const loadActiveRecordings = async () => {
    try {
      const recordings = await meetingIntelligenceService.listActiveMeetings();
      setActiveRecordings(recordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };

  const loadMeetingResults = async (meetingId: string) => {
    setIsLoading(true);
    try {
      const results = await meetingIntelligenceService.getMeetingResults(meetingId);
      setMeetingResults(results);
      setSelectedMeeting(meetingId);
    } catch (error) {
      console.error('Error loading meeting results:', error);
      setMeetingResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const startDemoRecording = async () => {
    try {
      console.log('🧪 Using debug method for demo recording');
      const result = await meetingIntelligenceService.debugStartMeetingRecording({
        meeting_url: 'https://meet.google.com/demo-meeting-url',
        meeting_title: 'Demo: AI Meeting Intelligence',
        client_id: '660f3f3b-39c2-49b2-a979-c9ed00cdc78a',
        attendees: ['demo@example.com', 'ai@lemur.com']
      });

      if (result.success) {
        const mockRecording: MeetingRecording = {
          meeting_id: result.meeting_id,
          bot_id: result.bot_id,
          status: 'recording',
          meeting_title: 'Demo: AI Meeting Intelligence',
          client_id: 'demo-client-1',
          processed: false,
          started_at: new Date().toISOString()
        };
        setActiveRecordings(prev => [...prev, mockRecording]);
        alert(`✅ Demo recording started!\nMeeting ID: ${result.meeting_id}`);
      } else {
        alert(`❌ Demo recording failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error starting demo recording:', error);
      alert(`❌ Demo recording failed: ${(error as Error).message}`);
    }
  };

  const startDebugRecording = async () => {
    try {
      const result = await meetingIntelligenceService.debugStartMeetingRecording({
        meeting_url: 'https://meet.google.com/debug-meeting-url',
        meeting_title: 'Debug: No Auth Test',
        client_id: '660f3f3b-39c2-49b2-a979-c9ed00cdc78a',
        attendees: ['debug@example.com']
      });

      console.log('🧪 Debug recording result:', result);

      if (result.success) {
        const mockRecording: MeetingRecording = {
          meeting_id: result.meeting_id,
          bot_id: result.bot_id,
          status: 'recording',
          meeting_title: 'Debug: No Auth Test',
          client_id: 'debug-client',
          processed: false,
          started_at: new Date().toISOString()
        };
        setActiveRecordings(prev => [...prev, mockRecording]);
        alert(`✅ Debug recording started successfully!\n\nMeeting ID: ${result.meeting_id}\nBot ID: ${result.bot_id}\n\nWatch your backend logs for processing updates.`);
      } else {
        alert(`❌ Debug recording failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting debug recording:', error);
      alert(`❌ Debug recording failed: ${(error as Error).message}`);
    }
  };

  const handleDebugTest = async () => {
    try {
      const results = await meetingIntelligenceService.debugGetMeetingResults('c260bdc7-5ac1-458d-9bfc-0b5a44b085e0');
      console.log('🧪 Direct debug results:', results);
      alert(`Debug Results:\n\nSummary: ${results.summary ? 'Available' : 'Not available'}\nAction Items: ${results.action_items ? 'Available' : 'Not available'}\nEmail: ${results.follow_up_email ? 'Available' : 'Not available'}\n\nCheck console for full details.`);
    } catch (error) {
      console.error('Debug test failed:', error);
      alert(`Debug test failed: ${(error as Error).message}`);
    }
  };

  const handleViewManualMeeting = () => {
    if (manualMeetingId.trim()) {
      setSelectedMeeting(manualMeetingId.trim());
      setSelectedMeetingTitle(`Meeting ${manualMeetingId.slice(0, 8)}...`);
      setIsResultsViewerOpen(true);
    }
  };

  const handleViewQuickMeeting = () => {
    setSelectedMeeting('c260bdc7-5ac1-458d-9bfc-0b5a44b085e0');
    setSelectedMeetingTitle('Test Meeting (From Logs)');
    setIsResultsViewerOpen(true);
  };

  const getStatusIcon = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'recording':
        return <Video className="h-5 w-5 text-red-500 animate-pulse" />;
      case 'processing':
        return <Brain className="h-5 w-5 animate-pulse text-purple-500" />;
      case 'done':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'recording':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'processing':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      case 'done':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const features = [
    {
      icon: Video,
      title: 'Auto Join & Record',
      description: 'Bot automatically joins meetings and records everything',
      color: 'text-red-500'
    },
    {
      icon: FileText,
      title: 'AI Transcription',
      description: 'High-quality transcription with speaker identification',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'Contextual AI',
      description: 'Uses client knowledge base for intelligent content generation',
      color: 'text-purple-500'
    },
    {
      icon: Mail,
      title: 'Auto Follow-up',
      description: 'Generates summaries, action items, and follow-up emails',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="opacity-0 translate-y-5 animate-fadeInUp">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-12 w-12 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Meeting Intelligence Demo
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience end-to-end AI-powered meeting processing: Bot joins → Records → Transcribes → 
              Generates summaries, action items, and follow-up emails using client context
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transform transition-transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className={`h-8 w-8 ${feature.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Demo Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Try the Demo
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={startDemoRecording}
                leftIcon={<Brain className="h-5 w-5" />}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                Start Demo Recording
              </Button>

              <Button
                onClick={startDebugRecording}
                leftIcon={<Video className="h-5 w-5" />}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Debug (No Auth)
              </Button>

              <Button
                variant="outline"
                onClick={loadActiveRecordings}
                leftIcon={<Clock className="h-5 w-5" />}
              >
                Refresh Status
              </Button>
            </div>

            {/* Manual Meeting ID Input */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                View Results by Meeting ID
              </h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualMeetingId}
                  onChange={(e) => setManualMeetingId(e.target.value)}
                  placeholder="Enter meeting ID (e.g., c260bdc7-5ac1-458d-9bfc-0b5a44b085e0)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <Button
                  onClick={handleViewManualMeeting}
                  disabled={!manualMeetingId.trim()}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  View Results
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter the meeting ID from your backend logs to view AI-generated results
              </p>

              {/* Quick Access to Recent Meeting */}
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Quick Access:</strong> Your recent meeting from logs
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono">
                    c260bdc7-5ac1-458d-9bfc-0b5a44b085e0
                  </code>
                  <Button
                    size="sm"
                    onClick={handleViewQuickMeeting}
                    leftIcon={<ArrowRight className="h-3 w-3" />}
                  >
                    View This Meeting
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDebugTest}
                    leftIcon={<Brain className="h-3 w-3" />}
                  >
                    Debug Test
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Recordings */}
          {activeRecordings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Active Recordings
              </h2>
              
              <div className="space-y-4">
                {activeRecordings.map((recording) => (
                  <div
                    key={recording.meeting_id}
                    className={`p-4 rounded-lg border ${getStatusColor(recording.status)} transform transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(recording.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {recording.meeting_title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Status: {recording.status} • Started: {new Date(recording.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMeeting(recording.meeting_id);
                            setSelectedMeetingTitle(recording.meeting_title);
                            setIsResultsViewerOpen(true);
                          }}
                          leftIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          View Results
                        </Button>

                        {recording.processed && (
                          <Button
                            size="sm"
                            onClick={() => loadMeetingResults(recording.meeting_id)}
                            leftIcon={<ArrowRight className="h-4 w-4" />}
                          >
                            Load AI Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Results */}
          {selectedMeeting && meetingResults && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                AI-Generated Results
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Summary */}
                {meetingResults.summary && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Meeting Summary
                      </h3>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {meetingResults.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {meetingResults.action_items && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Action Items
                      </h3>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {meetingResults.action_items}
                      </p>
                    </div>
                  </div>
                )}

                {/* Follow-up Email */}
                {meetingResults.follow_up_email && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Follow-up Email
                      </h3>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {meetingResults.follow_up_email}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Links */}
              {(meetingResults.video_url || meetingResults.audio_url) && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Meeting Media
                  </h3>
                  <div className="flex gap-4">
                    {meetingResults.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Video className="h-4 w-4" />}
                        onClick={() => window.open(meetingResults.video_url, '_blank')}
                      >
                        Download Video
                      </Button>
                    )}
                    {meetingResults.audio_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<FileText className="h-4 w-4" />}
                        onClick={() => window.open(meetingResults.audio_url, '_blank')}
                      >
                        Download Audio
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading AI results...</p>
            </div>
          )}
        </div>
      </main>

      {/* Meeting Results Viewer */}
      {selectedMeeting && (
        <MeetingResultsViewer
          isOpen={isResultsViewerOpen}
          onClose={() => {
            setIsResultsViewerOpen(false);
            setSelectedMeeting(null);
            setSelectedMeetingTitle('');
          }}
          meetingId={selectedMeeting}
          meetingTitle={selectedMeetingTitle}
        />
      )}
    </div>
  );
};