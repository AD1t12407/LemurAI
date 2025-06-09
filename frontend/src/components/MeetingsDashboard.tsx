import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, ChevronRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarEventsService, CalendarEvent } from '../services/calendarEvents';
import { useAuthStore } from '../stores/authStore';
import { Button } from './Button';
import { cn } from '../utils/cn';

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

  const { user } = useAuthStore();

  useEffect(() => {
    loadMeetings();
  }, [user?.id]);

  const loadMeetings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const categorizedMeetings = await CalendarEventsService.getCategorizedMeetings(user.id);
      setMeetings(categorizedMeetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
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
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 rounded-lg border cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
      onClick={() => onMeetingClick?.(meeting)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {meeting.title}
          </h3>
          
          <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {showDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(meeting.startTime)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </div>
            {meeting.attendees.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meeting.attendees.length}
              </div>
            )}
            {meeting.meetingLink && (
              <div className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                Meeting
              </div>
            )}
          </div>

          {meeting.description && (
            <p className="text-xs mt-2 truncate" style={{ color: 'var(--text-secondary)' }}>
              {meeting.description}
            </p>
          )}
        </div>

        <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
      </div>
    </motion.div>
  );

  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: meetings.upcoming.length },
    { id: 'today' as const, label: 'Today', count: meetings.today.length },
    { id: 'previous' as const, label: 'Previous', count: meetings.previous.length },
  ];

  const currentMeetings = meetings[activeTab];

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
    </div>
  );
};
