import { ApiService, CalendarAuthResponse, GoogleCalendarConnectionResponse, CalendarConnectionStatus } from './api';
import { useToastStore } from '../stores/toastStore';

export interface CalendarConnection {
  userId: string;
  provider: 'google';
  connected: boolean;
  lastSync?: Date;
  authToken?: string;
  tokenExpiresAt?: Date;
}

export class CalendarIntegrationService {
  private static connections: Map<string, CalendarConnection> = new Map();

  // Generate calendar auth token
  static async generateAuthToken(userId: string): Promise<string> {
    try {
      const response: CalendarAuthResponse = await ApiService.generateCalendarAuthToken(userId);
      
      // Store token info
      const connection = this.connections.get(userId) || {
        userId,
        provider: 'google',
        connected: false,
      };
      
      connection.authToken = response.token;
      connection.tokenExpiresAt = new Date(response.expires_at);
      
      this.connections.set(userId, connection);
      
      return response.token;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Generate Auth Token',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Initiate Google Calendar connection (NEW METHOD)
  static async connectGoogleCalendarNew(): Promise<string> {
    try {
      const response = await ApiService.post('/calendar/connect/google', {});

      const toast = useToastStore.getState();
      toast.info(
        'Calendar Connection',
        'Redirecting to Google for calendar authorization...'
      );

      return response.data.oauth_url;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Connect Calendar',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  // Initiate Google Calendar connection (OLD METHOD - for backward compatibility)
  static async connectGoogleCalendar(
    userId: string,
    successUrl?: string,
    errorUrl?: string
  ): Promise<string> {
    try {
      // Try new method first
      return await this.connectGoogleCalendarNew();
    } catch (error) {
      // Fallback to old method
      try {
        // First, generate auth token
        const authToken = await this.generateAuthToken(userId);

        // Then initiate OAuth flow
        const response: GoogleCalendarConnectionResponse = await ApiService.initiateGoogleCalendarConnection(
          userId,
          authToken,
          successUrl,
          errorUrl
        );

        const toast = useToastStore.getState();
        toast.info(
          'Calendar Connection',
          'Redirecting to Google for calendar authorization...'
        );

        return response.oauth_url;
      } catch (fallbackError: any) {
        const toast = useToastStore.getState();
        toast.error(
          'Failed to Connect Calendar',
          fallbackError.response?.data?.detail || fallbackError.message || 'Unknown error occurred'
        );
        throw fallbackError;
      }
    }
  }

  // Check calendar connection status
  static async checkConnectionStatus(userId: string): Promise<CalendarConnection> {
    try {
      const response = await ApiService.get(`/calendar/status/${userId}`);

      const connection: CalendarConnection = {
        userId: response.data.user_id,
        provider: response.data.provider || 'google',
        connected: response.data.google_calendar_connected,
        lastSync: response.data.last_sync ? new Date(response.data.last_sync) : undefined,
      };

      this.connections.set(userId, connection);

      const toast = useToastStore.getState();
      if (connection.connected) {
        toast.success(
          'Calendar Connected',
          `Your ${connection.provider} calendar is connected and syncing.`
        );
      }

      return connection;
    } catch (error: any) {
      console.error(`Failed to check calendar status for user ${userId}:`, error);

      // Return default disconnected state
      const connection: CalendarConnection = {
        userId,
        provider: 'google',
        connected: false,
      };

      this.connections.set(userId, connection);
      return connection;
    }
  }

  // Open Google Calendar OAuth in new window
  static async openCalendarOAuth(userId?: string): Promise<void> {
    try {
      // Use new OAuth method (doesn't need userId)
      const oauthUrl = await this.connectGoogleCalendarNew();

      // Open OAuth URL in new window
      const popup = window.open(
        oauthUrl,
        'google_calendar_oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check connection status after popup closes
          setTimeout(() => {
            if (userId) {
              this.checkConnectionStatus(userId);
            }
          }, 1000);
        }
      }, 1000);

    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Calendar Connection Failed',
        error.message || 'Failed to open calendar authorization'
      );
      throw error;
    }
  }

  // Fetch Google Calendar events
  static async fetchGoogleCalendarEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      const response = await ApiService.get(`/calendar/google-events/${userId}?${params.toString()}`);

      return response.data.events || [];
    } catch (error: any) {
      console.error('Failed to fetch Google Calendar events:', error);
      // Don't show error toast for this - it's expected if not connected
      return [];
    }
  }

  // Get connection for user
  static getConnection(userId: string): CalendarConnection | undefined {
    return this.connections.get(userId);
  }

  // Check if user has connected calendar
  static isConnected(userId: string): boolean {
    const connection = this.connections.get(userId);
    return connection?.connected || false;
  }

  // Disconnect calendar
  static disconnectCalendar(userId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.connected = false;
      connection.authToken = undefined;
      connection.tokenExpiresAt = undefined;
      connection.lastSync = undefined;
      this.connections.set(userId, connection);
    }
    
    const toast = useToastStore.getState();
    toast.info('Calendar Disconnected', 'Your Google Calendar has been disconnected.');
  }

  // Get all connections
  static getAllConnections(): CalendarConnection[] {
    return Array.from(this.connections.values());
  }
}

export default CalendarIntegrationService;
