import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, ExternalLink, Play, Save, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Meeting } from '../types';
import { cn } from '../utils/cn';
import { formatDate, formatTime, getMeetingDuration } from '../utils/date-utils';
import { joinMeeting } from '../utils/button-actions';
import { useDataStore } from '../stores/dataStore';
import { Button } from './Button';
import { Input } from './Input';
import { OverlayEditModal, EditFormWrapper, FormSection, FormActions, InputGroup } from './OverlayEditModal';
import { useToastStore } from '../stores/toastStore';

interface MeetingCardProps {
  meeting: Meeting;
  className?: string;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, className }) => {
  const { id, title, date, startTime, endTime, attendees, status, platform } = meeting;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: title,
    date: new Date(date).toISOString().split('T')[0],
    startTime: new Date(startTime).toTimeString().slice(0, 5),
    endTime: new Date(endTime).toTimeString().slice(0, 5),
    platform: platform || 'zoom',
    meetingLink: meeting.meetingLink || '',
    description: meeting.description || '',
    status: status,
  });
  const [attendeesList, setAttendeesList] = useState(attendees);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const { updateMeeting, deleteMeeting } = useDataStore();
  const { success, error } = useToastStore();

  const statusColors = {
    scheduled: 'badge badge-primary',
    in_progress: 'badge badge-success',
    completed: 'badge text-gray-600 dark:text-gray-400',
    cancelled: 'badge badge-error',
    processing: 'badge badge-warning',
    failed: 'badge badge-error',
  };

  const platformIcons = {
    zoom: { icon: Video, color: 'text-blue-600 dark:text-blue-400' },
    teams: { icon: Video, color: 'text-purple-600 dark:text-purple-400' },
    meet: { icon: Video, color: 'text-green-600 dark:text-green-400' },
    other: { icon: Video, color: 'text-dark-600 dark:text-dark-400' },
  };

  const duration = getMeetingDuration(startTime, endTime);
  const formattedDate = formatDate(date);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  const otherAttendees = attendees.length > 1
    ? `+${attendees.length - 1} others`
    : '';

  const PlatformIcon = platform ? platformIcons[platform]?.icon || Video : Video;
  const platformColor = platform ? platformIcons[platform]?.color || 'text-dark-600 dark:text-dark-400' : 'text-dark-600 dark:text-dark-400';

  const handleJoinMeeting = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinMeeting(id);
  };

  const handleCardClick = () => {
    setIsEditModalOpen(true);
  };

  const addAttendee = () => {
    if (!newAttendeeEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAttendeeEmail)) {
      error('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const newAttendee = {
      id: Date.now().toString(),
      name: newAttendeeEmail.split('@')[0],
      email: newAttendeeEmail,
    };

    setAttendeesList([...attendeesList, newAttendee]);
    setNewAttendeeEmail('');
  };

  const removeAttendee = (attendeeId: string) => {
    setAttendeesList(attendeesList.filter(a => a.id !== attendeeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      error('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (attendeesList.length === 0) {
      error('No Attendees', 'Please add at least one attendee.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const updatedMeeting: Meeting = {
        ...meeting,
        title: formData.title.trim(),
        date: startDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: attendeesList,
        platform: formData.platform,
        status: formData.status,
      };

      updateMeeting(id, updatedMeeting);
      success('Meeting Updated', 'Meeting has been updated successfully.');
      setIsEditModalOpen(false);
    } catch (err) {
      error('Save Failed', 'Failed to save the meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      deleteMeeting(id);
      success('Meeting Deleted', 'Meeting has been deleted successfully.');
      setIsEditModalOpen(false);
    } catch (err) {
      error('Delete Failed', 'Failed to delete the meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canJoin = status === 'scheduled' || status === 'in_progress';

  return (
    <div
      className={cn(
        'card group relative flex h-full min-h-[280px] flex-col justify-between hover-lift animate-fade-in',
        'transition-all duration-300 ease-out cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3
            className="font-semibold line-clamp-2 pr-2 leading-tight transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          <span className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 animate-scale-in shadow-sm',
            statusColors[status]
          )}>
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </span>
        </div>

        {/* Meeting Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
            <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-accent)' }} />
            <span className="truncate font-medium">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-accent)' }} />
            <span className="truncate">
              {formattedStartTime} - {formattedEndTime} ({duration} min)
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
            <PlatformIcon className={cn('h-4 w-4 flex-shrink-0', platformColor)} />
            <span className="truncate capitalize">
              {platform || 'Meeting'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
            <Users className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-accent)' }} />
            <span className="truncate">
              {attendees.length} participant{attendees.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Attendees Section */}
      <div className="mb-4">
        {attendees[0] && (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {attendees.slice(0, 3).map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 ring-2 ring-white dark:bg-primary-900 dark:text-primary-300 dark:ring-dark-900"
                  style={{ zIndex: 10 - index }}
                >
                  {attendee.name.charAt(0)}
                </div>
              ))}
              {attendees.length > 3 && (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dark-200 text-xs font-medium text-dark-600 ring-2 ring-white dark:bg-dark-700 dark:text-dark-300 dark:ring-dark-900">
                  +{attendees.length - 3}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                {attendees[0].name}
              </p>
              {attendees.length > 1 && (
                <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                  {otherAttendees}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={`/meetings/${id}`}
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            leftIcon={<ExternalLink className="h-4 w-4" />}
          >
            View Details
          </Button>
        </Link>

        {canJoin && (
          <Button
            size="sm"
            onClick={handleJoinMeeting}
            leftIcon={<Play className="h-4 w-4" />}
            className="flex-shrink-0"
          >
            Join
          </Button>
        )}
      </div>

      {/* Professional Overlay Edit Modal - Portal renders outside component tree */}
      <OverlayEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Meeting"
        size="lg"
      >
        <EditFormWrapper onSubmit={handleSubmit}>
          <FormSection>
            <InputGroup label="Meeting Title" required>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter meeting title"
                required
              />
            </InputGroup>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InputGroup label="Date" required>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup label="Start Time" required>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup label="End Time" required>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </InputGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputGroup label="Platform">
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="meet">Google Meet</option>
                  <option value="other">Other</option>
                </select>
              </InputGroup>
              <InputGroup label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input w-full"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </InputGroup>
            </div>

            <InputGroup label="Meeting Link">
              <Input
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="Enter meeting link"
                leftIcon={<Video className="h-4 w-4" />}
              />
            </InputGroup>

            <InputGroup label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting agenda or description"
                rows={3}
                className="input w-full resize-none"
              />
            </InputGroup>
          </FormSection>

          <FormSection title="Attendees" description="Manage meeting attendees">
            <div className="flex gap-2 mb-3">
              <Input
                value={newAttendeeEmail}
                onChange={(e) => setNewAttendeeEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
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

            {attendeesList.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {attendeesList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {attendee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {attendee.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttendee(attendee.id)}
                      className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              leftIcon={<X className="h-4 w-4" />}
            >
              Delete Meeting
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </FormActions>
        </EditFormWrapper>
      </OverlayEditModal>
    </div>
  );
};