import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, Plus, X, Building, UserCheck } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import { CalendarEventsService } from '../services/calendarEvents';

interface MeetingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (meeting: any) => void;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [platform, setPlatform] = useState('zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [autoGenerateLink, setAutoGenerateLink] = useState(true);
  const [description, setDescription] = useState('');
  const [meetingType, setMeetingType] = useState<'internal' | 'external'>('external');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToastStore();
  const { user } = useAuthStore();

  // Generate meeting link based on platform
  const generateMeetingLink = (platform: string) => {
    const meetingId = Math.random().toString(36).substr(2, 9);
    switch (platform) {
      case 'zoom':
        return `https://zoom.us/j/${meetingId}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
      case 'meet':
        return `https://meet.google.com/${meetingId}`;
      default:
        return '';
    }
  };

  // Auto-generate link when platform changes
  React.useEffect(() => {
    if (autoGenerateLink) {
      setMeetingLink(generateMeetingLink(platform));
    }
  }, [platform, autoGenerateLink]);

  const addAttendee = () => {
    if (!newAttendeeEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAttendeeEmail)) {
      error('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: newAttendeeEmail.split('@')[0],
      email: newAttendeeEmail,
    };

    setAttendees([...attendees, newAttendee]);
    setNewAttendeeEmail('');
  };

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date || !startTime || !endTime) {
      error('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!user?.id) {
      error('Authentication Error', 'Please log in to schedule meetings.');
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // Create event using the calendar events service
      const event = await CalendarEventsService.createEvent(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: attendees.map(a => a.email),
        meetingLink: meetingLink.trim() || undefined,
        location: undefined, // Could add location field later
      });

      // Create meeting object for local state (backward compatibility)
      const newMeeting = {
        id: event.id,
        title: event.title,
        date: event.startTime.toISOString(),
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        attendees: attendees.map(a => ({ id: a.id, name: a.name, email: a.email })),
        platform,
        meetingLink: event.meetingLink,
        description: event.description,
        status: 'scheduled' as const,
        meetingType,
        actionItems: [],
      };

      if (onSave) {
        onSave(newMeeting);
      }

      // Reset form
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPlatform('zoom');
      setMeetingLink('');
      setDescription('');
      setMeetingType('external');
      setAttendees([]);
      setNewAttendeeEmail('');

      onClose();
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
      // Error is already handled by CalendarEventsService
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule New Meeting"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Title */}
        <div>
          <Input
            label="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter meeting title"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Platform and Meeting Type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input w-full"
            >
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="meet">Google Meet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Meeting Type
            </label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value as 'internal' | 'external')}
              className="input w-full"
            >
              <option value="external">External (Client Meeting)</option>
              <option value="internal">Internal (Team Meeting)</option>
            </select>
            <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
              {meetingType === 'internal'
                ? 'Internal company meetings, standups, planning sessions'
                : 'Client meetings, sales calls, external stakeholder meetings'
              }
            </p>
          </div>
        </div>

        {/* Meeting Link */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Meeting Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoGenerate"
                checked={autoGenerateLink}
                onChange={(e) => setAutoGenerateLink(e.target.checked)}
                className="h-4 w-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="autoGenerate" className="text-sm text-dark-600 dark:text-dark-400">
                Auto-generate
              </label>
            </div>
          </div>
          <Input
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="Enter meeting link or let us generate one"
            disabled={autoGenerateLink}
          />
          {autoGenerateLink && platform !== 'other' && (
            <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
              Link will be automatically generated for {platform}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Meeting agenda or description"
            rows={3}
            className="input w-full resize-none"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Attendees
          </label>

          <div className="flex gap-2 mb-3">
            <Input
              value={newAttendeeEmail}
              onChange={(e) => setNewAttendeeEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
            />
            <Button
              type="button"
              onClick={addAttendee}
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add
            </Button>
          </div>

          {attendees.length > 0 && (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between rounded-lg border border-dark-200 p-3 dark:border-dark-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {attendee.name ? attendee.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                        {attendee.name}
                      </p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">
                        {attendee.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttendee(attendee.id)}
                    className="text-dark-400 hover:text-error-600 dark:text-dark-500 dark:hover:text-error-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-dark-200 dark:border-dark-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
