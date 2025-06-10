import React, { useState } from 'react';
import { Button } from './Button';
import { MeetingDetailModal } from './MeetingDetailModal';
import { CalendarEvent } from '../services/calendarEvents';

export const MeetingModalTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEvent | null>(null);

  // Sample upcoming meeting data
  const sampleUpcomingMeeting: CalendarEvent = {
    id: 'test-upcoming-1',
    title: 'Tech Stand Up',
    description: 'Daily team standup meeting',
    startTime: new Date('2025-06-10T14:30:00Z'),
    endTime: new Date('2025-06-10T15:00:00Z'),
    attendees: ['aditi@synatechsolutions.com', 'rishav@synatechsolutions.com', 'amansanghi@synatechsolutions.com'],
    meetingLink: 'https://meet.google.com/mka-vrqq-nwt',
    location: '',
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Sample past meeting data
  const samplePastMeeting: CalendarEvent = {
    id: 'test-past-1',
    title: 'Client Review Meeting',
    description: 'Weekly client review',
    startTime: new Date('2025-06-08T10:00:00Z'),
    endTime: new Date('2025-06-08T11:00:00Z'),
    attendees: ['client@example.com', 'aditi@synatechsolutions.com'],
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    location: '',
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Sample today's meeting data
  const sampleTodayMeeting: CalendarEvent = {
    id: 'test-today-1',
    title: 'Project Planning',
    description: 'Planning session for new project',
    startTime: new Date(), // Today
    endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    attendees: ['team@synatechsolutions.com'],
    meetingLink: 'https://zoom.us/j/123456789',
    location: '',
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const openModal = (meeting: CalendarEvent, fromCalendar: boolean = false) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
    
    if (fromCalendar) {
      // Simulate coming from calendar
      const meetingContext = {
        fromCalendar: true,
        meeting: meeting,
        returnMessage: "You can come back here once you're done with the meeting"
      };
      sessionStorage.setItem('meetingContext', JSON.stringify(meetingContext));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Meeting Modal Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upcoming Meeting */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Upcoming Meeting</h3>
          <p className="text-sm text-gray-600 mb-3">
            {sampleUpcomingMeeting.title} - {sampleUpcomingMeeting.startTime.toLocaleDateString()}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => openModal(sampleUpcomingMeeting, false)}
              size="sm"
              className="w-full"
            >
              Open from Meetings List
            </Button>
            <Button
              onClick={() => openModal(sampleUpcomingMeeting, true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Open from Calendar
            </Button>
          </div>
        </div>

        {/* Past Meeting */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Past Meeting</h3>
          <p className="text-sm text-gray-600 mb-3">
            {samplePastMeeting.title} - {samplePastMeeting.startTime.toLocaleDateString()}
          </p>
          <Button
            onClick={() => openModal(samplePastMeeting, false)}
            size="sm"
            className="w-full"
          >
            Open Past Meeting
          </Button>
        </div>

        {/* Today's Meeting */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Today's Meeting</h3>
          <p className="text-sm text-gray-600 mb-3">
            {sampleTodayMeeting.title} - Today
          </p>
          <Button
            onClick={() => openModal(sampleTodayMeeting, false)}
            size="sm"
            className="w-full"
          >
            Open Today's Meeting
          </Button>
        </div>
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMeeting(null);
          sessionStorage.removeItem('meetingContext');
        }}
        fromCalendar={sessionStorage.getItem('meetingContext') !== null}
      />
    </div>
  );
};
