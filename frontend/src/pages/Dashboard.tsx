import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, ListTodo, PlusCircle, BarChart3, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { MeetingCard } from '../components/MeetingCard';
import { ActionItemCard } from '../components/ActionItemCard';
import { MeetingScheduler } from '../components/MeetingScheduler';
import { MeetingRecorder } from '../components/MeetingRecorder';
import { scheduleMeeting, viewAllMeetings } from '../utils/button-actions';
import { RecordingBot } from '../services/meetingRecording';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { meetings, actionItems, initializeData, addMeeting } = useDataStore();
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard | Lemur AI';
    initializeData();
  }, [initializeData]);

  // Get today's date for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? 'Good morning'
    : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  // Filter meetings for upcoming and recent
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const upcoming = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
    return meetingDate >= todayStr;
  }).slice(0, 3);

  const recent = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
    return meetingDate < todayStr;
  }).slice(0, 3);

  // Get pending action items
  const pendingActionItems = actionItems
    .filter(item => item.status === 'pending')
    .slice(0, 3);

  const handleSchedulerSave = (meeting: any) => {
    addMeeting(meeting);
  };

  const handleRecordingCreated = (bot: RecordingBot) => {
    console.log('Recording bot created:', bot);
    // You could add the bot to a recordings store or update UI state here
  };

    return (
    <div className="min-h-screen bg-primary transition-colors duration-300">
      <style>{`
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
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl" style={{ color: 'var(--text-primary)' }}>
                {greeting}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Here's what's happening with your meetings today
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                leftIcon={<Video className="h-5 w-5" />}
                size="lg"
                variant="outline"
                onClick={() => setIsRecorderOpen(true)}
              >
                Record Meeting
              </Button>
              <Button
                leftIcon={<PlusCircle className="h-5 w-5" />}
                size="lg"
                onClick={() => scheduleMeeting(() => setIsSchedulerOpen(true))}
              >
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Upcoming Meetings',
                value: upcoming.length,
                icon: CalendarDays,
                gradient: 'from-blue-500 to-indigo-600',
                bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                iconColor: 'text-blue-600 dark:text-blue-400'
              },
              {
                label: 'Today\'s Meetings',
                value: meetings.filter(m => new Date(m.date).toISOString().split('T')[0] === todayStr).length,
                icon: Clock,
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
                iconColor: 'text-emerald-600 dark:text-emerald-400'
              },
              {
                label: 'Pending Action Items',
                value: pendingActionItems.length,
                icon: ListTodo,
                gradient: 'from-amber-500 to-orange-600',
                bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
                iconColor: 'text-amber-600 dark:text-amber-400'
              },
              {
                label: 'Insights Generated',
                value: meetings.length,
                icon: BarChart3,
                gradient: 'from-purple-500 to-pink-600',
                bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
                iconColor: 'text-purple-600 dark:text-purple-400'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="card hover-lift animate-scale-in"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 bg-gradient-to-br ${stat.bg} shadow-sm backdrop-filter backdrop-blur-sm`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Meetings */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Upcoming Meetings
              </h2>
              <Button variant="outline" size="sm" onClick={viewAllMeetings}>
                View All
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <MeetingCard meeting={meeting} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Meetings
              </h2>
              <Button variant="outline" size="sm" onClick={viewAllMeetings}>
                View All
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <MeetingCard meeting={meeting} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pending Action Items
              </h2>
              <Button variant="outline" size="sm" onClick={viewAllMeetings}>
                View All
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pendingActionItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <ActionItemCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSave={handleSchedulerSave}
      />

      {/* Meeting Recorder Modal */}
      <MeetingRecorder
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onRecordingCreated={handleRecordingCreated}
      />
    </div>
  );
};