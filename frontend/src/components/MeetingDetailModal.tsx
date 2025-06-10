import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Video, Edit3, Save, ArrowLeft, Plus, FileText, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { CalendarEvent } from '../services/calendarEvents';

interface MeetingDetailModalProps {
  meeting: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  fromCalendar?: boolean;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  isOpen,
  onClose,
  fromCalendar = false
}) => {
  const [meetingNotes, setMeetingNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingActions, setIsEditingActions] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempActions, setTempActions] = useState('');

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

  const isPast = meeting ? meeting.startTime < new Date() : false;
  const isToday = meeting ? meeting.startTime.toDateString() === new Date().toDateString() : false;
  const isUpcoming = meeting ? meeting.startTime > new Date() && !isToday : false;

  if (!meeting) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3">
                {fromCalendar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back to Calendar
                  </Button>
                )}
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meeting.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
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
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isUpcoming && meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  leftIcon={<X className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Meeting Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(meeting.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </p>
                  </div>
                </div>

                {meeting.attendees.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Attendees</p>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                            +{meeting.attendees.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {meeting.meetingLink && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Video className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Meeting Link</p>
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 mt-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Return Message for Calendar Navigation */}
              {fromCalendar && isUpcoming && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-800">
                      <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You can return to the calendar once you're done preparing for this meeting
                    </p>
                  </div>
                </div>
              )}

              {/* Meeting Preparation Section - Only for Upcoming Meetings */}
              {isUpcoming && (
                <div className="space-y-6">
                  {/* Things to Discuss */}
                  <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Things to talk about in the meeting
                        </h3>
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
                  <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                          <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Action items to discuss
                        </h3>
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
              )}

              {/* For Past Meetings - Show Empty State */}
              {isPast && (
                <div className="text-center py-8">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Meeting Completed
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    This meeting has already taken place. Meeting notes and recordings would appear here.
                  </p>
                </div>
              )}

              {/* For Today's Meetings */}
              {isToday && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Meeting is today!</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Make sure you're prepared with your discussion points and action items.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
