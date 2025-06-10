import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, Video, Edit3, Save, Plus, FileText, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { CalendarEvent } from '../services/calendarEvents';

export const UpcomingMeetingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<CalendarEvent | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingActions, setIsEditingActions] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempActions, setTempActions] = useState('');
  const [fromCalendar, setFromCalendar] = useState(false);

  useEffect(() => {
    // Check if we came from calendar with a meeting context
    const meetingContext = sessionStorage.getItem('meetingContext');
    if (meetingContext) {
      try {
        const context = JSON.parse(meetingContext);
        if (context.fromCalendar && context.meeting) {
          setMeeting(context.meeting);
          setFromCalendar(true);
          // Clear the context so it doesn't persist
          sessionStorage.removeItem('meetingContext');
        }
      } catch (error) {
        console.error('Error parsing meeting context:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (meeting) {
      // Load existing notes and action items from localStorage
      const savedNotes = localStorage.getItem(`meeting-notes-${meeting.id}`);
      const savedActions = localStorage.getItem(`meeting-actions-${meeting.id}`);
      
      setMeetingNotes(savedNotes || '');
      setActionItems(savedActions || '');
      setTempNotes(savedNotes || '');
      setTempActions(savedActions || '');
    }
  }, [meeting]);

  const handleSaveNotes = () => {
    if (meeting) {
      localStorage.setItem(`meeting-notes-${meeting.id}`, tempNotes);
      setMeetingNotes(tempNotes);
      setIsEditingNotes(false);
    }
  };

  const handleSaveActions = () => {
    if (meeting) {
      localStorage.setItem(`meeting-actions-${meeting.id}`, tempActions);
      setActionItems(tempActions);
      setIsEditingActions(false);
    }
  };

  const handleCancelNotesEdit = () => {
    setTempNotes(meetingNotes);
    setIsEditingNotes(false);
  };

  const handleCancelActionsEdit = () => {
    setTempActions(actionItems);
    setIsEditingActions(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Meeting not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The meeting details could not be loaded.
          </p>
          <Link to="/calendar" className="text-blue-600 hover:text-blue-800">
            ← Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = meeting.startTime > new Date();
  const isToday = meeting.startTime.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to={fromCalendar ? "/calendar" : "/meetings"}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {fromCalendar ? 'Back to Calendar' : 'Back to Meetings'}
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            {/* Meeting Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {meeting.title}
              </h1>
              <div className="flex items-center gap-2">
                {isUpcoming && (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Upcoming Meeting
                  </span>
                )}
                {isToday && (
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Meeting Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(meeting.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Attendees</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meeting.attendees.length} people
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting Link */}
            {meeting.meetingLink && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span style={{ color: 'var(--text-primary)' }}>Ready to join the meeting?</span>
                  </div>
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                </div>
              </div>
            )}

            {/* Return Message for Calendar Navigation */}
            {fromCalendar && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  💡 You can return to the calendar once you're done preparing for this meeting
                </p>
              </div>
            )}

            {/* Meeting Preparation Sections */}
            <div className="space-y-8">
              {/* Discussion Points */}
              <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Things to talk about in the meeting
                    </h2>
                  </div>
                  {!isEditingNotes && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingNotes(true)}
                      leftIcon={<Edit3 className="h-4 w-4" />}
                    >
                      {meetingNotes ? 'Edit' : 'Add Notes'}
                    </Button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="• What topics need to be covered?&#10;• Any updates to share?&#10;• Questions to ask?&#10;• Decisions that need to be made?"
                      className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onClick={handleCancelNotesEdit}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[120px] p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all duration-200 border-2 border-dashed"
                    style={{ 
                      background: meetingNotes ? 'var(--bg-primary)' : 'transparent',
                      borderColor: meetingNotes ? 'var(--border-primary)' : 'var(--border-secondary)'
                    }}
                    onClick={() => setIsEditingNotes(true)}
                  >
                    {meetingNotes ? (
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap leading-relaxed">
                          {meetingNotes}
                        </p>
                        <p className="text-xs mt-3 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          Click to edit
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Plus className="h-8 w-8 mb-2 opacity-40" style={{ color: 'var(--text-secondary)' }} />
                        <p style={{ color: 'var(--text-secondary)' }} className="font-medium">
                          Add discussion points for this meeting
                        </p>
                        <p className="text-sm mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          Click to start planning what to discuss
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Action items to discuss
                    </h2>
                  </div>
                  {!isEditingActions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingActions(true)}
                      leftIcon={<Edit3 className="h-4 w-4" />}
                    >
                      {actionItems ? 'Edit' : 'Add Items'}
                    </Button>
                  )}
                </div>

                {isEditingActions ? (
                  <div className="space-y-4">
                    <textarea
                      value={tempActions}
                      onChange={(e) => setTempActions(e.target.value)}
                      placeholder="• Follow up on previous action items&#10;• Review project progress&#10;• Assign new tasks&#10;• Set deadlines and next steps"
                      className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      style={{
                        background: 'var(--bg-primary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveActions}
                        leftIcon={<Save className="h-4 w-4" />}
                        size="sm"
                      >
                        Save Action Items
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelActionsEdit}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[120px] p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all duration-200 border-2 border-dashed"
                    style={{ 
                      background: actionItems ? 'var(--bg-primary)' : 'transparent',
                      borderColor: actionItems ? 'var(--border-primary)' : 'var(--border-secondary)'
                    }}
                    onClick={() => setIsEditingActions(true)}
                  >
                    {actionItems ? (
                      <div>
                        <p style={{ color: 'var(--text-primary)' }} className="whitespace-pre-wrap leading-relaxed">
                          {actionItems}
                        </p>
                        <p className="text-xs mt-3 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          Click to edit
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Plus className="h-8 w-8 mb-2 opacity-40" style={{ color: 'var(--text-secondary)' }} />
                        <p style={{ color: 'var(--text-secondary)' }} className="font-medium">
                          Add action items to review
                        </p>
                        <p className="text-sm mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          Click to add tasks and follow-ups to discuss
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
