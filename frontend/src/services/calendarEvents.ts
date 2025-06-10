import { ApiService, CalendarEventRequest, CalendarEventResponse, CalendarEventsListResponse } from './api';
import { useToastStore } from '../stores/toastStore';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  meetingLink?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export class CalendarEventsService {
  private static events: Map<string, CalendarEvent> = new Map();
  private static userEvents: Map<string, string[]> = new Map();

  // Convert API response to local CalendarEvent
  private static apiToLocal(apiEvent: CalendarEventResponse): CalendarEvent {
    return {
      id: apiEvent.id,
      title: apiEvent.title,
      description: apiEvent.description,
      startTime: new Date(apiEvent.start_time),
      endTime: new Date(apiEvent.end_time),
      attendees: apiEvent.attendees,
      meetingLink: apiEvent.meeting_link,
      location: apiEvent.location,
      createdAt: new Date(apiEvent.created_at),
      updatedAt: new Date(apiEvent.updated_at),
      userId: apiEvent.user_id,
    };
  }

  // Convert Recall AI meeting format to local CalendarEvent
  private static recallApiToLocal(recallMeeting: any): CalendarEvent {
    return {
      id: recallMeeting.id,
      title: recallMeeting.title,
      description: recallMeeting.description || '',
      startTime: new Date(recallMeeting.start_time),
      endTime: new Date(recallMeeting.end_time),
      attendees: recallMeeting.attendees || [],
      meetingLink: recallMeeting.meeting_url || '',
      location: recallMeeting.location || '',
      userId: recallMeeting.user_id || 'unknown',
      createdAt: new Date(recallMeeting.start_time), // Use start_time as created_at
      updatedAt: new Date(recallMeeting.start_time)  // Use start_time as updated_at
    };
  }

  // Convert local CalendarEvent to API request
  private static localToApi(event: Partial<CalendarEvent>): CalendarEventRequest {
    return {
      title: event.title!,
      description: event.description,
      start_time: event.startTime!.toISOString(),
      end_time: event.endTime!.toISOString(),
      attendees: event.attendees || [],
      meeting_link: event.meetingLink,
      location: event.location,
    };
  }

  // Get calendar events for a user
  static async getEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    try {
      const response: CalendarEventsListResponse = await ApiService.getCalendarEvents(
        userId,
        startDate?.toISOString(),
        endDate?.toISOString()
      );

      const events = response.events.map(this.apiToLocal);
      
      // Update local cache
      events.forEach(event => {
        this.events.set(event.id, event);
      });
      
      this.userEvents.set(userId, events.map(e => e.id));

      return events;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Load Events',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Create a new calendar event
  static async createEvent(
    userId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const apiRequest = this.localToApi(eventData);
      const response: CalendarEventResponse = await ApiService.createCalendarEvent(userId, apiRequest);
      
      const event = this.apiToLocal(response);
      
      // Update local cache
      this.events.set(event.id, event);
      
      const userEventIds = this.userEvents.get(userId) || [];
      userEventIds.push(event.id);
      this.userEvents.set(userId, userEventIds);

      const toast = useToastStore.getState();
      toast.success(
        'Event Created',
        `"${event.title}" has been scheduled successfully!`
      );

      return event;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Create Event',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Update an existing calendar event
  static async updateEvent(
    eventId: string,
    userId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const apiRequest = this.localToApi(eventData);
      const response: CalendarEventResponse = await ApiService.updateCalendarEvent(
        eventId,
        userId,
        apiRequest
      );
      
      const event = this.apiToLocal(response);
      
      // Update local cache
      this.events.set(event.id, event);

      const toast = useToastStore.getState();
      toast.success(
        'Event Updated',
        `"${event.title}" has been updated successfully!`
      );

      return event;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Update Event',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Delete a calendar event
  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      await ApiService.deleteCalendarEvent(eventId, userId);
      
      // Update local cache
      const event = this.events.get(eventId);
      this.events.delete(eventId);
      
      const userEventIds = this.userEvents.get(userId) || [];
      const updatedIds = userEventIds.filter(id => id !== eventId);
      this.userEvents.set(userId, updatedIds);

      const toast = useToastStore.getState();
      toast.success(
        'Event Deleted',
        `"${event?.title || 'Event'}" has been deleted successfully!`
      );
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Delete Event',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Get events from local cache
  static getCachedEvents(userId: string): CalendarEvent[] {
    const eventIds = this.userEvents.get(userId) || [];
    return eventIds
      .map(id => this.events.get(id))
      .filter((event): event is CalendarEvent => event !== undefined);
  }

  // Get a specific event
  static getEvent(eventId: string): CalendarEvent | undefined {
    return this.events.get(eventId);
  }

  // Get events for a specific date
  static getEventsForDate(userId: string, date: Date): CalendarEvent[] {
    const events = this.getCachedEvents(userId);
    const targetDate = date.toISOString().split('T')[0];

    return events.filter(event => {
      const eventDate = event.startTime.toISOString().split('T')[0];
      return eventDate === targetDate;
    });
  }

  // Get upcoming meetings
  static async getUpcomingMeetings(userId: string, limit: number = 10): Promise<CalendarEvent[]> {
    try {
      const response = await ApiService.get(`/calendar/upcoming/${userId}?limit=${limit}`);

      // Handle both old format (meetings) and new format (upcoming_meetings)
      const meetingsData = response.data.upcoming_meetings || response.data.meetings || [];
      const events = meetingsData.map(this.recallApiToLocal);

      // Update local cache
      events.forEach(event => {
        this.events.set(event.id, event);
      });

      return events;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Load Upcoming Meetings',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Get previous meetings
  static async getPreviousMeetings(userId: string, limit: number = 10): Promise<CalendarEvent[]> {
    try {
      const response = await ApiService.get(`/calendar/previous/${userId}?limit=${limit}`);

      // Handle both old format (meetings) and new format (previous_meetings)
      const meetingsData = response.data.previous_meetings || response.data.meetings || [];
      const events = meetingsData.map(this.recallApiToLocal);

      // Update local cache
      events.forEach(event => {
        this.events.set(event.id, event);
      });

      return events;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Load Previous Meetings',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Get meetings categorized by time
  static async getCategorizedMeetings(userId: string): Promise<{
    upcoming: CalendarEvent[];
    previous: CalendarEvent[];
    today: CalendarEvent[];
  }> {
    try {
      console.log('🔄 Fetching categorized meetings for user:', userId);

      const [upcoming, previous] = await Promise.all([
        this.getUpcomingMeetings(userId, 20),
        this.getPreviousMeetings(userId, 20)
      ]);

      console.log('📅 Raw upcoming meetings:', upcoming.length);
      console.log('📋 Raw previous meetings:', previous.length);

      // Separate today's meetings from upcoming
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Filter today's meetings from upcoming
      const todayMeetings = upcoming.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate >= todayStart && meetingDate <= todayEnd;
      });

      // Remove today's meetings from upcoming
      const upcomingMeetings = upcoming.filter(meeting => {
        const meetingDate = new Date(meeting.startTime);
        return meetingDate > todayEnd;
      });

      console.log('📊 Categorized meetings:', {
        upcoming: upcomingMeetings.length,
        previous: previous.length,
        today: todayMeetings.length
      });

      return {
        upcoming: upcomingMeetings,
        previous,
        today: todayMeetings
      };
    } catch (error: any) {
      console.error('❌ Error fetching categorized meetings:', error);
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Load Meetings',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }



  // Get events for a date range
  static getEventsForDateRange(userId: string, startDate: Date, endDate: Date): CalendarEvent[] {
    const events = this.getCachedEvents(userId);

    return events.filter(event => {
      return event.startTime >= startDate && event.startTime <= endDate;
    });
  }

  // Clear cache for a user
  static clearCache(userId: string): void {
    const eventIds = this.userEvents.get(userId) || [];
    eventIds.forEach(id => this.events.delete(id));
    this.userEvents.delete(userId);
  }

  // Clear all cache
  static clearAllCache(): void {
    this.events.clear();
    this.userEvents.clear();
  }
}

export default CalendarEventsService;
