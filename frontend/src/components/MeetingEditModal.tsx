import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, Plus, X, Save } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Meeting } from '../types';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

interface MeetingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSave: (updatedMeeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
}

export const MeetingEditModal: React.FC<MeetingEditModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    platform: 'zoom' as 'zoom' | 'teams' | 'meet' | 'other',
    meetingLink: '',
    description: '',
    status: 'scheduled' as Meeting['status'],
  });
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToastStore();

  useEffect(() => {
    if (meeting) {
      const startDate = new Date(meeting.date);
      const endDate = new Date(meeting.endTime);
      
      setFormData({
        title: meeting.title,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        platform: meeting.platform || 'zoom',
        meetingLink: meeting.meetingLink || '',
        description: meeting.description || '',
        status: meeting.status,
      });
      setAttendees(meeting.attendees.map(a => ({ ...a, id: a.id || Date.now().toString() })));
    } else {
      // Reset form for new meeting
      setFormData({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        platform: 'zoom',
        meetingLink: '',
        description: '',
        status: 'scheduled',
      });
      setAttendees([]);
    }
  }, [meeting]);

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
    
    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      error('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (attendees.length === 0) {
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
        id: meeting?.id || Date.now().toString(),
        title: formData.title.trim(),
        date: startDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: attendees.map(a => ({ id: a.id, name: a.name, email: a.email })),
        platform: formData.platform,
        meetingLink: formData.meetingLink.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        transcript: meeting?.transcript,
        summary: meeting?.summary,
        actionItems: meeting?.actionItems || [],
      };

      onSave(updatedMeeting);
      success(
        meeting ? 'Meeting Updated' : 'Meeting Created',
        meeting ? 'Meeting has been updated successfully.' : 'New meeting has been created.'
      );
      onClose();
    } catch (err) {
      error('Save Failed', 'Failed to save the meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!meeting || !onDelete) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDelete(meeting.id);
      success('Meeting Deleted', 'Meeting has been deleted successfully.');
      onClose();
    } catch (err) {
      error('Delete Failed', 'Failed to delete the meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting ? 'Edit Meeting' : 'Create Meeting'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Title */}
        <div>
          <Input
            label="Meeting Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter meeting title"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              label="Start Time *"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              label="End Time *"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Platform and Link */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Platform
            </label>
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
          </div>
          <div>
            <Input
              label="Meeting Link"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="Enter meeting link"
              leftIcon={<Video className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Status
          </label>
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
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Meeting agenda or description"
            rows={3}
            className="input w-full resize-none"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Attendees *
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
            <div className="space-y-2 max-h-40 overflow-y-auto">
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
                    className="text-dark-400 hover:text-error-600 dark:text-dark-500 dark:hover:text-error-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4 border-t border-dark-200 dark:border-dark-700">
          <div>
            {meeting && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                leftIcon={<X className="h-4 w-4" />}
              >
                Delete Meeting
              </Button>
            )}
          </div>
          <div className="flex gap-3">
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
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isLoading ? 'Saving...' : meeting ? 'Update Meeting' : 'Create Meeting'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
