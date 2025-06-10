import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader, Users, Building, Clock } from 'lucide-react';
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
  const [allMeetings, setAllMeetings] = useState<{
    upcoming: CalendarEvent[];
    previous: CalendarEvent[];
    today: CalendarEvent[];
  }>({ upcoming: [], previous: [], today: [] });
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load calendar events when component mounts or month changes
  useEffect(() => {
    loadCalendarData();
  }, [currentDate, user?.id]);

  const loadCalendarData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load both calendar events and categorized meetings
      const [events, categorizedMeetings] = await Promise.all([
        // Calendar events for current month
        CalendarEventsService.getEvents(
          user.id,
          new Date(currentYear, currentMonth, 1),
          new Date(currentYear, currentMonth + 1, 0)
        ),
        // All meetings for statistics
        CalendarEventsService.getCategorizedMeetings(user.id)
      ]);

      setCalendarEvents(events);
      setAllMeetings(categorizedMeetings);

      // Debug logging
      console.log('📅 Calendar data loaded:', {
        calendarEvents: events.length,
        upcomingMeetings: categorizedMeetings.upcoming.length,
        previousMeetings: categorizedMeetings.previous.length,
        todayMeetings: categorizedMeetings.today.length,
        totalMeetings: categorizedMeetings.upcoming.length + categorizedMeetings.previous.length + categorizedMeetings.today.length
      });
    } catch (error) {
      console.error('Failed to load calendar data:', error);
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

  // Combine all meetings for calendar display
  const allCalendarMeetings = [
    ...allMeetings.upcoming,
    ...allMeetings.previous,
    ...allMeetings.today,
    ...calendarEvents
  ];

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
      events: getAllMeetingsForDate(date, allCalendarMeetings),
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
      events: getAllMeetingsForDate(date, allCalendarMeetings),
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
      events: getAllMeetingsForDate(date, allCalendarMeetings),
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

  const handleMeetingClick = (meeting: CalendarEvent) => {
    console.log('📅 Calendar meeting clicked:', meeting.title);
    console.log('🕐 Meeting start time:', meeting.startTime);
    console.log('🕐 Current time:', new Date());

    // Store meeting context for navigation
    const meetingContext = {
      fromCalendar: true,
      meeting: meeting,
      returnMessage: "You can come back here once you're done with the meeting"
    };

    console.log('💾 Storing meeting context:', meetingContext);

    // Store in sessionStorage for the meeting details page to access
    sessionStorage.setItem('meetingContext', JSON.stringify(meetingContext));

    // Verify storage
    const stored = sessionStorage.getItem('meetingContext');
    console.log('✅ Verified stored context:', stored);

    // Check if this is an upcoming meeting
    const isUpcoming = meeting.startTime > new Date();
    console.log('🔮 Is upcoming meeting:', isUpcoming);

    // Navigate to appropriate page based on meeting status
    try {
      if (isUpcoming) {
        // For upcoming meetings, go to preparation page
        console.log('🚀 Navigating to upcoming meeting page:', `/meeting/upcoming/${meeting.id}`);
        window.location.href = `/meeting/upcoming/${meeting.id}`;
      } else {
        // For past/current meetings, go to regular meeting details
        console.log('🚀 Navigating to regular meeting page:', `/meetings/${meeting.id}`);
        window.location.href = `/meetings/${meeting.id}`;
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback navigation
      if (isUpcoming) {
        window.location.href = `/meeting/upcoming/${meeting.id}`;
      } else {
        window.location.href = `/meetings/${meeting.id}`;
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate meeting statistics
  const totalMeetings = allMeetings.upcoming.length + allMeetings.previous.length + allMeetings.today.length;
  const internalMeetings = [...allMeetings.upcoming, ...allMeetings.previous, ...allMeetings.today]
    .filter(meeting => meeting.attendees.some(attendee => attendee.includes('@synatechsolutions.com'))).length;
  const externalMeetings = totalMeetings - internalMeetings;
  const scheduledMeetings = allMeetings.upcoming.length + allMeetings.today.length;

  return (
    <div className="bg-white rounded-xl border border-dark-100 shadow-sm hover-lift animate-fade-in dark:bg-dark-900 dark:border-dark-800 transition-all duration-300">
      {/* Meeting Statistics Header */}
      <div className="p-6 border-b border-dark-200 dark:border-dark-700">
        <div className="grid grid-cols-4 gap-6">
          {/* Total Meetings */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Total Meetings</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">{totalMeetings}</p>
            </div>
          </div>

          {/* Internal Meetings */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Internal</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">{internalMeetings}</p>
            </div>
          </div>

          {/* External Meetings */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">External</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">{externalMeetings}</p>
            </div>
          </div>

          {/* Scheduled Meetings */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-dark-600 dark:text-dark-400">Scheduled</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-dark-50">{scheduledMeetings}</p>
            </div>
          </div>
        </div>
      </div>

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
                'min-h-[120px] p-2 border border-transparent rounded-lg cursor-pointer transition-all duration-300 hover-lift',
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
                  {/* All Meetings (Upcoming, Previous, Today) */}
                  {day.events.slice(0, 4).map((event, idx) => {
                    const isPast = event.startTime < new Date();
                    const isToday = event.startTime.toDateString() === new Date().toDateString();
                    const isUpcoming = event.startTime > new Date() && !isToday;

                    return (
                      <div
                        key={`event-${event.id}`}
                        className={cn(
                          "text-xs p-1.5 rounded truncate cursor-pointer transition-all duration-200 hover:scale-105 border",
                          isPast
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                            : isToday
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700"
                        )}
                        title={`${event.title}\n${event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n${event.attendees.length} attendees\nStatus: ${isPast ? 'Completed' : isToday ? 'Today' : 'Upcoming'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMeetingClick(event);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {isPast ? '✅' : isToday ? '🔵' : isUpcoming ? '⭐' : '⏰'}
                          <span className="truncate font-semibold">{event.title}</span>
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5 flex items-center justify-between">
                          <span>{event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {event.attendees.length > 0 && (
                            <span className="text-[9px] bg-white/50 px-1 rounded">
                              {event.attendees.length}👥
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Legacy Meetings */}
                  {day.meetings.slice(0, 3 - day.events.length).map((meeting, idx) => (
                    <div
                      key={`meeting-${meeting.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeetingClick?.(meeting);
                      }}
                      className={cn(
                        'text-xs p-1.5 rounded truncate cursor-pointer transition-all duration-200 hover:scale-105 border',
                        meeting.status === 'scheduled' && 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300 border-primary-200',
                        meeting.status === 'completed' && 'bg-success-100 text-success-800 hover:bg-success-200 dark:bg-success-900/40 dark:text-success-300 border-success-200',
                        meeting.status === 'in_progress' && 'bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-900/40 dark:text-accent-300 border-accent-200'
                      )}
                      title={`${meeting.title}\n${meeting.startTime} - ${meeting.endTime}\nStatus: ${meeting.status}`}
                    >
                      <div className="flex items-center gap-1">
                        {meeting.status === 'completed' ? '✅' : meeting.status === 'in_progress' ? '🔵' : '⭐'}
                        <span className="truncate font-semibold">{meeting.title}</span>
                      </div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}

                  {/* Show "more" indicator */}
                  {(day.meetings.length + day.events.length) > 4 && (
                    <div className="text-xs text-dark-500 dark:text-dark-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      +{(day.meetings.length + day.events.length) - 4} more meetings
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

function getAllMeetingsForDate(date: Date, meetings: CalendarEvent[]): CalendarEvent[] {
  return meetings.filter(meeting => {
    return isSameDay(date, meeting.startTime);
  });
}
