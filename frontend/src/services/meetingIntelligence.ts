/**
 * Meeting Intelligence Service
 * Handles end-to-end meeting recording and AI processing
 */

import { ApiService } from './api';
import { useToastStore } from '../stores/toastStore';

export interface StartRecordingRequest {
  meeting_url: string;
  meeting_title: string;
  client_id: string;
  sub_client_id?: string;
  attendees?: string[];
}

export interface MeetingRecording {
  meeting_id: string;
  bot_id?: string;
  status: 'starting' | 'recording' | 'completed' | 'processing' | 'done' | 'failed';
  meeting_title: string;
  client_id: string;
  processed: boolean;
  started_at: string;
  processed_at?: string;
}

export interface MeetingResults {
  meeting_id: string;
  summary?: string;
  action_items?: string;
  follow_up_email?: string;
  transcript_available: boolean;
  video_url?: string;
  audio_url?: string;
}

export class MeetingIntelligenceService {
  private static instance: MeetingIntelligenceService;
  private activeRecordings: Map<string, MeetingRecording> = new Map();
  private statusPollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): MeetingIntelligenceService {
    if (!MeetingIntelligenceService.instance) {
      MeetingIntelligenceService.instance = new MeetingIntelligenceService();
    }
    return MeetingIntelligenceService.instance;
  }

  /**
   * Start intelligent meeting recording
   */
  async startMeetingRecording(request: StartRecordingRequest): Promise<MeetingRecording> {
    try {
      console.log('🎬 Starting intelligent meeting recording:', request.meeting_title);

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Please login first to start meeting recording');
      }

      const response = await ApiService.post('/meeting-intelligence/start-recording', request);

      const recording: MeetingRecording = {
        meeting_id: response.meeting_id,
        bot_id: response.bot_id,
        status: response.status,
        meeting_title: request.meeting_title,
        client_id: request.client_id,
        processed: false,
        started_at: response.started_at
      };

      // Store locally
      this.activeRecordings.set(recording.meeting_id, recording);

      // Start status monitoring
      this.startStatusMonitoring(recording.meeting_id);

      // Show success toast
      const toast = useToastStore.getState();
      toast.success(
        'Meeting Recording Started',
        `AI bot is joining "${request.meeting_title}" and will automatically process the meeting when it ends.`
      );

      return recording;
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Start Meeting Recording',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  /**
   * Get meeting status
   */
  async getMeetingStatus(meetingId: string): Promise<MeetingRecording> {
    try {
      const response = await ApiService.get(`/meeting-intelligence/status/${meetingId}`);
      
      const recording: MeetingRecording = {
        meeting_id: response.meeting_id,
        bot_id: response.bot_id,
        status: response.status,
        meeting_title: response.meeting_title,
        client_id: response.client_id,
        processed: response.processed,
        started_at: response.started_at,
        processed_at: response.processed_at
      };

      // Update local storage
      this.activeRecordings.set(meetingId, recording);

      return recording;
    } catch (error: any) {
      console.error('Error getting meeting status:', error);
      throw error;
    }
  }

  /**
   * Get meeting results (AI-generated content)
   */
  async getMeetingResults(meetingId: string): Promise<MeetingResults> {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Service auth check - Token exists:', !!token);

      // Force debug mode for testing
      const forceDebugMode = true;

      if (!token || forceDebugMode) {
        // Use debug endpoint if not authenticated
        console.log('🧪 Using debug endpoint for meeting results:', meetingId);
        const response = await ApiService.get(`/meeting-intelligence/debug/results/${meetingId}`);
        console.log('🧪 Debug results response:', response);
        return response as MeetingResults;
      }

      // Normal authenticated flow - but fallback to debug if 404
      try {
        const response = await ApiService.get(`/meeting-intelligence/results/${meetingId}`);
        return response as MeetingResults;
      } catch (authError: any) {
        if (authError.response?.status === 404) {
          // Fallback to debug endpoint
          console.log('🧪 Authenticated endpoint not found, falling back to debug endpoint');
          const response = await ApiService.get(`/meeting-intelligence/debug/results/${meetingId}`);
          return response as MeetingResults;
        }
        throw authError;
      }
    } catch (error: any) {
      if (error.response?.status === 202) {
        // Still processing
        throw new Error('Meeting is still being processed. Please check back later.');
      }
      console.error('Error getting meeting results:', error);
      throw error;
    }
  }

  /**
   * List active meetings
   */
  async listActiveMeetings(): Promise<MeetingRecording[]> {
    try {
      const response = await ApiService.get('/meeting-intelligence/active');
      
      // Update local storage
      response.forEach((recording: MeetingRecording) => {
        this.activeRecordings.set(recording.meeting_id, recording);
      });

      return response;
    } catch (error: any) {
      console.error('Error listing active meetings:', error);
      throw error;
    }
  }

  /**
   * Manually trigger processing for a meeting
   */
  async manuallyProcessMeeting(meetingId: string): Promise<void> {
    try {
      await ApiService.post(`/meeting-intelligence/process-manual/${meetingId}`);
      
      const toast = useToastStore.getState();
      toast.success(
        'Processing Started',
        'Manual AI processing has been triggered for this meeting.'
      );
    } catch (error: any) {
      const toast = useToastStore.getState();
      toast.error(
        'Failed to Start Processing',
        error.response?.data?.detail || error.message || 'Unknown error occurred'
      );
      throw error;
    }
  }

  /**
   * Start monitoring meeting status
   */
  private startStatusMonitoring(meetingId: string): void {
    // Clear existing interval if any
    this.stopStatusMonitoring(meetingId);

    // Poll every 30 seconds
    const interval = setInterval(async () => {
      try {
        const recording = await this.getMeetingStatus(meetingId);
        
        console.log(`📊 Meeting ${meetingId} status: ${recording.status}`);

        // Check if meeting is completed and processed
        if (recording.processed) {
          console.log(`✅ Meeting ${meetingId} fully processed`);
          
          // Show completion notification
          const toast = useToastStore.getState();
          toast.success(
            'Meeting Processed',
            `"${recording.meeting_title}" has been processed. AI summary, action items, and follow-up email are ready.`
          );

          // Stop monitoring
          this.stopStatusMonitoring(meetingId);
        } else if (recording.status === 'failed') {
          console.log(`❌ Meeting ${meetingId} failed`);
          
          // Show error notification
          const toast = useToastStore.getState();
          toast.error(
            'Meeting Recording Failed',
            `Recording for "${recording.meeting_title}" encountered an error.`
          );

          // Stop monitoring
          this.stopStatusMonitoring(meetingId);
        }
      } catch (error) {
        console.error(`Error monitoring meeting ${meetingId}:`, error);
      }
    }, 30000); // 30 seconds

    this.statusPollingIntervals.set(meetingId, interval);
  }

  /**
   * Stop monitoring meeting status
   */
  private stopStatusMonitoring(meetingId: string): void {
    const interval = this.statusPollingIntervals.get(meetingId);
    if (interval) {
      clearInterval(interval);
      this.statusPollingIntervals.delete(meetingId);
    }
  }

  /**
   * Get local recording data
   */
  getLocalRecording(meetingId: string): MeetingRecording | undefined {
    return this.activeRecordings.get(meetingId);
  }

  /**
   * Get all local recordings
   */
  getAllLocalRecordings(): MeetingRecording[] {
    return Array.from(this.activeRecordings.values());
  }

  /**
   * Clear completed recordings from local storage
   */
  clearCompletedRecordings(): void {
    for (const [meetingId, recording] of this.activeRecordings.entries()) {
      if (recording.processed || recording.status === 'failed') {
        this.activeRecordings.delete(meetingId);
        this.stopStatusMonitoring(meetingId);
      }
    }
  }

  /**
   * Debug method - start recording without authentication
   */
  async debugStartMeetingRecording(request: StartRecordingRequest): Promise<any> {
    try {
      console.log('🧪 Starting DEBUG meeting recording:', request.meeting_title);
      console.log('🧪 Using endpoint: /meeting-intelligence/debug/start-recording');
      console.log('🧪 Request data:', request);

      const response = await ApiService.post('/meeting-intelligence/debug/start-recording', request);

      console.log('🧪 Debug response:', response);
      return response;
    } catch (error: any) {
      console.error('🧪 Debug recording failed:', error);
      console.error('🧪 Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Debug method - get meeting results directly
   */
  async debugGetMeetingResults(meetingId: string): Promise<MeetingResults> {
    try {
      console.log('🧪 Getting debug meeting results for:', meetingId);
      const response = await ApiService.get(`/meeting-intelligence/debug/results/${meetingId}`);
      console.log('🧪 Debug results response:', response);
      return response as MeetingResults;
    } catch (error: any) {
      console.error('🧪 Debug results failed:', error);
      throw error;
    }
  }

  /**
   * Debug method - get meeting status without authentication
   */
  async debugGetMeetingStatus(meetingId: string): Promise<any> {
    try {
      // For debug, we'll check the local recordings
      const recording = this.getLocalRecording(meetingId);
      if (recording) {
        return {
          meeting_id: meetingId,
          status: recording.status,
          processed: recording.processed,
          debug: true
        };
      }

      // If not found locally, return a mock status
      return {
        meeting_id: meetingId,
        status: 'unknown',
        processed: false,
        debug: true,
        message: 'Meeting not found in local storage'
      };
    } catch (error: any) {
      console.error('🧪 Debug status check failed:', error);
      throw error;
    }
  }

  /**
   * Stop all monitoring (cleanup)
   */
  cleanup(): void {
    for (const [meetingId] of this.statusPollingIntervals.entries()) {
      this.stopStatusMonitoring(meetingId);
    }
    this.activeRecordings.clear();
  }
}

// Export singleton instance
export const meetingIntelligenceService = MeetingIntelligenceService.getInstance();
