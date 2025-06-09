import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Grid, Filter, Search, Plus, Building, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Calendar } from '../components/Calendar';
import { MeetingCard } from '../components/MeetingCard';
import { MeetingScheduler } from '../components/MeetingScheduler';
import { MeetingsDashboard } from '../components/MeetingsDashboard';
import { Meeting } from '../types';
import { cn } from '../utils/cn';

export const Meetings: React.FC = () => {
  const { meetings, initializeData, addMeeting } = useDataStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'calendar' | 'list' | 'dashboard'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  useEffect(() => {
    document.title = 'Meetings | Lemur AI';
    initializeData();
  }, [initializeData]);

  // Use meetings from store
  const allMeetings = meetings;

  // Filter meetings based on search, status, and meeting type
  const filteredMeetings = allMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.attendees.some(attendee =>
                           attendee.name.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    const matchesMeetingType = meetingTypeFilter === 'all' ||
                              meeting.meetingType === meetingTypeFilter ||
                              (meetingTypeFilter === 'external' && !meeting.meetingType); // Default to external for legacy meetings

    if (selectedDate && view === 'list') {
      const meetingDate = new Date(meeting.date);
      const isSameDay = meetingDate.toDateString() === selectedDate.toDateString();
      return matchesSearch && matchesStatus && matchesMeetingType && isSameDay;
    }

    return matchesSearch && matchesStatus && matchesMeetingType;
  });

  const handleMeetingClick = (meeting: Meeting) => {
    navigate(`/meetings/${meeting.id}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (view === 'calendar') {
      setView('list');
    }
  };

  const handleSchedulerSave = (meeting: any) => {
    addMeeting(meeting);
  };

  // Calculate meeting statistics
  const meetingStats = {
    total: allMeetings.length,
    internal: allMeetings.filter(m => m.meetingType === 'internal').length,
    external: allMeetings.filter(m => m.meetingType === 'external' || !m.meetingType).length,
    scheduled: allMeetings.filter(m => m.status === 'scheduled').length,
    completed: allMeetings.filter(m => m.status === 'completed').length,
  };

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50">
                Meetings
              </h1>
              <p className="mt-2 text-dark-600 dark:text-dark-400">
                Manage all your meetings - internal team meetings and external client meetings
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-dark-200 dark:border-dark-700">
                <button
                  onClick={() => setView('dashboard')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-l-lg transition-colors',
                    view === 'dashboard'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50'
                  )}
                >
                  <Grid className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                    view === 'calendar'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50'
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-r-lg transition-colors',
                    view === 'list'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50'
                  )}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
              </div>

              <Button
                onClick={() => setIsSchedulerOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meetings</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{meetingStats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Internal</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{meetingStats.internal}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">External</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{meetingStats.external}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                  <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{meetingStats.scheduled}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {view === 'list' && (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={meetingTypeFilter}
                  onChange={(e) => setMeetingTypeFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Meetings</option>
                  <option value="internal">Internal Meetings</option>
                  <option value="external">External Meetings</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear Date Filter
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mt-8">
            {view === 'dashboard' ? (
              <MeetingsDashboard
                onScheduleClick={() => setIsSchedulerOpen(true)}
                onMeetingClick={handleMeetingClick}
              />
            ) : view === 'calendar' ? (
              <Calendar
                meetings={allMeetings}
                onDateSelect={handleDateSelect}
                onMeetingClick={handleMeetingClick}
                onScheduleClick={() => setIsSchedulerOpen(true)}
              />
            ) : (
              <div>
                {selectedDate && (
                  <div className="mb-6 rounded-lg bg-primary-100 p-4 dark:bg-primary-900/20">
                    <h3 className="font-medium text-primary-900 dark:text-primary-100">
                      Meetings for {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                )}

                {filteredMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-dark-400 dark:text-dark-600" />
                    <h3 className="mt-4 text-lg font-medium text-dark-900 dark:text-dark-50">
                      No meetings found
                    </h3>
                    <p className="mt-2 text-dark-600 dark:text-dark-400">
                      {selectedDate
                        ? 'No meetings scheduled for this date.'
                        : searchQuery
                          ? 'Try adjusting your search criteria.'
                          : 'Get started by scheduling your first meeting.'
                      }
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsSchedulerOpen(true)}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Schedule Meeting
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMeetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className="animate-fade-in"
                      >
                        <MeetingCard meeting={meeting} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSave={handleSchedulerSave}
      />
    </div>
  );
};
