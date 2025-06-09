import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Meeting } from '../types';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { useAuthStore } from '../stores/authStore';
import { CalendarEventsService, CalendarEvent } from '../services/calendarEvents';

interface CalendarProps {
  meetings: Meeting[];
  onDateSelect?: (date: Date) => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onScheduleClick?: () => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: Meeting[];
  events: CalendarEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({
  meetings,
  onDateSelect,
  onMeetingClick,
  onScheduleClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load calendar events when component mounts or month changes
  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate, user?.id]);

  const loadCalendarEvents = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get events for the current month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const events = await CalendarEventsService.getEvents(
        user.id,
        startOfMonth,
        endOfMonth
      );

      setCalendarEvents(events);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      // Error is handled by CalendarEventsService
    } finally {
      setIsLoading(false);
    }
  };

  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays: CalendarDay[] = [];

  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      meetings: getMeetingsForDate(date, meetings),
      events: getEventsForDate(date, calendarEvents),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      meetings: getMeetingsForDate(date, meetings),
      events: getEventsForDate(date, calendarEvents),
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      meetings: getMeetingsForDate(date, meetings),
      events: getEventsForDate(date, calendarEvents),
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    onDateSelect?.(day.date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-dark-100 shadow-sm hover-lift animate-fade-in dark:bg-dark-900 dark:border-dark-800 transition-all duration-300">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-50">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              leftIcon={<ChevronRight className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <Loader className="h-4 w-4 animate-spin text-primary-600" />}
          <Button
            onClick={onScheduleClick}
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
          >
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-dark-600 dark:text-dark-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                'min-h-[100px] p-2 border border-transparent rounded-lg cursor-pointer transition-all duration-300 hover-lift',
                day.isCurrentMonth
                  ? 'hover:border-primary-200 hover:bg-primary-50 hover:shadow-md dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
                  : 'opacity-40 hover:opacity-60',
                day.isToday && 'bg-primary-100 border-primary-300 shadow-sm dark:bg-primary-900/30 dark:border-primary-600',
                selectedDate && isSameDay(day.date, selectedDate) && 'bg-primary-200 border-primary-400 shadow-md dark:bg-primary-800/50 dark:border-primary-500'
              )}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  'text-sm font-medium mb-1',
                  day.isCurrentMonth
                    ? 'text-dark-900 dark:text-dark-50'
                    : 'text-dark-400 dark:text-dark-600',
                  day.isToday && 'text-primary-700 dark:text-primary-300 font-bold'
                )}>
                  {day.date.getDate()}
                </span>

                {/* Meeting and Event indicators */}
                <div className="flex-1 space-y-1">
                  {/* Calendar Events */}
                  {day.events.slice(0, 2).map((event, idx) => (
                    <div
                      key={`event-${event.id}`}
                      className="text-xs p-1 rounded truncate cursor-pointer transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300"
                      title={`${event.title} - ${event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      📅 {event.title}
                    </div>
                  ))}

                  {/* Legacy Meetings */}
                  {day.meetings.slice(0, 3 - day.events.length).map((meeting, idx) => (
                    <div
                      key={`meeting-${meeting.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeetingClick?.(meeting);
                      }}
                      className={cn(
                        'text-xs p-1 rounded truncate cursor-pointer transition-colors',
                        meeting.status === 'scheduled' && 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300',
                        meeting.status === 'completed' && 'bg-success-100 text-success-800 hover:bg-success-200 dark:bg-success-900/40 dark:text-success-300',
                        meeting.status === 'in_progress' && 'bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-900/40 dark:text-accent-300'
                      )}
                    >
                      {meeting.title}
                    </div>
                  ))}

                  {/* Show "more" indicator */}
                  {(day.meetings.length + day.events.length) > 3 && (
                    <div className="text-xs text-dark-500 dark:text-dark-400 font-medium">
                      +{(day.meetings.length + day.events.length) - 3} more
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function getMeetingsForDate(date: Date, meetings: Meeting[]): Meeting[] {
  return meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    return isSameDay(date, meetingDate);
  });
}

function getEventsForDate(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => {
    return isSameDay(date, event.startTime);
  });
}
