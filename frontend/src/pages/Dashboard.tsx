import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, ListTodo, PlusCircle, BarChart3, Video, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { MeetingCard } from '../components/MeetingCard';
import { ActionItemCard } from '../components/ActionItemCard';
import { MeetingScheduler } from '../components/MeetingScheduler';
import { MeetingRecorder } from '../components/MeetingRecorder';
import IntelligentMeetingRecorder from '../components/IntelligentMeetingRecorder';
import { ProductionDashboard } from '../components/ProductionDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { scheduleMeeting, viewAllMeetings } from '../utils/button-actions';
import { RecordingBot } from '../services/meetingRecording';
import { realMeetingsService, RealMeeting } from '../services/realMeetings';

interface DashboardProps {
  production?: boolean;
}

const DashboardContent: React.FC<DashboardProps> = ({ production = false }) => {
  const { user } = useAuthStore();
  const { meetings, actionItems, initializeData, addMeeting } = useDataStore();
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isIntelligentRecorderOpen, setIsIntelligentRecorderOpen] = useState(false);
  const [realMeetings, setRealMeetings] = useState<RealMeeting[]>([]);
  const [realActionItems, setRealActionItems] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true); // Start with loading true
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load real meetings data
  const loadRealData = async () => {
    setIsLoadingRealData(true);
    try {
      console.log('📊 Loading real meetings data...');

      const meetings = await realMeetingsService.getAllMeetings();
      console.log('📊 Got meetings:', meetings);

      const actionItems = await realMeetingsService.getPendingActionItems();
      console.log('📊 Got action items:', actionItems);

      console.log('📊 Loaded real data:', { meetings: meetings.length, actionItems: actionItems.length });

      // Ensure we always have arrays, even if the service returns undefined
      setRealMeetings(Array.isArray(meetings) ? meetings : []);
      setRealActionItems(Array.isArray(actionItems) ? actionItems : []);
      setHasInitialized(true);
    } catch (error) {
      console.error('❌ Error loading real data:', error);
      console.error('❌ Error details:', error);
      // Set empty arrays on error so UI shows empty state
      setRealMeetings([]);
      setRealActionItems([]);
      setHasInitialized(true);

      // Don't show alert during hot reload
      if (!window.location.href.includes('localhost')) {
        alert('Failed to load meeting data. Please check your connection and try again.');
      }
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // Manual API test
  const testAPI = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('http://localhost:8000/meeting-intelligence/debug/test-connection');
      const data = await response.json();
      console.log('🧪 API Test Result:', data);

      const dbResponse = await fetch('http://localhost:8000/meeting-intelligence/debug/database/outputs');
      const dbData = await dbResponse.json();
      console.log('🧪 Database Test Result:', dbData);

      alert(`API Test: ${data.success ? 'SUCCESS' : 'FAILED'}\nDatabase: ${dbData.count || 0} outputs found`);
    } catch (error) {
      console.error('🧪 API Test Failed:', error);
      alert(`API Test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard | Lemur AI';

    // Initialize data safely
    try {
      initializeData();
    } catch (error) {
      console.error('Error initializing data:', error);
    }

    // Load real data safely
    loadRealData();
  }, []); // Remove initializeData dependency to prevent hot reload issues

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

  // Always prioritize real meetings, show loading state if still loading
  // Ensure we always have arrays to prevent crashes
  const allMeetings = Array.isArray(realMeetings) ? realMeetings : [];
  const allActionItems = Array.isArray(realActionItems) ? realActionItems : [];

  console.log('📊 Dashboard data:', {
    realMeetings: realMeetings.length,
    mockMeetings: meetings.length,
    isLoading: isLoadingRealData
  });

  const upcoming = allMeetings.filter(meeting => {
    try {
      if (!meeting || !meeting.date) return false;
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate >= todayStr;
    } catch (error) {
      console.error('Error filtering upcoming meeting:', meeting, error);
      return false;
    }
  }).slice(0, 3);

  const recent = allMeetings.filter(meeting => {
    try {
      if (!meeting || !meeting.date) return false;
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate < todayStr;
    } catch (error) {
      console.error('Error filtering recent meeting:', meeting, error);
      return false;
    }
  }).slice(0, 3);

  console.log('📊 Meeting filtering:', {
    totalMeetings: allMeetings.length,
    todayStr,
    upcoming: upcoming.length,
    recent: recent.length,
    allMeetingDates: allMeetings.map(m => ({
      id: m?.id || 'unknown',
      date: m?.date || 'unknown',
      title: m?.title || 'Unknown Meeting'
    })),
    upcomingMeetings: upcoming.map(m => ({ id: m.id, title: m.title, date: m.date })),
    recentMeetings: recent.map(m => ({ id: m.id, title: m.title, date: m.date }))
  });

  // Get pending action items
  const pendingActionItems = allActionItems
    .filter(item => {
      try {
        return item && item.status === 'pending';
      } catch (error) {
        console.error('Error filtering action item:', item, error);
        return false;
      }
    })
    .slice(0, 3);

  const handleSchedulerSave = (meeting: any) => {
    addMeeting(meeting);
  };

  const handleRecordingCreated = (bot: RecordingBot) => {
    console.log('Recording bot created:', bot);
    // You could add the bot to a recordings store or update UI state here
  };

  // Show loading screen during initial load
  if (!hasInitialized && isLoadingRealData) {
    return (
      <div className="min-h-screen bg-primary transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If production mode, render the production dashboard
  if (production) {
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
          <ProductionDashboard />
        </main>
      </div>
    );
  }

  // Default dashboard
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
                {greeting}, {(user?.name && typeof user.name === 'string') ? user.name.split(' ')[0] : 'there'}
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
                leftIcon={<Brain className="h-5 w-5" />}
                size="lg"
                onClick={() => setIsIntelligentRecorderOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0"
              >
                AI Intelligence
              </Button>

              <Button
                leftIcon={<PlusCircle className="h-5 w-5" />}
                size="lg"
                onClick={() => scheduleMeeting(() => setIsSchedulerOpen(true))}
              >
                Schedule Meeting
              </Button>

              {/* Debug button to reload real data */}
              <Button
                leftIcon={<BarChart3 className="h-5 w-5" />}
                size="lg"
                variant="outline"
                onClick={loadRealData}
                disabled={isLoadingRealData}
              >
                {isLoadingRealData ? 'Loading...' : 'Refresh Data'}
              </Button>

              {/* Test API button */}
              <Button
                size="lg"
                variant="outline"
                onClick={testAPI}
              >
                Test API
              </Button>

              {/* Debug info */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Real: {realMeetings.length} | Mock: {meetings.length} | Loading: {isLoadingRealData ? 'Yes' : 'No'}
              </div>
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
              {isLoadingRealData ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : upcoming.length > 0 ? (
                upcoming.map((meeting, index) => {
                  if (!meeting || !meeting.id) return null;
                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <MeetingCard meeting={meeting} />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No upcoming meetings found. Start a meeting recording to see real data here.
                  </p>
                </div>
              )}
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
              {isLoadingRealData ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : recent.length > 0 ? (
                recent.map((meeting, index) => {
                  if (!meeting || !meeting.id) return null;
                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <MeetingCard meeting={meeting} />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent meetings found. Your processed meetings will appear here.
                  </p>
                </div>
              )}
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
              {isLoadingRealData ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : pendingActionItems.length > 0 ? (
                pendingActionItems.map((item, index) => {
                  if (!item || !item.id) return null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <ActionItemCard item={item} />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending action items. Action items from your meetings will appear here.
                  </p>
                </div>
              )}
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

      {/* Intelligent Meeting Recorder Modal */}
      <IntelligentMeetingRecorder
        isOpen={isIntelligentRecorderOpen}
        onClose={() => setIsIntelligentRecorderOpen(false)}
        onRecordingCreated={(recording) => {
          console.log('AI recording created:', recording);
          // Optionally refresh the dashboard or show notification
        }}
      />
    </div>
  );
};

// Export with Error Boundary
export const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
    <ErrorBoundary>
      <DashboardContent {...props} />
    </ErrorBoundary>
  );
};