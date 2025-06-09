import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Calendar,
  ChevronLeft,
  PlayCircle,
  FileText,
  CheckCircle,
  Brain,
  Sparkles,
  Copy,
  Download,
  Mail,
  Share,
  Bot,
  DollarSign,
  Database,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { ActionItemCard } from '../components/ActionItemCard';
import { ActionItemEditModal } from '../components/ActionItemEditModal';
import { AINotesPanel } from '../components/AINotesPanel';
import { ProposalGenerator } from '../components/ProposalGenerator';
import { CRMSync } from '../components/CRMSync';
import { FollowUpGenerator } from '../components/FollowUpGenerator';
import { PricingAssistant } from '../components/PricingAssistant';
import { formatDate, formatTime, getMeetingDuration } from '../utils/date-utils';
import {
  sendFollowUp,
  exportMeeting,
  shareMeeting,
  copyToClipboard,
  downloadTranscript
} from '../utils/button-actions';

export const MeetingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMeeting, getActionItemsByMeeting, addActionItem, updateActionItem, deleteActionItem, initializeData } = useDataStore();
  const [activeTab, setActiveTab] = useState<'brief' | 'transcript' | 'ai-tools'>('brief');
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isActionItemModalOpen, setIsActionItemModalOpen] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState<any>(null);

  const meeting = id ? getMeeting(id) : undefined;
  const meetingActionItems = id ? getActionItemsByMeeting(id) : [];

  useEffect(() => {
    initializeData();
    if (meeting) {
      document.title = `${meeting.title} | Lemur AI`;
    }
  }, [meeting, initializeData]);

  // Action item handlers
  const handleAddActionItem = () => {
    setEditingActionItem(null);
    setIsActionItemModalOpen(true);
  };

  const handleEditActionItem = (actionItem: any) => {
    setEditingActionItem(actionItem);
    setIsActionItemModalOpen(true);
  };

  const handleSaveActionItem = (actionItemData: any) => {
    if (editingActionItem) {
      // Update existing action item
      updateActionItem(editingActionItem.id, actionItemData);
    } else {
      // Create new action item
      const newActionItem = {
        ...actionItemData,
        id: Date.now().toString(),
        meetingId: meeting?.id || '',
      };
      addActionItem(newActionItem);
    }
    setIsActionItemModalOpen(false);
    setEditingActionItem(null);
  };

  const handleDeleteActionItem = (actionItemId: string) => {
    deleteActionItem(actionItemId);
    setIsActionItemModalOpen(false);
    setEditingActionItem(null);
  };



  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/dashboard\" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const { title, date, startTime, endTime, attendees, status, summary, actionItems, platform } = meeting;

  const formattedDate = formatDate(date);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);
  const duration = getMeetingDuration(startTime, endTime);

  // Mock transcript for demo purposes
  const mockTranscript = `
[00:00:05] John: Hi everyone, thanks for joining the meeting today.
[00:00:10] Sarah: Good to be here. I'm excited to discuss the project.
[00:00:18] John: Let's start with the bot integration. Rishav, can you give us an update?
[00:00:25] Rishav: Sure. I've been working on the bot creation and management via HTTP requests.
[00:00:40] Rishav: We need to decide between webhook and WebSocket for real-time updates.
[00:01:05] Sarah: What are the tradeoffs?
[00:01:12] Rishav: WebSockets maintain persistent connections, so they're better for frequent updates.
[00:01:30] Rishav: Webhooks are simpler to implement but work best for less frequent events.
[00:01:45] John: Given our use case, I think WebSockets make more sense.
[00:02:00] Sarah: I agree. Let's go with WebSockets for now.
[00:02:10] John: Great, let's move on to privacy concerns...
  `;

  // Mock insights for demo purposes
  const mockInsights = [
    {
      id: 'i1',
      type: 'client_need',
      content: 'Client needs real-time updates for their bot integration',
      confidence: 0.92,
    },
    {
      id: 'i2',
      type: 'project_scope',
      content: 'WebSocket implementation will be required for the project',
      confidence: 0.89,
    },
    {
      id: 'i3',
      type: 'risk',
      content: 'Team should address client privacy concerns before proceeding',
      confidence: 0.78,
    },
    {
      id: 'i4',
      type: 'opportunity',
      content: 'Frontend development can begin once backend work is completed',
      confidence: 0.85,
    },
  ];

  const tabs = [
    { id: 'brief', label: 'Brief', icon: FileText },
    { id: 'transcript', label: 'Transcript', icon: PlayCircle },
    { id: 'ai-tools', label: 'AI Business Tools', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      <style jsx>{`
        .bg-primary {
          background: var(--bg-primary);
        }
        .dark .bg-primary {
          background: radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                      var(--bg-primary);
        }
      `}</style>
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50 transition-colors duration-200 hover-scale">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50 md:text-3xl">
              {title}
            </h1>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-dark-600 dark:text-dark-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-5 w-5" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              <span>
                {formattedStartTime} - {formattedEndTime} ({duration} min)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-5 w-5" />
              <span>{attendees.length} attendees</span>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Mail className="h-4 w-4" />}
                onClick={() => setIsFollowUpOpen(true)}
              >
                AI Follow-up
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={() => setIsProposalOpen(true)}
              >
                Generate Proposal
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => exportMeeting(meeting)}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share className="h-4 w-4" />}
                onClick={() => shareMeeting(meeting)}
              >
                Share
              </Button>
            </div>
          </div>

          {/* Meeting status banner */}
          <div className={`
            mt-6 rounded-lg p-4
            ${status === 'completed'
              ? 'bg-success-50 dark:bg-success-900'
              : status === 'in_progress'
                ? 'bg-lemur-100 dark:bg-lemur-900'
                : 'bg-azure-100 dark:bg-azure-900'
            }
          `}>
            <div className="flex items-center">
              <Sparkles className={`
                h-5 w-5 mr-2
                ${status === 'completed'
                  ? 'text-success-600 dark:text-success-400'
                  : status === 'in_progress'
                    ? 'text-lemur-600 dark:text-lemur-400'
                    : 'text-azure-600 dark:text-azure-400'
                }
              `} />
              <p className={`
                text-sm font-medium
                ${status === 'completed'
                  ? 'text-success-700 dark:text-success-300'
                  : status === 'in_progress'
                    ? 'text-lemur-700 dark:text-lemur-300'
                    : 'text-azure-700 dark:text-azure-300'
                }
              `}>
                {status === 'completed'
                  ? 'This meeting has been processed by Lemur AI'
                  : status === 'in_progress'
                    ? 'Lemur AI is currently listening to this meeting'
                    : 'This meeting is scheduled for Lemur AI to join'
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`
                      flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium
                      ${activeTab === tab.id
                        ? 'border-lemur-500 text-lemur-600 dark:border-lemur-400 dark:text-lemur-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'}
                    `}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <TabIcon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-8">
            {activeTab === 'brief' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="prose max-w-none dark:prose-invert"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Brief</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => copyToClipboard(summary || 'No brief available', 'Meeting brief')}
                  >
                    Copy
                  </Button>
                </div>

                <div className="mt-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">
                    {summary || 'No brief available for this meeting.'}
                  </p>
                </div>

                <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Key Participants</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lemur-100 text-lemur-700 dark:bg-lemur-900 dark:text-lemur-300">
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{attendee.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{attendee.email}</p>
                          {attendee.role && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">{attendee.role}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'transcript' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Recording & Transcript</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Copy className="h-4 w-4" />}
                      onClick={() => copyToClipboard(mockTranscript, 'Meeting transcript')}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Download className="h-4 w-4" />}
                      onClick={() => downloadTranscript(meeting)}
                    >
                      Download
                    </Button>
                  </div>
                </div>

                {/* Video Player */}
                <div className="mt-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meeting Recording</h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      poster="/api/placeholder/800/450"
                    >
                      <source src="/api/placeholder/video/meeting-recording.mp4" type="video/mp4" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">Meeting recording will appear here</p>
                        </div>
                      </div>
                    </video>
                  </div>
                </div>

                {/* Transcript */}
                <div className="mt-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transcript</h3>
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                    {mockTranscript}
                  </pre>
                </div>
              </motion.div>
            )}



            {activeTab === 'ai-tools' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                    AI Business Tools
                  </h2>
                  <p className="text-dark-600 dark:text-dark-400">
                    Leverage AI to streamline your business processes from meeting to proposal
                  </p>
                </div>

                {/* Meeting Summary Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Meeting Summary
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Copy className="h-4 w-4" />}
                      onClick={() => copyToClipboard(summary || 'No summary available', 'Meeting summary')}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {summary || 'No summary available for this meeting.'}
                    </p>
                  </div>
                </div>

                {/* Action Items Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Action Items
                    </h3>
                    <Button
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      size="sm"
                      onClick={handleAddActionItem}
                    >
                      Add Action Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {meetingActionItems && meetingActionItems.length > 0 ? (
                      meetingActionItems.map((item) => (
                        <ActionItemCard
                          key={item.id}
                          item={item}
                          onClick={() => handleEditActionItem(item)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No action items yet. Click "Add Action Item" to create one.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Lemur AI Insights
                      <span className="inline-flex items-center rounded-full bg-lemur-100 px-2.5 py-0.5 text-xs font-medium text-lemur-800 dark:bg-lemur-900 dark:text-lemur-300">
                        Powered by AI
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {mockInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-flex items-center rounded-full bg-lemur-100 px-2.5 py-0.5 text-xs font-medium text-lemur-800 dark:bg-lemur-900 dark:text-lemur-300">
                              {insight.type.replace('_', ' ')}
                            </span>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{insight.content}</p>
                          </div>
                          <div className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Chatbot Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Bot className="h-5 w-5 text-indigo-600" />
                      AI Meeting Assistant
                    </h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-80 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-xs shadow-sm">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Hi! I can help you analyze this meeting. Ask me about action items, insights, or next steps.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-xs shadow-sm">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            I noticed this meeting discussed WebSocket implementation. Would you like me to generate a technical scope of work?
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask about this meeting..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <Button size="sm" className="px-4">
                        <span className="sr-only">Send</span>
                        →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Scope of Work Section */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Scope of Work Generator
                    </h3>
                    <Button
                      leftIcon={<Sparkles className="h-4 w-4" />}
                      size="sm"
                    >
                      Generate SOW
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Project Scope</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• WebSocket integration implementation</li>
                          <li>• Real-time data synchronization</li>
                          <li>• Privacy and security compliance</li>
                          <li>• Frontend development coordination</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Deliverables</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Technical documentation</li>
                          <li>• Implementation timeline</li>
                          <li>• Testing protocols</li>
                          <li>• Training materials</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>AI Recommendation:</strong> Based on the meeting discussion, this project will require
                        approximately 6-8 weeks with a team of 3 developers. Consider addressing privacy concerns
                        in the first sprint.
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Notes Panel */}
                <AINotesPanel
                  meetingId={meeting.id}
                  isRecording={status === 'in_progress'}
                />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setIsProposalOpen(true)}
                    leftIcon={<FileText className="h-6 w-6" />}
                  >
                    <span className="font-medium">Generate Proposal</span>
                    <span className="text-xs text-dark-500">AI-powered proposals</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setIsFollowUpOpen(true)}
                    leftIcon={<Mail className="h-6 w-6" />}
                  >
                    <span className="font-medium">Smart Follow-up</span>
                    <span className="text-xs text-dark-500">Personalized emails</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <ProposalGenerator
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        meetingId={meeting.id}
      />

      <FollowUpGenerator
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        meetingId={meeting.id}
        attendees={attendees.map(a => ({ name: a.name, email: a.email }))}
      />

      <ActionItemEditModal
        isOpen={isActionItemModalOpen}
        onClose={() => {
          setIsActionItemModalOpen(false);
          setEditingActionItem(null);
        }}
        actionItem={editingActionItem}
        onSave={handleSaveActionItem}
        onDelete={editingActionItem ? () => handleDeleteActionItem(editingActionItem.id) : undefined}
      />
    </div>
  );
};