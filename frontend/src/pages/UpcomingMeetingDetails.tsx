import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Calendar,
  ChevronLeft,
  FileText,
  Edit3,
  Save,
  Plus,
  Video,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { formatDate, formatTime } from '../utils/date-utils';

export const UpcomingMeetingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<any>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [fromCalendar, setFromCalendar] = useState(false);

  useEffect(() => {
    console.log('🔍 UpcomingMeetingDetails mounted, checking for meeting context...');

    // Check if we came from calendar with a meeting context
    const meetingContext = sessionStorage.getItem('meetingContext');
    console.log('📋 Meeting context from sessionStorage:', meetingContext);

    if (meetingContext) {
      try {
        const context = JSON.parse(meetingContext);
        console.log('✅ Parsed meeting context:', context);

        if (context.meeting) {
          setMeeting(context.meeting);
          setFromCalendar(context.fromCalendar || false);
          console.log('🎯 Meeting set:', context.meeting.title);

          // Don't clear immediately, let it persist for debugging
          // sessionStorage.removeItem('meetingContext');
        } else {
          console.error('❌ No meeting data in context');
        }
      } catch (error) {
        console.error('❌ Error parsing meeting context:', error);
      }
    } else {
      console.error('❌ No meeting context found in sessionStorage');

      // Try to get meeting ID from URL and create a dummy meeting for testing
      if (id) {
        console.log('🔧 Creating test meeting for ID:', id);
        const testMeeting = {
          id: id,
          title: 'Tech Stand Up',
          startTime: new Date('2025-06-10T14:30:00Z'),
          endTime: new Date('2025-06-10T15:00:00Z'),
          attendees: ['aditi@synatechsolutions.com', 'rishav@synatechsolutions.com'],
          meetingLink: 'https://meet.google.com/mka-vrqq-nwt'
        };
        setMeeting(testMeeting);
        setFromCalendar(true);
      }
    }
  }, [id]);

  useEffect(() => {
    if (meeting) {
      // Load existing notes from localStorage
      const savedNotes = localStorage.getItem(`meeting-notes-${meeting.id}`);
      setMeetingNotes(savedNotes || '');
      setTempNotes(savedNotes || '');
      
      // Set page title
      document.title = `${meeting.title} - Preparation | Lemur AI`;
    }
  }, [meeting]);

  const handleSaveNotes = () => {
    if (meeting) {
      localStorage.setItem(`meeting-notes-${meeting.id}`, tempNotes);
      setMeetingNotes(tempNotes);
      setIsEditingNotes(false);
    }
  };

  const handleCancelEdit = () => {
    setTempNotes(meetingNotes);
    setIsEditingNotes(false);
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/calendar" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const { title, startTime, endTime, attendees } = meeting;
  const formattedDate = formatDate(startTime);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

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
            <Link to="/calendar" className="text-dark-600 hover:text-dark-900 dark:text-dark-400 dark:hover:text-dark-50 transition-colors duration-200 hover-scale">
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
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-5 w-5" />
              <span>{attendees?.length || 0} attendees</span>
            </div>

            {meeting.meetingLink && (
              <div className="ml-auto">
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Join Meeting
                </a>
              </div>
            )}
          </div>

          {/* Meeting preparation banner */}
          <div className="mt-6 rounded-lg p-4 bg-blue-100 dark:bg-blue-900">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Prepare for your upcoming meeting
              </p>
            </div>
          </div>

          {/* Calendar Navigation Message */}
          {fromCalendar && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can return to the calendar once you're done preparing for this meeting
                </p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="mt-8">
            {/* Things to Talk About Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose max-w-none dark:prose-invert"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Things to talk about in the meeting</h2>
                {!isEditingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 className="h-4 w-4" />}
                    onClick={() => setIsEditingNotes(true)}
                  >
                    {meetingNotes ? 'Edit' : 'Add Notes'}
                  </Button>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                {isEditingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="• What topics need to be covered?&#10;• Any updates to share?&#10;• Questions to ask?&#10;• Decisions that need to be made?&#10;• Action items to review"
                      className="w-full h-48 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        background: 'var(--bg-primary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveNotes}
                        leftIcon={<Save className="h-4 w-4" />}
                        size="sm"
                      >
                        Save Notes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[200px] cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    {meetingNotes ? (
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {meetingNotes}
                        </p>
                        <p className="text-xs mt-4 text-gray-500 dark:text-gray-400">
                          Click to edit your meeting notes
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Plus className="h-12 w-12 mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">
                          Add discussion points for this meeting
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Click here to start planning what to discuss
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Other Sections - Coming Soon */}
            <div className="mt-12 space-y-8">
              {/* Transcript Section */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meeting Recording & Transcript</h3>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Please come back after the meeting
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Recording and transcript will be available once the meeting is completed
                  </p>
                </div>
              </div>

              {/* AI Tools Section */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Business Tools</h3>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Please come back after the meeting
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    AI-powered insights, proposals, and follow-ups will be generated after the meeting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
