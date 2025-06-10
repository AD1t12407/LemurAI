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

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  google_calendar_connected: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Client Management Types
export interface Client {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SubClient {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  contact_email?: string;
  contact_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ClientCreateRequest {
  name: string;
  description?: string;
}

export interface SubClientCreateRequest {
  name: string;
  description?: string;
  client_id: string;
  contact_email?: string;
  contact_name?: string;
}

// File Management Types
export interface FileUploadResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  client_id: string;
  sub_client_id?: string;
  processed: boolean;
  extracted_text?: string;
  chunks_stored: number;
  created_at: string;
}

export interface KnowledgeSearchRequest {
  query: string;
  client_id: string;
  sub_client_id?: string;
  n_results?: number;
}

export interface KnowledgeSearchResponse {
  results: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  query: string;
  total_results: number;
}

// AI Generation Types
export interface LLMGenerationRequest {
  prompt: string;
  content_type: string; // email, summary, action_items, custom
  client_id: string;
  sub_client_id?: string;
  recipient_name?: string;
  sender_name?: string;
  additional_instructions?: string;
}

export interface LLMGenerationResponse {
  id: string;
  content: string;
  content_type: string;
  prompt: string;
  client_id: string;
  sub_client_id?: string;
  context_used: string;
  created_at: string;
}

// Bot Management Types
export interface BotResponse {
  bot_id: string;
  status: string;
  meeting_url: string;
  bot_name: string;
  created_at: string;
  message: string;
}

export interface BotStatusResponse {
  bot_id: string;
  status: string;
  meeting_url: string;
  bot_name: string;
  status_changes: Array<any>;
  checked_at: string;
}

export interface DownloadUrlsResponse {
  bot_id: string;
  video_url?: string;
  audio_url?: string;
  transcript_url?: string;
  chat_messages_url?: string;
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

  // Authentication
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Client Management
  static async createClient(data: ClientCreateRequest): Promise<Client> {
    const response = await api.post('/clients/', data);
    return response.data;
  }

  static async getClients(): Promise<Client[]> {
    const response = await api.get('/clients/');
    return response.data;
  }

  static async getClient(clientId: string): Promise<Client> {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  }

  static async updateClient(clientId: string, data: Partial<ClientCreateRequest>): Promise<Client> {
    const response = await api.put(`/clients/${clientId}`, data);
    return response.data;
  }

  static async deleteClient(clientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  }

  // Sub-Client Management
  static async createSubClient(clientId: string, data: Omit<SubClientCreateRequest, 'client_id'>): Promise<SubClient> {
    const response = await api.post(`/clients/${clientId}/sub-clients`, data);
    return response.data;
  }

  static async getSubClients(clientId: string): Promise<SubClient[]> {
    const response = await api.get(`/clients/${clientId}/sub-clients`);
    return response.data;
  }

  static async updateSubClient(clientId: string, subClientId: string, data: Partial<SubClientCreateRequest>): Promise<SubClient> {
    const response = await api.put(`/clients/${clientId}/sub-clients/${subClientId}`, data);
    return response.data;
  }

  static async deleteSubClient(clientId: string, subClientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/sub-clients/${subClientId}`);
  }

  // File Management
  static async uploadFile(file: File, clientId: string, subClientId?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    if (subClientId) {
      formData.append('sub_client_id', subClientId);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async searchKnowledge(data: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse> {
    const response = await api.post('/files/search', data);
    return response.data;
  }

  static async getFiles(clientId?: string, subClientId?: string): Promise<FileUploadResponse[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (subClientId) params.append('sub_client_id', subClientId);

    const response = await api.get(`/files/?${params.toString()}`);
    return response.data;
  }

  // AI Content Generation
  static async generateContent(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/generate', data);
    return response.data;
  }

  static async generateEmail(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/email', data);
    return response.data;
  }

  static async generateSummary(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/summary', data);
    return response.data;
  }

  static async generateActionItems(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/action-items', data);
    return response.data;
  }

  // Bot Management
  static async createBot(meetingUrl: string, botName: string): Promise<BotResponse> {
    const response = await api.post('/create-bot', {
      meeting_url: meetingUrl,
      bot_name: botName,
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

  static async cleanupOldBots(): Promise<any> {
    const response = await api.post('/bots/cleanup');
    return response.data;
  }

  // Debug endpoints (for development)
  static async getDebugUsers(): Promise<any> {
    const response = await api.get('/debug/users');
    return response.data;
  }

  static async getDebugTest(): Promise<any> {
    const response = await api.get('/debug/test');
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
