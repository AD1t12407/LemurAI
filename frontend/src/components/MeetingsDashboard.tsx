import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, ChevronRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarEventsService, CalendarEvent } from '../services/calendarEvents';
import { useAuthStore } from '../stores/authStore';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { MeetingDetailModal } from './MeetingDetailModal';

interface MeetingsDashboardProps {
  onScheduleClick?: () => void;
  onMeetingClick?: (meeting: CalendarEvent) => void;
}

interface CategorizedMeetings {
  upcoming: CalendarEvent[];
  previous: CalendarEvent[];
  today: CalendarEvent[];
}

export const MeetingsDashboard: React.FC<MeetingsDashboardProps> = ({
  onScheduleClick,
  onMeetingClick,
}) => {
  const [meetings, setMeetings] = useState<CategorizedMeetings>({
    upcoming: [],
    previous: [],
    today: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous' | 'today'>('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromCalendar, setFromCalendar] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    loadMeetings();

    // Check if we came from calendar with a meeting context
    const meetingContext = sessionStorage.getItem('meetingContext');
    if (meetingContext) {
      try {
        const context = JSON.parse(meetingContext);
        if (context.fromCalendar && context.meeting) {
          setSelectedMeeting(context.meeting);
          setFromCalendar(true);
          setIsModalOpen(true);
          // Clear the context so it doesn't persist
          sessionStorage.removeItem('meetingContext');
        }
      } catch (error) {
        console.error('Error parsing meeting context:', error);
      }
    }
  }, [user?.id]);

  const loadMeetings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading meetings for user:', user.id);
      const categorizedMeetings = await CalendarEventsService.getCategorizedMeetings(user.id);
      console.log('✅ Meetings loaded:', categorizedMeetings);
      setMeetings(categorizedMeetings);
    } catch (error) {
      console.error('❌ Failed to load meetings:', error);
      // Keep existing data on error, don't reset to empty
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const MeetingCard: React.FC<{ meeting: CalendarEvent; showDate?: boolean }> = ({
    meeting,
    showDate = true
  }) => {
    const isPast = meeting.startTime < new Date();
    const isToday = meeting.startTime.toDateString() === new Date().toDateString();
    const isUpcoming = meeting.startTime > new Date() && !isToday;

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: isPast ? 'var(--border-secondary)' : 'var(--border-primary)',
          opacity: isPast ? 0.8 : 1,
        }}
        onClick={() => {
          const isUpcoming = meeting.startTime > new Date();

          if (isUpcoming) {
            // For upcoming meetings, navigate to preparation page
            const meetingContext = {
              fromCalendar: false,
              meeting: meeting,
              returnMessage: "You can return to meetings once you're done preparing"
            };
            sessionStorage.setItem('meetingContext', JSON.stringify(meetingContext));
            window.location.href = `/meeting/upcoming/${meeting.id}`;
          } else {
            // For past/current meetings, show modal or navigate to regular details
            setSelectedMeeting(meeting);
            setFromCalendar(false);
            setIsModalOpen(true);
            onMeetingClick?.(meeting);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Meeting Title with Status */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                {meeting.title}
              </h3>
              {isPast && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Completed
                </span>
              )}
              {isToday && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  Today
                </span>
              )}
              {isUpcoming && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                  Upcoming
                </span>
              )}
            </div>

            {/* Date and Time */}
            <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {showDate && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">{formatDate(meeting.startTime)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
              </div>
            </div>

            {/* Attendees */}
            {meeting.attendees.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                <div className="flex flex-wrap gap-1">
                  {meeting.attendees.slice(0, 3).map((attendee, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {attendee.split('@')[0]}
                    </span>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      +{meeting.attendees.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Meeting Link and Platform */}
            {meeting.meetingLink && (
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Meeting
                </a>
                {(meeting as any).platform && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {(meeting as any).platform.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {(meeting as any).isRecurring && (
                <span className="flex items-center gap-1">
                  🔄 Recurring
                </span>
              )}
              {(meeting as any).willRecord !== undefined && (
                <span className="flex items-center gap-1">
                  {(meeting as any).willRecord ? '🎥 Will Record' : '📵 No Recording'}
                </span>
              )}
              {(meeting as any).recordingAvailable && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  📹 Recording Available
                </span>
              )}
            </div>

            {meeting.description && (
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                {meeting.description}
              </p>
            )}
          </div>

          <ChevronRight className="h-5 w-5 ml-3 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        </div>
      </motion.div>
    );
  };

  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: meetings.upcoming.length },
    { id: 'today' as const, label: 'Today', count: meetings.today.length },
    { id: 'previous' as const, label: 'Previous', count: meetings.previous.length },
  ];

  const currentMeetings = meetings[activeTab];

  // Calculate meeting statistics
  const totalMeetings = meetings.upcoming.length + meetings.previous.length + meetings.today.length;
  const internalMeetings = [...meetings.upcoming, ...meetings.previous, ...meetings.today]
    .filter(meeting => meeting.attendees.some(attendee => attendee.includes('@synatechsolutions.com'))).length;
  const externalMeetings = totalMeetings - internalMeetings;
  const scheduledMeetings = meetings.upcoming.length + meetings.today.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Meetings
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your calendar events and meetings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <Loader className="h-5 w-5 animate-spin" style={{ color: 'var(--text-secondary)' }} />}
          <Button
            onClick={onScheduleClick}
            leftIcon={<CalendarIcon className="h-4 w-4" />}
            size="sm"
          >
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-4 gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
        {/* Total Meetings */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Meetings</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalMeetings}</p>
          </div>
        </div>

        {/* Internal Meetings */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Internal</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{internalMeetings}</p>
          </div>
        </div>

        {/* External Meetings */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>External</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{externalMeetings}</p>
          </div>
        </div>

        {/* Scheduled Meetings */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scheduled</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{scheduledMeetings}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
              activeTab === tab.id
                ? 'shadow-sm'
                : 'hover:opacity-80'
            )}
            style={{
              background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  background: activeTab === tab.id ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
                  color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {currentMeetings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No {activeTab} meetings
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'upcoming' && "You don't have any upcoming meetings scheduled."}
              {activeTab === 'today' && "No meetings scheduled for today."}
              {activeTab === 'previous' && "No previous meetings found."}
            </p>
            {activeTab === 'upcoming' && (
              <Button
                onClick={onScheduleClick}
                className="mt-4"
                size="sm"
              >
                Schedule Your First Meeting
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                showDate={activeTab !== 'today'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={loadMeetings}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Meetings'}
        </Button>
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMeeting(null);
          setFromCalendar(false);
        }}
        fromCalendar={fromCalendar}
      />
    </div>
  );
};
