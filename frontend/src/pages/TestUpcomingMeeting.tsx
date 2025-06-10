import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const TestUpcomingMeeting: React.FC = () => {
  const testMeeting = {
    id: 'test-upcoming-1',
    title: 'Tech Stand Up',
    description: 'Daily team standup meeting',
    startTime: new Date('2025-06-10T14:30:00Z'),
    endTime: new Date('2025-06-10T15:00:00Z'),
    attendees: ['aditi@synatechsolutions.com', 'rishav@synatechsolutions.com', 'amansanghi@synatechsolutions.com'],
    meetingLink: 'https://meet.google.com/mka-vrqq-nwt'
  };

  const handleTestUpcomingMeeting = () => {
    // Store meeting context
    const meetingContext = {
      fromCalendar: true,
      meeting: testMeeting,
      returnMessage: "You can come back here once you're done with the meeting"
    };
    
    console.log('🧪 Setting up test meeting context:', meetingContext);
    sessionStorage.setItem('meetingContext', JSON.stringify(meetingContext));
    
    // Navigate to upcoming meeting page
    window.location.href = `/meeting/upcoming/${testMeeting.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test Upcoming Meeting Page
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test Meeting Details</h2>
          <div className="space-y-2 mb-6">
            <p><strong>Title:</strong> {testMeeting.title}</p>
            <p><strong>Date:</strong> {testMeeting.startTime.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {testMeeting.startTime.toLocaleTimeString()} - {testMeeting.endTime.toLocaleTimeString()}</p>
            <p><strong>Attendees:</strong> {testMeeting.attendees.length} people</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleTestUpcomingMeeting}
              className="w-full"
            >
              🚀 Test Upcoming Meeting Page
            </Button>
            
            <Link to="/calendar">
              <Button variant="outline" className="w-full">
                ← Back to Calendar
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Debug Information
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This test page will set up the meeting context and navigate to the upcoming meeting preparation page.
            Check the browser console for debug logs.
          </p>
        </div>
      </div>
    </div>
  );
};
