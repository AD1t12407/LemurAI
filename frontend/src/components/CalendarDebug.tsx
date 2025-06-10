import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { useAuthStore } from '../stores/authStore';
import { CalendarEventsService } from '../services/calendarEvents';

export const CalendarDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const testCalendarIntegration = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('🧪 Testing calendar integration...');
      
      // Test upcoming meetings
      const upcoming = await CalendarEventsService.getUpcomingMeetings(user.id, 10);
      console.log('📅 Upcoming meetings:', upcoming);

      // Test previous meetings
      const previous = await CalendarEventsService.getPreviousMeetings(user.id, 10);
      console.log('📋 Previous meetings:', previous);

      // Test categorized meetings
      const categorized = await CalendarEventsService.getCategorizedMeetings(user.id);
      console.log('📊 Categorized meetings:', categorized);

      setDebugData({
        upcoming,
        previous,
        categorized,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Calendar test failed:', error);
      setDebugData({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Calendar Integration Debug</h3>
      
      <div className="flex gap-4 mb-6">
        <Button
          onClick={testCalendarIntegration}
          disabled={isLoading || !user?.id}
          size="sm"
        >
          {isLoading ? 'Testing...' : 'Test Calendar API'}
        </Button>
        
        <Button
          onClick={() => setDebugData(null)}
          variant="outline"
          size="sm"
        >
          Clear
        </Button>
      </div>

      {debugData && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Last tested: {new Date(debugData.timestamp).toLocaleString()}
          </div>

          {debugData.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Error</h4>
              <p className="text-red-700">{debugData.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upcoming Meetings */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Upcoming Meetings ({debugData.upcoming?.length || 0})
                </h4>
                {debugData.upcoming?.slice(0, 3).map((meeting: any, index: number) => (
                  <div key={index} className="text-sm text-blue-700 mb-1">
                    • {meeting.title} - {new Date(meeting.startTime).toLocaleString()}
                  </div>
                ))}
              </div>

              {/* Previous Meetings */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Previous Meetings ({debugData.previous?.length || 0})
                </h4>
                {debugData.previous?.slice(0, 3).map((meeting: any, index: number) => (
                  <div key={index} className="text-sm text-green-700 mb-1">
                    • {meeting.title} - {new Date(meeting.startTime).toLocaleString()}
                  </div>
                ))}
              </div>

              {/* Statistics */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-purple-600">Upcoming:</span>
                    <span className="ml-2 font-medium">{debugData.categorized?.upcoming?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-purple-600">Previous:</span>
                    <span className="ml-2 font-medium">{debugData.categorized?.previous?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-purple-600">Today:</span>
                    <span className="ml-2 font-medium">{debugData.categorized?.today?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Raw Data */}
              <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <summary className="font-medium text-gray-800 cursor-pointer">
                  Raw API Response
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-64">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
