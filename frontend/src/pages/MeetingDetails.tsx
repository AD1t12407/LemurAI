import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { meetingIntelligenceService } from '../services/meetingIntelligence';
import { realMeetingsService, RealMeeting } from '../services/realMeetings';
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
  Zap,
  Edit
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
  const [activeTab, setActiveTab] = useState<'brief' | 'transcript' | 'ai-tools' | 'preparation'>('brief');
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isActionItemModalOpen, setIsActionItemModalOpen] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState<any>(null);
  const [fromCalendar, setFromCalendar] = useState(false);
  const [calendarMeeting, setCalendarMeeting] = useState<any>(null);
  const [realMeetingData, setRealMeetingData] = useState<any>(null);
  const [isLoadingMeetingData, setIsLoadingMeetingData] = useState(false);
  const [realMeeting, setRealMeeting] = useState<RealMeeting | null>(null);
  const [isLoadingRealMeeting, setIsLoadingRealMeeting] = useState(false);

  const meeting = id ? getMeeting(id) : undefined;
  const meetingActionItems = id ? getActionItemsByMeeting(id) : [];

  // Load real meeting intelligence data
  const loadRealMeetingData = async (meetingId: string) => {
    setIsLoadingMeetingData(true);
    try {
      console.log('🔍 Loading real meeting data for:', meetingId);
      const results = await meetingIntelligenceService.getMeetingResults(meetingId);
      console.log('📊 Real meeting results:', results);
      setRealMeetingData(results);

      // If no intelligence data found, create fallback data for UUID-style IDs
      if (!results && meetingId.includes('-') && meetingId.length > 20) {
        console.log('🔍 No intelligence data found, creating fallback for UUID:', meetingId);
        const fallbackIntelligence = {
          meeting_id: meetingId,
          transcript: 'Meeting transcript is being processed...',
          video_url: null,
          action_items: [
            'Review meeting recording when available',
            'Follow up on discussed topics'
          ],
          summary: 'This meeting is being processed. Intelligence data will be available shortly.',
          key_points: [
            'Meeting intelligence is being generated',
            'Check back later for full details'
          ],
          participants: ['You'],
          duration: '60 minutes',
          meeting_date: new Date().toISOString()
        };
        setRealMeetingData(fallbackIntelligence);
      }
    } catch (error) {
      console.error('❌ Error loading real meeting data:', error);
      setRealMeetingData(null);
    } finally {
      setIsLoadingMeetingData(false);
    }
  };

  // Load real meeting from our service
  const loadRealMeeting = async (meetingId: string) => {
    setIsLoadingRealMeeting(true);
    try {
      console.log('🔍 Loading real meeting for ID:', meetingId);
      const realMeetingData = await realMeetingsService.getMeetingById(meetingId);
      console.log('📊 Found real meeting:', realMeetingData);
      setRealMeeting(realMeetingData);

      // If no real meeting found, create a fallback meeting for UUID-style IDs
      if (!realMeetingData && meetingId.includes('-') && meetingId.length > 20) {
        console.log('🔍 No real meeting found, creating fallback for UUID:', meetingId);
        const fallbackMeeting = {
          id: meetingId,
          title: 'Meeting Details',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          attendees: [
            { id: '1', name: 'You', email: 'user@example.com' }
          ],
          status: 'completed',
          summary: 'Meeting details will be loaded from the intelligence system.',
          hasVideo: true,
          hasAIContent: true,
          actionItems: []
        };
        setRealMeeting(fallbackMeeting as any);
      }
    } catch (error) {
      console.error('❌ Error loading real meeting:', error);
      setRealMeeting(null);
    } finally {
      setIsLoadingRealMeeting(false);
    }
  };

  useEffect(() => {
    console.log('🔍 MeetingDetails useEffect - ID:', id);

    initializeData();

    if (id) {
      console.log('🔍 Loading meeting data for ID:', id);

      // Try to load real meeting first (for synthetic IDs like "2024-06-05-1")
      loadRealMeeting(id);

      // Try to load real meeting intelligence data if ID looks like a UUID
      if (id.includes('-') && id.length > 20) {
        console.log('🔍 ID looks like UUID, loading intelligence data');
        loadRealMeetingData(id);
      }
    }

    // Check if we came from calendar with a meeting context
    const meetingContext = sessionStorage.getItem('meetingContext');
    if (meetingContext) {
      try {
        const context = JSON.parse(meetingContext);
        if (context.fromCalendar && context.meeting) {
          setFromCalendar(true);
          setCalendarMeeting(context.meeting);
          // Clear the context so it doesn't persist
          sessionStorage.removeItem('meetingContext');
        }
      } catch (error) {
        console.error('Error parsing meeting context:', error);
      }
    }

    if (meeting) {
      document.title = `${meeting.title} | Lemur AI`;
    } else if (calendarMeeting) {
      document.title = `${calendarMeeting.title} | Lemur AI`;
    } else if (realMeeting) {
      document.title = `${realMeeting.title} | Lemur AI`;
    }
  }, [meeting, calendarMeeting, realMeeting, initializeData, id]);

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



  // Use real meeting first, then calendar meeting, then regular meeting
  const displayMeeting = realMeeting || meeting || calendarMeeting;

  // Show loading state while we're loading real meetings
  if (isLoadingRealMeeting && !displayMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading meeting...</h1>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to={fromCalendar ? "/calendar" : "/dashboard"} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting not found</h1>
          </div>
        </div>
      </div>
    );
  }

  // Handle different meeting formats (calendar vs stored meetings)
  const title = displayMeeting.title;
  const date = displayMeeting.date || (displayMeeting.startTime ? displayMeeting.startTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const startTime = displayMeeting.startTime || new Date();
  const endTime = displayMeeting.endTime || new Date();
  const attendees = displayMeeting.attendees || [];
  const status = displayMeeting.status || (startTime > new Date() ? 'scheduled' : startTime.toDateString() === new Date().toDateString() ? 'in_progress' : 'completed');
  const summary = displayMeeting.summary || (displayMeeting as any).description || '';
  const meetingLink = (displayMeeting as any).meetingLink || '';

  // Determine if this is an upcoming meeting from calendar
  const isUpcomingMeeting = fromCalendar && startTime > new Date();

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

  const tabs = isUpcomingMeeting && fromCalendar ? [
    { id: 'preparation', label: 'Meeting Preparation', icon: FileText },
    { id: 'brief', label: 'Brief', icon: FileText },
    { id: 'ai-tools', label: 'AI Business Tools', icon: Bot },
  ] : [
    { id: 'brief', label: 'Brief', icon: FileText },
    { id: 'transcript', label: 'Transcript', icon: PlayCircle },
    { id: 'ai-tools', label: 'AI Business Tools', icon: Bot },
  ];

  // Set default tab based on meeting type
  useEffect(() => {
    if (isUpcomingMeeting && fromCalendar && activeTab === 'brief') {
      setActiveTab('preparation' as any);
    }
  }, [isUpcomingMeeting, fromCalendar, activeTab]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
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
                onClick={() => meeting && exportMeeting(meeting)}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share className="h-4 w-4" />}
                onClick={() => meeting && shareMeeting(meeting)}
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
                    : isUpcomingMeeting && fromCalendar
                      ? 'Prepare for your upcoming meeting'
                      : 'This meeting is scheduled for Lemur AI to join'
                }
              </p>
            </div>
          </div>

          {/* Calendar Navigation Message */}
          {fromCalendar && isUpcomingMeeting && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 You can return to the calendar once you're done preparing for this meeting
              </p>
            </div>
          )}

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
            {activeTab === 'preparation' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                    Meeting Preparation
                  </h2>
                  <p className="text-dark-600 dark:text-dark-400">
                    Get ready for your upcoming meeting with AI-powered insights and preparation tools
                  </p>
                </div>

                {/* Meeting Overview */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Meeting Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meeting Title</p>
                      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">{duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendees</p>
                      <p className="font-medium text-gray-900 dark:text-white">{attendees.length} participants</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Until Meeting</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.ceil((startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Things to Talk About */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Things to Talk About in the Meeting
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit Notes
                    </Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <textarea
                      className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-gray-700 dark:text-gray-300"
                      placeholder="Add your meeting agenda and talking points here..."
                      defaultValue="• Discuss project timeline and milestones&#10;• Review technical requirements&#10;• Address any concerns or questions&#10;• Plan next steps"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm">Save Notes</Button>
                  </div>
                </div>

                {/* AI Preparation Suggestions */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Preparation Suggestions
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-purple-800 dark:text-purple-200 text-sm">
                        💡 <strong>Suggestion:</strong> Review the client's previous project history and any outstanding action items from past meetings.
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        📋 <strong>Preparation Tip:</strong> Prepare specific questions about project scope, timeline, and budget to maximize meeting efficiency.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        🎯 <strong>Focus Area:</strong> Come prepared with concrete examples and case studies relevant to the client's industry.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2"
                    leftIcon={<Users className="h-5 w-5" />}
                  >
                    <span className="font-medium">Review Attendees</span>
                    <span className="text-xs text-gray-500">Check participant profiles</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2"
                    leftIcon={<FileText className="h-5 w-5" />}
                  >
                    <span className="font-medium">Client History</span>
                    <span className="text-xs text-gray-500">Past interactions & projects</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-2"
                    leftIcon={<Clock className="h-5 w-5" />}
                  >
                    <span className="font-medium">Set Reminders</span>
                    <span className="text-xs text-gray-500">Pre-meeting notifications</span>
                  </Button>
                </div>

                {/* Return to Calendar */}
                <div className="text-center pt-4">
                  <Link
                    to="/calendar"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Return to Calendar
                  </Link>
                </div>
              </motion.div>
            )}

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
                  {attendees.map((attendee: any, index: number) => {
                    // Handle both string and object attendees
                    const attendeeData = typeof attendee === 'string'
                      ? { id: index.toString(), name: attendee.split('@')[0], email: attendee, role: undefined }
                      : attendee;

                    return (
                      <div
                        key={attendeeData.id || index}
                        className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lemur-100 text-lemur-700 dark:bg-lemur-900 dark:text-lemur-300">
                            {attendeeData.name ? attendeeData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{attendeeData.name || attendeeData.email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{attendeeData.email}</p>
                            {attendeeData.role && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">{attendeeData.role}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      onClick={() => meeting && downloadTranscript(meeting)}
                    >
                      Download
                    </Button>
                  </div>
                </div>

                {/* Video Player */}
                <div className="mt-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Recording</h3>
                    {realMeetingData?.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="h-4 w-4" />}
                        onClick={() => window.open(realMeetingData.video_url, '_blank')}
                      >
                        Download Video
                      </Button>
                    )}
                    {isLoadingMeetingData && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Loading video...
                      </div>
                    )}
                  </div>

                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {realMeetingData?.video_url ? (
                      <video
                        className="w-full h-full object-cover"
                        controls
                        poster="/api/placeholder/800/450"
                      >
                        <source src={realMeetingData.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : isLoadingMeetingData ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-gray-500 dark:text-gray-400">Loading meeting recording...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">
                            {realMeetingData ? 'No recording available for this meeting' : 'Meeting recording will appear here'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Real Meeting Info */}
                  {realMeetingData && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <CheckCircle className="h-4 w-4" />
                        <span>Real meeting data loaded from AI processing system</span>
                      </div>
                      {realMeetingData.audio_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          leftIcon={<Download className="h-4 w-4" />}
                          onClick={() => window.open(realMeetingData.audio_url, '_blank')}
                        >
                          Download Audio
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Transcript */}
                <div className="mt-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
                    {realMeetingData?.transcript && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Copy className="h-4 w-4" />}
                        onClick={() => copyToClipboard(realMeetingData.transcript, 'Meeting transcript')}
                      >
                        Copy Transcript
                      </Button>
                    )}
                  </div>

                  {isLoadingMeetingData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading transcript...</p>
                      </div>
                    </div>
                  ) : realMeetingData?.transcript ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm">
                        {realMeetingData.transcript}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm">
                        {mockTranscript}
                      </pre>
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          📝 This is a demo transcript. Real meeting transcripts will appear here when available.
                        </p>
                      </div>
                    </div>
                  )}
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
                      {realMeetingData?.summary || summary || 'No summary available for this meeting.'}
                    </p>
                    {realMeetingData?.summary && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-800 dark:text-green-200">
                          ✨ AI-generated summary from meeting intelligence
                        </p>
                      </div>
                    )}
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
                    {/* Real AI-generated action items */}
                    {realMeetingData?.action_items && realMeetingData.action_items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            AI-Generated Action Items
                          </span>
                        </div>
                        {realMeetingData.action_items.map((item: string, index: number) => (
                          <div key={`ai-${index}`} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-2">
                            <p className="text-gray-700 dark:text-gray-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* User-created action items */}
                    {meetingActionItems && meetingActionItems.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Manual Action Items
                          </span>
                        </div>
                        {meetingActionItems.map((item) => (
                          <ActionItemCard
                            key={item.id}
                            item={item}
                            onClick={() => handleEditActionItem(item)}
                          />
                        ))}
                      </div>
                    ) : !realMeetingData?.action_items?.length ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No action items yet. Click "Add Action Item" to create one.</p>
                      </div>
                    ) : null}
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
                {meeting && (
                  <AINotesPanel
                    meetingId={meeting.id}
                    isRecording={status === 'in_progress'}
                  />
                )}

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
      {meeting && (
        <ProposalGenerator
          isOpen={isProposalOpen}
          onClose={() => setIsProposalOpen(false)}
          meetingId={meeting.id}
        />
      )}

      {meeting && (
        <FollowUpGenerator
          isOpen={isFollowUpOpen}
          onClose={() => setIsFollowUpOpen(false)}
          meetingId={meeting.id}
          attendees={attendees.map((a: any) => ({
            name: typeof a === 'string' ? a.split('@')[0] : a.name,
            email: typeof a === 'string' ? a : a.email
          }))}
        />
      )}

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