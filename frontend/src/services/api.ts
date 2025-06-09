import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface BotResponse {
  bot_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface BotStatusResponse {
  bot_id: string;
  status: string;
  checked_at: string;
}

export interface DownloadUrlsResponse {
  bot_id: string;
  video_url?: string;
  transcript_url?: string;
  status: string;
}

export interface CalendarAuthResponse {
  token: string;
  expires_at: string;
  user_id: string;
}

export interface GoogleCalendarConnectionResponse {
  oauth_url: string;
  state: string;
  message: string;
}

export interface CalendarConnectionStatus {
  user_id: string;
  connected: boolean;
  provider?: string;
  last_sync?: string;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  start_time: string; // ISO format datetime
  end_time: string;   // ISO format datetime
  attendees?: string[]; // List of email addresses
  meeting_link?: string;
  location?: string;
}

export interface CalendarEventResponse {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  meeting_link?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CalendarEventsListResponse {
  events: CalendarEventResponse[];
  total_count: number;
  start_date: string;
  end_date: string;
}

// API Service Class
export class ApiService {
  // Generic HTTP methods
  static async get(url: string, config?: any) {
    return api.get(url, config);
  }

  static async post(url: string, data?: any, config?: any) {
    return api.post(url, data, config);
  }

  static async put(url: string, data?: any, config?: any) {
    return api.put(url, data, config);
  }

  static async delete(url: string, config?: any) {
    return api.delete(url, config);
  }

  // Health check
  static async healthCheck(): Promise<any> {
    const response = await api.get('/health');
    return response.data;
  }

  // Bot Management
  static async createBot(meetingUrl: string, botName: string, apiKey: string): Promise<BotResponse> {
    const response = await api.post('/create-bot', {
      meeting_url: meetingUrl,
      bot_name: botName,
      api_key: apiKey,
    });
    return response.data;
  }

  static async getBotStatus(botId: string): Promise<BotStatusResponse> {
    const response = await api.get(`/bot/${botId}/status`);
    return response.data;
  }

  static async getDownloadUrls(botId: string): Promise<DownloadUrlsResponse> {
    const response = await api.get(`/bot/${botId}/download-urls`);
    return response.data;
  }

  static async removeBot(botId: string): Promise<any> {
    const response = await api.delete(`/bot/${botId}`);
    return response.data;
  }

  static async listActiveBots(): Promise<any> {
    const response = await api.get('/bots');
    return response.data;
  }

  // Calendar Integration
  static async generateCalendarAuthToken(userId: string): Promise<CalendarAuthResponse> {
    const response = await api.post('/calendar/auth-token', {
      user_id: userId,
    });
    return response.data;
  }

  static async initiateGoogleCalendarConnection(
    userId: string,
    calendarAuthToken: string,
    successUrl?: string,
    errorUrl?: string
  ): Promise<GoogleCalendarConnectionResponse> {
    const response = await api.post('/calendar/connect/google', {
      user_id: userId,
      calendar_auth_token: calendarAuthToken,
      success_url: successUrl,
      error_url: errorUrl,
    });
    return response.data;
  }

  static async getCalendarConnectionStatus(userId: string): Promise<CalendarConnectionStatus> {
    const response = await api.get(`/calendar/status/${userId}`);
    return response.data;
  }

  // Calendar Events
  static async getCalendarEvents(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarEventsListResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get(`/calendar/events/${userId}?${params.toString()}`);
    return response.data;
  }

  static async createCalendarEvent(
    userId: string,
    eventData: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    const response = await api.post(`/calendar/events?user_id=${userId}`, eventData);
    return response.data;
  }

  static async updateCalendarEvent(
    eventId: string,
    userId: string,
    eventData: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    const response = await api.put(`/calendar/events/${eventId}?user_id=${userId}`, eventData);
    return response.data;
  }

  static async deleteCalendarEvent(eventId: string, userId: string): Promise<any> {
    const response = await api.delete(`/calendar/events/${eventId}?user_id=${userId}`);
    return response.data;
  }
}

export default ApiService;
