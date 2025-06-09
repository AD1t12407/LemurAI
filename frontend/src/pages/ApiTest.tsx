import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Navbar } from '../components/Navbar';
import { ApiService } from '../services/api';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import { CalendarEventsService } from '../services/calendarEvents';

export const ApiTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [botName, setBotName] = useState('Test Bot');
  const [apiKey, setApiKey] = useState('');
  const [botResponse, setBotResponse] = useState<any>(null);

  // Calendar event test state
  const [eventTitle, setEventTitle] = useState('Test Meeting');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const { success, error } = useToastStore();
  const { user } = useAuthStore();

  // Load calendar events when user is available
  useEffect(() => {
    if (user?.id) {
      loadCalendarEvents();
    }
  }, [user?.id]);

  const testHealthCheck = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.healthCheck();
      setHealthStatus(response);
      success('Health Check', 'Backend is healthy and responding!');
    } catch (err: any) {
      error('Health Check Failed', err.message || 'Failed to connect to backend');
      setHealthStatus({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateBot = async () => {
    if (!meetingUrl || !apiKey) {
      error('Missing Fields', 'Please provide meeting URL and API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.createBot(meetingUrl, botName, apiKey);
      setBotResponse(response);
      success('Bot Created', `Bot ${response.bot_id} created successfully!`);
    } catch (err: any) {
      error('Bot Creation Failed', err.response?.data?.detail || err.message || 'Failed to create bot');
      setBotResponse({ error: err.response?.data || err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateEvent = async () => {
    if (!eventTitle || !eventDate || !eventStartTime || !eventEndTime) {
      error('Missing Fields', 'Please provide all event details');
      return;
    }

    if (!user?.id) {
      error('Authentication Error', 'Please log in to test calendar events');
      return;
    }

    setIsLoading(true);
    try {
      const startDateTime = new Date(`${eventDate}T${eventStartTime}`);
      const endDateTime = new Date(`${eventDate}T${eventEndTime}`);

      const event = await CalendarEventsService.createEvent(user.id, {
        title: eventTitle,
        description: 'Test event created via API test',
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: ['test@example.com'],
      });

      success('Event Created', `Event "${event.title}" created successfully!`);
      loadCalendarEvents();
    } catch (err: any) {
      console.error('Failed to create event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    if (!user?.id) return;

    try {
      const events = await CalendarEventsService.getEvents(user.id);
      setCalendarEvents(events);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
              API Integration Test
            </h1>
            <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Test the connection between frontend and backend
            </p>
          </div>

          {/* Health Check Section */}
          <div
            className="rounded-xl p-6 shadow-lg ring-1 backdrop-blur-sm"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Health Check
            </h2>
            
            <div className="space-y-4">
              <Button
                onClick={testHealthCheck}
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Test Backend Connection
              </Button>

              {healthStatus && (
                <div
                  className="rounded-lg p-4 ring-1"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
                >
                  <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Response:
                  </h3>
                  <pre className="text-sm overflow-auto" style={{ color: 'var(--text-secondary)' }}>
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Bot Creation Test */}
          <div
            className="rounded-xl p-6 shadow-lg ring-1 backdrop-blur-sm"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Bot Creation Test
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Meeting URL"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
              />
              
              <Input
                label="Bot Name"
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Test Bot"
              />
              
              <Input
                label="Recall API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your Recall AI API key"
              />
              
              <Button
                onClick={testCreateBot}
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Test Bot Creation
              </Button>

              {botResponse && (
                <div
                  className="rounded-lg p-4 ring-1"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
                >
                  <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Response:
                  </h3>
                  <pre className="text-sm overflow-auto" style={{ color: 'var(--text-secondary)' }}>
                    {JSON.stringify(botResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Events Test */}
          {user && (
            <div
              className="rounded-xl p-6 shadow-lg ring-1 backdrop-blur-sm"
              style={{
                background: 'var(--glass-bg)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Calendar Events Test
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Event Title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Test Meeting"
                  />

                  <Input
                    label="Date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />

                  <Input
                    label="Start Time"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                  />

                  <Input
                    label="End Time"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={testCreateEvent}
                    isLoading={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Create Test Event
                  </Button>

                  <Button
                    onClick={loadCalendarEvents}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Load Events
                  </Button>
                </div>

                {calendarEvents.length > 0 && (
                  <div
                    className="rounded-lg p-4 ring-1"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
                  >
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Your Calendar Events ({calendarEvents.length}):
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {calendarEvents.map((event, index) => (
                        <div
                          key={event.id || index}
                          className="text-sm p-2 rounded"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs">
                            {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div
            className="rounded-xl p-6 shadow-lg ring-1 backdrop-blur-sm"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Instructions
            </h2>
            
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>1. Make sure your backend server is running on port 8000</p>
              <p>2. Click "Test Backend Connection" to verify the health endpoint</p>
              <p>3. To test bot creation, you'll need a valid Recall AI API key</p>
              <p>4. Use a real meeting URL (Google Meet, Zoom, etc.) for testing</p>
              <p>5. To test calendar events, make sure you're logged in (demo@lemurai.com / demo1234)</p>
              <p>6. Create test events and verify they appear in the calendar</p>
              <p>7. Check the browser console and network tab for detailed error information</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ApiTest;
